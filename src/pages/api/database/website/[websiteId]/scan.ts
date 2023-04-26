import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { hosting } from '@makakwastaken/co2'
import prisma from '@src/lib/prisma'
import { getXray } from '@src/utils/harFetcher'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const websiteId = req.query.websiteId as string

    if (!websiteId) {
      res.status(400).json({
        ok: false,
        message: 'Missing websiteId',
      })
      return
    }

    // This action requires the user to be logged in
    const session = await getSession(req, res)

    if (!session?.user.sub) {
      res.status(401).json({
        ok: false,
        message: 'Unauthorized',
      })
      return
    }

    switch (method) {
      case 'GET':
        try {
          const scans = await prisma.scan.findMany({
            where: {
              websiteId,
              createdAt: req.query.start
                ? {
                    gte: DateTime.fromISO(req.query.start as string).toJSDate(),
                  }
                : undefined,
            },
          })
          res.status(200).json(scans)
        } catch (error) {
          res.status(500).json({ error })
        }
        break
      case 'POST':
        // Get the website

        // This action requires the user to be admin or owner (The action requires a lot of server power, so we don't want users to abuse it)

        const website = await prisma.website.findFirst({
          where: {
            id: websiteId,
            team: {
              roles: {
                some: {
                  id: session?.user.sub,
                  role: {
                    in: ['ADMIN', 'OWNER'],
                  },
                },
              },
            },
          },
        })

        if (!website) {
          res.status(404).json({
            ok: false,
            message: 'Website not found',
          })
          return
        }

        // When we get a POST request, we want to rescan the website. This is done by getting the HAR file and checking which domains are green.
        console.log('Rescanning website', website.url)

        // Get the scan
        // We rescan the entire website, in case of new scripts or removed scripts
        const xray = await getXray(website.url)

        if (!xray) {
          throw new Error(
            'Could not scan website. Make sure the url is correct',
          )
        }

        console.log(JSON.stringify(xray))

        // Check which of the domains are green
        const green = (await hosting.check(Object.keys(xray))) as string[]

        // Delete and readd all the scans (Cleanups the database)
        await prisma.scan.deleteMany({
          where: {
            websiteId: website.id,
          },
        })

        // Create the final website
        await prisma.website.update({
          where: {
            id: website.id,
          },
          data: {
            scans: {
              createMany: {
                data: Object.keys(xray).map((url) => ({
                  url,
                  green: green.includes(url),
                  transferSize: xray[url].transferSize,
                  contentSize: xray[url].contentSize,
                })),
                skipDuplicates: true,
              },
            },
          },
        })
        break
      default:
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  },
)

export default handle
