import { useUser } from '@auth0/nextjs-auth0/client'
import { HeaderContext } from '@contexts/HeaderContext'
import {
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  TextField,
  Typography,
} from '@mui/material'
import { api } from '@utils/network'
import React, { FC, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface DeleteTeamModalProps {
  open: boolean
  setOpen: (value: boolean) => void
}

const DeleteTeamModal: FC<DeleteTeamModalProps> = ({ open, setOpen }) => {
  // Context
  const { user } = useUser()
  const { selectedTeam, reloadTeams } = useContext(HeaderContext)

  // States
  const [teamName, setTeamName] = useState('')

  const ownRole = useMemo(() => {
    return selectedTeam?.roles.find((role) => role.userId === user?.sub)?.role
  }, [user, selectedTeam])

  /**
   * Close the delete team modal
   */
  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = () => {
    if (!selectedTeam) {
      toast.error('No team selected')
      return
    }
    if (!ownRole || ownRole !== 'OWNER') {
      toast.error('You do not have permission to do this.')
      return
    }

    toast.promise(api.delete(`database/team/${selectedTeam.id}`), {
      loading: 'Deleting team',
      error: (err) => err.message || err,
      success: () => {
        reloadTeams()
        handleClose()

        return 'Successfully deleted team'
      },
    })
  }

  return (
    selectedTeam &&
    ownRole === 'OWNER' && (
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Typography color="danger" level="h4">
            Delete this team?
          </Typography>
          <Typography>Are you sure you want to delete this team?</Typography>
          <Typography>
            To continue, you will need to input the name of the team '
            <span style={{ fontWeight: 'bold' }}>{selectedTeam?.name}</span>'
          </Typography>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              mt: 2,
            }}
          >
            <Button color="neutral" variant="soft" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={teamName !== selectedTeam.name}
              color="danger"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  )
}

export default DeleteTeamModal
