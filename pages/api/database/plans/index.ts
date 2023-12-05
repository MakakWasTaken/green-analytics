import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const STRIPE_SECRET = process.env.STRIPE_SECRET ?? ''

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method

  if (method === 'GET') {
    await handleGET(req, res)
  } else {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
  }
}

const handleGET = async (_req: NextApiRequest, res: NextApiResponse) => {
  // Get all plans from Stripe.

  const [plans, products] = await Promise.all([
    stripe.plans.list({
      active: true,
    }),
    stripe.products.list({
      active: true,
    }),
  ])

  const response = plans.data.map<Stripe.Plan>((plan) => ({
    ...plan,
    product:
      typeof plan.product === 'string'
        ? products.data.find((product) => product.id === plan.product) ?? null
        : plan.product,
  }))

  const groupedByInterval = response.reduce((prev, cur) => {
    if (!prev[cur.interval]) {
      prev[cur.interval] = []
    }
    prev[cur.interval].push(cur)

    return prev
  }, {} as { [key: string]: Stripe.Plan[] })

  res.json(groupedByInterval)
}

export default handle
