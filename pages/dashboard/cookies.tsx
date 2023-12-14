import NavigationMenu from '@components/Dashboard/NavigationMenu'
import SimpleGrid, { SimpleGridColumnDefinition } from '@components/SimpleGrid'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { GAResponse } from '@models/GAResponse'
import { Check, Close } from '@mui/icons-material'
import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import { Cookie, User } from '@prisma/client'
import { api } from '@utils/network'
import { NextSeo } from 'next-seo'
import { FC, useContext, useMemo } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

/**
 * This page allows the user to see the latest scan result for their website.
 * @returns
 */
const CookiesPage: FC = () => {
  const { data: user } = useSWR<User>('database/user/own')
  const { selectedTeam, selectedWebsite, loadingTeams } =
    useContext(HeaderContext)

  const { data, mutate } = useSWR<Cookie[]>(
    selectedWebsite ? `/database/website/${selectedWebsite.id}/cookies` : null,
  )

  const columns: SimpleGridColumnDefinition<Cookie>[] = [
    {
      field: 'id',
      hidden: true,
      headerName: 'ID',
    },
    {
      field: 'name',
      width: '30%',
      headerName: 'Name',
    },
    {
      field: 'domain',
      headerName: 'Domain',
    },
    {
      field: 'path',
      headerName: 'Path',
    },
    {
      field: 'expires',
      headerName: 'Lifetime',
      renderCell: (value) => (
        <Typography>{value === 0 ? 'session' : `${value}s`}</Typography>
      ),
    },
    {
      field: 'httpOnly',
      headerName: 'HTTP Only',
      renderCell: (value: boolean) => (value ? <Check /> : <Close />),
      type: 'checkbox',
    },
    {
      field: 'secure',
      headerName: 'Secure',
      renderCell: (value: boolean) => (value ? <Check /> : <Close />),
      type: 'checkbox',
    },
    {
      field: 'sameSite',
      headerName: 'Same Site',
    },
    {
      field: 'type',
      headerName: 'Type',
      type: 'singleSelect',
      valueOptions: [
        {
          value: 'NONE',
          label: 'None',
        },
        {
          value: 'ESSENTIAL',
          label: 'Essential',
        },
        {
          value: 'FUNCTIONALITY',
          label: 'Functionality',
        },
        {
          value: 'PERFORMANCE',
          label: 'Performance',
        },
        {
          value: 'MARKETING',
          label: 'Marketing',
        },
      ],
      editable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: [
        {
          value: 'MANUAL',
          label: 'Manual',
        },
        {
          value: 'AUTO',
          label: 'Auto',
        },
      ],
    },
    {
      field: 'party',
      headerName: 'Party',
      type: 'singleSelect',
      valueOptions: [
        {
          value: 'FIRST',
          label: 'First Party',
        },
        {
          value: 'THIRD',
          label: 'Third Party',
        },
      ],
      editable: true,
    },
  ]

  const handleAdd = async (row: Cookie) => {
    if (!selectedWebsite) {
      toast.error('No website selected')
      return
    }

    const response = await api.post<GAResponse<Cookie>>(
      `database/website/${selectedWebsite.id}/cookies`,
      row,
    )

    const data = response.data.data

    // Update row in local data
    mutate((prev) => (prev ? [...prev, data] : [data]))

    return response.data
  }

  const handleEdit = async (row: Cookie) => {
    if (!selectedWebsite) {
      toast.error('No website selected')
      return
    }
    const response = await api.put<GAResponse<Cookie>>(
      `database/website/${selectedWebsite.id}/cookies/${row.id}`,
      row,
    )

    const data = response.data.data

    // Update row in local data
    mutate((prev) =>
      prev?.map((cookie) => (cookie.id === data.id ? data : cookie)),
    )

    return response.data
  }

  const handleDelete = async (id: string) => {
    if (!selectedWebsite) {
      toast.error('No website selected')
      return
    }
    const response = await api.delete(
      `database/website/${selectedWebsite.id}/cookies/${id}`,
    )

    mutate((prev) => prev?.filter((cookie) => cookie.id !== Number(id)) ?? [])

    return response.data
  }

  const myRole = useMemo(() => {
    if (user && selectedTeam) {
      const role = selectedTeam.roles.find((role) => role.userId === user.id)
      if (role) {
        return role.role
      }
    }
    return null
  }, [selectedTeam, user])

  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title="Dashboard - Cookies" />
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
            sx={{
              margin: { xs: 0, md: 4 },
              flexGrow: 1,
              overflowX: 'scroll',
            }}
          >
            <SimpleGrid
              rows={data ?? []}
              columns={columns}
              onRowAdd={
                myRole === 'OWNER' || myRole === 'ADMIN' ? handleAdd : undefined
              }
              onRowEdit={handleEdit}
              onRowDelete={
                myRole === 'OWNER' || myRole === 'ADMIN'
                  ? handleDelete
                  : undefined
              }
            />
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default CookiesPage
