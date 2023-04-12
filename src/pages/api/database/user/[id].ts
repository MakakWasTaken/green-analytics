// GET, UPDATE, DELETE

import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
      return
    }
    const userId = req.query.id as string
    const session = await getSession(req, res)

    // Get own teamId, because we only allow the user to fetch members of their own team
    const user = await prisma.user.findUnique({
      where: { id: session?.user.sid },
      select: {
        teamId: true,
      },
    })
    const teamId = user?.teamId

    if (teamId !== undefined) {
      const user = await prisma.user.findFirst({
        where: { id: userId, teamId },
      })
      res.json(user)
    } else {
      res.status(401)
    }
  },
)

export default handle
