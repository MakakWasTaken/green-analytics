import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { Team, TeamRole } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const STRIPE_SECRET = process.env.STRIPE_SECRET ?? ''

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)

    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    let team = await prisma.team.findFirst({
      where: { id: teamId, users: { some: { id: session.user.sub } } },
      include: {
        users: true,
        roles: {
          include: {
            user: true,
          },
        },
        websites: true,
        subscription: true,
      },
    })

    if (!team) {
      res.status(404).json({ ok: false, message: 'Team not found' })
      return
    }

    // Backwards compatibility
    if (!team.stripeCustomerId) {
      // Get the owner of the team
      const owner = team.roles.find((role) => role.role === 'OWNER')

      if (!owner) {
        res.status(404).json({
          ok: false,
          message: 'Owner not found when creating stripe customer',
        })
        return
      }
      const stripeCustomer = await stripe.customers.create({
        name: req.body.name,
        email: owner.user.email,
      })
      team = await prisma.team.update({
        where: {
          id: team.id,
        },
        data: {
          stripeCustomerId: stripeCustomer.id,
        },
        include: {
          users: true,
          roles: {
            include: {
              user: true,
            },
          },
          websites: true,
          subscription: true,
        },
      })
    }

    if (method === 'GET') {
      res.json(team)
    } else if (method === 'PUT') {
      await handlePUT(req, res, session, team)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  team: Team & { roles: TeamRole[] },
) => {
  const role = team.roles.find((role) => role.userId === session.user.sub)

  // If the user is trying to update the team info, we need to check if they are the owner/admin
  if (!role || (role.role !== 'ADMIN' && role.role !== 'OWNER')) {
    res
      .status(401)
      .json({ ok: false, message: 'You do not have the right permissions' })
    return
  }

  const { name } = req.body

  const updatedTeam = await prisma.team.update({
    where: { id: team.id },
    data: {
      name,
    },
  })

  res.json({
    ok: true,
    message: 'Succesfully updated team',
    data: updatedTeam,
  })
}

export default handle
