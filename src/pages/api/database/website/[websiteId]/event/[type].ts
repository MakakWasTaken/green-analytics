import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

enum Type {
  pageview = 'pageview',
  click = 'click',
  form = 'form',
  error = 'error',
}

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method
    const websiteId = req.query.websiteId as string
    const type = req.query.type as Type

    if (method === 'GET') {
      const response = await prisma.event.findMany({
        where: {
          type,
          websiteId,
        },
      })

      res.json(response)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
