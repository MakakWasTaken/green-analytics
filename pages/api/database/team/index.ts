// Description: Get all teams in the database

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
  } else if (method === 'POST') {
    await handlePOST(req, res, session)
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // The number of teams should be depending on the plan that the user has.
  // TODO: Implement plans.

  // Create the new team.
  const team = await prisma.team.create({
    data: {
      name: req.body.name,
      users: {
        connect: {
          id: session.user.sub,
        },
      },
      roles: {
        create: {
          role: 'OWNER',
          userId: session.user.sub,
        },
      },
    },
  })

  res.json(team)
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // Find all teams where we are a user
  const teams = await prisma.team.findMany({
    where: {
      users: {
        some: {
          id: session?.user.sub,
        },
      },
    },
  })

  res.json(teams)
}

export default handle
