import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  switch (method) {
    case 'GET': {
      const includePersons = req.query.includePersons === 'true'
      try {
        if (!req.query.websiteId) {
          res.status(400).json({ error: 'Missing websiteId' })
          return
        }
        const events = await prisma.event.findMany({
          where: {
            website: {
              id: req.query.websiteId as string,
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
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handle
