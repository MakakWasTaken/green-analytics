import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req

    const websiteId = req.query.websiteId as string

    if (!websiteId) {
      res.status(400).json({ ok: false, message: 'Missing websiteId' })
      return
    }

    switch (method) {
      case 'GET':
        try {
          const scans = await prisma.scan.findMany({
            where: {
              websiteId,
              createdAt: req.query.start
                ? {
                    gte: DateTime.fromISO(req.query.start as string).toJSDate(),
                  }
                : undefined,
            },
          })
          res.status(200).json(scans)
        } catch (error) {
          res.status(500).json({ error })
        }
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  },
)

export default handle
