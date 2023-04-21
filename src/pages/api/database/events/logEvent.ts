/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Event, Property, Website } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

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
  let website: Website | null = null
  if (req.body.event.website.url.startsWith('http://localhost:')) {
    // Get the website from the token and req.body.event.website.url
    website = await prisma.website.findFirst({
      where: {
        token,
      },
    })

    if (!website) {
      res.status(403).json({ ok: false, message: 'Website not found' })
      return
    }
  } else {
    // Check if the website.url is a valid url
    const url = new URL(req.body.event.website.url)
    if (!url.origin) {
      res.status(400).json({ ok: false, message: 'Invalid website url' })
      return
    }

    // Get the website from the token and req.body.event.website.url
    website = await prisma.website.findFirst({
      where: {
        token,
        url: req.body.event.website.url,
      },
    })

    if (!website) {
      res.status(403).json({ ok: false, message: 'Website not found' })
      return
    }

    // Give a cors error if the website url does not match the origin and token
    // Prevents abuse of the API
    await NextCors(req, res, {
      // Options
      methods: ['POST'],
      origin: website.url,
      optionsSuccessStatus: 200,
    })
  }

  if (!website) {
    res.status(403).json({ ok: false, message: 'Website not found' })
    return
  }

  if (method === 'POST') {
    // Create the new event

    const event: Event = req.body.event

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
    console.log(req.body)
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
    })

    res.json({ ok: true })
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

export default handle
