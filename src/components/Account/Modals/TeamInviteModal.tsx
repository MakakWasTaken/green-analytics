import { HeaderContext } from '@contexts/HeaderContext'
import {
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/material'
import { Team, TeamInvite } from '@prisma/client'
import { api } from '@utils/network'
import React, { FC, useContext, useState } from 'react'
import { toast } from 'sonner'
import { v4 } from 'uuid'

interface TeamInviteModalProps {
  open: boolean
  setOpen: (value: boolean) => void
  refreshInvitations: () => void
}

const TeamInviteModal: FC<TeamInviteModalProps> = ({
  open,
  setOpen,
  refreshInvitations,
}) => {
  const { selectedTeam } = useContext(HeaderContext)
  // States
  const [modalInvitations, setModalInvitations] = useState<
    Omit<TeamInvite, 'teamId'>[]
  >([
    {
      id: v4(),
      userName: '',
      userEmail: '',
    },
  ])

  /**
   * Close the invite modal
   */
  const handleClose = () => {
    setOpen(false)
    setModalInvitations([
      {
        id: v4(),
        userName: '',
        userEmail: '',
      },
    ])
  }

  /**
   * Submit the invite modal
   * @returns void
   */
  const handleSubmit = () => {
    if (!selectedTeam) {
      toast.error('Select a team')
      return
    }
    if (modalInvitations.length === 0) {
      toast.error('You need to invite at least one person')
      return
    }
    toast.promise(
      api.post<{ count: number }>(`database/team/${selectedTeam.id}/invite`, {
        invitations: modalInvitations,
      }),
      {
        loading: 'Inviting members..',
        error: (err) => err.message || err,
        success: (response) => {
          refreshInvitations()

          handleClose()

          return `Successfully invited ${response.data.count} members`
        },
      },
    )
  }

  if (!selectedTeam) {
    return null
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog size="md">
        <ModalClose />
        <Typography level="h4">Invite new members</Typography>
        {modalInvitations.map((invitation) => {
          const onInvitationChange = (newInvitation: Partial<TeamInvite>) => {
            setModalInvitations((prev) =>
              prev?.map((prevInvitation) =>
                prevInvitation.id === invitation.id
                  ? { ...prevInvitation, ...newInvitation }
                  : prevInvitation,
              ),
            )
          }

          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Input
                value={invitation.userName}
                sx={{ flex: 0.4 }}
                placeholder="Name"
                onChange={(e) =>
                  onInvitationChange({
                    userName: e.target.value,
                  })
                }
              />
              <Input
                value={invitation.userEmail}
                sx={{ flex: 0.6 }}
                placeholder="Email"
                onChange={(e) =>
                  onInvitationChange({
                    userEmail: e.target.value,
                  })
                }
              />
            </Box>
          )
        })}
        <Button
          fullWidth
          onClick={() => {
            const newInvite: Omit<TeamInvite, 'teamId'> = {
              id: v4(),
              userName: '',
              userEmail: '',
            }
            setModalInvitations((prev) =>
              prev ? [...prev, newInvite] : [newInvite],
            )
          }}
        >
          Add additional invitation
        </Button>
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
          <Button color="success" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}

export default TeamInviteModal
