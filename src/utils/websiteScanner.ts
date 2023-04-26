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

  await Promise.all(
    Object.keys(xray).map(async (url) => {
      const ip = xray[url].ip
      const location = await axios.get(
        `http://ip-api.com/json/${ip}?field=countryCode`,
      )

      xray[url].countryCode = countryISOMapping[location.data]
    }),
  )

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
            countryCode: xray[url].countryCode,
          })),
          skipDuplicates: true,
        },
      },
    },
  })
}
