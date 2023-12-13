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

    if (req.method === 'GET') {
      await handleGET(req, res, session.user)
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
  const dashboardId = req.query.dashboardId as string

  if (!dashboardId) {
    res.status(400).json({
      ok: false,
      message: 'slug dashboardId not defined',
    })
    return
  }
  if (!selectedWebsite) {
    res.status(400).json({
      ok: false,
      message: 'selectedWebsite not defined',
    })
    return
  }

  const response = await prisma.dashboardCell.findMany({
    where: {
      dashboardId: dashboardId,
      dashboard: {
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
    },
  })

  res.json(response)
}

export default handler
