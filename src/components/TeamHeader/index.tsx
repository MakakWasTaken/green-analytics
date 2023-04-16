import { Box, CircularProgress, Option, Select } from '@mui/joy'
import { TeamContext } from '@src/contexts/TeamContext'
import { FC, useContext } from 'react'

const TeamHeader: FC = () => {
  const { allTeams, selectedTeam, setSelectedTeam } = useContext(TeamContext)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingBottom: 2,
        paddingTop: 2,
        marginBottom: 2,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {!allTeams || !selectedTeam ? (
        <CircularProgress />
      ) : (
        <Select
          placeholder="Team"
          value={selectedTeam.id}
          onChange={(_, newValue) => {
            setSelectedTeam(
              (prev) => allTeams.find((team) => team.id === newValue) || prev,
            )
          }}
          sx={{ width: { sx: '100%', md: '250px' } }}
        >
          {allTeams?.map((team) => (
            <Option key={team.id} value={team.id}>
              {team.name}
            </Option>
          ))}
        </Select>
      )}
    </Box>
  )
}

export default TeamHeader
