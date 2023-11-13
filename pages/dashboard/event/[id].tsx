import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import NavigationMenu from '@components/Dashboard/NavigationMenu'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { Box, Card, CardContent, Grid, Table, Typography } from '@mui/material'
import { Event, Person, Property } from '@prisma/client'
import { DateTime } from 'luxon'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import useSWR from 'swr'

const EventPage = withPageAuthRequired(() => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)
  const router = useRouter()
  const { id } = router.query

  const { data } = useSWR<Event>(
    selectedWebsite && id
      ? `/database/events/${id}?websiteId=${selectedWebsite.id}`
      : null,
  )

  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title="Dashboard - Person" />
      <TeamHeader selectWebsite />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />
        <Grid
          container
          spacing={2}
          sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
        >
          {/* PERSON DETAILS */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="h2">Event Details</Typography>

                <Table>
                  <tbody>
                    <tr>
                      <td>ID</td>
                      <td>{data?.id}</td>
                    </tr>
                    <tr>
                      <td>Name</td>
                      <td>{data?.name}</td>
                    </tr>
                    <tr>
                      <td>Type</td>
                      <td>{data?.type}</td>
                    </tr>
                    <tr>
                      <td>Created At</td>
                      <td>
                        {DateTime.fromISO(data?.createdAt as any).toFormat(
                          'dd/MM/yyyy HH:mm',
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Updated At</td>
                      <td>
                        {DateTime.fromISO(data?.updatedAt as any).toFormat(
                          'dd/MM/yyyy HH:mm',
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
})

export default EventPage
