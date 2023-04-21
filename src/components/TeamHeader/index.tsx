import { Box, CircularProgress, Option, Select } from '@mui/joy'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { FC, useContext, useEffect } from 'react'

interface TeamHeaderProps {
  selectWebsite?: boolean
}

const TeamHeader: FC<TeamHeaderProps> = ({ selectWebsite }) => {
  const {
    allTeams,
    selectedTeam,
    setSelectedTeam,
    selectedWebsite,
    setSelectedWebsite,
  } = useContext(HeaderContext)

  useEffect(() => {
    if (selectedTeam && selectedTeam.websites.length > 0) {
      setSelectedWebsite(selectedTeam.websites[0])
    }
  }, [selectedTeam])

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
        <>
          {selectWebsite && selectedWebsite && (
            <Select
              placeholder="Website"
              value={selectedWebsite.id}
              onChange={(_, newValue) => {
                setSelectedWebsite(
                  (prev) =>
                    selectedTeam.websites.find(
                      (website) => website.id === newValue,
                    ) || prev,
                )
              }}
              sx={{ width: { sx: '100%', md: '250px' } }}
            >
              {selectedTeam.websites?.map((website) => (
                <Option key={website.id} value={website.id}>
                  {website.name}
                </Option>
              ))}
            </Select>
          )}
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
        </>
      )}
    </Box>
  )
}

export default TeamHeader
