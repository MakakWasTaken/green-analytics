import { Box, CircularProgress, List, ListItem, Typography } from '@mui/joy'
import { ListItemText } from '@mui/material'
import Link from '@src/components/Link'
import Head from 'next/head'
import { Suspense } from 'react'

const FeaturesPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <Head>
        <title>Features | Green-Analytics</title>
        <meta
          name="description"
          content="This page describes the features of the analytics tool. "
        />
      </Head>
      <Box
        sx={{
          margin: { xs: '0 3vw', md: '0 20vw' },
          minHeight: 'calc(100vh - 75px)',
        }}
      >
        <Typography level="h1">Features</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Web Analytics"
              secondary="Allows logging the page views to websites"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="User Analytics"
              secondary="Allows setting attributes to users and logging events"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Carbon Calculations"
              secondary="Is able to convert the page views into carbon emissions"
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="Dashboard"
              secondary="Provides a simple dashboard that allows for an easy overview"
            />
          </ListItem>
        </List>

        <Typography level="h1">Planned Features</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="API"
              secondary="Allows for easy integration with other tools"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Customizable Dashboard"
              secondary="Allows for a customizable dashboard"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Customizable Carbon Calculations"
              secondary="Allows for a customizable carbon calculation"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Additional data sources"
              secondary="Allows for additional data sources"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Additional tools for data collection"
              secondary="Create tools for measuring carbon emission from docker containers, backend systems, mobile apps, etc."
            />
          </ListItem>
        </List>
        <Typography level="h5">
          For a more comprehensive roadmap refer to the github project.
        </Typography>
        <Link
          sx={{
            margin: '25px 0',
            fontSize: { xs: '1rem', md: '1rem' },
            padding: 1,
            borderRadius: '15px',
            fontWeight: 'bold',
          }}
          variant="solid"
          href="https://github.com/MakakWasTaken/projects/1"
        >
          Github Project
        </Link>
      </Box>
    </Suspense>
  )
}

export default FeaturesPage
