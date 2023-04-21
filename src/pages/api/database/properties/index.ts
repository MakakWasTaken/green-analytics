import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        if (!req.query.websiteId) {
          res.status(400).json({ error: 'Missing websiteId' })
          return
        }
        const properties = await prisma.property.findMany({
          where: {
            website: {
              id: req.query.websiteId as string,
            },
            createdAt: req.query.start
              ? {
                  gte: DateTime.fromISO(req.query.start as string).toJSDate(),
                }
              : undefined,
          },
        })
        res.status(200).json(properties)
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handle
