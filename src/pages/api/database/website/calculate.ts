import { SustainableWebDesign } from '@makakwastaken/co2'
import prisma from '@src/lib/prisma'
import { getPredictedCarbonIntensity } from '@src/utils/getPredictedCarbonIntensity'
import { scanWebsite } from '@src/utils/websiteScanner'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  if (method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    return
  }
  // Extract country, pageviews and url
  const { url, country }: { url: string; country: string } = req.body

  // Extract hostname from url
  const formattedURL = new URL(url.startsWith('http') ? url : 'https://' + url)

  // Check if the website has already been scanned in the past 2 weeks
  let website = await prisma.website.findFirst({
    where: {
      url: formattedURL.hostname,
    },
    include: {
      scans: true,
    },
  })

  if (!website) {
    // The website was not found, we need to create it
    // We don't have a team to connect with the website yet, so leave it.
    // If the website already exists, a team possibly owns it, this is why we
    // only return the calculations and no confidential information.

    console.log('Creating website...')

    const createResult = await prisma.website.create({
      data: {
        name: 'No Name',
        url: formattedURL.hostname,
      },
      include: {
        scans: true,
      },
    })

    website = {
      ...createResult,
      scans: [],
    }
  }

  if (!website) {
    res.status(500).json({
      ok: false,
      message: 'Something went wrong, could not find website after scan',
    })
    return
  }

  // We now have a website no matter what, so we can scan it if needed.
  if (website.updatedAt <= DateTime.now().minus({ week: 2 }).toJSDate()) {
    // The scan is over 2 weeks old, rescan the website.
    await scanWebsite(website)

    // We need to refetch the scans of the website
    website = await prisma.website.findFirstOrThrow({
      where: {
        id: website.id,
      },
      include: {
        scans: true,
      },
    })
  }

  // Get the carbon intensity for the user base country
  const carbonIntensity = await getPredictedCarbonIntensity(country)

  const swd = new SustainableWebDesign({
    gridIntensity: {
      device: {
        value: carbonIntensity[country]?.prediction,
      },
    },
  })

  // The metric. The unit is gram CO2e per pageview
  let totalEmission = 0.0

  // Now we have a website with scans.
  // This can be converted to the carbon emission metric.
  website.scans.forEach((scan) => {
    const emission = swd.perVisit(scan.transferSize, scan.green, false, {
      gridIntensity: {
        dataCenter: {
          country: scan.countryCode as any,
        },
      },
    })

    totalEmission += emission.total
  })

  res.json({
    co2perPageview: totalEmission,
  })
}

export default handle
