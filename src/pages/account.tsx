import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  tabClasses,
} from '@mui/joy'
import { Team, User } from '@prisma/client'
import AccountBox from '@src/components/Account/AccountBox'
import TeamHeader from '@src/components/TeamHeader'
import { TeamContext } from '@src/contexts/TeamContext'
import { api } from '@src/utils/network'
import { useContext, useState } from 'react'
import useSWR from 'swr'

enum Page {
  General = 0,
  Privacy = 1,
  Team = 2,
}

interface PageInfo {
  title: string
  page: Page
}

const pageInfo: PageInfo[] = [
  {
    title: 'General',
    page: Page.General,
  },
  {
    title: 'Privacy',
    page: Page.Privacy,
  },
  {
    title: 'Team',
    page: Page.Team,
  },
]

const UserPage = withPageAuthRequired(
  () => {
    const { user: authUser } = useUser()
    const { selectedTeam, setSelectedTeam } = useContext(TeamContext)
    const { data: user, mutate: setUser } = useSWR<User>('/database/user/own')

    const [index, setIndex] = useState(Page.General)

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
            <TabPanel value={Page.General}>
              <AccountBox
                label="Personal Information"
                object={user}
                cells={[
                  { field: 'name', label: 'Name' },
                  { field: 'email', label: 'Email', disabled: true },
                ]}
                onSave={updateUser}
              />
            </TabPanel>
            <TabPanel value={Page.Privacy}></TabPanel>
            <TabPanel value={Page.Team}>
              <AccountBox
                label="Team Information"
                object={selectedTeam}
                cells={[{ field: 'name', label: 'Name' }]}
                onSave={updateTeam}
              />
            </TabPanel>
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
