import { useUser } from '@auth0/nextjs-auth0/client'
import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  TextField,
  Typography,
} from '@mui/joy'
import { Team } from '@prisma/client'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { api } from '@src/utils/network'
import { FC, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AccountInput from '../Account/AccountInput'

interface TeamHeaderProps {
  selectWebsite?: boolean
}

const TeamHeader: FC<TeamHeaderProps> = ({ selectWebsite }) => {
  const {
    allTeams,
    selectedTeam,
    loadingTeams,
    reloadTeams,
    setSelectedTeam,
    selectedWebsite,
    setSelectedWebsite,
  } = useContext(HeaderContext)

  const [showCreateWebsite, setShowCreateWebsite] = useState(false)
  const [createTeamName, setCreateTeamName] = useState('')

  const handleCloseCreateTeamModal = () => {
    setShowCreateWebsite(false)
    setCreateTeamName('')
  }

  const handleSubmitCreateTeam = () => {
    // Validate
    if (!createTeamName) {
      toast.error('You need to define a name for your new team')
      return
    }

    // Send request
    toast.promise(api.post<Team>('database/team', { name: createTeamName }), {
      loading: 'Creating team',
      error: (err) => err.message || err,
      success: (response) => {
        reloadTeams((prev) =>
          prev ? [...prev, response.data] : [response.data],
        )

        handleCloseCreateTeamModal()
        return 'Succesfully created team'
      },
    })
  }

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
      <Modal open={showCreateWebsite} onClose={handleCloseCreateTeamModal}>
        <ModalDialog
          size="lg"
          sx={{ overflowY: 'scroll', width: { xs: '100%', md: '500px' } }}
        >
          <ModalClose />
          <Typography level="h4">Create Team</Typography>

          <AccountInput
            label="Team Name"
            value={createTeamName}
            placeholder="Team Name"
            onChange={(e) => setCreateTeamName(e.target.value)}
          />{' '}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Button
              color="danger"
              variant="soft"
              onClick={handleCloseCreateTeamModal}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCreateTeam}>Submit</Button>
          </Box>
        </ModalDialog>
      </Modal>

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
          {!loadingTeams && !selectedWebsite && (
            <Select placeholder="No websites" disabled />
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
            <Option
              key="new-team"
              value="new-team"
              onClick={() => {
                // Open modal to create new team
                setShowCreateWebsite(true)
              }}
            >
              <Add />
              Create new team
            </Option>
          </Select>
        </>
      )}
    </Box>
  )
}

export default TeamHeader
