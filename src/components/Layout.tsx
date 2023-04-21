import { useUser } from '@auth0/nextjs-auth0/client'
import { Box, CssBaseline, CssVarsProvider } from '@mui/joy'
import theme from '@src/styles/theme'
import { initGA, setPerson } from 'green-analytics-react'
import { Public_Sans as PublicSans } from 'next/font/google'
import { FC, PropsWithChildren, useEffect } from 'react'
import Footer from './Footer'
import Header from './Header'

const publicSans = PublicSans({
  weight: '400',
  subsets: ['latin'],
})

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useUser()

  useEffect(() => {
    initGA('b3cdaa7c-ca1b-4641-b01f-dace971b7850')
  }, [])

  useEffect(() => {
    if (user && user.sub) {
      setPerson({
        id: user.sub,
        name: user.name || undefined,
        email: user.email || undefined,
      })
    }
  }, [user])

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
