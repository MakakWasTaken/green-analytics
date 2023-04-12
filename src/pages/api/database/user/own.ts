import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method
    const session = await getSession(req, res)

    const userId = session?.user.sid

    if (userId) {
      if (method === 'GET') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          // If the user is not found, create it with the current session
          const sessionUser = session.user
          const newTeam = await prisma.team.create({
            data: {
              name: sessionUser.name,
              updatedAt: new Date(),
            },
          })

          const newUser = await prisma.user.create({
            data: {
              id: userId,
              name: sessionUser.name,
              email: sessionUser.email,
              teamId: newTeam.id,
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
      res.status(401).json({ ok: false, message: 'Unauthorized' })
    }
  },
)
export default handle
