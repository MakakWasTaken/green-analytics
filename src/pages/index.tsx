import { useUser } from '@auth0/nextjs-auth0/client'
import Link from '@components/Link'
import { Box, CircularProgress, Container, Typography } from '@mui/joy'
import { Suspense } from 'react'

export const Home = () => {
  const { user, error, isLoading } = useUser()

  return (
    <Container maxWidth="lg">
      <Suspense fallback={<CircularProgress />}>
        {!isLoading && (
          <Box
            sx={{
              my: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {error && (
              <Typography level="h1">Error: {error.message}</Typography>
            )}
            {!user && (
              <Link href="/api/auth/login" color="neutral">
                Login
              </Link>
            )}
          </Box>
        )}
      </Suspense>
    </Container>
  )
}

export default Home
