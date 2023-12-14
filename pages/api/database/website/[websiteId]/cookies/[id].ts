import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Cookie, CookieStatus } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({ ok: false, message: 'Unauthorized' })
      return
    }

    if (!req.query.id) {
      res.status(400).json({ ok: false, message: 'Missing id' })
      return
    }

    if (method === 'GET') {
      await handleGET(req, res, session)
    } else if (method === 'PUT') {
      await handlePUT(req, res, session)
    } else if (method === 'DELETE') {
      await handleDELETE(req, res, session)
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  },
)

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const cookie = await prisma.cookie.findFirst({
    where: {
      id: Number(req.query.id),
      website: {
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

  if (!cookie) {
    res.status(404).json({ ok: false, message: 'Cookie not found' })
    return
  }

  res.json(cookie)
}

export const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const id = Number(req.query.id as string)

  if (!id) {
    res.status(400).json({
      ok: false,
      message: 'id is not defined or it is invalid',
    })
    return
  }

  // UPDATE the cookie
  const response = await prisma.cookie.update({
    where: {
      id,
      website: {
        team: {
          users: {
            some: {
              id: session.user.sub,
            },
          },
        },
      },
    },
    data: {
      ...(req.body as Cookie),
      status: CookieStatus.MANUAL,
      createdAt: undefined,
      updatedAt: undefined,
      id: undefined,
      websiteId: undefined,
    },
  })

  res.json({ ok: true, message: 'Succesfully updated cookie', data: response })
}

export const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const id = Number(req.query.id as string)

  if (!id) {
    res.status(400).json({
      ok: false,
      message: 'id is not defined or it is invalid',
    })
    return
  }

  // UPDATE the cookie
  const response = await prisma.cookie.delete({
    where: {
      id,
      website: {
        team: {
          users: {
            some: {
              roles: {
                // Only allow deleting if user is Owner or Admin
                some: {
                  role: {
                    in: ['OWNER', 'ADMIN'],
                  },
                  userId: session.user.sub,
                },
              },
              id: session.user.sub,
            },
          },
        },
      },
    },
  })

  res.json({
    ok: true,
    message: 'Succesfully deleted cookie',
    data: response,
  })
}

export default handle
