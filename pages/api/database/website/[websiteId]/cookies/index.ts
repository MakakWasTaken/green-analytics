import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Cookie, CookieParty, CookieStatus, CookieType } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    if (!req.query.websiteId) {
      res.status(400).json({
        ok: false,
        message: 'Missing websiteId',
      })
      return
    }

    // This action requires the user to be logged in
    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    try {
      if (req.method === 'GET') {
        await handleGET(req, res, session)
      } else if (req.method === 'POST') {
        await handlePOST(req, res, session)
      } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    } catch (error: any) {
      console.error(error)
      res
        .status(500)
        .json({ ok: false, message: error.message ?? error.name ?? error })
    }
  },
)

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const cookies = await prisma.cookie.findMany({
    where: {
      website: {
        id: req.query.websiteId as string,
        team: {
          users: {
            some: {
              id: session.user.sub,
            },
          },
        },
      },
    },
  })
  res.status(200).json(cookies)
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // Get the website

  const newBody = req.body as Cookie

  // Check that the user has the correct permission for this website.
  const website = await prisma.teamRole.findFirst({
    where: {
      role: {
        in: ['ADMIN', 'OWNER'],
      },
      userId: session.user.sub,
      team: {
        users: {
          some: {
            id: session.user.sub,
          },
        },
      },
    },
  })

  if (!website) {
    res.status(403).json({
      ok: false,
      message: 'Permission denied',
    })
    return
  }

  const cookie = await prisma.cookie.create({
    data: {
      domain: newBody.domain,
      name: newBody.name,

      type: newBody.type ?? CookieType.NONE,
      party: newBody.party ?? CookieParty.THIRD,
      secure: newBody.secure ?? false,
      path: newBody.path ?? '/',
      sameSite: newBody.sameSite ?? 'Lax',
      httpOnly: newBody.httpOnly ?? false,
      expires: newBody.expires ?? 0,
      status: CookieStatus.MANUAL,
      websiteId: req.query.websiteId as string,
    },
  })

  res.json({ ok: true, message: 'Succesfully created cookie', data: cookie })
}

export default handle
