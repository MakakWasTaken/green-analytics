import { UserProvider } from '@auth0/nextjs-auth0/client'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Layout } from '@src/components/Layout'
import { AuthProvider } from '@src/contexts/AuthContext'
import { AppProps } from 'next/app'
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
      <UserProvider>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </UserProvider>
    </CacheProvider>
  )
}

export default GAApp
