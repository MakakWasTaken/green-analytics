// Get all team members

import { Session, getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { TeamInvite } from '@prisma/client/edge'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export const handle = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    const teamId = req.query.id as string

    const session = await getSession(req, res)
    if (!session) {
      res.status(401).json({ ok: false, message: 'You are not logged in' })
      return
    }

    if (method === 'GET') {
      await handleGET(res, session, teamId)
    } else if (method === 'POST') {
      await handlePOST(req, res, session, teamId)
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

/**
 * Get all invite handler
 * @param req The request
 * @param res The response object, for responsding to the HTTP request.
 * @param session The session of the user trying to access this endpoint.
 * @param team The selected team for this transaction
 */
const handleGET = async (
  res: NextApiResponse,
  session: Session,
  teamId: string,
) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      users: {
        some: {
          id: session.user.sub,
        },
      },
    },
  })

  if (!team) {
    res
      .status(404)
      .json({ ok: false, message: `Could not find team with id: ${teamId}` })
    return
  }

  // Get all invitations for this team
  const response = await prisma.teamInvite.findMany({
    where: {
      teamId: team.id,
    },
  })

  res.json(response)
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: 'no-reply@green-analytics.com', // Your email address
    serviceClient: process.env.GMAIL_CLIENT_ID,
    privateKey: process.env.GMAIL_PRIVATE_KEY,
    accessUrl: process.env.GMAIL_TOKEN_URL,
  },
})

const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    // Verify your transporter
    await transporter.verify()

    const mailOptions = {
      from: '"Green-Analytics" <no-reply@green-analytics.com>', // sender address
      to, // receiver
      subject, // Subject line
      text, // plain text body
      // We don't use html, because emails with only text has 80% higher open rate.
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`Message sent: ${info.messageId}`)

    return info
  } catch (error: any) {
    console.error(error)
  }
  return null
}

/**
 * Create invite handler
 * @param req The request
 * @param res The response object, for responsding to the HTTP request.
 * @param session The session of the user trying to access this endpoint.
 * @param team The selected team for this transaction
 */
const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  teamId: string,
) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      roles: {
        some: {
          userId: session.user.sub,
          role: {
            in: ['ADMIN', 'OWNER'],
          },
        },
      },
    },
  })

  if (!team) {
    res
      .status(404)
      .json({ ok: false, message: `Could not find team with id: ${teamId}` })
    return
  }

  const { invitations }: { invitations: Partial<TeamInvite>[] | undefined } =
    req.body

  if (!invitations) {
    res.status(400).json({ ok: false, message: 'No invitations provided' })
    return
  }
  if (
    invitations.some(
      (invitation) => !invitation.userName || !invitation.userEmail,
    )
  ) {
    res.status(400).json({
      ok: false,
      message: 'userName or userEmail missing from one of the invitations',
    })
    return
  }

  // Create the invitations in the DB
  const response = await prisma.teamInvite.createMany({
    data: invitations.map(
      (invitation) => ({ ...invitation, teamId: team.id }) as TeamInvite,
    ),
  })

  // Send out the emails to the users that were invited.
  await Promise.all(
    invitations.map(async (invitation) => {
      // Send individual email
      if (!invitation.userEmail || !invitation.userName) {
        return
      }
      const response = await sendEmail(
        invitation.userEmail,
        `Invitation to team: ${team.name}`,
        `Hey ${invitation.userName}, 

You have been invited by ${session.user.name} to join the team ${team.name}. To react to this invitation go to the following link: ${process.env.AUTH0_BASE_URL}/dashboard and create an account. 
After you've created an account, the invitation will show up.

Kind Regards,
Green-Analytics`,
      )

      return response
    }),
  )

  res.json(response)
}

export default handle
