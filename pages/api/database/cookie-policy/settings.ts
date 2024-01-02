import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok')
  }
  // This endpoint is public, so we just get the cookie settings for the provided token

  const token = req.headers.api_token as string | undefined
  if (!token) {
    res.status(403).json({ ok: false, message: 'Missing token' })
    return
  }

  try { 
    if (req.method === 'GET') {
      await handleGET(res, token)
    } else {
      res.status(405).json({
        ok: false,
        message: `Method ${req.method} is not allowed for this endpoint`,
      })
    }
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

const handleGET = async (res: NextApiResponse, token: string) => {
  // Get the cookies for this website.
  const [cookies, website] = await Promise.all([
    prisma.cookie.findMany({
      where: {
        website: {
          token,
        },
      },
    }),
    prisma.website.findFirst({
      where: {
        token,
      },
      include: {
        team: {
          include: {
            roles: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    }),
  ])

  if (!website || !website.team) {
    res.status(404).json({
      ok: false,
      message: 'No website found with the provided token.',
    })
    return
  }

  if (!website.settings) {
    res.json({
      cookies: cookies.map((cookie) => ({
        name: cookie.name,
        type: cookie.type,
        lastUpdated: cookie.createdAt,
      })),
      enabled: false,
    })
    return
  }

  const parsedSettings = JSON.parse(website.settings as any as string)

  res.json({
    cookies: cookies.map((cookie) => ({
      name: cookie.name,
      type: cookie.type,
      lastUpdated: cookie.createdAt,
    })),
    cookiePolicyUrl:
      parsedSettings.cookiePolicyUrl ?? `https://${website.url}/cookies`,
    enabled: parsedSettings.cookiePolicyEnabled ?? false,
  })
}

export default handler
