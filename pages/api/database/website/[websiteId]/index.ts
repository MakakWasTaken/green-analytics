import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    const websiteId = req.query.websiteId as string
    if (!websiteId) {
      res.status(400).json({
        ok: false,
        message: 'websiteId is missing',
      })
      return
    }

    // Add delete method
    if (method === 'DELETE') {
      await handleDELETE(req, res, session)
    } else if (method === 'PUT') {
      await handlePUT(req, res, session)
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  },
)

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const websiteId = req.query.websiteId as string
  // Add update method

  // Check if the website exists and the user is allowed to update it
  // Only admins are allowed to update websites

  // Get the website, to find its team
  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
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
    res
      .status(403)
      .json({ ok: false, message: 'Website not found or unauthorized' })
    return
  }

  // Update the website
  const { name, url, teamId, cookiePolicyEnabled, cookiePolicyUrl } = req.body

  // If teamId is defined we also need to verify that the user is an admin in the other team
  if (teamId) {
    const destinationTeamIdVerification = await prisma.team.findFirst({
      where: {
        id: teamId,
        roles: {
          some: {
            userId: session.user.sub,
            role: {
              in: ['ADMIN', 'OWNER'],
            },
          },
        },
      },
    })

    if (!destinationTeamIdVerification) {
      res.status(403).json({
        ok: false,
        message:
          'You do not have the right permissions in the destination team.',
      })
      return
    }
  }

  let newSettings = website.settings as { [key: string]: any } | null

  if (!newSettings) {
    newSettings = {}
  }

  if (cookiePolicyEnabled !== undefined) {
    newSettings.cookiePolicyEnabled = cookiePolicyEnabled
  }
  if (cookiePolicyUrl !== undefined) {
    newSettings.cookiePolicyUrl = cookiePolicyUrl
  }

  const result = await prisma.website.update({
    where: {
      id: websiteId,
    },
    data: {
      name,
      url,
      teamId,
      settings: newSettings,
    },
  })

  res.json({
    ok: true,
    message: 'Succesfully updated website',
    data: result,
  })
}

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const websiteId = req.query.websiteId as string

  // Check if the website exists and the user is allowed to delete it
  // Only admins are allowed to delete websites

  // Get the website, to find its team
  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
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
    res
      .status(403)
      .json({ ok: false, message: 'Website not found or unauthorized' })
    return
  }

  // Delete the website
  await prisma.website.delete({
    where: {
      id: websiteId,
    },
  })

  res.status(200).json({ ok: true, message: 'Website deleted' })
}

export default handle
