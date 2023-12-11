import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    const userId = session.user.sub
    const teamId = req.query.teamId as string

    // Check if user is part of the defined team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        users: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        websites: true,
      },
    })

    if (!team) {
      res.status(403).json({ ok: false, message: 'Team not found' })
      return
    }

    if (method === 'GET') {
      res.json(team.websites)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
