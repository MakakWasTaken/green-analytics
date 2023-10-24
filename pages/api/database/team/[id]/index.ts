// Description: Get all teams in the database

import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const session = await getSession(req, res)
  if (!session) {
    res.status(401).json({ ok: false, message: 'You are not signed in' })
    return
  }

  if (method === 'DELETE') {
    await handleDELETE(req, res, session)
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const teamId = req.query.id as string

  if (!teamId) {
    res.status(400).json({ ok: false, message: 'teamId not defined' })
    return
  }

  // Verify that the current user is the owner.
  const teamRole = await prisma.teamRole.findFirst({
    where: {
      role: 'OWNER',
      userId: session.user?.sub,
      teamId,
    },
  })

  if (!teamRole) {
    // If the role does not exist, delete the role.
    res.status(401).json({
      ok: false,
      message: 'You do not have permission to perform this action.',
    })
    return
  }

  // Delete the team
  await prisma.team.delete({
    where: {
      id: teamId,
    },
  })

  res.json({ ok: true, message: 'Successfully deleted team' })
}

export default handle
