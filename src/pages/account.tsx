import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import {
  Box,
  CircularProgress,
  Option,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  tabClasses,
} from '@mui/joy'
import { Team, User } from '@prisma/client'
import AccountBox from '@src/components/Account/AccountBox'
import { AccountInput } from '@src/components/Account/AccountInput'
import { api } from '@src/utils/network'
import { Suspense, useState } from 'react'
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
    const { data: user } = useSWR<User>('/database/user/own')

    const [index, setIndex] = useState(Page.General)
    const [selectedTeam, setSelectedTeam] = useState<Pick<
      Team,
      'id' | 'name'
    > | null>(null)

    const { data: allTeams } = useSWR<Pick<Team, 'id' | 'name'>[]>(
      index === Page.Team ? '/database/team/getAll' : null,
    )
    // Only load team info if on team page
    const { data: teamInfo } = useSWR<Team>(
      index === Page.Team && selectedTeam
        ? `/database/team/${selectedTeam.id}/info`
        : null,
    )

    const updateUserField = async (field: keyof User, value: string) => {
      await api.put('/database/user/own', {
        [field]: value,
      })
    }

    return (
      <Box sx={{ margin: 8 }}>
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
            sx={{ '--Tabs-gap': '0px' }}
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
                inputs={[
                  <AccountInput
                    key="Name"
                    label="Name"
                    value={user?.name || ''}
                    onChange={(e) => updateUserField('name', e.target.value)}
                  />,
                  <AccountInput
                    key="Email"
                    label="Email"
                    disabled
                    value={user?.email || ''}
                  />,
                ]}
              />
            </TabPanel>
            <TabPanel value={Page.Privacy}></TabPanel>
            <TabPanel value={Page.Team}>
              <Suspense fallback={<CircularProgress />}>
                {selectedTeam && (
                  <Select
                    placeholder="Team"
                    value={selectedTeam.id}
                    onChange={(_, newValue) => {
                      const team = allTeams?.find(
                        (team) => team.id === newValue,
                      )
                      setSelectedTeam(team || null)
                    }}
                    sx={{ width: '100%' }}
                  >
                    {allTeams?.map((team) => (
                      <Option key={team.id} value={team}>
                        {team.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Suspense>
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
