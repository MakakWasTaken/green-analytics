import NavigationMenu from '@components/Dashboard/NavigationMenu'
import Pagination from '@components/Dashboard/Pagination'
import SimpleGrid from '@components/SimpleGrid'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Table,
  Typography,
} from '@mui/material'
import { Person } from 'green-analytics-js'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'

const EventTypes = () => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)
  const router = useRouter()

  const { data } = useSWR<Event['type'][]>(
    selectedWebsite
      ? `/database/events/types?websiteId=${selectedWebsite.id}`
      : null,
  )

  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title="Dashboard - Event Types" />
      <TeamHeader selectWebsite />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />

        {loadingTeams && <CircularProgress />}
        {!loadingTeams && !selectedWebsite && (
          <Typography level="h3">You need to select a website</Typography>
        )}
        {!loadingTeams && selectedWebsite && (
          <Grid
            container
            spacing={2}
            sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
          >
            {/* PERSON LIST */}
            <Grid xs={12}>
              <Card>
                <CardContent>
                  <Table>
                    <thead>
                      <tr>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.map((type) => (
                        <tr
                          onClick={() =>
                            router.push(`/dashboard/event/type/${type}`)
                          }
                          key={type}
                        >
                          <td>{type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default EventTypes
