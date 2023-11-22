import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const session = await getSession(req, res)

  if (!session) {
    res.status(401).json({ ok: false, message: 'Unauthorized' })
    return
  }

  if (!req.query.websiteId) {
    res.status(400).json({ ok: false, message: 'Missing websiteId' })
    return
  }

  if (req.method === 'GET') {
    await handleGET(req, res, session)
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  if (!req.query.websiteId) {
    res.status(400).json({ message: 'Missing websiteId' })
    return
  }

  const personCount = await prisma.person.count({
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
      email: {
        not: null,
      },
    },
  })

  res.status(200).json({ count: personCount })
}

export default handle
