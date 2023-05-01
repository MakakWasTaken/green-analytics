/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Event, Scan, Website } from '@prisma/client/edge'
import prisma from '@src/lib/prisma'
import { scanWebsite } from '@src/utils/websiteScanner'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import requestCountry from 'request-country'

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
    await scanWebsite(website)
  }
}

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    // Options
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
  const method = req.method
  const ip =
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress

  // Check if the request is headless or bot. If it is we don't want to log it
  const userAgent = req.headers['user-agent']?.toLowerCase()
  if (userAgent?.includes('headless') || userAgent?.includes('bot')) {
    res.status(200).json({ ok: true })
    return
  }

  const country = requestCountry(req, 'US')

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

  const origin = req.headers.origin || req.headers.host || ''
  const originURL = new URL(
    origin.startsWith('http') ? origin : 'https://' + origin,
  )
  // Check that the origin of the request matches the given url
  if (
    website.url !== originURL.host &&
    originURL.host !== 'green-analytics.com'
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

    const event: Event & { properties: { [key: string]: string } } =
      req.body.event

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
        properties: {
          createMany: {
            data: [
              ...Object.keys(event.properties).map((key) => ({
                key,
                value: event.properties[key].toString(),
                websiteId: website.id,
              })),
            ],
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
    const keys = Object.keys(req.body.userProperties)

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
    const userProperties: {
      [key: string]: number | boolean | string
    } = req.body.userProperties

    userProperties.ip = ip || ''
    userProperties.country = country

    await prisma.property.createMany({
      data: Object.keys(userProperties).map((property) => ({
        key: property,
        value: userProperties[property].toString(),
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
