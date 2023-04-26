/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { hosting } from '@makakwastaken/co2'
import { Event, Property, Scan, Website } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { getXray } from '@src/utils/harFetcher'
import { NextApiRequest, NextApiResponse } from 'next'

const handleURLs = async (website: Website & { scans: Scan[] }) => {
  // When receiving a list of urls we check if the script is already added and if it was updated within the past 2 weeks

  // Check if any of the updatedAt dates are older than 2 weeks. In this case we need to update the script
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  // If the website has not been updated in two weeks. (Meaning its scans has not been updated in two weeks)
  let rescanRequired =
    website.updatedAt < twoWeeksAgo || website.scans.length === 0
  website.scans.forEach((scan) => {
    if (scan.updatedAt < twoWeeksAgo) {
      rescanRequired = true
    }
  })

  if (rescanRequired) {
    console.log('Rescanning website', website.url)

    // Get the scan
    // We rescan the entire website, in case of new scripts or removed scripts
    const xray = await getXray(website.url)

    if (!xray) {
      throw new Error('Could not scan website. Make sure the url is correct')
    }

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
  }
}

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const token = req.headers.api_token as string | undefined
  if (!token) {
    res.status(403).json({ ok: false, message: 'Missing token' })
    return
  }

  if (!req.body.event.website.url) {
    res.status(400).json({ ok: false, message: 'Missing website url' })
    return
  }

  // Check if the website.url is localhost
  // If it is, allow it
  const urlRegex = /^(?:\w+?:\/\/)?([A-z0-9.\-:]+).*/g
  const urlMatch = urlRegex.exec(req.body.event.website.url)
  const formattedEventUrl = urlMatch ? urlMatch[1] : req.body.event.website.url
  const website = await prisma.website.findFirst({
    where: {
      token,
      url: formattedEventUrl,
    },
    include: {
      scans: true,
    },
  })

  if (!website) {
    res.status(403).json({ ok: false, message: 'Website not found' })
    return
  }

  const origin = req.headers.origin || ''
  const originURL = new URL(
    origin.startsWith('http') ? origin : 'https://' + origin,
  )
  // Check that the origin of the request matches the given url
  if (
    website.url !== originURL.host &&
    originURL.host !== 'green-analytics.dk'
  ) {
    res.status(403).json({ ok: false, message: `Invalid origin ${origin}` })
    return
  }

  if (!website) {
    res.status(403).json({ ok: false, message: 'Website not found' })
    return
  }

  if (method === 'POST') {
    // Create the new event

    const event: Event = req.body.event

    await handleURLs(website)

    await prisma.event.create({
      data: {
        name: event.name,
        type: event.type,
        website: {
          connect: {
            id: website.id,
          },
        },
        person: {
          connectOrCreate: {
            where: { id: req.body.personId || req.body.sessionId },
            create: {
              id: req.body.personId || req.body.sessionId,
              websiteId: website.id,
            },
          },
        },
      },
    })

    // Create the new properties
    const properties: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>[] =
      Object.keys(req.body.properties).map((key) => ({
        key,
        value: req.body.properties[key],
        websiteId: website!.id,
        personId: req.body.personId || req.body.sessionId,
      }))
    // Extract all the keys from the properties
    const keys = properties.map((property) => property.key)

    // Delete all the properties with the same key
    await prisma.property.deleteMany({
      where: {
        key: {
          in: keys,
        },
        personId: req.body.personId || req.body.sessionId,
        websiteId: website.id,
      },
    })

    // Create the new properties
    await prisma.property.createMany({
      data: properties.map((property) => ({
        key: property.key,
        value: JSON.stringify(property.value),
        personId: req.body.personId || req.body.sessionId,
        websiteId: website!.id,
      })),
      skipDuplicates: true,
    })

    res.json({ ok: true })
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

export default handle
