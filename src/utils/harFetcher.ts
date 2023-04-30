import axios from 'axios'

export const getXray = async (url: string) => {
  const response = await axios.get('https://har.green-analytics.com/api', {
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

  const urls: {
    [key: string]: {
      contentSize: number
      transferSize: number
      ip: string
    }
  } = {}

  entries.forEach((entry: any) => {
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
  })

  return urls
}
