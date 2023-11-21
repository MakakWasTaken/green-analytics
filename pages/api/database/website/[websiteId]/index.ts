import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const websiteId = req.query.websiteId as string
    const session = await getSession(req, res)

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
                userId: session?.user.sub,
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
                userId: session?.user.sub,
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
      const { name, url } = req.body

      const result = await prisma.website.update({
        where: {
          id: websiteId,
        },
        data: {
          name,
          url,
        },
      })

      res.json(result)
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  },
)

export default handle
