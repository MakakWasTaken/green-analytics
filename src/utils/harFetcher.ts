import axios from 'axios'

export const getXray = async (url: string) => {
  const response = await axios.get('https://har.green-analytics.dk/api', {
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
    }
  } = {}

  entries.forEach((entry: any) => {
    const url = entry.request.url
    const contentSize = entry.response.content.size
    const transferSize = entry.response.bodySize

    if (!urls[url]) {
      urls[url] = {
        contentSize,
        transferSize,
      }
    } else {
      urls[url].contentSize += contentSize
      urls[url].transferSize += transferSize
    }
  })

  console.log(urls)
  return urls
}
