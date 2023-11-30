import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: `${process.env.SITE_URL}/api`,
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
      error.response?.data?.error ||
        error.status ||
        error.cause ||
        error.message,
    )
  }

  return Promise.reject(error.message)
})
