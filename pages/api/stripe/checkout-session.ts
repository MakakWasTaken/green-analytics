import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET ?? '', {
  typescript: true,
  apiVersion: '2023-10-16',
})

const SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://green-analytics.com'
    : 'http://localhost:3000'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res)
    if (!session) {
      res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
      return
    }

    if (req.method === 'POST') {
      await handlePOST(req, res, session)
    } else {
      res.status(405).json({
        ok: false,
        message: `Method ${req.method} not allowed`,
      })
    }
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const priceId = req.body.priceId as string
  const selectedTeam = req.body.selectedTeam as string

  if (!priceId) {
    res.status(400).json({
      ok: false,
      message: 'priceId is not defined',
    })
    return
  }
  if (!selectedTeam) {
    res.status(400).json({
      ok: false,
      message: 'selectedTeam is not defined',
    })
  }

  // Get the price object
  const [price, team] = await Promise.all([
    stripe.prices.retrieve(priceId),
    prisma.team.findFirst({
      where: {
        id: selectedTeam,
        users: {
          some: {
            id: session.user.sub,
          },
        },
      },
    }),
  ])

  if (!price.active) {
    res.status(400).json({
      ok: false,
      message: 'Price is not active',
    })
    return
  }

  if (!team) {
    res.status(400).json({
      ok: false,
      message: 'selectedTeam is not a valid team id',
    })
    return
  }

  if (!team.stripeCustomerId) {
    res.status(500).json({
      ok: false,
      message: 'Team does not have a customer id',
    })
    return
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: team.stripeCustomerId,
    billing_address_collection: 'auto',
    line_items: [
      {
        price: price.id,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${SITE_URL}/dashboard?teamid=${selectedTeam}&successUpgrade=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/pricing?canceled=true`,
  })

  res.json({
    ok: true,
    message: 'Succesfully created session',
    url: checkoutSession.url,
  })
}

export default handler
