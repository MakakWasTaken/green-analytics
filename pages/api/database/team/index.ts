// Description: Get all teams in the database

import { Session, getSession } from '@auth0/nextjs-auth0'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const STRIPE_SECRET = process.env.STRIPE_SECRET ?? ''

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  const session = await getSession(req, res)
  if (!session) {
    res.status(401).json({ ok: false, message: 'You are not signed in' })
    return
  }

  if (method === 'GET') {
    await handleGET(req, res, session)
  } else if (method === 'POST') {
    await handlePOST(req, res, session)
  } else {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  if (!req.body.name) {
    res.status(400).json({
      ok: false,
      message: 'name not defined',
    })
    return
  }
  // The number of teams should be depending on the plan that the user has.
  // When a team is create, start by creating a stripe customer for it.
  const stripeCustomer = await stripe.customers.create({
    name: req.body.name,
    email: session.user.email,
  })

  // Create the new team.
  const team = await prisma.team.create({
    data: {
      name: req.body.name,
      stripeCustomerId: stripeCustomer.id,
      users: {
        connect: {
          id: session.user.sub,
        },
      },
      roles: {
        create: {
          role: 'OWNER',
          userId: session.user.sub,
        },
      },
    },
  })

  res.json(team)
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // Find all teams where we are a user
  const teams = await prisma.team.findMany({
    where: {
      users: {
        some: {
          id: session.user.sub,
        },
      },
    },
  })

  res.json(teams)
}

export default handle
