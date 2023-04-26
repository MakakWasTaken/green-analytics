import { Box } from '@mui/joy'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'
import Head from 'next/head'

const EventTypes = () => {
  return (
    <Box sx={{ margin: 8 }}>
      <Head>
        <title>Green Analytics | Dashboard - Event Types</title>
      </Head>
      <TeamHeader />
      <NavigationMenu />
    </Box>
  )
}

export default EventTypes
