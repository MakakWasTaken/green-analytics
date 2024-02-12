import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 } from 'uuid'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res)
    if (!session) {
      res.status(401).json({ ok: false, message: 'You are not signed in' })
      return
    }

    if (req.method === 'POST') {
      await handlePOST(req, res, session)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
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

  // Check that the invite exists
  const invite = await prisma.teamInvite.findUnique({
    where: {
      id: inviteId,
      userEmail: session.user.email,
    },
  })

  if (!invite) {
    res.status(404).json({
      ok: false,
      message:
        'Could not find invitation, you might already have reacted to it.',
    })
    return
  }

  // If the invite exists, add the user to the team and vice-versa.
  await prisma.user.update({
    where: {
      id: session.user.sub,
    },
    data: {
      teams: {
        connect: {
          id: invite.teamId,
        },
      },
      roles: {
        create: {
          role: 'MEMBER',
          teamId: invite.teamId,
        },
      },
    },
    include: {
      teams: true,
    },
  })

  // Delete the invitation
  await prisma.teamInvite.delete({
    where: {
      id: inviteId,
    },
  })

  res.json({ ok: true, message: 'Invitation accepted' })
}

export default handle
