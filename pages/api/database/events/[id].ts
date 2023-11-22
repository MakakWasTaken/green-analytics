import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({ ok: false, message: 'Unauthorized' })
      return
    }

    switch (method) {
      case 'GET': {
        return handleGET(req, res, session)
      }
      default:
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  },
)

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  try {
    if (!req.query.id) {
      res.status(400).json({ error: 'Missing id' })
      return
    }
    if (!req.query.websiteId) {
      res.status(400).json({ error: 'Missing websiteId' })
      return
    }
    const events = await prisma.event.findFirst({
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
        id: req.query.id as string,
      },
    })
    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default handle
