import KeyFeatureBox from '@components/LandingPage/KeyFeatureBox'
import Link from '@components/Link'
import { AutoGraph, EmojiNature, LocalFlorist } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  useColorScheme,
} from '@mui/material'
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
} from 'chart.js'
import { NextSeo } from 'next-seo'
import { FC } from 'react'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement)

export const Home: FC = () => {
  const colorScheme = useColorScheme()

  return (
    <>
      <NextSeo
        title="Home"
        description="Green Analytics is an analytics tool that is built on top of SWD's model. The tool allows you to do basis analytics on your website and provide your company with insights into your carbon emissions."
      />
      <Box
        sx={{
          margin: { xs: '0 3vw', md: '0 20vw' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 75px)',
        }}
      >
        <Box
          sx={{
            padding: '32px 0',
            minHeight: 'calc(100vh - 75px)',

            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
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
            <Typography level="h1">A new way of measuring emissions</Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', md: '1rem' },
              }}
            >
              Green Analytics is an analytics tool that is built on top of{' '}
              <Link fontWeight={600} href="https://sustainablewebdesign.org/">
                {"SWD's model"}
              </Link>
              . The tool allows you to do basis analytics on your website and
              provide your company with insights into your carbon emissions.
            </Typography>
            <Link
              sx={{
                marginTop: '25px',
                fontSize: { xs: '1rem', md: '1rem' },
                padding: '10px 20px',
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
            <Line
              style={{
                maxWidth: '400px',
                maxHeight: '250px',
              }}
              data={{
                labels: ['1', '1', '1', '1', '1', '1', '1'],
                datasets: [
                  {
                    label: 'Default graph',
                    normalized: true,
                    pointRadius: 0,
                    borderWidth: 5,
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor:
                      colorScheme.colorScheme === 'dark' ? '#fff' : '#000',
                  },
                ],
              }}
              options={{
                events: [],
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            minHeight: 'calc(100vh - 75px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '50px 0',
          }}
        >
          <Typography sx={{ alignSelf: 'center' }} level="h2">
            Key Features
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
              gap: '25px',
              margin: '50px 0',
            }}
          >
            <KeyFeatureBox
              icon={<LocalFlorist />}
              title="Carbon Footprint"
              description="Our carbon footprint analysis service helps you understand the environmental impact of your business."
            />
            <KeyFeatureBox
              icon={<AutoGraph />}
              title="Website Analytics"
              description="Use our web analytics to gain an insight into who is visiting your website, where they are coming from, and what they are doing on your site."
            />
            <KeyFeatureBox
              icon={<EmojiNature />}
              title="Size Optimization"
              description="Monitor which parts of your website is hosted on green datacenters. This is done automatically through our algorithms."
            />
          </Box>
          <Button sx={{ width: '200px', alignSelf: 'center' }}>
            View All Features
          </Button>
        </Box>
        <Box
          sx={{
            minHeight: 'calc(100vh - 75px)',
          }}
        >
          <Box
            sx={{
              padding: 8,
              backgroundColor: 'var(--joy-palette-background-backdrop)',
              borderRadius: 32,
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
            }}
          >
            <Typography sx={{ flex: 0.4 }} level="h2">
              Our Mission
            </Typography>
            <Typography
              sx={{
                flex: 0.6,
                padding: '25px 0',
                textAlign: 'justify',
                hyphens: 'auto',
              }}
            >
              At Green Analytics, we believe that every step towards
              sustainability is a stride towards a healthier planet. Our story
              began in 2023 with a simple, yet powerful mission.
              <br />
              To make it easier for businesses to understand, measure and reduce
              their environmental impact. Our suite of services includes
              comprehensive carbon footprint analysis, waste management
              optimization, energy efficiency assessment, and sustainability
              reporting, amongst others.
              <br />
              <br />
              At Green Analytics, we envision a future where sustainable
              practices are not just an afterthought but an integral part of
              every business strategy. <br />
              We are more than just a service provider; we are your partner in
              creating a sustainable future. <br />
              <br />
              Join us on this journey towards a greener, more responsible way of
              doing business.
            </Typography>
          </Box>
          <Box
            sx={{
              margin: '50px 0',
              padding: 8,
              borderRadius: 32,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography level="h2">Climate Contributions</Typography>
            <Typography
              sx={{
                padding: '25px 0',
                textAlign: 'justify',
                hyphens: 'auto',
              }}
            >
              While we try to help companies better understand their emissions
              we would also like to help companies reduce their emissions. This
              it currently being achieved by donating a part of our revenue to
              carbon projects. Our current contribution is set to 2%. We also
              look for new projects can help furthen our carbon emission
              reductions.
            </Typography>
            <Box>
              <Link
                variant="solid"
                sx={{
                  padding: '6px 16px',
                  borderRadius: 8,
                }}
                href="https://climate.stripe.com/Xe5VdV"
              >
                Learn more
              </Link>
            </Box>
          </Box>
          <Box
            sx={{
              margin: '50px 0',
              padding: 8,
              backgroundColor: 'var(--joy-palette-background-backdrop)',
              borderRadius: 32,
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
            }}
          >
            <Typography sx={{ flex: 0.4 }} level="h2">
              The Team
            </Typography>
            <Typography
              sx={{
                flex: 0.6,
                padding: '25px 0',
                textAlign: 'justify',
                hyphens: 'auto',
              }}
            >
              This solution is developed by Markus Moltke, from the{' '}
              <Link fontWeight={600} href="https://unknown-studios.com">
                Unknown Studios
              </Link>{' '}
              team. <br />
              <br />
              Unknown Studios is a small team of developers, designers and
              marketers who are passionate about building products that make a
              difference. We believe that technology can be used to solve some
              of the world&apos;s most pressing problems, and we are committed
              to doing our part in making this happen.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Home
