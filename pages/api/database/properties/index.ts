import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({ ok: false, message: 'Unauthorized' })
      return
    }

    switch (method) {
      case 'GET':
        return handleGET(req, res, session)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ ok: false, message: error.message ?? error.name ?? error })
  }
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  if (!req.query.websiteId) {
    res.status(400).json({ ok: false, message: 'Missing websiteId' })
    return
  }

  const propertyTypes = req.query.type as string

  const propertyTypeSplit = propertyTypes.split(',')

  const properties = await prisma.property.findMany({
    where: {
      key: {
        in: propertyTypeSplit,
      },
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
      event: {
        createdAt: req.query.start
          ? {
              gte: DateTime.fromISO(req.query.start as string).toJSDate(),
            }
          : undefined,
      },
    },
    select: {
      id: true,
      key: true,
      value: true,
    },
  })
  res.status(200).json(properties)
}

export default handle
