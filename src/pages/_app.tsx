import { CacheProvider, EmotionCache } from '@emotion/react'
import { CssBaseline, CssVarsProvider, ThemeProvider } from '@mui/joy'
import { AppProps } from 'next/app'
import { Public_Sans as PublicSans } from 'next/font/google'
import theme from '../styles/theme'
import { createEmotionCache } from '../utils/createEmotionCache'

const publicSans = PublicSans({
  weight: '400',
  subsets: ['latin'],
})

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface GAAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export const GAApp = (props: GAAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssVarsProvider>
          <main className={publicSans.className}>
            <CssBaseline />
            <Component {...pageProps} />
          </main>
        </CssVarsProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default GAApp
