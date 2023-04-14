import { Box } from '@mui/joy'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'

const EventTypes = () => {
  return (
    <Box sx={{ margin: 8 }}>
      <TeamHeader />
      <NavigationMenu />
    </Box>
  )
}

export default EventTypes
