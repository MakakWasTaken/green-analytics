import {
  Autocomplete,
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  TabPanel,
  Table,
  TextField,
  Typography,
} from '@mui/material'
import { Team, TeamInvite, User } from '@prisma/client'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { SettingsTab } from '@src/pages/settings'
import { api } from '@src/utils/network'
import React, { FC, useContext, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { v4 } from 'uuid'
import AccountBox from '../AccountBox'
import AccountUpdateBox from '../AccountUpdateBox'

const TeamTabPanel: FC = () => {
  const { selectedTeam, setSelectedTeam, reloadTeams } =
    useContext(HeaderContext)
  const { data: invitations, mutate: updateInvitations } = useSWR<TeamInvite[]>(
    selectedTeam ? `database/team/${selectedTeam.id}/invite` : null,
  )

  // States
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [modalInvitations, setModalInvitations] = useState<TeamInvite[]>([])

  // Update team function
  const updateTeam = async (value: Team) => {
    if (!selectedTeam) {
      toast.error('No team selected')
      return
    }
    toast.promise(
      api.put<Team>(`/database/team/${selectedTeam.id}/info`, value),
      {
        loading: 'Updating team..',
        error: (err) => err.message || err,
        success: (response) => {
          setSelectedTeam(response.data)

          return 'Successfully updated team'
        },
      },
    )
  }

  /**
   * Close the invite modal
   */
  const handleCloseInviteModal = () => {
    setInviteModalOpen(false)
    setModalInvitations([])
  }

  /**
   * Submit the invite modal
   * @returns void
   */
  const handleSubmitInviteModal = () => {
    if (modalInvitations.length === 0) {
      toast.error('You need to invite at least one person')
      return
    }
    toast.promise(
      api.post<TeamInvite[]>('database/team/invite', {
        invitations: modalInvitations,
      }),
      {
        loading: 'Inviting members..',
        error: (err) => err.message || err,
        success: (response) => {
          updateInvitations((prev) =>
            prev ? [...prev, ...response.data] : response.data,
          )

          return 'Successfully invited members'
        },
      },
    )
  }

  const deleteMember = (memberId: string) => {
    if (!selectedTeam) {
      toast.error('Select a team')
      return
    }
    if (window.confirm('Are you sure you want to delete this member?')) {
      toast.promise(
        api.delete(`database/team/${selectedTeam.id}/member/${memberId}`),
        {
          loading: 'Deleting member..',
          error: (err) => err.message || err,
          success: () => {
            reloadTeams()

            return 'Successfully deleted member'
          },
        },
      )
    }
  }

  const deleteInvite = (inviteId: string) => {
    if (!selectedTeam) {
      toast.error('Select a team')
      return
    }
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      toast.promise(
        api.delete(`database/team/${selectedTeam.id}/invite/${inviteId}`),
        {
          loading: 'Deleting invite..',
          error: (err) => err.message || err,
          success: () => {
            reloadTeams()

            return 'Successfully deleted invite'
          },
        },
      )
    }
  }

  return (
    <TabPanel value={SettingsTab.Team}>
      {selectedTeam && (
        <Modal open={inviteModalOpen} onClose={handleCloseInviteModal}>
          <ModalDialog>
            <ModalClose />
            <Typography level="h4">Invite new members</Typography>
            {modalInvitations.map((invitation) => {
              const onInvitationChange = (
                newInvitation: Partial<TeamInvite>,
              ) => {
                setModalInvitations((prev) =>
                  prev?.map((prevInvitation) =>
                    prevInvitation.id === invitation.id
                      ? { ...prevInvitation, ...newInvitation }
                      : prevInvitation,
                  ),
                )
              }

              return (
                <Box>
                  <Input
                    value={invitation.userName}
                    placeholder="Name"
                    onChange={(e) =>
                      onInvitationChange({
                        userName: e.target.value,
                      })
                    }
                  />
                  <Input
                    value={invitation.userName}
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
                const newInvite: TeamInvite = {
                  id: v4(),
                  userName: '',
                  userEmail: '',
                  teamId: selectedTeam.id,
                }
                setModalInvitations((prev) =>
                  prev ? [...prev, newInvite] : [newInvite],
                )
              }}
            >
              Add Invitation
            </Button>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                mt: 2,
              }}
            >
              <Button
                color="neutral"
                variant="soft"
                onClick={handleCloseInviteModal}
              >
                Cancel
              </Button>
              <Button color="success" onClick={handleSubmitInviteModal}>
                Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}
      <AccountUpdateBox
        label="Team Information"
        object={selectedTeam}
        cells={[{ field: 'name', label: 'Name' }]}
        onSave={updateTeam}
      />
      <AccountBox
        label="Team Members"
        actionButton={{
          label: 'Invite',
          onClick: () => {
            // Show modal to invite more members.
            setInviteModalOpen(true)
          },
        }}
      >
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: 'min-content' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedTeam?.users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {
                    selectedTeam.roles.find((role) => role.userId === user.id)
                      ?.role
                  }
                </td>
                <td>
                  <Button>Change Role</Button>
                  <Button color="danger" onClick={() => deleteMember(user.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            {invitations?.map((invitation) => (
              <tr key={invitation.id}>
                <td>{invitation.userName}</td>
                <td>{invitation.userEmail}</td>
                <td>Invitation</td>
                <td>
                  <Button
                    color="danger"
                    onClick={() => deleteInvite(invitation.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AccountBox>
    </TabPanel>
  )
}

export default TeamTabPanel
