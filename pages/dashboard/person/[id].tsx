import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { Box, Card, CardContent, Grid, Table, Typography } from '@mui/joy'
import { Event, Person, Property } from '@prisma/client'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import TeamHeader from '@src/components/TeamHeader'
import { DateTime } from 'luxon'
import Head from 'next/head'
import { useRouter } from 'next/router'
import useSWR from 'swr'

const PersonPage = withPageAuthRequired(() => {
  const router = useRouter()
  const { id } = router.query

  const { data } = useSWR<Person & { events: Event[]; properties: Property[] }>(
    id ? `/database/persons/${id}` : null,
  )

  return (
    <Box sx={{ margin: 8 }}>
      <Head>
        <title>Green Analytics | Person</title>
      </Head>
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
                <Typography level="h2">Person Details</Typography>

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
                      <td>Email</td>
                      <td>{data?.email}</td>
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

          {/* PERSON PROPERTIES */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="h2">Person Properties</Typography>
                <Table>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.properties?.map((property) => (
                      <tr key={property.id}>
                        <td>{property.key}</td>
                        <td>{property.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* PERSON EVENTS */}
          <Grid xs={12} md={12}>
            <Card>
              <CardContent>
                <Typography level="h2">Person Events</Typography>
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
                      <tr key={event.id}>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
})

export default PersonPage
