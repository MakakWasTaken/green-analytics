// Description: Get all teams in the database

import { getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const session = await getSession(req, res)

  if (method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: session?.user.sid },
      select: {
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    res.json(user?.teams)
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}
