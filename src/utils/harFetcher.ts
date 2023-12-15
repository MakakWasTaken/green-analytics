import { Cookie } from '@prisma/client'
import axios from 'axios'

const harAPI = axios.create({
  baseURL: 'https://har.green-analytics.com',
})

harAPI.interceptors.response.use(undefined, (err) => {
  return Promise.reject(err.response?.data?.error || err.message || err)
})

interface XrayURL {
  contentSize: number
  transferSize: number
  countryCode?: string // Not loaded in this file, but will be used when scanning
  ip: string
}

export const getXray = async (
  url: string,
): Promise<
  | {
      urls: { [url: string]: XrayURL }
      cookies: Omit<Cookie, 'id' | 'createdAt' | 'updated' | 'websiteId'>[]
    }
  | undefined
> => {
  const response = await harAPI.get('/api', {
    params: {
      url,
    },
    headers: {
      api_key: process.env.HAR_API_KEY,
    },
  })

  // The domains are not in the correct format. We need to extract the domains from the requests and we need to extract the transfer size from the domains
  const data = response.data
  const entries = data.log.entries
  const cookies = data.cookies

  const urls: { [url: string]: XrayURL } = {}

  for (const entry of entries) {
    const urlRegex = /^(\w+?:\/\/[^?]+).*/g
    const url = entry.request.url
    // Apply the regex and only keep the first match
    const match = urlRegex.exec(url)
    if (!match) {
      return
    }
    const formattedUrl = match[1]

    const contentSize = entry.response.content.size
    const transferSize = entry.response.bodySize

    if (!urls[formattedUrl]) {
      urls[formattedUrl] = {
        contentSize,
        transferSize,
        ip: entry.serverIPAddress,
      }
    } else {
      urls[formattedUrl].contentSize += contentSize
      urls[formattedUrl].transferSize += transferSize
    }
  }

  return { cookies, urls }
}
