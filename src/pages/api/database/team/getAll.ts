// Description: Get all teams in the database

import { getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const session = await getSession(req, res)

  if (method === 'GET') {
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
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

export default handle
