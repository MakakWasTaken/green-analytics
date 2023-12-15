// Get all team members

import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Team } from '@prisma/client/edge'
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
    })

    if (!team) {
      res
        .status(404)
        .json({ ok: false, message: `Could not find team with id: ${teamId}` })
      return
    }

    if (method === 'DELETE') {
      await handleDELETE(req, res, session, team)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  team: Team,
) => {
  // Delete the invitation
  const inviteId = req.query.inviteId as string

  const response = await prisma.teamInvite.delete({
    where: {
      id: inviteId,
      teamId: team.id,
    },
  })

  res.json({ ok: true, message: 'Succesfully deleted invite', data: response })
}

export default handle
