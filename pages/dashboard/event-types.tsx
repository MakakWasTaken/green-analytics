import NavigationMenu from '@components/Dashboard/NavigationMenu'
import SimpleGrid from '@components/SimpleGrid'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import { NextSeo } from 'next-seo'
import { useContext } from 'react'

const EventTypes = () => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)

  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title="Dashboard - Event Types" />
      <TeamHeader selectWebsite />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />

        {loadingTeams && <CircularProgress />}
        {!loadingTeams && !selectedWebsite && (
          <Typography level="h3">You need to select a website</Typography>
        )}
        {!loadingTeams && selectedWebsite && (
          <Grid
            container
            spacing={2}
            sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1, overflowX: 'scroll' }}
          >
            <SimpleGrid rows={[]} columns={[]} />
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default EventTypes
