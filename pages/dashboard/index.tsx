import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import CellGridBox from '@components/Dashboard/Grid/CellGridBox'
import NavigationMenu from '@components/Dashboard/NavigationMenu'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { Box, CircularProgress, Grid, Typography } from '@mui/material'
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

    // Dashboard
    const [selectedDashboardId, setSelectedDashboardId] = useState<
      string | null
    >(null)
    const [editCell, setEditCell] = useState<DashboardCell>()

    const { data: dashboards, isLoading: dashboardsLoading } =
      useSWR<Dashboard[]>('dashboard')
    const { data: selectedDashboard, isLoading: dashboardLoading } = useSWR<
      Dashboard & { cells: DashboardCell[] }
    >(selectedDashboardId ? `dashboard/${selectedDashboardId}` : null)

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

    // Check if the team was succesfully upgraded
    useEffect(() => {
      if (successUpgrade === 'true') {
        showUpgradeNotification()
      }
    }, [successUpgrade, showUpgradeNotification])
    /* UPDATE NOTIFICATION END */

    /* VIEW HANDLING */
    const view = useMemo(() => {
      if (loadingTeams) {
        return <CircularProgress />
      }
      if (!selectedWebsite) {
        return <Typography level="h3">You need to select a website</Typography>
      }

      // Main view
      return (
        <Grid
          container
          spacing={2}
          sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
        >
          {selectedDashboard?.cells.map((cell) => (
            <CellGridBox setEditCell={setEditCell} cell={cell} />
          ))}
        </Grid>
      )
    }, [loadingTeams, selectedWebsite, selectedDashboard])

    return (
      <Box sx={{ margin: 8 }}>
        <NextSeo title="Dashboard" />
        <TeamHeader selectWebsite />
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
