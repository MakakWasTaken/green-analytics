import { getAccessToken } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

export const fetchAccessToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const response = await getAccessToken(req, res)

    res.status(200).json(response)
  } catch (error: any) {
    res.status(500).json({
      code: error.code,
      error: error.message,
    })
  }
}

export default fetchAccessToken
