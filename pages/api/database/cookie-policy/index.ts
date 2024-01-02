import { Cookie, Team, TeamRole, User, Website } from '@prisma/client'
import prisma from '@src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // This endpoint is public, so we just get the cookie policy for the provided token

  const token = req.headers.api_token as string | undefined
  if (!token) {
    res.status(403).json({ ok: false, message: 'Missing token' })
    return
  }

  try {
    if (req.method === 'GET') {
      await handleGET(res, token)
    } else {
      res.status(405).json({
        ok: false,
        message: `Method ${req.method} is not allowed for this endpoint`,
      })
    }
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message ?? err,
    })
  }
}

const generateDefaultMarkdown = (
  cookies: Cookie[],
  website: Website & {
    team:
      | (Team & {
          roles: (TeamRole & {
            user: User
          })[]
        })
      | null
  },
) => {
  const owner = website.team?.roles.find((role) => role.role === 'OWNER')?.user

  if (!owner) {
    throw new Error('Could not find owner')
  }

  const lastUpdated =
    cookies.reduce((prev: Date | undefined, cur: Cookie) => {
      if (!prev) {
        return cur.createdAt
      }
      if (prev < cur.createdAt) {
        return cur.createdAt
      }
      return prev
    }, undefined) ?? new Date()

  const policy = `
# Cookie Policy

Last Updated: ${lastUpdated.toDateString()} ${lastUpdated.toTimeString()}

## 1. Introduction

Welcome to ${website.name} ("we," "our," or "us"). This Cookie Policy is designed to inform you about our use of different types of cookies on our website. By continuing to browse our site, you agree to the use of cookies as described in this policy.

## 2. What are Cookies?

Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently.

## 3. Categories of Cookies

### 3.1 None Cookies

None cookies are essential for the basic functionality of our website. They do not collect any personal information and are necessary for the proper operation of the site.

### 3.2 Essential Cookies

Essential cookies are crucial for the basic functions of our website. They enable you to navigate and use key features. Without these cookies, our website may not function properly.

### 3.3 Performance Cookies

Performance cookies help us analyze how visitors use our website. They collect information such as the number of visitors, the pages visited, and the sources of traffic. This data helps us improve the performance and user experience of our site.

### 3.4 Functionality Cookies

Functionality cookies allow our website to remember choices you make, such as language preferences and customized settings. These cookies enhance your experience by providing personalized features.

### 3.5 Marketing Cookies

Marketing cookies are used to track visitors across websites. They are employed to display ads that are relevant and engaging for the individual user. These cookies may share information with third parties for advertising purposes.

## 4. Our cookies

| Name      | Description    | Category        | Expiration Time       | Domain              |
| --------- | -------------- | --------------- | --------------------- | ------------------- |
${cookies
  .map(
    (cookie) =>
      `| ${cookie.name} | ${cookie.description} | ${cookie.type} | ${
        cookie.expires === 0 ? 'session' : `${cookie.expires}s`
      } | ${cookie.domain} |`,
  )
  .join('\n')}

## 5. Managing Cookies

Most web browsers allow you to control cookies through their settings. You can choose to accept or reject cookies and delete existing ones. However, disabling certain cookies may impact the functionality and user experience of the website.

## 6. Changes to the Cookie Policy

We reserve the right to update this Cookie Policy at any time. Any changes will be effective immediately upon posting. Please check this page regularly for updates.

If you have any questions about our Cookie Policy, please contact us at [${
    owner.email
  }](mailto:${owner.email}).
  `

  return policy
}

const handleGET = async (res: NextApiResponse, token: string) => {
  // Get the cookies for this website.
  const [cookies, website] = await Promise.all([
    prisma.cookie.findMany({
      where: {
        website: {
          token,
        },
      },
    }),
    prisma.website.findFirst({
      where: {
        token,
      },
      include: {
        team: {
          include: {
            roles: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    }),
  ])

  if (!website || !website.team) {
    res.status(404).json({
      ok: false,
      message: 'No website found with the provided token.',
    })
    return
  }

  const policy = generateDefaultMarkdown(cookies, website)

  res.json({
    content: policy,
  })
}

export default handler
