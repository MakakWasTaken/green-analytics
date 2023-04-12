// Get all team members

import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)
    const user = await prisma.user.findUnique({
      where: { id: session?.user.sid },
      select: {
        teams: {
          where: {
            id: teamId,
          },
        },
      },
    })

    if (method === 'GET') {
      // Get own teamId, because we only allow the user to fetch members of their own team

      if (!user?.teams) {
        res.status(404).json({ ok: false, message: 'Team not found' })
        return
      }

      res.json(user?.teams)
    } else if (method === 'PUT') {
      // If the user is trying to update the team info, we need to check if they are the team leader
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
