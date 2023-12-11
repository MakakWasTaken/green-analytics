// Set up a handler to clean up the data older than 3 months using a CRON job.

import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

// Free -> 1 month
// Pro -> 3 months
// Enterprise -> custom, but default 3 months.

const maxRetentionMonths = {
  free: 1,
  pro: 3,
  enterprise: 12,
}

const STRIPE_SECRET = process.env.STRIPE_SECRET ?? ''

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: '2023-10-16',
  typescript: true,
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }
  try {
    const [teams, products] = await Promise.all([
      prisma.team.findMany({
        include: {
          subscription: true,
        },
      }),
      stripe.products.list({
        active: true,
      }),
    ])

    console.log(`Starting cleanup for ${teams.length} teams`)

    // Cleanup data less than the following date.
    // To prepare for future implementation
    for (const team of teams) {
      // Get the plan, to get the retention period.
      const planProductId = team.subscription?.planProductId
      let plan: 'free' | 'pro' | 'enterprise' = 'free'
      if (planProductId) {
        const product = products.data.find(
          (product) => product.id === planProductId,
        )

        // Get product name
        plan = (product?.name.toLowerCase() ?? 'free') as
          | 'free'
          | 'pro'
          | 'enterprise'
      }

      // TODO: Implement retention settings on team page

      console.log(
        `Cleaning up for team ${team.name} (${team.id}), with plan ${plan}..`,
      )

      const retentionMax = maxRetentionMonths[plan]

      const retentionDateTime = DateTime.utc().minus({
        month: retentionMax,
        day: 1,
      })

      // Delete all events that are older than 3 months. They are not visisble to the user anyways.
      const events = await prisma.event.deleteMany({
        where: {
          updatedAt: {
            lte: retentionDateTime.toJSDate(),
          },
          website: {
            teamId: team.id,
          },
        },
      })
      console.log(`Events: ${events.count}`)
      // If for some reason the website has not been scanned for 3 months. Delete the scan. (This means that the site was not visited in 3 months)
      const scans = await prisma.scan.deleteMany({
        where: {
          updatedAt: {
            lte: retentionDateTime.toJSDate(),
          },
          website: {
            teamId: team.id,
          },
        },
      })
      console.log(`Scans: ${scans.count}`)
      // If we delete properties & events, persons are meaningless anyways.
      const persons = await prisma.person.deleteMany({
        where: {
          updatedAt: {
            lte: retentionDateTime.toJSDate(),
          },
          website: {
            teamId: team.id,
          },
        },
      })
      console.log(`Persons: ${persons.count}`)

      console.log(`Cleaned up team: ${team.name} (${team.id})\r\n-----`)
    }

    console.log('Handled cleanup succesfully!')
    res.json({ ok: true, message: 'Handled cleanup succesfully' })
  } catch (err: any) {
    console.error(err)
    res.json({ ok: false, error: err.message || err })
  }
}

export default handler
