import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
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
  const person = await prisma.person.findFirst({
    where: {
      id: req.query.id as string,
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
    include: {
      events: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      properties: {
        distinct: 'key',
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!person) {
    res.status(404).json({ ok: false, message: 'Person not found' })
    return
  }

  res.json(person)
}

export default handle
