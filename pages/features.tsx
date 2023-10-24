import Link from '@components/Link'
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemContent,
  Typography,
} from '@mui/material'
import { NextSeo } from 'next-seo'
import { Suspense } from 'react'

const FeaturesPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <NextSeo
        title="Calculate"
        description="This page describes the features of the analytics tool."
      />

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
              <Typography fontWeight="bold">Web Analytics</Typography>
              <Typography level="body-md">
                Allows logging the page views to websites
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">User Management</Typography>
              <Typography level="body-md">
                Allows setting attributes to users and logging events
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">Carbon Caluclations</Typography>
              <Typography level="body-md">
                Ability to convert the page views into carbon emissions
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">Dashboard</Typography>
              <Typography level="body-md">
                Provides a simple dashboard that allows for an easy overview
              </Typography>
            </ListItemContent>
          </ListItem>
        </List>

        <Typography level="h1">Planned Features</Typography>
        <List>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">API</Typography>
              <Typography level="body-md">
                Allows for easy integration with other tools
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">Customizability</Typography>
              <Typography level="body-md">
                Allows for a customizable dashboard
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">
                Customizable Carbon Calculations
              </Typography>
              <Typography level="body-md">
                Allows for a customizable carbon calculations
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">Additional data sources</Typography>
              <Typography level="body-md">
                Allows for additional data sources
              </Typography>
            </ListItemContent>
          </ListItem>
          <ListItem>
            <ListItemContent>
              <Typography fontWeight="bold">
                Additional tools for data collection
              </Typography>
              <Typography level="body-md">
                Create tools for measuring carbon emission from docker
                containers, backend systems, mobile apps, etc.
              </Typography>
            </ListItemContent>
          </ListItem>
        </List>
        <Typography level="h4">
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
          href="https://github.com/users/MakakWasTaken/projects/1"
        >
          Github Project
        </Link>
      </Box>
    </Suspense>
  )
}

export default FeaturesPage
