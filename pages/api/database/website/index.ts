import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { scanWebsite } from '@utils/websiteScanner'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method
    const teamId = req.body.teamId

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    if (!teamId) {
      res.status(400).json({
        ok: false,
        message: 'You need to supply a teamId for this request',
      })
      return
    }

    if (method === 'POST') {
      // Create a website, also when creating a website we do the first scan.
      // After this it will be updated every 2nd week on logEvent (No reason to update a dead website) or it can happen manually.
      const { name, url } = req.body

      // Verify that the user is an admin or a owner of the team to create a new website.
      const teamRole = await prisma.teamRole.findFirst({
        where: {
          teamId,
          userId: session.user.sub,
          role: {
            in: ['ADMIN', 'OWNER'],
          },
        },
      })

      if (!teamRole) {
        res.status(403).json({
          ok: false,
          message: 'You do not have permission to invite new users',
        })
        return
      }

      // Create the final website
      const website = await prisma.website.create({
        data: {
          name,
          url,
          team: {
            connect: {
              id: teamId,
            },
          },
        },
      })

      await scanWebsite(website)

      res.json(website)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
