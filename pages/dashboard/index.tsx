import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import CellGridBox from '@components/Dashboard/Grid/CellGridBox'
import CreateDashboardViewModal from '@components/Dashboard/Modals/CreateDashboardViewModal'
import { MutateDashboardCellModal } from '@components/Dashboard/Modals/MutateCellConfigurationModal/MutateCellConfigurationModal'
import NavigationMenu from '@components/Dashboard/NavigationMenu'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Option,
  Select,
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
    const [editCell, setEditCell] = useState<
      Omit<DashboardCell, 'id'> & { id?: string }
    >()

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
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            {selectedDashboard && (
              <Button
                sx={{ mr: 2 }}
                onClick={() => {
                  setEditCell({
                    content: {},
                    dashboardId: selectedDashboard.id,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                  })
                }}
              >
                Create new cell
              </Button>
            )}
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
          <Grid
            container
            spacing={2}
            sx={{ width: '100%', margin: { xs: 0, md: 4 }, flexGrow: 1 }}
          >
            {selectedDashboard?.cells.map((cell) => (
              <CellGridBox
                key={cell.id}
                setEditCell={setEditCell}
                cell={cell}
              />
            ))}
          </Grid>
        </Box>
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

    return (
      <Box sx={{ margin: 8 }}>
        <NextSeo title="Dashboard" />
        <TeamHeader selectWebsite />
        <Box
          sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}
        >
          <CreateDashboardViewModal
            open={createDashboardOpen}
            setOpen={setCreateDashboardOpen}
            refreshViews={setDashboards}
            key="create-dashboard"
          />
          <MutateDashboardCellModal
            cellConfig={editCell}
            configurationId={editCell?.id}
            handleClose={() => setEditCell(undefined)}
            selectedView={selectedDashboard}
            updateView={setDashboards}
          />
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
