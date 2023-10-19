import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { scanWebsite } from '@src/utils/websiteScanner'
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
      case 'POST': {
        // Get the website

        // This action requires the user to be admin or owner (The action requires a lot of server power, so we don't want users to abuse it)

        const website = await prisma.website.findFirst({
          where: {
            id: websiteId,
            team: {
              roles: {
                some: {
                  userId: session?.user.sub,
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

        await scanWebsite(website)

        res.json({ ok: true })
        break
      }
      default:
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  },
)

export default handle
