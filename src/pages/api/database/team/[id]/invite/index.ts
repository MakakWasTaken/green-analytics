// Get all team members

import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Team, TeamInvite } from '@prisma/client/edge'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)
    if (!session?.user.sub) {
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

    if (method === 'GET') {
      await handleGET(res, team)
    } else if (method === 'POST') {
      await handlePOST(req, res, team)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

/**
 * Get all invite handler
 * @param req The request
 * @param res The response object, for responsding to the HTTP request.
 * @param session The session of the user trying to access this endpoint.
 * @param team The selected team for this transaction
 */
const handleGET = async (res: NextApiResponse, team: Team) => {
  // Get all invitations for this team
  const response = await prisma.teamInvite.findMany({
    where: {
      teamId: team.id,
    },
  })

  res.json(response)
}

/**
 * Create invite handler
 * @param req The request
 * @param res The response object, for responsding to the HTTP request.
 * @param session The session of the user trying to access this endpoint.
 * @param team The selected team for this transaction
 */
const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  team: Team,
) => {
  const { invitations }: { invitations: Partial<TeamInvite>[] | undefined } =
    req.body

  if (!invitations) {
    res.status(400).json({ ok: false, message: 'No invitations provided' })
    return
  }
  if (
    invitations.some(
      (invitation) => !invitation.userName || !invitation.userEmail,
    )
  ) {
    res.status(400).json({
      ok: false,
      message: 'userName or userEmail missing from one of the invitations',
    })
    return
  }

  // Create the invitations in the DB
  const response = await prisma.teamInvite.createMany({
    data: invitations.map(
      (invitation) => ({ ...invitation, teamId: team.id }) as TeamInvite,
    ),
  })

  // Send out the emails to the users that were invited.

  res.json(response)
}

export default handle
