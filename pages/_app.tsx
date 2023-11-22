import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Layout } from '@components/Layout'
import MDXContent from '@components/MDXContent'
import { HeaderProvider } from '@contexts/HeaderContext'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { createEmotionCache } from '@utils/createEmotionCache'
import { api } from '@utils/network'
import { NextSeo } from 'next-seo'
import { AppProps } from 'next/app'
import { Toaster, toast } from 'sonner'
import { SWRConfig } from 'swr'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface GAAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export const GAApp = (props: GAAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <SWRConfig
      value={{
        errorRetryCount: 1, // only retry once, then throw error
        fetcher: (resource, init) =>
          api.get(resource, init).then((res) => res.data),
        onErrorRetry: (error) => {
          toast.error(error.message || error)
        },
      }}
    >
      <NextSeo
        additionalLinkTags={[
          {
            rel: 'apple-touch-icon',
            href: '/logo192.png',
            sizes: '192x192',
          },
          {
            rel: 'preconnect',
            href: 'https://log.cookieyes.com',
          },
        ]}
        titleTemplate="%s | Green Analytics"
      />
      <UserProvider>
        <HeaderProvider>
          <CacheProvider value={emotionCache}>
            <Layout>
              {Component.displayName === 'MDXContent' ? (
                <MDXContent Component={Component} pageProps={pageProps} />
              ) : (
                <Component {...pageProps} />
              )}
              <Toaster richColors />
            </Layout>
          </CacheProvider>
        </HeaderProvider>
      </UserProvider>
    </SWRConfig>
  )
}

export default GAApp
