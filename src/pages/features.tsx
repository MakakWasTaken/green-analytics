import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemContent,
  Typography,
} from '@mui/joy'
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
            <ListItemContent>
              <Typography>Web Analytics</Typography>
              <Typography level="body2">
                Allows logging the page views to websites
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>User Management</Typography>
              <Typography level="body2">
                Allows setting attributes to users and logging events
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>Carbon Caluclations</Typography>
              <Typography level="body2">
                Ability to convert the page views into carbon emissions
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>Dashboard</Typography>
              <Typography level="body2">
                Provides a simple dashboard that allows for an easy overview
              </Typography>
            </ListItemContent>
          </ListItem>
        </List>

        <Typography level="h1">Planned Features</Typography>
        <List>
          <ListItem>
            <ListItemContent>
              <Typography>API</Typography>
              <Typography level="body2">
                Allows for easy integration with other tools
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>Customizability</Typography>
              <Typography level="body2">
                Allows for a customizable dashboard
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>Customizable Carbon Calculations</Typography>
              <Typography level="body2">
                Allows for a customizable carbon calculations
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>Additional data sources</Typography>
              <Typography level="body2">
                Allows for additional data sources
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography>Additional tools for data collection</Typography>
              <Typography level="body2">
                Create tools for measuring carbon emission from docker
                containers, backend systems, mobile apps, etc.
              </Typography>
            </ListItemContent>
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
