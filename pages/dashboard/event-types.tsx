import NavigationMenu from '@components/Dashboard/NavigationMenu'
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
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { KeyboardEvent, useContext, useState } from 'react'
import useSWR from 'swr'

const EventTypes = () => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)
  const router = useRouter()
  const [highlighted, setHighlighted] = useState(0)

  const { data } = useSWR<Event['type'][]>(
    selectedWebsite ? `events/types?websiteId=${selectedWebsite.id}` : null,
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    console.log(e.code, e.key)
    if (e.code === '40') {
      // Down arrow
      setHighlighted((prev) => Math.max(0, prev - 1))
    } else if (e.code === '38') {
      // Up arrow
      setHighlighted((prev) => Math.max(0, prev - 1))
    }
  }

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
                      {data?.map((type, index) => (
                        <tr
                          style={{
                            border:
                              index === highlighted
                                ? '2px solid black'
                                : undefined,
                          }}
                          onClick={() =>
                            router.push(`/dashboard/event/type/${type}`)
                          }
                          onKeyDown={handleKeyDown}
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
