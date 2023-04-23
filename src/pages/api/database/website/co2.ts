import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import CO2 from '@makakwastaken/co2/dist/src/co2'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    switch (method) {
      case 'GET':
        // When we get a GET request, we want to return the CO2 data for the website. This is given in CO2 per page view or CO2 yearly.
        // We need to get the websiteId from the query parameters.
        // We need to get the type of CO2 data from the query parameters.

        // If the websiteId is not given, we return a 400 error.
        // The default type of CO2 data is CO2 yearly.

        const websiteId = req.query.websiteId as string
        const type = (req.query.type as string) || 'yearly'

        if (!websiteId) {
          res.status(400).json({
            ok: false,
            message: 'Missing websiteId',
          })
          return
        }

        if (type !== 'yearly' && type !== 'pageview') {
          res.status(400).json({
            ok: false,
            message: "Invalid CO2 type, should be 'yearly' or 'pageview'",
          })
          return
        }

        // Get the website with scans
        const session = await getSession(req, res)
        const website = await prisma.website.findFirst({
          where: {
            id: websiteId,
            team: {
              users: {
                some: {
                  id: session?.user.sub,
                },
              },
            },
          },
          include: {
            scans: true,
          },
        })

        if (!website) {
          res.status(404).json({
            ok: false,
            message: 'Website not found',
          })
          return
        }

        // Calculate the CO2 data using SWD (@makakwastaken/co2)

        const co2 = new CO2({ model: 'swd' })

        let totalEmission = 0.0
        if (type === 'yearly') {
          website.scans.forEach((scan) => {
            const emission = co2.perByte(scan.transferSize, scan.green)

            totalEmission += emission.total
          })

          // Get number of pageviews within the past month and multiply it by the total emission and 12 to get the yearly emission.
          const pageviews = await prisma.event.count({
            where: {
              websiteId: website.id,
              type: 'pageview',
              createdAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              },
            },
          })

          res.json({
            domains: website.scans.length,
            greenDomains: website.scans.filter((scan) => scan.green).length,
            emission: totalEmission * pageviews * 12,
          })
        } else if (type === 'pageview') {
          website.scans.forEach((scan) => {
            const emission = co2.perByte(scan.transferSize, scan.green)

            totalEmission += emission.total
          })

          res.json({
            domains: website.scans.length,
            greenDomains: website.scans.filter((scan) => scan.green).length,
            emission: totalEmission,
          })
        }

        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  },
)
