import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const session = await getSession(req, res)

    const userId = session?.user.sub

    if (userId) {
      if (method === 'GET') {
        const user = await prisma.user.findFirst({
          where: { id: userId },
        })

        if (!user) {
          // If the user is not found, create it with the current session
          const sessionUser = session.user

          const newUser = await prisma.user.create({
            data: {
              id: userId,
              name: sessionUser.name,
              email: sessionUser.email,
              picture: sessionUser.picture,
              teams: {
                create: [
                  {
                    name: sessionUser.name,
                  },
                ],
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
              teams: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
          await prisma.teamRole.create({
            data: {
              team: {
                connect: {
                  id: newUser.teams[0].id,
                },
              },
              user: {
                connect: {
                  id: newUser.id,
                },
              },
              role: 'OWNER',
            },
          })
          res.json(newUser)
          return
        }
        res.json(user)
      } else if (method === 'PUT') {
        const user = await prisma.user.update({
          where: { id: userId },
          data: req.body,
        })

        res.json(user)
      } else if (method === 'DELETE') {
        const user = await prisma.user.delete({
          where: { id: userId },
        })

        res.json(user)
      } else {
        res.status(405).json({ ok: false, message: 'Method Not Allowed' })
      }
    } else {
      // If the user is not logged in, return null. This means that we can use this endpoint as proof of sign in
      res.json(null)
    }
  },
)
export default handle
