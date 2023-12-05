import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const websiteId = req.query.websiteId as string
    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    // Add delete method
    if (method === 'DELETE') {
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
    } else if (method === 'PUT') {
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
      const { name, url, teamId } = req.body

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

      const result = await prisma.website.update({
        where: {
          id: websiteId,
        },
        data: {
          name,
          url,
          teamId,
        },
      })

      res.json(result)
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  },
)

export default handle
