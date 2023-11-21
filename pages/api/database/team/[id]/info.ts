// Get all team members

import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)
    const team = await prisma.team.findFirst({
      where: { id: teamId, users: { some: { id: session?.user.sub } } },
      include: {
        users: true,
        roles: true,
        websites: true,
      },
    })

    if (method === 'GET') {
      // Get own teamId, because we only allow the user to fetch members of their own team

      if (!team) {
        res.status(404).json({ ok: false, message: 'Team not found' })
        return
      }

      res.json(team)
    } else if (method === 'PUT') {
      // If the user is trying to update the team info, we need to check if they are the team leader
      const teamRole = await prisma.teamRole.findFirst({
        where: {
          teamId,
          userId: session?.user.sub,
          role: 'OWNER',
        },
      })
      if (!teamRole) {
        res
          .status(401)
          .json({ ok: false, message: 'You do not have the right permissions' })
        return
      }

      const { name } = req.body

      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          name,
        },
      })

      res.json(updatedTeam)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
