import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import CellGridBox from '@components/Dashboard/Grid/CellGridBox'
import NavigationMenu from '@components/Dashboard/NavigationMenu'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { DialogContent, DialogTitle } from '@mui/joy'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { Dashboard, DashboardCell } from '@prisma/client'
import { api } from '@utils/network'
import { NextSeo } from 'next-seo'
import { useSearchParams } from 'next/navigation'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Stripe from 'stripe'
import useSWR from 'swr'

const DashboardPage = withPageAuthRequired(
  () => {
    const { selectedTeam, selectedWebsite, loadingTeams } =
      useContext(HeaderContext)

    const { user } = useUser()

    // Dashboard
    const [selectedDashboardId, setSelectedDashboardId] = useState<
      string | null
    >(null)
    const [editCell, setEditCell] = useState<DashboardCell>()

    // Create Dashboard
    const [createDashboardName, setCreateDashboardName] = useState('')
    const [createDashboardOpen, setCreateDashboardOpen] = useState(false)

    // DATA
    const {
      data: dashboards,
      isLoading: dashboardsLoading,
      mutate: setDashboards,
    } = useSWR<Dashboard[]>(
      selectedWebsite
        ? { url: 'dashboard', selectedWebsite: selectedWebsite.id }
        : null,
    )
    const { data: selectedDashboard, isLoading: dashboardLoading } = useSWR<
      Dashboard & { cells: DashboardCell[] }
    >(
      selectedDashboardId && selectedWebsite
        ? {
            url: `dashboard/${selectedDashboardId}`,
            selectedWebsite: selectedWebsite.id,
          }
        : null,
    )

    /* UPGRADE NOTIFICATION START */
    const successUpgrade = useSearchParams().get('successUpgrade')
    const [upgradeMessageShown, setUpgradeMessageShown] = useState(false)

    const showUpgradeNotification = useCallback(async () => {
      if (selectedTeam && !upgradeMessageShown) {
        const planId = selectedTeam?.subscription?.planId

        if (planId) {
          const response = await api.get<Stripe.Plan>(
            `/database/plans/${planId}`,
          )
          const plan = response.data
          toast.success(
            `Succesfully upgraded subscription to ${
              (plan.product as Stripe.Product).name
            }`,
          )
        }
        setUpgradeMessageShown(true)
      }
    }, [upgradeMessageShown, selectedTeam])

    useEffect(() => {
      if (dashboards) {
        // Try to load setting from localStorage
        const prevSelectedDashboardId =
          localStorage.getItem('selectedDashboard')
        if (prevSelectedDashboardId) {
          const prevSelectedDashboard = dashboards.find(
            (dashboard) => dashboard.id === prevSelectedDashboardId,
          )

          if (prevSelectedDashboard) {
            // If the dashboard still exists, set it as active
            setSelectedDashboardId(prevSelectedDashboard.id)
          }
          return
        }
        // Set to first dashboard, if length is over 0
        if (dashboards.length > 0) {
          setSelectedDashboardId(dashboards[0].id)
        }
      }
    }, [dashboards])

    useEffect(() => {
      if (selectedDashboardId) {
        // Store setting in localStorage
        localStorage.setItem('selectedDashboard', selectedDashboardId)
      }
    }, [selectedDashboardId])

    // Check if the team was succesfully upgraded
    useEffect(() => {
      if (successUpgrade === 'true') {
        showUpgradeNotification()
      }
    }, [successUpgrade, showUpgradeNotification])
    /* UPDATE NOTIFICATION END */

    const myRole = useMemo(() => {
      // Get the user's role in the selected team
      return selectedTeam?.roles.find((role) => role.userId === user?.sub)?.role
    }, [selectedTeam, user])

    /* VIEW HANDLING */
    const view = useMemo(() => {
      if (loadingTeams) {
        return <CircularProgress />
      }
      if (!selectedWebsite) {
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography level="h3">You need to select a website</Typography>
          </Box>
        )
      }

      if (dashboardsLoading || dashboardLoading) {
        return <CircularProgress />
      }

      // If the dashboards is not loading, but still empty. Show the quick create button.
      if (
        dashboards?.length === 0 &&
        (myRole === 'ADMIN' || myRole === 'OWNER')
      ) {
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={() => {
                setCreateDashboardOpen(true)
              }}
            >
              Create Dashboard
            </Button>
          </Box>
        )
      }

      // Main view
      return (
        <Grid
          container
          spacing={2}
          sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
        >
          {selectedDashboard?.cells.map((cell) => (
            <CellGridBox key={cell.id} setEditCell={setEditCell} cell={cell} />
          ))}
        </Grid>
      )
    }, [
      myRole,
      dashboards,
      dashboardsLoading,
      dashboardLoading,
      loadingTeams,
      selectedWebsite,
      selectedDashboard,
    ])

    const handleCreateDashboardSubmit = () => {
      if (!selectedWebsite) {
        toast.error('No team selected')
        return
      }
      // Validate
      if (!createDashboardName) {
        toast.error('You need to define a name for the dashboard')
        return
      }

      // Submit
      toast.promise(
        api.post<Dashboard>(
          `database/dashboard?selectedWebsite=${selectedWebsite.id}`,
          {
            name: createDashboardName,
          } as Partial<Dashboard>,
        ),
        {
          loading: 'Creating dashboard..',
          error: (err) => err.message ?? err,
          success: (response) => {
            setDashboards((prev) =>
              prev ? [...prev, response.data] : [response.data],
            )

            // If we just created it, select it.
            setSelectedDashboardId(response.data.id)

            // Reset state
            setCreateDashboardName('')
            setCreateDashboardOpen(false)

            return 'Succesfully created dashboard '
          },
        },
      )
    }

    return (
      <Box sx={{ margin: 8 }}>
        <NextSeo title="Dashboard" />
        <TeamHeader selectWebsite />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Modal open={createDashboardOpen}>
            <ModalDialog>
              <ModalClose />
              <DialogTitle>Create Dashboard</DialogTitle>
              <DialogContent>
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      autoFocus
                      value={createDashboardName}
                      onChange={(e) => setCreateDashboardName(e.target.value)}
                    />
                  </FormControl>
                  <Button onClick={handleCreateDashboardSubmit}>Submit</Button>
                </Stack>
              </DialogContent>
            </ModalDialog>
          </Modal>
          <Select
            placeholder="Select Dashboard"
            onChange={(_e, newValue) => setSelectedDashboardId(newValue)}
            value={selectedDashboardId}
            disabled={
              myRole !== 'ADMIN' &&
              myRole !== 'OWNER' &&
              dashboards?.length === 0
            }
          >
            {dashboards?.map((dashboard) => (
              <Option key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </Option>
            ))}
            {myRole === 'ADMIN' ||
              (myRole === 'OWNER' && (
                <Option
                  key="create-new-dashboard"
                  value="create-dashboard"
                  onClick={() => {
                    setCreateDashboardOpen(true)
                  }}
                >
                  Create Dashboard
                </Option>
              ))}
          </Select>
        </Box>
        <Box
          sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}
        >
          <NavigationMenu />
          {view}
        </Box>
      </Box>
    )
  },
  {
    returnTo: '/dashboard',
  },
)

export default DashboardPage
