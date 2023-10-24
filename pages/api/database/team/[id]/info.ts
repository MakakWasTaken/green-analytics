// Get all team members

import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Team, TeamRole } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'You need to be authenticated to perform this action',
      })
      return
    }

    const team = await prisma.team.findFirst({
      where: { id: teamId, users: { some: { id: session?.user.sub } } },
      include: {
        users: true,
        roles: true,
        websites: true,
      },
    })

    if (!team) {
      res.status(404).json({ ok: false, message: 'Team not found' })
      return
    }

    if (method === 'GET') {
      res.json(team)
    } else if (method === 'PUT') {
      await handlePUT(req, res, session, team)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  team: Team & { roles: TeamRole[] },
) => {
  const role = team.roles.find((role) => role.userId === session.user.sub)

  // If the user is trying to update the team info, we need to check if they are the owner/admin
  if (!role || (role.role !== 'ADMIN' && role.role !== 'OWNER')) {
    res
      .status(401)
      .json({ ok: false, message: 'You do not have the right permissions' })
    return
  }

  const { name } = req.body

  const updatedTeam = await prisma.team.update({
    where: { id: team.id },
    data: {
      name,
    },
  })

  res.json(updatedTeam)
}

export default handle
