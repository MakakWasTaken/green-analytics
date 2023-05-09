import { Box, CircularProgress, Typography } from '@mui/joy'
import Link from '@src/components/Link'
import Head from 'next/head'
import Image from 'next/image'
import { FC, Suspense } from 'react'

export const Home: FC = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <Head>
        <title>Green Analytics</title>
        <meta
          name="description"
          content="Green Analytics is an analytics tool that is built on top of SWD's model. The tool allows you to do basis analytics on your website and provide your company with insights into your carbon emissions."
        />
      </Head>
      <Box
        sx={{
          margin: { xs: '0 3vw', md: '0 10vw' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 'calc(100vh - 75px)',
        }}
      >
        <Box
          sx={{
            flex: 0.75,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'left',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 'bold',
            }}
          >
            A new way of measuring emissions
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', md: '1rem' },
            }}
          >
            Green Analytics is an analytics tool that is built on top of{' '}
            <Link href="https://sustainablewebdesign.org/">
              {"SWD's model"}
            </Link>
            . The tool allows you to do basis analytics on your website and
            provide your company with insights into your carbon emissions.
          </Typography>
          <Link
            sx={{
              marginTop: '25px',
              fontSize: { xs: '1rem', md: '1rem' },
              padding: 1,
              borderRadius: '15px',
              fontWeight: 'bold',
              width: '250px',
            }}
            variant="solid"
            href="/dashboard" // Dashboard will redirect to login, if not logged in
          >
            Get Started
          </Link>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            src="/images/undraw_healthy_habit.svg"
            alt="Healthy Habit"
            width={500}
            height={500}
          />
        </Box>
      </Box>
    </Suspense>
  )
}

export default Home
