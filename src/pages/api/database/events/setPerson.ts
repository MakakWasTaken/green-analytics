import { Website } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.api_token as string | undefined

  if (!token) {
    res.status(403).json({ ok: false, message: 'Forbidden' })
    return
  }

  // Check if the website.url is localhost
  // If it is, allow it
  let website: Website | null = null
  if (req.body.person.website.url.startsWith('http://localhost:')) {
    // Get the website from the token and req.body.person.website.url
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
    const url = new URL(req.body.person.website.url)
    if (!url.origin) {
      res.status(400).json({ ok: false, message: 'Invalid website url' })
      return
    }

    // Get the website from the token and req.body.person.website.url
    website = await prisma.website.findFirst({
      where: {
        token,
        url: req.body.person.website.url,
      },
    })

    if (!website) {
      res.status(403).json({ ok: false, message: 'Website not found' })
      return
    }

    const origin = req.headers.host || req.headers.origin
    const originURL = new URL(origin || '')
    // Check that the origin of the request matches the given url
    const websiteURL = new URL(website.url)
    if (websiteURL.origin !== originURL.origin) {
      res.status(403).json({ ok: false, message: 'Invalid origin' })
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

  // Check if the person already exists

  // // Check if the person already exists
  const person = await prisma.person.upsert({
    where: {
      id: req.body.person.id,
    },
    create: {
      id: req.body.person.id,
      email: req.body.person.email,
      name: req.body.person.name,
      website: {
        connect: {
          id: website.id,
        },
      },
    },
    update: {
      email: req.body.person.email,
      name: req.body.person.name,
    },
  })

  // Update all events where person.id is equal to sessionId
  // to have the new person id
  await prisma.event.updateMany({
    where: {
      website: {
        id: website.id,
      },
      personId: req.body.sessionId,
    },
    data: {
      personId: person?.id,
    },
  })

  // Insert all properties for this person into the properties table
  // Extract all the keys in the new properties
  if (req.body.person.properties) {
    const newPropertyKeys = req.body.person.properties.map(
      (property: any) => property.key,
    )

    // Delete all properties for this person that are in the new properties. We are going to replace them
    await prisma.property.deleteMany({
      where: {
        personId: person?.id,
        key: {
          in: newPropertyKeys,
        },
      },
    })

    // Insert all the new properties
    await prisma.property.createMany({
      data: req.body.person.properties.map((property: any) => ({
        key: property.key,
        value: JSON.stringify(property.value),
        personId: person?.id,
      })),
      skipDuplicates: true,
    })
  }

  res.json({ ok: true })
}

export default handle
