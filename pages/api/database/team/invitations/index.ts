// Description: Get the user's own invitations from the db

import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 } from 'uuid'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const session = await getSession(req, res)
  if (!session) {
    res.status(401).json({ ok: false, message: 'You are not signed in' })
    return
  }

  if (method === 'GET') {
    await handleGET(req, res, session)
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

/**
 * Get the users own invitations. This is not under the [id]/invite folder because the team id is not known yet.
 * @param req The HTTP request.
 * @param res The HTTP response object, used to respond to the request.
 * @param session The user trying to access this endpoint.
 */
const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // Find all teams where we are a user
  const invites = await prisma.teamInvite.findMany({
    where: {
      userEmail: session?.user.email,
    },
    include: {
      team: true,
    },
  })

  res.json(invites)
}

export default handle
