import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://green-analytics.com/api'
      : 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(undefined, (error) => {
  if (axios.isCancel(error)) {
    return Promise.reject(error.message)
  }

  if (error instanceof AxiosError) {
    return Promise.reject(
      error.response?.data?.message ||
        error.status ||
        error.cause ||
        error.message,
    )
  }

  return Promise.reject(error.message)
})
