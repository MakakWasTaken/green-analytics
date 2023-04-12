import Link from '@components/Link'
import { Box, CircularProgress, Container, Typography } from '@mui/joy'
import { FC, Suspense } from 'react'
import useSWR from 'swr'

export const Home: FC = () => {
  const { data: user, isLoading } = useSWR('/database/user/own')

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
            {!user ? (
              <Link href="/api/auth/login" color="neutral">
                Login
              </Link>
            ) : (
              <Typography level="h3">Welcome {user.name}</Typography>
            )}
          </Box>
        )}
      </Suspense>
    </Container>
  )
}

export default Home
