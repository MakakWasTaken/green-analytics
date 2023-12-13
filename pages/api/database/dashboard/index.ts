import { Claims, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({ ok: false, message: 'Unauthorized' })
      return
    }
    const selectedWebsite = req.query.selectedWebsite as string

    if (!selectedWebsite) {
      res.status(400).json({
        ok: false,
        message: 'selectedWebsite not defined',
      })
      return
    }

    if (req.method === 'GET') {
      await handleGET(req, res, session.user)
    } else if (req.method === 'POST') {
      await handlePOST(req, res, session.user)
    } else {
      res.status(405).json({
        ok: false,
        message: `Method ${req.method} is not allowed for this endpoint`,
      })
    }
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: Claims,
) => {
  const selectedWebsite = req.query.selectedWebsite as string

  const response = await prisma.dashboard.findMany({
    where: {
      website: {
        id: selectedWebsite,
        team: {
          users: {
            some: {
              id: user.sub,
            },
          },
        },
      },
    },
  })

  res.json(response)
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: Claims,
) => {
  const selectedWebsite = req.query.selectedWebsite as string
  const name = req.body.name as string | undefined

  // Validate data
  if (!name) {
    res.status(400).json({
      ok: false,
      message: 'name is not defined',
    })
    return
  }

  // Check that the user is part of the team
  const teamResponse = await prisma.team.findFirst({
    where: {
      websites: {
        some: {
          id: selectedWebsite,
        },
      },
      users: {
        some: {
          id: user.sub,
        },
      },
    },
    include: {
      roles: true,
    },
  })

  // Validate the user's role
  const role = teamResponse?.roles.find(
    (role) => role.userId === user.sub,
  )?.role

  if (!role || (role !== 'ADMIN' && role !== 'OWNER')) {
    res.status(403).json({
      ok: false,
      message: 'You do not have the right permission to do this',
    })
    return
  }

  // Create the new dashboard
  const response = await prisma.dashboard.create({
    data: {
      name,
      websiteId: selectedWebsite,
    },
  })

  res.json(response)
}

export default handler
