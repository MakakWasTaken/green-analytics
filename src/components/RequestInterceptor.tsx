import { AuthContext } from '@src/contexts/AuthContext'
import { api } from '@src/utils/network'
import { AxiosHeaders } from 'axios'
import { FC, PropsWithChildren, useContext } from 'react'

const dev = 'http://localhost:2525'
const prod = 'https://api.placeholder.io'
const test = 'https://test-api.placeholder.io'

export const RequestInterceptor: FC<
  React.PropsWithChildren<PropsWithChildren>
> = ({ children }) => {
  const { accessToken } = useContext(AuthContext)

  /* eslint-disable no-param-reassign */
  api.interceptors.request.use(async (config) => {
    // In the dev environment we keep the default localhost url, so no need to get an error when trying to fetch the environment variables (The endpoint is only available in the production environment (render-server))
    if (process.env.NODE_ENV !== 'development') {
      try {
        const apiUrl =
          !process.env.REACT_APP_ENV ||
          process.env.REACT_APP_ENV === 'development'
            ? dev
            : process.env.REACT_APP_ENV === 'production'
            ? prod
            : test

        config.baseURL = apiUrl
      } catch (err) {
        // We are usually running a local dev environment, so we don't want to log this error
        console.warn(err)
      }
    }

    try {
      // If expires is in the past the token won't work anyways
      // if (response.expiresOn && response.expiresOn < new Date()) {
      //   throw new Error('Token has expired, should have gotten a new one')
      // }
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('Authorization', `Bearer ${accessToken}`)
      }
    } catch (error) {
      console.error(error)
    }

    return config
  })

  return <>{children}</>
}
