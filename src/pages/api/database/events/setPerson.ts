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
  const urlRegex = /^(?:\w+?:\/\/)?([A-z0-9.\-:]+).*/g
  const urlMatch = urlRegex.exec(req.body.person.website.url)
  const formattedEventUrl = urlMatch ? urlMatch[1] : req.body.person.website.url
  // Get the website from the token and req.body.person.website.url
  const website = await prisma.website.findFirst({
    where: {
      token,
      url: formattedEventUrl,
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
  if (website.url !== originURL.host) {
    res.status(403).json({ ok: false, message: `Invalid origin ${origin}` })
    return
  }

  // Give a cors error if the website url does not match the origin and token
  // Prevents abuse of the API
  try {
    await NextCors(req, res, {
      // Options
      methods: ['POST'],
      origin: [
        'https://' + website.url,
        'https://green-analytics.dk',
        'http://localhost:3000',
      ],
      optionsSuccessStatus: 200,
    })
  } catch (e) {
    console.error(e)
    throw e
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
