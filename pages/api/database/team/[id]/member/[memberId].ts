// Get all team members

import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Team, TeamRole, User } from '@prisma/client/edge'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)
    if (!session) {
      res.status(401).json({ ok: false, message: 'You are not logged in' })
      return
    }
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        roles: {
          some: {
            userId: session.user.sub,
            role: {
              in: ['ADMIN', 'OWNER'],
            },
          },
        },
      },
      include: {
        users: true,
        roles: true,
      },
    })

    if (!team) {
      res
        .status(404)
        .json({ ok: false, message: `Could not find team with id: ${teamId}` })
      return
    }

    if (method === 'PUT') {
      await handlePUT(req, res, session, team)
    } else if (method === 'DELETE') {
      await handleDELETE(req, res, session, team)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

const validRoles = ['MEMBER', 'ADMIN']

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  team: Team & { users: User[]; roles: TeamRole[] },
) => {
  // Handle role change of user
  const memberId = req.query.memberId as string
  const role = req.body.role as string

  if (!validRoles.includes(role)) {
    res.status(400).json({
      ok: false,
      message: 'The only valid roles are "MEMBER" and "ADMIN',
    })
    return
  }

  const teamRole = team.roles.find((role) => role.userId === memberId)
  if (teamRole?.role !== 'OWNER') {
    res.status(403).json({
      ok: false,
      message: 'You are not allowed to change the role of the owner',
    })
    return
  }

  const response = await prisma.teamRole.update({
    where: {
      id: teamRole.id,
    },
    data: {
      role: role,
    },
  })

  res.json(response)
}

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  team: Team & { users: User[]; roles: TeamRole[] },
) => {
  // Delete the invitation
  const memberId = req.query.memberId as string

  const memberRoleId = team.roles.find((role) => role.userId === memberId)?.id

  const response = await prisma.team.update({
    where: {
      id: team.id,
    },
    data: {
      users: {
        disconnect: {
          id: memberId,
        },
      },
      roles: {
        delete: {
          id: memberRoleId,
          teamId: team.id,
        },
      },
    },
  })

  res.json(response)
}

export default handle
