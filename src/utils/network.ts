import axios from 'axios'

export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://green-analytics.dk/api'
      : 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
