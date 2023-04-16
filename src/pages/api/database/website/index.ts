import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    const userId = session?.user.sub

    if (userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          teams: {
            some: {
              id: req.body.teamId,
            },
          },
        },
      })

      if (!user) {
        res.status(403).json({ ok: false, message: 'Team not found' })
        return
      }

      if (method === 'POST') {
        // Create a website
        const { name, url } = req.body
        const website = await prisma.website.create({
          data: {
            name,
            url,
            team: {
              connect: {
                id: req.body.teamId,
              },
            },
          },
        })

        res.json(website)
      } else {
        res.status(405).json({ ok: false, message: 'Method Not Allowed' })
      }
    }
  },
)

export default handle
