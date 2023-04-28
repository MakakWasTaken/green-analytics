/* eslint-disable func-call-spacing */
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { Box, Grid, Typography, useTheme } from '@mui/joy'
import { Event, Property, Scan } from '@prisma/client'
import DoughnutChart from '@src/components/Dashboard/Charts/DoughnutChart'
import HorizontalBarChart from '@src/components/Dashboard/Charts/HorizontalBarChart'
import LineChart from '@src/components/Dashboard/Charts/LineChart'
import ProgressChart from '@src/components/Dashboard/Charts/ProgressChart'
import RadarChart from '@src/components/Dashboard/Charts/RadarChart'
import GridBox from '@src/components/Dashboard/Grid/GridBox'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { getRandomColor } from '@src/utils/utils'
import convert from 'convert'
import { DateTime } from 'luxon'
import Head from 'next/head'
import { useContext, useMemo } from 'react'
import useSWR from 'swr'

const Dashboard = withPageAuthRequired(
  () => {
    const theme = useTheme()

    const { selectedWebsite } = useContext(HeaderContext)

    const { data: previous2WeeksEvents } = useSWR<Event[]>(
      selectedWebsite
        ? `/database/events?websiteId=${selectedWebsite.id}&start=` +
            DateTime.now().minus({ weeks: 2 }).toISODate()
        : null,
    )
    const { data: previousMonthEvents } = useSWR<
      (Event & { properties: Property[] })[]
    >(
      selectedWebsite
        ? `/database/events?websiteId=${selectedWebsite.id}&start=` +
            DateTime.now().minus({ months: 1 }).toISODate()
        : null,
    )

    const { data: previousMonthProperties } = useSWR<Property[]>(
      selectedWebsite
        ? `/database/properties?websiteId=${selectedWebsite.id}&start=` +
            DateTime.now().minus({ months: 1 }).toISODate()
        : null,
    )

    const { data: co2Response } = useSWR<{
      domains: number
      greenDomains: number
      emission: number
    }>(selectedWebsite ? `/database/website/${selectedWebsite.id}/co2` : null)

    const { data: scans } = useSWR<Scan[]>(
      selectedWebsite ? `/database/website/${selectedWebsite.id}/scan` : null,
    )

    const thisWeekDays = new Array(7).fill(0).map((_, i) => {
      const datetime = DateTime.now().startOf('week').plus({ days: i })
      return datetime.toFormat('ccc')
    })
    const weekdays = new Array(7).fill(0).map((_, i) => {
      const datetime = DateTime.now().startOf('week').plus({ days: i })
      return datetime.toFormat('ccc')
    })
    const today = DateTime.now().toFormat('LLL dd')

    const extractEventsByDay = (events: Event[]) => {
      const eventsByDay = new Array(7).fill(0)
      events.forEach((event) => {
        const eventDay = DateTime.fromISO(event.createdAt as any).toFormat(
          'ccc',
        )
        const eventDayIndex = weekdays.indexOf(eventDay)
        eventsByDay[eventDayIndex] += 1
      })
      return eventsByDay
    }

    const averageEventsByDay = extractEventsByDay(
      previousMonthEvents || [],
    ).map((e) => Math.round(e / 4))

    const extractEventsByType = (events: Event[]) => {
      const eventsByType = new Map<string, number>()
      events.forEach((event) => {
        if (eventsByType.has(event.type)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          eventsByType.set(event.type, eventsByType.get(event.type)! + 1)
        } else {
          eventsByType.set(event.type, 1)
        }
      })
      return eventsByType
    }

    const countProperties = (
      properties: Property[],
      propertyKey: string,
    ): Map<string, number> => {
      const eventsByProperty = new Map<string, number>()
      const filteredProperties = properties.filter((p) => p.key === propertyKey)
      filteredProperties.forEach((filteredProperty) => {
        if (filteredProperty) {
          if (eventsByProperty.has(filteredProperty.value)) {
            eventsByProperty.set(
              filteredProperty.value,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              eventsByProperty.get(filteredProperty.value)! + 1,
            )
          } else {
            eventsByProperty.set(filteredProperty.value, 1)
          }
        }
      })
      return eventsByProperty
    }

    const emission = useMemo(
      () => convert(co2Response?.emission || 0.0, 'gram').to('best'),
      [co2Response?.emission],
    )

    const devicePercentages = useMemo((): {
      desktop: number
      mobile: number
    } => {
      if (!previousMonthProperties) {
        return {
          desktop: 0,
          mobile: 0,
        }
      }
      const countByDevice = countProperties(previousMonthProperties, 'mobile')
      const desktop = countByDevice.get('false') || 0
      const mobile = countByDevice.get('true') || 0

      const total = desktop + mobile || 1.0
      return {
        desktop: desktop / total,
        mobile: mobile / total,
      }
    }, [previousMonthProperties])

    const bytePercentages = useMemo((): {
      totalBytes: number
      green: number
      grey: number // Grey bytes are bytes that are not green
    } => {
      let total = 0.0
      let green = 0.0
      let grey = 0.0
      scans?.forEach((scan) => {
        total += scan.transferSize
        if (scan.green) {
          green += scan.transferSize
        } else {
          grey += scan.transferSize
        }
      })
      return {
        totalBytes: total,
        green: green / (total || 0.01),
        grey: grey / (total || 0.01),
      }
    }, [scans])

    return (
      <Box sx={{ margin: 8 }}>
        <Head>
          <title>Green Analytics | Dashboard</title>
        </Head>
        <TeamHeader selectWebsite />
        <Box
          sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}
        >
          <NavigationMenu />
          <Grid
            container
            spacing={2}
            sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
          >
            <GridBox md={4} label="Page Views">
              <Box>
                <Typography level="h1">
                  {
                    previous2WeeksEvents?.filter(
                      (e) =>
                        e.type === 'pageview' &&
                        DateTime.fromISO(e.createdAt as any).weekNumber ===
                          DateTime.now().weekNumber,
                    ).length
                  }
                </Typography>
                <Typography level="h6">This week</Typography>
              </Box>
            </GridBox>
            <GridBox
              md={4}
              label="CO2 Emissions"
              helpLabel={`This indicator is an estimate.
            
            It uses the estimations from sustainable web design guidelines to predict the yearly emissions. 
            This indicator takes the transfer size for each resource and multiplies it by the CO2 emissions per byte transfered. 
            This is then multiplied by the number of visitors per month.
            `}
            >
              <Box>
                <Typography level="h1">
                  {emission.quantity.toFixed(1)}
                </Typography>
                <Typography level="h6">
                  {emission.unit} approximate CO2 emissions
                </Typography>
                <Typography level="h6">this year</Typography>
              </Box>
            </GridBox>
            {/* The percentage of green bytes */}
            <ProgressChart
              md={4}
              label="Green Bytes"
              mainLabel={`${(bytePercentages.green * 100.0).toFixed(2)}%`}
              subLabel={'of all bytes are green'}
              value={bytePercentages.green * 100.0}
            />
            <LineChart
              xs={12}
              md={8}
              label={'Page Views'}
              data={{
                labels: thisWeekDays,
                datasets: [
                  {
                    label: 'This week',
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
                    cubicInterpolationMode: 'monotone',
                    data: extractEventsByDay(
                      previous2WeeksEvents?.filter(
                        (e) =>
                          e.type === 'pageview' &&
                          DateTime.fromISO(e.createdAt as any) >
                            DateTime.now().minus({ week: 1 }),
                      ) || [],
                    ),
                  },
                  {
                    label: 'Previous week',
                    normalized: true,
                    borderColor: theme.palette.neutral[500],
                    backgroundColor: theme.palette.neutral[500],
                    pointRadius: (ctx) =>
                      ctx.chart.data.labels?.[ctx.dataIndex] === today
                        ? 3
                        : ctx.active
                        ? 5
                        : 1,
                    pointHitRadius: 10,
                    cubicInterpolationMode: 'monotone',
                    data: extractEventsByDay(
                      previous2WeeksEvents?.filter(
                        (e) =>
                          e.type === 'pageview' &&
                          DateTime.fromISO(e.createdAt as any) <=
                            DateTime.now().minus({ week: 1 }),
                      ) || [],
                    ),
                  },
                ],
              }}
            />
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
                    data: averageEventsByDay,
                  },
                ],
              }}
            />
            <ProgressChart
              md={4}
              label="Mobile"
              mainLabel={`${(devicePercentages.mobile * 100.0).toFixed(2)}%`}
              subLabel={'is mobile users'}
              value={devicePercentages.mobile * 100.0}
            />
            <DoughnutChart
              md={4}
              label="Browser"
              data={{
                labels: Array.from(
                  countProperties(
                    previousMonthProperties || [],
                    'browser',
                  ).keys(),
                ),
                datasets: [
                  {
                    normalized: true,
                    backgroundColor: getRandomColor(5),
                    borderWidth: 0,
                    data: Array.from(
                      countProperties(
                        previousMonthProperties || [],
                        'browser',
                      ).values(),
                    ),
                  },
                ],
              }}
            />
            <HorizontalBarChart
              md={4}
              label="Popular Pages"
              data={{
                labels: Array.from(
                  countProperties(previousMonthProperties || [], 'path').keys(),
                ),
                datasets: [
                  {
                    normalized: true,
                    backgroundColor: getRandomColor(5),
                    borderWidth: 0,
                    data: Array.from(
                      countProperties(
                        previousMonthProperties || [],
                        'path',
                      ).values(),
                    ),
                  },
                ],
              }}
            />
          </Grid>
        </Box>
      </Box>
    )
  },
  {
    returnTo: '/dashboard',
  },
)

export default Dashboard
