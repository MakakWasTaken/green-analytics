import Link from '@components/Link'
import { Box, Container, Typography } from '@mui/joy'

export const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography level="h4">
          Material UI - Next.js example in TypeScript
        </Typography>
        <Link href="/about" color="neutral">
          Go to the about page
        </Link>
      </Box>
    </Container>
  )
}

export default Home
