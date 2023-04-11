import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

export const api = setupCache(
  axios.create({
    baseURL:
      process.env.NODE_ENV === 'production'
        ? 'https://placeholder.io'
        : 'http://localhost:2525/',
    withCredentials: true,
  }),
)
