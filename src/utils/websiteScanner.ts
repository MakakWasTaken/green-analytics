import { hosting } from '@makakwastaken/co2'
import {
  Cookie,
  CookieParty,
  CookieStatus,
  CookieType,
  Website,
} from '@prisma/client'
import prisma from '@src/lib/prisma'
import axios from 'axios'
import { countryISO3Mapping } from './countryISOMapping'
import { getPredictedCarbonIntensity } from './getPredictedCarbonIntensity'
import { getXray } from './harFetcher'
import { convertExpiresToSeconds } from './utils'

/**
 * Used to find the most used type in a list of cookies.
 * @param cookies The array should be an array of the type of cookie that is being looked up.
 * @returns The most popular or null if not found
 */
const getMostUsed = (cookies: Cookie[], property: keyof Cookie): any | null => {
  const counts: { [type: string]: number } = {}
  for (const cookie of cookies) {
    const item = cookie[property]
    if (typeof item !== 'string') {
      throw new Error(`The ${property} of the cookie needs to be a string`)
    }
    if (!counts[item]) {
      counts[item] = 0
    }
    counts[item] += 1
  }

  // Get the values with the highest value
  const max = Object.keys(counts).reduce(
    (prev, key) => {
      const cur = counts[key]
      if (prev.value < cur) {
        // If this value is over the previous, change the object to this one.
        return {
          name: key,
          value: cur,
        }
      }
      return prev
    },
    { name: '', value: 0 } as { name: string; value: number },
  )

  if (max.name === '') {
    return null
  }
  return max.name as CookieType
}

export const scanWebsite = async (website: Website) => {
  // When we get a POST request, we want to rescan the website. This is done by getting the HAR file and checking which domains are green.
  console.log('Rescanning website', website.url)

  // Get the scan
  // We rescan the entire website, in case of new scripts or removed scripts
  const xray = await getXray(website.url)

  if (!xray) {
    throw new Error('Could not scan website. Make sure the url is correct')
  }

  const urlData = xray.urls

  const IPset = Array.from(
    new Set(Object.keys(urlData).map((url) => urlData[url].ip)),
  )

  const response = await axios.post(
    'http://ip-api.com/batch?fields=countryCode,query',
    IPset,
  )

  // Get the country codes
  const data: { countryCode: string; query: string }[] = response.data

  for (const url in urlData) {
    const location = data.find((location) => location.query === urlData[url].ip)
    if (location) {
      urlData[url].countryCode = countryISO3Mapping[location.countryCode]
    }
  }

  const co2Intensities = await getPredictedCarbonIntensity(
    Object.keys(urlData)
      .map((url) => urlData[url].countryCode)
      .filter((countryCode) => !!countryCode) as string[],
  )

  // Check which of the domains are green
  const hostOnly = Object.keys(urlData).map((url) => {
    const urlObject = new URL(url)
    return urlObject.host
  })

  const green = (await hosting.check(hostOnly)) as string[]

  // Get all the cookies with the same names. Used to determine the type
  const sameCookies = await prisma.cookie.findMany({
    where: {
      name: {
        in: xray.cookies.map((cookie) => cookie.name),
      },
      status: CookieStatus.MANUAL,
    },
  })

  await Promise.all([
    // Delete and read all the scans (Cleanups the database)
    prisma.scan.deleteMany({
      where: {
        websiteId: website.id,
      },
    }),
    // Remove all auto generated cookie entries from the
    prisma.cookie.deleteMany({
      where: {
        websiteId: website.id,
        status: CookieStatus.AUTO,
      },
    }),
  ])

  // We do not want to override cookies that are already manually defined.
  const filteredCookies = xray.cookies.filter(
    (cookie) =>
      !sameCookies.some(
        (sameCookie) =>
          // Same website
          sameCookie.websiteId === website.id &&
          // Same name
          sameCookie.name === cookie.name,
        // Implicit manual cookies only
      ),
  )

  // Create the final website
  await prisma.website.update({
    where: {
      id: website.id,
    },
    data: {
      updatedAt: new Date(), // Update the updatedAt field
      cookies: {
        createMany: {
          data: filteredCookies.map((cookie) => {
            const sameTypeCookies = sameCookies.filter(
              (sameCookie) => sameCookie.name === cookie.name,
            )

            return {
              ...cookie,
              value: undefined,
              status: CookieStatus.AUTO,
              type: getMostUsed(sameTypeCookies, 'type') ?? CookieType.NONE,
              party: getMostUsed(sameTypeCookies, 'party') ?? CookieParty.THIRD,
              expires: convertExpiresToSeconds(cookie.expires), // Will convert epoch seconds to actual seconds of expiry.
            }
          }),
        },
      },
      scans: {
        createMany: {
          data: Object.keys(urlData).map((url) => ({
            url,
            green: green.includes(new URL(url).host),
            transferSize: urlData[url].transferSize,
            contentSize: urlData[url].contentSize,
            countryCode: urlData[url].countryCode,
            co2Intensity:
              co2Intensities[urlData[url].countryCode || '']?.prediction || 0,
          })),
          skipDuplicates: true,
        },
      },
    },
  })
}
