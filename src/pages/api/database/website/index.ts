import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { scanWebsite } from '@src/utils/websiteScanner'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    const userId = session?.user.sub

    if (userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          teams: {
            some: {
              id: req.body.teamId,
            },
          },
        },
      })

      if (!user) {
        res.status(403).json({ ok: false, message: 'Team not found' })
        return
      }

      if (method === 'POST') {
        // Create a website, also when creating a website we do the first scan.
        // After this it will be updated every 2nd week on logEvent (No reason to update a dead website) or it can happen manually.
        const { name, url } = req.body

        // Create the final website
        const website = await prisma.website.create({
          data: {
            name,
            url,
            team: {
              connect: {
                id: req.body.teamId,
              },
            },
          },
        })

        await scanWebsite(website)

        res.json(website)
      } else {
        res.status(405).json({ ok: false, message: 'Method Not Allowed' })
      }
    }
  },
)

export default handle
