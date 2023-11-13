import { count } from 'console'
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import NavigationMenu from '@components/Dashboard/NavigationMenu'
import Pagination from '@components/Dashboard/Pagination'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { Box, Card, CardContent, Grid, Table, Typography } from '@mui/material'
import { Event, Person, Property } from '@prisma/client'
import { DateTime } from 'luxon'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'

const EventTypePage = withPageAuthRequired(() => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)

  const router = useRouter()
  const { type } = router.query

  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)

  const { data } = useSWR<{ events: Event[]; count: number }>(
    selectedWebsite && type
      ? `/database/events/types/${type}?websiteId=${selectedWebsite.id}`
      : null,
  )

  useEffect(() => {
    if (data?.count) {
      setCount(data.count)
    }
  }, [data])

  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title={`Dashboard - ${type}`} />
      <TeamHeader selectWebsite />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />
        {!loadingTeams && (
          <Grid
            container
            spacing={2}
            sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
          >
            <Grid xs={12} md={12}>
              <Card>
                <CardContent>
                  <Typography level="h2">{type}</Typography>
                  <Table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.events?.map((event) => (
                        <tr
                          key={event.id}
                          onClick={() =>
                            router.push(`/dashboard/event/${event.id}`)
                          }
                        >
                          <td>{event.id}</td>
                          <td>{event.type}</td>
                          <td>
                            {DateTime.fromISO(event.createdAt as any).toFormat(
                              'dd/MM/yyyy HH:mm',
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Pagination
                    sx={{
                      marginTop: 4,
                    }}
                    page={page}
                    onPageChange={(value) => setPage(value)}
                    totalPages={Math.ceil(count / 20) || 1}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  )
})

export default EventTypePage
