import { useUser } from '@auth0/nextjs-auth0/client'
import { CssBaseline, CssVarsProvider } from '@mui/material'
import Box from '@mui/material/Box'
import { poppins } from '@src/styles/font'
import theme from '@src/styles/theme'
import { initGA, setPerson } from 'green-analytics-js'
import { FC, PropsWithChildren, useEffect } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useUser()

  useEffect(() => {
    initGA('c0544bf3-65b8-47ad-b75f-b8189980715c')
  }, [])

  useEffect(() => {
    if (user?.sub) {
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
