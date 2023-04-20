import { Website } from '@prisma/client'
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

  if (method === 'POST') {
    // Create the new event

    const event = req.body.event

    await prisma.event.create({
      data: {
        name: event.name,
        type: event.type,
        sessionId: req.body.sessionId,
        websiteId: website.id,
      },
    })

    res.json({ ok: true })
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

export default handle
