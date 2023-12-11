import prisma from '@src/lib/prisma'
import { buffer } from 'micro'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''
const STRIPE_SECRET = process.env.STRIPE_SECRET ?? ''

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: '2023-10-16',
  typescript: true,
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  // Handle the incoming webhook from STRIPE
  const buf = await buffer(req)
  const sig = req.headers['stripe-signature'] as string | string[]

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object
      // Then define and call a function to handle the event customer.subscription.created

      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id
      const team = await prisma.team.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      })

      if (!team) {
        res.status(400).send('Could not find team')
        return
      }

      // Upsert the subscription
      const subscriptionItem = subscription.items.data?.[0]
      if (!subscriptionItem) {
        res.status(400).send('Could not find subscriptionItem')
        return
      }
      const plan = subscriptionItem.plan

      const productId =
        typeof plan.product === 'string' ? plan.product : plan.product?.id

      if (!productId) {
        res.status(400).send('Could not find productId')
        return
      }

      await prisma.teamSubscription.create({
        data: {
          id: subscription.id,
          billingCycle: plan.interval,
          planId: plan.id,
          planProductId: productId,
          status: subscription.status,
          stripeCustomerId: customerId,
          teamId: team.id,
        },
      })

      res.send('Succesfully handled request')
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      // Then define and call a function to handle the event customer.subscription.deleted
      await prisma.teamSubscription.delete({
        where: {
          id: subscription.id,
        },
      })

      res.send('Succesfully handled request')
      break
    }
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed':
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      // Then define and call a function to handle the event customer.subscription.created

      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id
      const team = await prisma.team.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      })

      if (!team) {
        res.status(400).send('Could not find team')
        return
      }

      // Upsert the subscription
      const subscriptionItem = subscription.items.data?.[0]
      if (!subscriptionItem) {
        res.status(400).send('Could not find subscriptionItem')
        return
      }
      const plan = subscriptionItem.plan

      const productId =
        typeof plan.product === 'string' ? plan.product : plan.product?.id

      if (!productId) {
        res.status(400).send('Could not find productId')
        return
      }

      await prisma.teamSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          billingCycle: plan.interval,
          planId: plan.id,
          planProductId: productId,
          status: subscription.status,
        },
      })

      res.send('Succesfully handled request')
      break
    }
    case 'customer.deleted': {
      const customer = event.data.object
      // When a customer is deleted, remove the id from the team using it.

      await prisma.team.updateMany({
        where: {
          stripeCustomerId: customer.id,
        },
        data: {
          stripeCustomerId: null,
        },
      })

      break
    }
    default:
      res.send(`Unhandled event type ${event.type}`)
  }
}

//The next lines are required for Pages API Routes only
export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
