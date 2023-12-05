import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
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
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  try {
    const type = req.query.type as string
    if (!type) {
      res.status(400).json({ error: 'Missing type' })
      return
    }
    if (!req.query.websiteId) {
      res.status(400).json({ error: 'Missing websiteId' })
      return
    }
    const [events, count] = await Promise.all([
      prisma.event.findMany({
        where: {
          type,
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
          createdAt: {
            gte: DateTime.utc().minus({ month: 3 }).toJSDate(), // Get event types for the past 3 months.
          },
        },
        skip: req.query.page
          ? Number.parseInt(req.query.page as string) * 20
          : 0,
        take: 20,
      }),
      prisma.event.count({
        where: {
          type,
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
          createdAt: {
            gte: DateTime.utc().minus({ month: 3 }).toJSDate(), // Get event types for the past 3 months.
          },
        },
      }),
    ])

    res.status(200).json({
      events,
      count: count,
    })
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default handle
