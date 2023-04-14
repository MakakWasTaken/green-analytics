import { Box, CssBaseline, CssVarsProvider } from '@mui/joy'
import theme from '@src/styles/theme'
import { Public_Sans as PublicSans } from 'next/font/google'
import { FC, PropsWithChildren } from 'react'
import Footer from './Footer'
import Header from './Header'

const publicSans = PublicSans({
  weight: '400',
  subsets: ['latin'],
})

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      <main className={publicSans.className}>
        <CssBaseline />
        <Header />
        <Box
          sx={{
            marginTop: '75px', // Header height
            minHeight: 'calc(100vh - 75px)', // Header height
          }}
        >
          {children}
        </Box>
        <Footer />
      </main>
    </CssVarsProvider>
  )
}
