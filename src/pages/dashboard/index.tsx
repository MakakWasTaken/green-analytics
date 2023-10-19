/* eslint-disable func-call-spacing */
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/joy'
import { Person, Property, Scan } from '@prisma/client'
import DoughnutChart from '@src/components/Dashboard/Charts/DoughnutChart'
import HorizontalBarChart from '@src/components/Dashboard/Charts/HorizontalBarChart'
import LineChart from '@src/components/Dashboard/Charts/LineChart'
import ProgressChart from '@src/components/Dashboard/Charts/ProgressChart'
import GridBox from '@src/components/Dashboard/Grid/GridBox'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { getRandomColor } from '@src/utils/utils'
import convert from 'convert'
import { DateTime } from 'luxon'
import { NextSeo } from 'next-seo'
import { useContext, useMemo } from 'react'
import useSWR from 'swr'

const Dashboard = withPageAuthRequired(
  () => {
    const theme = useTheme()

    const { selectedWebsite, loadingTeams } = useContext(HeaderContext)

    const { data: previousMonthEvents } = useSWR<
      { id: string; personId: string; person: Person; createdAt: Date }[]
    >(
      selectedWebsite
        ? `/database/events?websiteId=${selectedWebsite.id}&type=pageview&includePersons=true&start=` +
          DateTime.now().minus({ months: 1 }).toISODate()
        : null,
    )

    const { data: previousMonthProperties } = useSWR<Property[]>(
      selectedWebsite
        ? `/database/properties?websiteId=${selectedWebsite.id}&type=browser,mobile,path&start=` +
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

    const { data: personCount } = useSWR<{ count: number }>(
      selectedWebsite
        ? `/database/persons/count?websiteId=${selectedWebsite.id}`
        : null,
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

    const extractEventsByDay = (
      events: {
        id: string
        personId: string
        person: Person
        createdAt: Date
      }[],
    ) => {
      const eventsByDay = new Array(7).fill(0)
      for (const event of events) {
        const eventDay = DateTime.fromISO(event?.createdAt as any).toFormat(
          'ccc',
        )
        const eventDayIndex = weekdays.indexOf(eventDay)
        eventsByDay[eventDayIndex] += 1
      }
      return eventsByDay
    }

    // const extractEventsByType = (events: Event[]) => {
    //   const eventsByType = new Map<string, number>()
    //   events.forEach((event) => {
    //     if (eventsByType.has(event.type)) {
    //       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //       eventsByType.set(event.type, eventsByType.get(event.type)! + 1)
    //     } else {
    //       eventsByType.set(event.type, 1)
    //     }
    //   })
    //   return eventsByType
    // }

    const countProperties = (
      properties: { key: string; value: string }[],
      propertyKey: string,
    ): Map<string, number> => {
      const eventsByProperty = new Map<string, number>()
      const filteredProperties = properties.filter((p) => p.key === propertyKey)
      for (const filteredProperty of filteredProperties) {
        if (filteredProperty) {
          const value = eventsByProperty.get(filteredProperty.value)
          if (value) {
            eventsByProperty.set(filteredProperty.value, value + 1)
          } else {
            eventsByProperty.set(filteredProperty.value, 1)
          }
        }
      }
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
    }, [previousMonthProperties, countProperties])

    const bytePercentages = useMemo((): {
      totalBytes: number
      green: number
      grey: number // Grey bytes are bytes that are not green
    } => {
      let total = 0.0
      let green = 0.0
      let grey = 0.0
      for (const scan of scans ?? []) {
        total += scan.transferSize
        if (scan.green) {
          green += scan.transferSize
        } else {
          grey += scan.transferSize
        }
      }
      return {
        totalBytes: total,
        green: green / (total || 0.01),
        grey: grey / (total || 0.01),
      }
    }, [scans])

    const pathData = useMemo(() => {
      const countedPaths = countProperties(
        previousMonthProperties || [],
        'path',
      )
      return new Map(
        [...countedPaths.entries()].sort((a, b) => b[1] - a[1]).splice(0, 5),
      )
    }, [previousMonthProperties, countProperties])

    const activeUsers = useMemo(() => {
      // From the events, extract the persons active for each day. While keeping it distinct for the date and person.
      const activeUsersMap: { [key: string]: number } = {}
      for (let i = 14; i >= 0; i--) {
        const date =
          DateTime.now()
            .minus({ days: i }) //
            .toFormat('MMM d') || ''
        const dateSet = new Set<string>()

        for (const event of previousMonthEvents ?? []) {
          const eventDate = DateTime.fromISO(event.createdAt as any).toFormat(
            'MMM d',
          )
          if (
            event.person.email !== null &&
            event.personId &&
            eventDate === date
          ) {
            dateSet.add(event.personId)
          }
        }

        activeUsersMap[date] = dateSet.size
      }

      return activeUsersMap
    }, [previousMonthEvents])

    /**
     * Get the percentage of pageviews that are from returning users
     */
    const returningUserPercentage = useMemo(() => {
      const returningUsers = new Set<string>()
      const totalUsers = new Array<string>()
      for (const event of previousMonthEvents ?? []) {
        if (event.personId) {
          totalUsers.push(event.personId)
          returningUsers.add(event.personId)
        }
      }
      return returningUsers.size / (totalUsers.length || 1)
    }, [previousMonthEvents])

    return (
      <Box sx={{ margin: 8 }}>
        <NextSeo title="Dashboard" />
        <TeamHeader selectWebsite />
        <Box
          sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}
        >
          <NavigationMenu />
          {loadingTeams && <CircularProgress />}
          {!loadingTeams && !selectedWebsite && (
            <Typography level="h3">You need to select a team</Typography>
          )}
          {!loadingTeams && selectedWebsite && (
            <Grid
              container
              spacing={2}
              sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
            >
              <GridBox md={4} label="Page Views">
                <Typography level="h1">
                  {
                    previousMonthEvents?.filter(
                      (e) =>
                        DateTime.fromISO(e.createdAt as any) >
                        DateTime.now().startOf('week'),
                    ).length
                  }
                </Typography>
                <Typography level="h4">This week</Typography>
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
                <Typography level="h1">
                  {emission.quantity.toFixed(1)}
                </Typography>
                <Typography level="h4">
                  {emission.unit} CO2 emissions this year
                </Typography>
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
                        previousMonthEvents?.filter(
                          (e) =>
                            DateTime.fromISO(e.createdAt as any) >
                            DateTime.now().startOf('week'),
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
                        previousMonthEvents?.filter(
                          (e) =>
                            DateTime.fromISO(e.createdAt as any) <=
                            DateTime.now().startOf('week'),
                        ) || [],
                      ),
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
              <LineChart
                md={8}
                label="Active Persons"
                data={{
                  labels: Object.keys(activeUsers),
                  datasets: [
                    {
                      label: 'Active Persons',
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
                      data: Object.values(activeUsers),
                    },
                  ],
                }}
              />
              <HorizontalBarChart
                md={4}
                label="Popular Pages"
                data={{
                  labels: Array.from(pathData.keys()),
                  datasets: [
                    {
                      normalized: true,
                      backgroundColor: getRandomColor(5),
                      borderWidth: 0,
                      borderRadius: 5,
                      data: Array.from(pathData.values()),
                    },
                  ],
                }}
              />
              <GridBox md={4} label="Total Person #">
                <Typography level="h1">{personCount?.count || 0}</Typography>
              </GridBox>
              <ProgressChart
                label="Returning Users"
                md={4}
                mainLabel={`${(returningUserPercentage * 100.0).toFixed(2)}%`}
                subLabel="are returning"
                value={returningUserPercentage * 100.0}
              />
            </Grid>
          )}
        </Box>
      </Box>
    )
  },
  {
    returnTo: '/dashboard',
  },
)

export default Dashboard
