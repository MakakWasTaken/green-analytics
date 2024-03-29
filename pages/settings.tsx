import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import AccountUpdateBox from '@components/Account/AccountUpdateBox'
import TeamTabPanel from '@components/Account/Panels/TeamTabPanel'
import Websites from '@components/Account/Panels/WebsiteTabPanel'
import TeamHeader from '@components/TeamHeader'
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  tabClasses,
} from '@mui/material'
import { User } from '@prisma/client'
import { api } from '@utils/network'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

export enum SettingsTab {
  General = 0,
  Privacy = 1,
  Websites = 2,
  Team = 3,
}

interface PageInfo {
  title: string
  tab: SettingsTab
}

const pageInfo: PageInfo[] = [
  {
    title: 'General',
    tab: SettingsTab.General,
  },
  {
    title: 'Privacy',
    tab: SettingsTab.Privacy,
  },
  {
    title: 'Websites',
    tab: SettingsTab.Websites,
  },
  {
    title: 'Team',
    tab: SettingsTab.Team,
  },
]

const UserPage = withPageAuthRequired(
  () => {
    const { user: authUser } = useUser()
    const { data: user, mutate: setUser } = useSWR<User>('/database/user/own')

    const [index, setIndex] = useState(SettingsTab.General)

    const updateUser = async (value: User) => {
      const user = await api.put<User>('/database/user/own', value)
      setUser(user.data)
    }

    return (
      <Box
        sx={{ margin: { xs: 0, sm: 0, md: 8 }, my: { xs: 4, sm: 4, md: 0 } }}
      >
        <NextSeo title="Settings" noindex />
        <TeamHeader />
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          <Image
            width={80}
            height={80}
            priority
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
            my: 2,
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
                  borderTopRightRadius: '10px',
                  borderTopLeftRadius: '10px',
                  transition: '0.2s',
                  '&:hover': {
                    bgcolor:
                      'var(--joy-palette-neutral-plainHoverBg, var(--joy-palette-neutral-200, #DDE7EE))',
                  },
                  [`&.${tabClasses.selected}`]: {
                    color: 'primary.plainColor',
                    fontWeight: 'lg',
                  },
                },
              }}
            >
              {pageInfo.map((pageInfo) => (
                <Tab key={pageInfo.tab}>{pageInfo.title}</Tab>
              ))}
            </TabList>
            <TabPanel value={SettingsTab.General}>
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
            <TabPanel value={SettingsTab.Privacy} />
            <TeamTabPanel />
            <Websites />
          </Tabs>
        </Box>
      </Box>
    )
  },
  {
    returnTo: '/settings',
  },
)

export default UserPage
