import { Box, Grid, Table } from '@mui/joy'
import { Person } from '@prisma/client'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import Pagination from '@src/components/Dashboard/Pagination'
import TeamHeader from '@src/components/TeamHeader'
import { HeaderContext } from '@src/contexts/HeaderContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FC, useContext, useEffect, useState } from 'react'
import useSWR from 'swr'

const PersonsPage: FC = () => {
  const { selectedWebsite } = useContext(HeaderContext)
  const router = useRouter()

  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)

  const { data } = useSWR<{ persons: Person[]; count: number }>(
    selectedWebsite
      ? `/database/persons?websiteId=${selectedWebsite.id}&page=${page}`
      : null,
  )

  useEffect(() => {
    if (data?.count) {
      setCount(data.count)
    }
  }, [data?.count])

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
          {/* PERSON LIST */}
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
                {data?.persons?.map((person) => (
                  <tr
                    onClick={() =>
                      router.push(`/dashboard/person/${person.id}`)
                    }
                    key={person.id}
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
        </Grid>
      </Box>
    </Box>
  )
}

export default PersonsPage
