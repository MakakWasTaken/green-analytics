import { useUser } from '@auth0/nextjs-auth0/client'
import SimpleGrid, {
  SimpleGridColumnDefinition,
  SimpleGridRef,
} from '@components/SimpleGrid'
import { HeaderContext } from '@contexts/HeaderContext'
import { ArrowForward, ArrowRight, Code, Refresh } from '@mui/icons-material'
import {
  Box,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { SettingsTab } from '@pages/settings'
import { Team, Website } from '@prisma/client'
import { api } from '@utils/network'
import { useContext, useMemo, useRef, useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash'
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript'
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml'
import {
  stackoverflowDark as darkTheme,
  stackoverflowLight as lightTheme,
} from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { toast } from 'sonner'
import useSWR from 'swr'
import AccountBox from '../AccountBox'

SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('bash', bash)

const WebsiteTabPanel = () => {
  // Layout
  const theme = useTheme()

  // Data
  const { selectedTeam, allTeams } = useContext(HeaderContext)
  const { user } = useUser()
  const { data, mutate: setData } = useSWR<Website[]>(
    selectedTeam ? `/database/website/getAll?teamId=${selectedTeam.id}` : null,
  )
  const [viewTokenDialog, setViewTokenDialog] = useState<string | null>(null)
  const [transferModalWebsite, setTransferModalWebsite] =
    useState<Website | null>(null)
  const [selectedTransferTeam, setSelectedTransferTeam] = useState<Team>()
  const simpleGridRef = useRef<SimpleGridRef>(null)

  const transferTeamDestinations = useMemo((): Team[] => {
    if (allTeams && transferModalWebsite) {
      // If allTeams length is 1, we do not have any destinations (We only have the current team)
      if (allTeams.length === 0) {
        return []
      }

      const filteredTeams = allTeams.filter(
        (team) => team.id !== transferModalWebsite.teamId,
      )
      return filteredTeams
    }
    return []
  }, [allTeams, transferModalWebsite])

  const deleteWebsite = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this item? This cannot be undone.',
      )
    ) {
      toast.promise(api.delete(`/database/website/${id}`), {
        loading: 'Deleting website...',
        error: (err) => err.message || err,
        success: (response) =>
          response.data.message || 'Successfully deleted website',
      })
    }
  }

  const rescanWebsite = (id: string) => async () => {
    toast.promise(api.post(`/database/website/${id}/scan`), {
      loading: 'Scanning website...',
      error: (err) => err.message || err,
      success: (response) =>
        response.data.message || 'Successfully scanned website',
    })
  }

  // Get the user's role in the selected team
  const userRole = useMemo(() => {
    return selectedTeam?.roles.find((role) => role.userId === user?.sub)?.role
  }, [selectedTeam, user])

  const columns: SimpleGridColumnDefinition[] = useMemo(() => {
    const tmpColumns: SimpleGridColumnDefinition[] = [
      { field: 'name', headerName: 'Name', editable: true },
      { field: 'url', headerName: 'URL', type: 'url', editable: true },
      {
        field: 'token',
        headerName: 'Setup',
        renderCell: (value: string) => (
          <Button onClick={() => setViewTokenDialog(value)}>
            <Code />
          </Button>
        ),
      },
    ]

    // If the user is an admin/owner, allow them to rescan.
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      tmpColumns.push({
        field: 'rescan',
        headerName: 'Rescan',
        renderCell: (_value, id) => (
          <Button onClick={rescanWebsite(id)}>
            <Refresh />
          </Button>
        ),
      })
    }

    return tmpColumns
  }, [userRole, rescanWebsite])

  const fixURL = (url: string): string => {
    // Get match from regex
    const regex = /^(?:\w+?:\/\/)?([A-z0-9.\-:]+).*/g

    const urlMatch = regex.exec(url)

    if (!urlMatch || !urlMatch[1]) {
      throw new Error('Invalid URL')
    }

    return urlMatch[1]
  }

  const handleTransferModalClose = () => {
    setTransferModalWebsite(null)
    setSelectedTransferTeam(undefined)
  }

  const submitTransferModal = () => {
    if (!transferModalWebsite) {
      toast.error('transferModalWebsite is not defined')
      return
    }
    if (!selectedTransferTeam) {
      toast.error('You need to select a destination team')
      return
    }
    toast.promise(
      api.put<Website>(`database/website/${transferModalWebsite.id}`, {
        teamId: selectedTransferTeam.id,
      }),
      {
        loading: 'Transfering team..',
        error: (err) => err.message || err,
        success: (response) => {
          setData(
            (prev) =>
              prev?.filter((website) => website.id !== response.data.id), // We remove the website, because it has been transfered to another team
          )

          handleTransferModalClose()

          return 'Successfully transfered team'
        },
      },
    )
  }

  return (
    <TabPanel value={SettingsTab.Websites}>
      <Modal
        open={viewTokenDialog !== null}
        onClose={() => setViewTokenDialog(null)}
      >
        <ModalDialog
          size="lg"
          sx={{ overflowY: 'scroll', minWidth: { xs: '100%', md: '500px' } }}
        >
          <ModalClose />
          <Typography level="h4">Website Setup</Typography>
          <Tabs>
            <TabList>
              <Tab>HTML</Tab>
              <Tab>JavaScript</Tab>
            </TabList>
            <TabPanel value={0}>
              <Typography>
                Copy and paste this code into your website's{' '}
                <code>&lt;head&gt;</code> element. It should be the first thing
                in the <code>&lt;head&gt;</code> tag.
              </Typography>
              <SyntaxHighlighter
                style={theme.palette.mode === 'light' ? lightTheme : darkTheme}
                language="xml"
              >
                {`<script
  async
  src="https://green-analytics.com/green-analytics.js"
  data-token="${viewTokenDialog}"
></script>`}
              </SyntaxHighlighter>
            </TabPanel>
            <TabPanel value={1}>
              <Typography>Installation</Typography>
              <SyntaxHighlighter
                style={theme.palette.mode === 'light' ? lightTheme : darkTheme}
                language="bash"
              >
                {`yarn add green-analytics-js
# or
npm install green-analytics-js`}
              </SyntaxHighlighter>
              <Typography>Usage</Typography>
              <SyntaxHighlighter
                style={theme.palette.mode === 'light' ? lightTheme : darkTheme}
                language="javascript"
              >
                {`import { initGA, setPerson } from 'green-analytics-js'

// Initializes the analytics script
initGA('${viewTokenDialog}')

// Marks the current session as belonging to a person
setPerson({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
})
`}
              </SyntaxHighlighter>
            </TabPanel>
          </Tabs>
        </ModalDialog>
      </Modal>
      {(userRole === 'ADMIN' || userRole === 'OWNER') && (
        <Modal
          open={transferModalWebsite !== null}
          onClose={handleTransferModalClose}
        >
          <ModalDialog>
            <ModalClose />
            <Typography level="h4">Transfer Website</Typography>
            {/* Show other teams we are admins of (If we are not admin, we are not allowed to create website.*/}
            <Select
              value={selectedTransferTeam}
              onChange={(_e, newValue) => {
                console.log(_e, newValue)
                setSelectedTransferTeam(
                  transferTeamDestinations.find(
                    (team) => team.id === newValue?.id,
                  ),
                )
              }}
            >
              {transferTeamDestinations?.map((team) => (
                <Option key={team.id} value={team}>
                  {team.name}
                </Option>
              ))}
            </Select>
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
                onClick={handleTransferModalClose}
              >
                Cancel
              </Button>
              <Button color="success" onClick={submitTransferModal}>
                Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}
      <AccountBox
        label="Websites"
        actionButton={
          userRole === 'ADMIN' || userRole === 'OWNER'
            ? {
                label: 'Add',
                onClick: () => {
                  console.log('Adding row', simpleGridRef)
                  if (!simpleGridRef.current) {
                    toast.error('Reference to grid not found')
                    return
                  }
                  simpleGridRef.current?.addRow()
                },
              }
            : undefined
        }
      >
        <SimpleGrid
          ref={simpleGridRef}
          rows={data ?? []}
          columns={columns}
          onRowDelete={
            userRole === 'ADMIN' || userRole === 'OWNER'
              ? deleteWebsite
              : undefined
          }
          onRowAdd={
            userRole === 'ADMIN' || userRole === 'OWNER'
              ? async (newRow: Website) => {
                  // For this grid we only allow editing the URL
                  newRow.url = fixURL(newRow.url)

                  toast.promise(
                    api.post<Website>('/database/website', {
                      name: newRow.name,
                      url: newRow.url,
                      teamId: selectedTeam?.id,
                    }),
                    {
                      loading: 'Adding website..',
                      error: (err) => err.message || err,
                      success: (response) => {
                        setData((prev) =>
                          prev ? [...prev, response.data] : [response.data],
                        )
                        return 'Website added'
                      },
                    },
                  )
                }
              : undefined
          }
          onRowEdit={
            userRole === 'ADMIN' || userRole === 'OWNER'
              ? async (newRow: Website) => {
                  // For this grid we only allow editing the URL
                  newRow.url = fixURL(newRow.url)
                  toast.promise(
                    api.put<Website>(`/database/website/${newRow.id}`, {
                      name: newRow.name,
                      url: newRow.url,
                      teamId: selectedTeam?.id,
                    }),
                    {
                      loading: 'Updating website..',
                      error: (err) => err.message || err,
                      success: (response) => {
                        const data = response.data
                        setData((prev) =>
                          prev
                            ? prev.map((item) =>
                                item.id === data.id ? data : item,
                              )
                            : [data],
                        )

                        return 'Website updated'
                      },
                    },
                  )
                }
              : undefined
          }
          additionalActions={
            userRole === 'ADMIN' || userRole === 'OWNER'
              ? (item: Website) => [
                  <Tooltip title="Transfer">
                    <Button
                      variant="plain"
                      sx={{
                        backgroundColor: 'transparent',
                        color: (theme) => theme.palette.text.primary,
                      }}
                      onClick={() => {
                        // Show transfer modal
                        setTransferModalWebsite(item)
                      }}
                    >
                      <ArrowForward />
                    </Button>
                  </Tooltip>,
                ]
              : undefined
          }
        />
      </AccountBox>
    </TabPanel>
  )
}

export default WebsiteTabPanel
