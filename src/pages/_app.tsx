import { UserProvider } from '@auth0/nextjs-auth0/client'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Layout } from '@src/components/Layout'
import { api } from '@src/utils/network'
import { AppProps } from 'next/app'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SWRConfig } from 'swr'
import { createEmotionCache } from '../utils/createEmotionCache'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface GAAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export const GAApp = (props: GAAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <CacheProvider value={emotionCache}>
      <SWRConfig
        value={{
          errorRetryCount: 1, // only retry once, then throw error
          fetcher: (resource, init) =>
            api.get(resource, init).then((res) => res.data),
          onErrorRetry: (error) => {
            toast.error(error.message)
          },
        }}
      >
        <UserProvider>
          <Layout>
            <Component {...pageProps} />
            <ToastContainer />
          </Layout>
        </UserProvider>
      </SWRConfig>
    </CacheProvider>
  )
}

export default GAApp
