import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

export const handle = withApiAuthRequired(
  (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method

    if (method === 'GET') {
      res.json({ ok: true, message: 'Hello World' })
    } else {
      res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    }
  },
)

export default handle
