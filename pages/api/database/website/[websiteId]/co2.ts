import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { SustainableWebDesign } from '@makakwastaken/co2'
import prisma from '@src/lib/prisma'
import { countryISO3Mapping } from '@src/utils/countryISOMapping'
import { getPredictedCarbonIntensity } from '@src/utils/getPredictedCarbonIntensity'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    if (method === 'GET') {
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

      const swd = new SustainableWebDesign()

      let totalEmission = 0.0
      if (type === 'yearly') {
        // Get number of pageviews within the past month and multiply it by the total emission and 12 to get the yearly emission.
        const pageviews = await prisma.event.findMany({
          where: {
            websiteId: website.id,
            type: 'pageview',
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
          select: {
            personId: true,
            person: {
              select: {
                properties: {
                  where: {
                    key: 'country',
                  },
                },
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        // Calculate the number of returning pageviews
        const returningUsers = new Set<string>()
        const totalUsers = new Array<string>()
        for (const event of pageviews) {
          if (event.personId) {
            totalUsers.push(event.personId)
            returningUsers.add(event.personId)
          }
        }
        const firstVisitPercentage =
          1 - returningUsers.size / (totalUsers.length || 1)

        const countrySet = Array.from([
          ...new Set([
            ...pageviews.flatMap((pageview) =>
              pageview.person?.properties.map(
                (property) => countryISO3Mapping[property.value],
              ),
            ),
          ]),
        ]).filter((countryCode) => countryCode !== undefined) as string[]
        const predictedCarbonIntensities = await getPredictedCarbonIntensity(
          countrySet,
        )

        for (const scan of website.scans) {
          for (const pageview of pageviews) {
            const countryProperty = pageview.person?.properties.find(
              (property) => property.key === 'country',
            )

            const pageviewCountryCode = countryProperty?.value || ''

            const emission = swd.perVisit(
              scan.transferSize,
              scan.green,
              false,
              {
                gridIntensity: {
                  dataCenter: {
                    value: scan.co2Intensity,
                    country: scan.countryCode as any | undefined,
                  },
                  device: {
                    value:
                      predictedCarbonIntensities[pageviewCountryCode]
                        ?.prediction,
                    country: countryISO3Mapping[pageviewCountryCode] as
                      | any
                      | undefined,
                  },
                  renewableEnergy: 10, // 10g/kWh for renewable energy.
                },
                kwhPerGB: 0.75, // 0.75 kWh per GB of data transfer.
                dataReloadRatio: 0.089, // 8.9% of data is reloaded.
                firstVisitPercentage,
              },
            )
            if (emission.total) {
              totalEmission += emission.total
            }
          }
        }

        // We hope to get one month of pageviews, but this might not be possible.
        // So we take the difference in days between the first and last pageview, as this symbolizes the number of days we have pageviews for.

        if (pageviews.length === 0) {
          res.json({
            domains: website.scans.length,
            greenDomains: website.scans.filter((scan) => scan.green).length,
            emission: 0.0, // We return 0, because it is invalid if no pageviews are present
          })
          return
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

        const factor = daysInMonth / (differenceInDays || 1)

        res.json({
          domains: website.scans.length,
          greenDomains: website.scans.filter((scan) => scan.green).length,
          emission: totalEmission * factor * 12,
        })
      } else if (type === 'pageview') {
        for (const scan of website.scans) {
          const emission = swd.perVisit(scan.transferSize, scan.green, false, {
            gridIntensity: {
              dataCenter: {
                country: scan.countryCode as any,
              },
              renewableEnergy: 10, // 10g/kWh for renewable energy.
            },
            kwhPerGB: 0.75, // 0.75 kWh per GB of data transfer.
            dataReloadRatio: 0.089, // 8.9% of data is reloaded.
          })

          totalEmission += emission.total
        }

        res.json({
          domains: website.scans.length,
          greenDomains: website.scans.filter((scan) => scan.green).length,
          emission: totalEmission,
        })
      }
    } else {
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  },
)

export default handle
