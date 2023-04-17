import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.API_TOKEN as string | undefined

  if (!token) {
    res.status(403).json({ ok: false, message: 'Forbidden' })
    return
  }

  // Get the website from the token and req.body.event.website.url
  const website = await prisma.website.findFirst({
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

  // Check if the person already exists
  let person = await prisma.person.findFirst({
    where: {
      id: req.body.person.id,
      website: {
        id: website.id,
      },
    },
    include: {
      properties: true,
    },
  })

  if (!person) {
    // Create the new Person
    person = await prisma.person.create({
      data: {
        id: req.body.person.id,
        website: {
          connect: {
            id: website.id,
          },
        },
        name: req.body.person.name,
        email: req.body.person.email,
        properties: {
          createMany: {
            data: req.body.person.properties.map((property: any) => ({
              name: property.name,
              value: JSON.stringify(property.value),
            })),
          },
        },
      },
      include: {
        properties: true,
      },
    })
  } else {
    // Update the existing person
    await prisma.person.update({
      where: {
        id: person.id,
      },
      data: {
        name: req.body.person.name,
        email: req.body.person.email,
        properties: {
          upsert: req.body.person.properties.map((property: any) => ({
            where: {
              name: property.name,
              personId: person?.id || 'ERROR', // Error should not happen, but typescript complains
            },
            create: {
              name: property.name,
              value: JSON.stringify(property.value),
            },
            update: {
              value: JSON.stringify(property.value),
            },
          })),
        },
      },
    })
  }

  // Update all events with the sessionId to have the new person id
  await prisma.event.updateMany({
    where: {
      website: {
        id: website.id,
      },
      sessionId: req.body.sessionId,
    },
    data: {
      personId: person?.id,
    },
  })

  res.json({ ok: true })
}

export default handle
