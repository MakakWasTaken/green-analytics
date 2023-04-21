/* eslint-disable no-case-declarations */
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({ ok: false, message: 'Unauthorized' })
      return
    }

    const website = await prisma.website.findFirst({
      where: {
        id: req.query.websiteId as string,
        team: {
          users: {
            some: {
              id: session?.user.sub,
            },
          },
        },
      },
    })

    if (!website) {
      res.status(401).json({ ok: false, message: 'Website not found' })
      return
    }

    if (method === 'GET') {
      // Get all persons for this website, use pagination
      const persons = await prisma.person.findMany({
        where: {
          websiteId: website.id as string,
        },
        skip: req.query.page
          ? Number.parseInt(req.query.page as string) * 20
          : 0,
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
      })
      const count = await prisma.person.count({
        where: {
          websiteId: website.id as string,
        },
      })

      res.json({ persons, count })
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  },
)

export default handle
