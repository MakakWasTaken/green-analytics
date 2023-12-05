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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const planId = req.query.id as string

  if (!planId) {
    res.status(400).json({
      ok: false,
      message: 'planId not defined',
    })
    return
  }

  // Get plan from Stripe.

  const [plan, products] = await Promise.all([
    stripe.plans.retrieve(planId),
    stripe.products.list({
      active: true,
    }),
  ])

  const response = {
    ...plan,
    product:
      typeof plan.product === 'string'
        ? products.data.find((product) => product.id === plan.product) ?? null
        : plan.product,
  }

  res.json(response)
}

export default handle
