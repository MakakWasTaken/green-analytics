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
const getMostUsedType = (cookies: Cookie[]): CookieType | null => {
  const counts: { [type: string]: number } = {}
  for (const cookie of cookies) {
    if (!counts[cookie.type]) {
      counts[cookie.type] = 0
    }
    counts[cookie.type] += 1
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

/**
 * Used to find the most used party in a list of cookies.
 * @param cookies The array should be an array of the type of cookie that is being looked up.
 * @returns The most popular or null if not found
 */
const getMostUsedParty = (cookies: Cookie[]): CookieParty | null => {
  const counts: { [type: string]: number } = {}
  for (const cookie of cookies) {
    if (!counts[cookie.party]) {
      counts[cookie.party] = 0
    }
    counts[cookie.party] += 1
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
  return max.name as CookieParty
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
      domain: {
        in: xray.cookies.map((cookie) => cookie.domain),
      },
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

  console.log(xray.cookies.map((cookie) => cookie.domain))

  // We do not want to override cookies that are already manually defined.
  const filteredCookies = xray.cookies.filter(
    (cookie) =>
      !sameCookies.some(
        (sameCookie) =>
          // Same website
          sameCookie.websiteId === website.id &&
          // Same name
          sameCookie.name === cookie.name &&
          // Manual cookies only
          sameCookie.status === CookieStatus.MANUAL,
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
              (sameCookie) =>
                sameCookie.name === cookie.name &&
                sameCookie.domain === cookie.domain,
            )

            return {
              ...cookie,
              value: undefined,
              status: CookieStatus.AUTO,
              type: getMostUsedType(sameTypeCookies) ?? CookieType.NONE,
              party: getMostUsedParty(sameTypeCookies) ?? CookieParty.THIRD,
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
