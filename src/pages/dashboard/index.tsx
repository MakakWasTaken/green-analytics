import { Box, Grid, Typography, useTheme } from '@mui/joy'
import DoughnutChart from '@src/components/Dashboard/Charts/DoughnutChart'
import LineChart from '@src/components/Dashboard/Charts/LineChart'
import RadarChart from '@src/components/Dashboard/Charts/RadarChart'
import GridBox from '@src/components/Dashboard/Grid/GridBox'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'
import { getRandomColor } from '@src/utils/utils'
import { DateTime } from 'luxon'

const Dashboard = () => {
  const theme = useTheme()

  const thisWeekDays = new Array(7).fill(0).map((_, i) => {
    const datetime = DateTime.now().startOf('week').plus({ days: i })
    return datetime.toFormat('LLL dd')
  })
  const previousWeekDays = new Array(7).fill(0).map((_, i) => {
    const datetime = DateTime.now()
      .startOf('week')
      .minus({ weeks: 1 })
      .plus({ days: i })
    return datetime.toFormat('LLL dd')
  })
  const weekdays = new Array(7).fill(0).map((_, i) => {
    const datetime = DateTime.now().startOf('week').plus({ days: i })
    return datetime.toFormat('ccc')
  })
  const today = DateTime.now().toFormat('LLL dd')

  return (
    <Box sx={{ margin: 8 }}>
      <TeamHeader />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />
        <Grid
          container
          spacing={2}
          sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
        >
          <GridBox md={4} label="Page Views">
            <Box>
              <Typography level="h1">1</Typography>
              <Typography level="h6">This week</Typography>
            </Box>
          </GridBox>
          <GridBox md={4} label="CO2 Emissions">
            <Box>
              <Typography level="h1">1.2</Typography>
              <Typography level="h6">kg CO2</Typography>
            </Box>
          </GridBox>
          <RadarChart
            md={4}
            label="Weekly Visitors"
            data={{
              labels: weekdays,
              datasets: [
                {
                  normalized: true,
                  borderColor: theme.palette.primary[500],
                  backgroundColor: theme.palette.primary[500],
                  pointRadius: (ctx) =>
                    ctx.chart.data.labels?.[ctx.dataIndex] === today
                      ? 3
                      : ctx.active
                      ? 5
                      : 1,
                  pointHitRadius: 10,
                  data: [1, 2, 3, 4, 5, 6, 7],
                },
              ],
            }}
          />
          <LineChart
            xs={12}
            md={8}
            label={'Page Views'}
            data={{
              labels: thisWeekDays,
              datasets: [
                {
                  normalized: true,
                  borderColor: theme.palette.primary[500],
                  backgroundColor: theme.palette.primary[500],
                  pointRadius: (ctx) =>
                    ctx.chart.data.labels?.[ctx.dataIndex] === today
                      ? 3
                      : ctx.active
                      ? 5
                      : 1,
                  pointHitRadius: 10,
                  data: [1, 2, 3, 4, 5],
                },
              ],
            }}
          />
          <DoughnutChart
            md={4}
            label="Browser"
            data={{
              labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'],
              datasets: [
                {
                  normalized: true,
                  backgroundColor: getRandomColor(5),
                  data: [1, 2, 3, 4, 5],
                },
              ],
            }}
          />
        </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard
