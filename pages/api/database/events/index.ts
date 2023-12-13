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
  const includePersons = req.query.includePersons === 'true'
  try {
    if (!req.query.websiteId) {
      res.status(400).json({ ok: false, message: 'Missing websiteId' })
      return
    }
    const events = await prisma.event.findMany({
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
        type: req.query.type as string,
        createdAt: req.query.start
          ? {
              gte: DateTime.fromISO(req.query.start as string).toJSDate(),
            }
          : undefined,
      },
      select: includePersons
        ? {
            id: true,
            personId: true,
            person: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdAt: true,
          }
        : {
            id: true,
            personId: true,
            createdAt: true,
          },
    })
    res.status(200).json(events)
  } catch (error: any) {
    res
      .status(500)
      .json({ ok: false, message: error.message ?? error.name ?? error })
  }
}

export default handle
