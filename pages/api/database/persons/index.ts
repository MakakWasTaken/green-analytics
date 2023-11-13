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
    if (!req.query.websiteId) {
      res.status(400).json({ error: 'Missing websiteId' })
      return
    }

    if (method === 'GET') {
      // Get all persons for this website, use pagination
      if (req.query.page) {
        const [persons, count] = await Promise.all([
          prisma.person.findMany({
            where: {
              website: {
                id: req.query.websiteId as string,
                team: {
                  users: {
                    some: {
                      id: session.user.sub,
                    },
                  },
                },
              },
            },
            skip: req.query.page
              ? Number.parseInt(req.query.page as string) * 20
              : 0,
            take: 20,
            orderBy: [
              { email: 'desc' },
              { name: 'desc' },
              { createdAt: 'desc' },
            ],
          }),
          prisma.person.count({
            where: {
              website: {
                id: req.query.websiteId as string,
                team: {
                  users: {
                    some: {
                      id: session.user.sub,
                    },
                  },
                },
              },
            },
          }),
        ])

        res.json({ persons, count })
      } else {
        // Get all persons for this website
        const persons = await prisma.person.findMany({
          where: {
            website: {
              id: req.query.websiteId as string,
              team: {
                users: {
                  some: {
                    id: session.user.sub,
                  },
                },
              },
            },
          },
          orderBy: [{ email: 'desc' }, { name: 'desc' }, { createdAt: 'desc' }],
        })

        res.json({ persons })
      }
    } else {
      res.status(405).json({ ok: false, message: 'Method not allowed' })
    }
  },
)

export default handle
