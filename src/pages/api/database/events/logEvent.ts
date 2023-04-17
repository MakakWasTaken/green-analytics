import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

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

  if (method === 'POST') {
    // Create the new event

    await prisma.event.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        sessionId: req.body.sessionId,
        website: {
          connect: {
            id: website.id,
          },
        },
        properties: {
          createMany: {
            data: req.body.properties.map((property: any) => ({
              name: property.name,
              value: JSON.stringify(property.value),
            })),
          },
        },
      },
    })

    res.json({ ok: true })
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}
