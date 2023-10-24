import { useUser } from '@auth0/nextjs-auth0/client'
import { HeaderContext } from '@contexts/HeaderContext'
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
import { SettingsTab } from '@pages/settings'
import { Team, TeamInvite, User } from '@prisma/client'
import { api } from '@utils/network'
import { userAgent } from 'next/server'
import React, { FC, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { v4 } from 'uuid'
import AccountBox from '../AccountBox'
import AccountUpdateBox from '../AccountUpdateBox'
import DeleteTeamModal from '../Modals/DeleteTeamModal'
import TeamInviteModal from '../Modals/TeamInviteModal'

const TeamTabPanel: FC = () => {
  // Context
  const { user } = useUser()

  // Data
  const { selectedTeam, setSelectedTeam, reloadTeams } =
    useContext(HeaderContext)
  const { data: invitations, mutate: updateInvitations } = useSWR<TeamInvite[]>(
    selectedTeam ? `database/team/${selectedTeam.id}/invite` : null,
  )

  // States
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState(false)

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
            updateInvitations()

            return 'Successfully deleted invite'
          },
        },
      )
    }
  }

  const ownRole = useMemo(() => {
    return selectedTeam?.roles.find((role) => role.userId === user?.sub)?.role
  }, [user, selectedTeam])

  return (
    <TabPanel value={SettingsTab.Team}>
      <DeleteTeamModal
        open={deleteTeamModalOpen}
        setOpen={setDeleteTeamModalOpen}
      />
      <TeamInviteModal
        open={inviteModalOpen}
        setOpen={setInviteModalOpen}
        refreshInvitations={updateInvitations}
      />
      <AccountUpdateBox
        label="Team Information"
        object={selectedTeam}
        cells={[
          {
            field: 'name',
            label: 'Name',
            disabled: ownRole !== 'ADMIN' && ownRole !== 'OWNER',
          },
        ]}
        onSave={
          ownRole === 'ADMIN' || ownRole === 'OWNER' ? updateTeam : undefined
        }
      />
      <AccountBox
        label="Team Members"
        actionButton={
          ownRole === 'ADMIN' || ownRole === 'OWNER'
            ? {
                label: 'Invite',
                onClick: () => {
                  // Show modal to invite more members.
                  setInviteModalOpen(true)
                },
              }
            : undefined
        }
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
                  {/* If the row's role is not OWNER and the logged in users role is ADMIN or OWNER */}
                  {selectedTeam.roles.find((role) => role.userId === user.id)
                    ?.role !== 'OWNER' &&
                    (ownRole === 'ADMIN' || ownRole === 'OWNER') && (
                      <>
                        <Button>Change Role</Button>
                        <Button
                          sx={{ ml: 1 }}
                          color="danger"
                          onClick={() => deleteMember(user.id)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                </td>
              </tr>
            ))}
            {invitations?.map((invitation) => (
              <tr key={invitation.id}>
                <td>{invitation.userName}</td>
                <td>{invitation.userEmail}</td>
                <td>Invitation</td>
                <td>
                  {(ownRole === 'ADMIN' || ownRole === 'OWNER') && (
                    <Button
                      color="danger"
                      onClick={() => deleteInvite(invitation.id)}
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </AccountBox>

      {ownRole === 'OWNER' && (
        <AccountBox label="Owner Actions">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography>Delete this team</Typography>
              <Typography>
                This action cannot be undone. Be sure before you delete your
                team.
              </Typography>
            </Box>
            <Button color="danger" onClick={() => setDeleteTeamModalOpen(true)}>
              Delete Team
            </Button>
          </Box>
        </AccountBox>
      )}
    </TabPanel>
  )
}

export default TeamTabPanel
