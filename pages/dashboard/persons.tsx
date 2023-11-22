import { Box, Grid, Table } from '@mui/joy'
import { CircularProgress, Typography } from '@mui/material'
import { Person } from '@prisma/client'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import Pagination from '@src/components/Dashboard/Pagination'
import TeamHeader from '@src/components/TeamHeader'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FC, KeyboardEvent, useContext, useEffect, useState } from 'react'
import useSWR from 'swr'

const PersonsPage: FC = () => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)
  const router = useRouter()

  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [highlighted, setHighlighted] = useState(0)

  const { data } = useSWR<{ persons: Person[]; count: number }>(
    selectedWebsite
      ? `/database/persons?websiteId=${selectedWebsite.id}&page=${page}`
      : null,
  )

  useEffect(() => {
    if (data?.count) {
      setCount(data?.count)
    }
  }, [data?.count])

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
      <Head>
        <title>Green Analytics | Dashboard - Persons</title>
      </Head>
      <TeamHeader selectWebsite />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />
        <Grid
          container
          spacing={2}
          sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1 }}
        >
          {loadingTeams && <CircularProgress />}
          {!loadingTeams && !selectedWebsite && (
            <Typography level="h3">You need to select a website</Typography>
          )}
          {/* PERSON LIST */}
          {!loadingTeams && selectedWebsite && (
            <Grid xs={12}>
              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.persons?.map((person, index) => (
                    <tr
                      onClick={() =>
                        router.push(`/dashboard/person/${person.id}`)
                      }
                      style={{
                        border:
                          index === highlighted ? '2px solid black' : undefined,
                      }}
                      key={person.id}
                      onKeyDown={handleKeyDown}
                    >
                      <td>{person.id}</td>
                      <td>{person.name}</td>
                      <td>{person.email}</td>
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
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  )
}

export default PersonsPage
