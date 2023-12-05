import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import prisma from '../_base'
import { authOptions } from '../auth/[...nextauth]'

const stripe = new Stripe(process.env.STRIPE_SECRET ?? '', {
  typescript: true,
  apiVersion: '2023-10-16',
})

const SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://advisual.io'
    : 'http://localhost:3000'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({
      ok: false,
      message: 'Not authenticated',
    })
    return
  }

  const selectedTeamId = (req.query.selectedTeamId ??
    req.body.selectedTeamId) as string | undefined

  if (!selectedTeamId) {
    res.status(400).json({
      ok: false,
      message: 'selectedTeamId not provided',
    })
    return
  }

  const team = await prisma.team.findFirst({
    where: {
      id: selectedTeamId,
      users: {
        some: {
          roles: {
            some: {
              userId: session.user.id,
              teamId: selectedTeamId,
              role: 'Admin',
            },
          },
          id: session.user.id,
        },
      },
    },
    include: {
      subscription: true,
    },
  })

  if (!team) {
    res.status(404).json({
      ok: false,
      message:
        'Team not found or your do not have the correct permission to access it',
    })
    return
  }

  if (!team.stripeCustomerId) {
    // Team's stripe customer is not set up
    res.status(500).json({
      ok: false,
      message: 'team.stripeCustomerId not set up correctly',
    })
    return
  }

  const customer = await stripe.customers.retrieve(team.stripeCustomerId)

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = `${SITE_URL}/account` // Because this is likely where we are coming from.

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl,
  })

  res.json({
    ok: true,
    message: 'Succesfully created portal session',
    url: portalSession.url,
  })
}

export default handler
