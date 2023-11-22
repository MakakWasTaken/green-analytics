import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import {
  Box,
  Button,
  Tab,
  TabList,
  TabPanel,
  Table,
  Tabs,
  Typography,
  tabClasses,
} from '@mui/joy'
import { Team, User } from '@prisma/client'
import AccountBox from '@src/components/Account/AccountBox'
import AccountUpdateBox from '@src/components/Account/AccountUpdateBox'
import Websites from '@src/components/Account/Panels/Websites'
import TeamHeader from '@src/components/TeamHeader'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { api } from '@src/utils/network'
import Head from 'next/head'
import { useContext, useState } from 'react'
import useSWR from 'swr'

export enum AccountPage {
  General = 0,
  Privacy = 1,
  Websites = 2,
  Team = 3,
}

interface PageInfo {
  title: string
  page: AccountPage
}

const pageInfo: PageInfo[] = [
  {
    title: 'General',
    page: AccountPage.General,
  },
  {
    title: 'Privacy',
    page: AccountPage.Privacy,
  },
  {
    title: 'Websites',
    page: AccountPage.Websites,
  },
  {
    title: 'Team',
    page: AccountPage.Team,
  },
]

const UserPage = withPageAuthRequired(
  () => {
    const { user: authUser } = useUser()
    const { selectedTeam, setSelectedTeam } = useContext(HeaderContext)
    const { data: user, mutate: setUser } = useSWR<User>('/database/user/own')

    const [index, setIndex] = useState(AccountPage.General)

    const updateUser = async (value: User) => {
      const user = await api.put<User>('/database/user/own', value)
      setUser(user.data)
    }

    const updateTeam = async (value: Team) => {
      if (!selectedTeam) {
        console.error('No team selected')
        return
      }
      const team = await api.put<Team>(
        `/database/team/${selectedTeam.id}/info`,
        value,
      )
      setSelectedTeam(team.data)
    }

    return (
      <Box sx={{ margin: 8 }}>
        <Head>
          <title>Green Analytics | Account</title>
        </Head>
        <TeamHeader />
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={80}
            height={80}
            style={{
              borderRadius: '50vh',
            }}
            alt={user?.name || ''}
            src={user?.picture || authUser?.picture || ''}
          />
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginLeft: '1rem',
            }}
          >
            {user?.name}
          </Typography>
        </Box>
        <Box
          sx={{
            margin: 2,
          }}
        >
          <Tabs
            value={index}
            onChange={(_, value) => setIndex(value as number)}
            sx={{
              '--Tabs-gap': '0px',
              backgroundColor: (theme) => theme.palette.background.body,
            }}
          >
            <TabList
              variant="plain"
              sx={{
                width: '100%',
                maxWidth: 400,
                mx: 'auto',
                pt: 2,
                alignSelf: 'flex-start',
                [`& .${tabClasses.root}`]: {
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'transparent',
                  },
                  [`&.${tabClasses.selected}`]: {
                    color: 'primary.plainColor',
                    fontWeight: 'lg',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      zIndex: 1,
                      bottom: '-1px',
                      left: 'var(--ListItem-paddingLeft)',
                      right: 'var(--ListItem-paddingRight)',
                      height: '3px',
                      borderTopLeftRadius: '3px',
                      borderTopRightRadius: '3px',
                      bgcolor: 'primary.500',
                    },
                  },
                },
              }}
            >
              {pageInfo.map((pageInfo) => (
                <Tab key={pageInfo.page}>{pageInfo.title}</Tab>
              ))}
            </TabList>
            <TabPanel value={AccountPage.General}>
              <AccountUpdateBox
                label="Personal Information"
                object={user}
                cells={[
                  { field: 'name', label: 'Name' },
                  { field: 'email', label: 'Email', disabled: true },
                ]}
                onSave={updateUser}
              />
            </TabPanel>
            <TabPanel value={AccountPage.Privacy}>Coming soon..</TabPanel>
            <TabPanel value={AccountPage.Team}>
              <AccountUpdateBox
                label="Team Information"
                object={selectedTeam}
                cells={[{ field: 'name', label: 'Name' }]}
                onSave={updateTeam}
              />
              <AccountBox label="Team Members">
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th style={{ width: 'min-content' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeam?.users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <Button>Change Role</Button>
                          <Button color="danger">Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AccountBox>
            </TabPanel>
            <Websites />
          </Tabs>
        </Box>
      </Box>
    )
  },
  {
    returnTo: '/account',
  },
)

export default UserPage
