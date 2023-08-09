import { Box } from '@mui/joy'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'
import { NextSeo } from 'next-seo'

const EventTypes = () => {
  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title="Dashboard - Event Types" />
      <TeamHeader />
      <NavigationMenu />
    </Box>
  )
}

export default EventTypes
