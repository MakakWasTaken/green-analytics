import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { scanWebsite } from '@src/utils/websiteScanner'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    if (!req.query.websiteId) {
      res.status(400).json({
        ok: false,
        message: 'Missing websiteId',
      })
      return
    }

    // This action requires the user to be logged in
    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    try {
      if (req.method === 'GET') {
        await handleGET(req, res, session)
      } else if (req.method === 'POST') {
        await handlePOST(req, res, session)
      } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    } catch (error: any) {
      console.error(error)
      res
        .status(500)
        .json({ ok: false, message: error.message ?? error.name ?? error })
    }
  },
)

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const scans = await prisma.scan.findMany({
    where: {
      website: {
        id: req.query.websiteId as string,
        team: {
          roles: {
            some: {
              userId: session.user.sub,
            },
          },
        },
      },
      createdAt: req.query.start
        ? {
            gte: DateTime.fromISO(req.query.start as string).toJSDate(),
          }
        : undefined,
    },
  })
  res.status(200).json(scans)
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // Get the website

  // This action requires the user to be admin or owner (The action requires a lot of server power, so we don't want users to abuse it)

  const website = await prisma.website.findFirst({
    where: {
      id: req.query.websiteId as string,
      team: {
        roles: {
          some: {
            userId: session.user.sub,
            role: {
              in: ['ADMIN', 'OWNER'],
            },
          },
        },
      },
    },
  })

  if (!website) {
    res.status(404).json({
      ok: false,
      message: 'Website not found',
    })
    return
  }

  await scanWebsite(website)

  res.json({ ok: true })
}

export default handle
