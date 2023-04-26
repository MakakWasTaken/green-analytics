import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { CO2 } from '@makakwastaken/co2/dist/src/co2'
import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
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
          const pageviews = await prisma.event.findMany({
            where: {
              websiteId: website.id,
              type: 'pageview',
              createdAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })

          // We hope to get one month of pageviews, but this might not be possible.
          // So we take the difference in days between the first and last pageview, as this symbolizes the number of days we have pageviews for.

          if (pageviews.length === 0) {
            res.json({
              domains: website.scans.length,
              greenDomains: website.scans.filter((scan) => scan.green).length,
              emission: 0.0, // We return 0, because it is invalid if no pageviews are present
            })
          }

          const firstPageView = pageviews[0]
          const lastPageView = pageviews[pageviews.length - 1]

          // Difference in days between the first and last pageview
          const differenceInDays = Math.floor(
            (firstPageView.createdAt.getTime() -
              lastPageView.createdAt.getTime()) /
              (1000 * 3600 * 24),
          )

          // Get the number of days since the last month
          const daysInMonth = Math.abs(
            DateTime.now().minus({ months: 1 }).diffNow('days').get('days'),
          )

          // We need to upscale the amount of pageview to be a monthly amount.

          const factor = daysInMonth / differenceInDays

          res.json({
            domains: website.scans.length,
            greenDomains: website.scans.filter((scan) => scan.green).length,
            emission: totalEmission * pageviews.length * factor * 12,
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

export default handle