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

  if (method === 'POST') {
    await handlePOST(req, res, session)
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

/**
 * Accept an invitation
 * @param req The request object.
 * @param res The response object, used to respond to the request.
 * @param session The user's session.
 */
const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const inviteId = req.body.id

  if (!inviteId) {
    res.status(400).json({
      ok: false,
      message: 'You need to supply an id for this request to work',
    })
    return
  }

  // Delete the invitation
  await prisma.teamInvite.delete({
    where: {
      id: inviteId,
    },
  })

  res.json({ ok: true, message: 'Invitation declined' })
}

export default handle
