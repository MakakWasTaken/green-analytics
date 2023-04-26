import { hosting } from '@makakwastaken/co2'
import { Website } from '@prisma/client/edge'
import prisma from '@src/lib/prisma'
import axios from 'axios'
import { countryISOMapping } from './countryISOMapping'
import { getXray } from './harFetcher'

export const scanWebsite = async (website: Website) => {
  // When we get a POST request, we want to rescan the website. This is done by getting the HAR file and checking which domains are green.
  console.log('Rescanning website', website.url)

  // Get the scan
  // We rescan the entire website, in case of new scripts or removed scripts
  const xray: {
    [key: string]: {
      ip: string
      countryCode?: string
      contentSize: number
      transferSize: number
    }
  } = await getXray(website.url)

  if (!xray) {
    throw new Error('Could not scan website. Make sure the url is correct')
  }

  const IPset = Array.from(
    new Set(Object.keys(xray).map((url) => xray[url].ip)),
  )

  const response = await axios.post(
    'http://ip-api.com/batch?fields=countryCode,query',
    IPset,
  )

  // Get the country codes
  const data: { countryCode: string; query: string }[] = response.data

  Object.keys(xray).forEach((url) => {
    const location = data.find((location) => location.query === xray[url].ip)
    if (location) {
      xray[url].countryCode = countryISOMapping[location.countryCode]
    }
  })

  // Check which of the domains are green
  const hostOnly = Object.keys(xray).map((url) => {
    const urlObject = new URL(url)
    return urlObject.host
  })

  const green = (await hosting.check(hostOnly)) as string[]

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
            green: green.includes(new URL(url).host),
            transferSize: xray[url].transferSize,
            contentSize: xray[url].contentSize,
            countryCode: xray[url].countryCode,
          })),
          skipDuplicates: true,
        },
      },
    },
  })
}
