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
        fetcher: async (args) => {
          if (typeof args === 'string') {
            const response = await api.get(`/database/${args}`)
            return response.data
          }
          const { url, ...rest } = args

          const response = await api.get(`/database/${url}`, {
            params: rest,
          })
          return response.data
        },
        errorRetryCount: 1, // only retry once, then throw error
        onErrorRetry: (error, key: string) => {
          const matches = /#url:"(\w*)"/g.exec(key)
          let formattedKey = key
          if (matches !== null && matches.length > 1) {
            formattedKey = matches[1]
          }
          toast.error(
            `${formattedKey} failed with error: ${
              error?.response?.data?.message || error?.message || error
            }`,
          )
        },
        revalidateOnFocus: false,
      }}
    >
      <NextSeo
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'initial-scale=1, width=device-width',
          },
        ]}
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
