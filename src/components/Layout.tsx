import { useUser } from '@auth0/nextjs-auth0/client'
import { Box, CssBaseline, CssVarsProvider } from '@mui/joy'
import theme from '@src/styles/theme'
import { defaults } from 'chart.js'
import { initGA, setPerson } from 'green-analytics-react'
import { Poppins } from 'next/font/google'
import { FC, PropsWithChildren, useEffect } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

export const poppins = Poppins({
  weight: ['400', '500'],
  subsets: ['latin'],
})

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useUser()

  defaults.font.family = poppins.style.fontFamily
  defaults.font.weight = '500'

  useEffect(() => {
    initGA('b3cdaa7c-ca1b-4641-b01f-dace971b7850')
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      console.log(poppins.style)
      setPerson({
        id: user.sub,
        name: user.name || undefined,
        email: user.email || undefined,
      })
    }
  }, [user])

  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      <main className={poppins.className}>
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
