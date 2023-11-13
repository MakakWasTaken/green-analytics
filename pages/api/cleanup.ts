// Set up a handler to clean up the data older than 3 months using a CRON job.

import prisma from '@src/lib/prisma'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'

// TODO: In the future, this should depend on the subscription.
// Free -> 1 month
// Pro -> 3 months
// Enterprise -> custom, but default 3 months.

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }
  try {
    const teams = await prisma.team.findMany()

    console.log(`Starting cleanup for ${teams.length} teams`)

    // Cleanup data less than the following date.
    // To prepare for future implementation
    for (const team of teams) {
      console.log(`Cleaning up for team ${team.name} (${team.id})..`)
      const threeMonthsAgo = DateTime.utc().minus({ month: 3, day: 1 })

      // Delete all events that are older than 3 months. They are not visisble to the user anyways.
      const events = await prisma.event.deleteMany({
        where: {
          updatedAt: {
            lte: threeMonthsAgo.toJSDate(),
          },
          website: {
            teamId: team.id,
          },
        },
      })
      console.log(`Events: ${events.count}`)
      // Delete all properties that are older than 3 months. They are obsolete.
      const properties = await prisma.property.deleteMany({
        where: {
          updatedAt: {
            lte: threeMonthsAgo.toJSDate(),
          },
          website: {
            teamId: team.id,
          },
        },
      })
      console.log(`Properties: ${properties.count}`)
      // If for some reason the website has not been scanned for 3 months. Delete the scan. (This means that the site was not visited in 3 months)
      const scans = await prisma.scan.deleteMany({
        where: {
          updatedAt: {
            lte: threeMonthsAgo.toJSDate(),
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
            lte: threeMonthsAgo.toJSDate(),
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
