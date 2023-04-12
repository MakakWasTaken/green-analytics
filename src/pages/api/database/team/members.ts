// Get all team members

import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    if (method === 'GET') {
      const session = await getSession(req, res)

      // Get own teamId, because we only allow the user to fetch members of their own team
      const user = await prisma.user.findUnique({
        where: { id: session?.user.sid },
        select: {
          teamId: true,
        },
      })
      const teamId = user?.teamId

      const members = await prisma.user.findMany({
        where: {
          teamId,
        },
      })

      res.json(members)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
