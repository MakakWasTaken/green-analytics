import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  switch (method) {
    case 'GET':
      if (!req.query.websiteId) {
        res.status(400).json({ message: 'Missing websiteId' })
        return
      }

      const personCount = await prisma.person.count({
        where: {
          websiteId: req.query.websiteId as string,
          email: {
            not: null,
          },
        },
      })

      res.status(200).json({ count: personCount })
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handle
