import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import { Box, Grid } from '@mui/joy'
import { GridColDef } from '@mui/x-data-grid'
import { Scan } from '@prisma/client'
import NavigationMenu from '@src/components/Dashboard/NavigationMenu'
import MUIDataGrid from '@src/components/MUIDataGrid'
import TeamHeader from '@src/components/TeamHeader'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { countryISO2Mapping } from '@src/utils/countryISOMapping'
import Head from 'next/head'
import { FC, useContext } from 'react'
import useSWR from 'swr'

/**
 * This page allows the user to see the latest scan result for their website.
 * @returns
 */
const ScanPage: FC = () => {
  const { selectedWebsite } = useContext(HeaderContext)

  const { data, isLoading } = useSWR<Scan[]>(
    selectedWebsite ? `/database/website/${selectedWebsite.id}/scan` : null,
  )

  const columns: GridColDef[] = [
    { field: 'url', headerName: 'URL', flex: 1 },
    {
      field: 'green',
      headerName: 'Green Hosting',
      width: 150,
      renderCell: (params) =>
        params.value ? <LocalFloristIcon color="success" /> : null,
    },
    { field: 'transferSize', headerName: 'Transfer Size', width: 100 },
    { field: 'contentSize', headerName: 'Content Size', width: 100 },
    {
      field: 'countryCode',
      headerName: 'Country',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              loading="lazy"
              width="20"
              src={`https://flagcdn.com/w20/${countryISO2Mapping[
                params.value as string
              ]?.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w40/${countryISO2Mapping[
                params.value as string
              ]?.toLowerCase()}.png 2x`}
              alt={params.value + ' flag'}
            />
          )}
          <Box sx={{ marginLeft: 1 }}>{params.value}</Box>
        </Box>
      ),
    },
    {
      field: 'co2Intensity',
      headerName: 'CO2 Intensity',
      valueFormatter: (params) => `${params.value?.toFixed(2)}g/kWh`,
      width: 200,
    },
  ]

  return (
    <Box sx={{ margin: 8 }}>
      <Head>
        <title>Green Analytics | Dashboard - Scan Results</title>
      </Head>
      <TeamHeader selectWebsite />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <NavigationMenu />
        <Grid
          container
          spacing={2}
          sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1, overflowX: 'scroll' }}
        >
          <MUIDataGrid
            hideFooter
            autoHeight
            loading={isLoading}
            rows={[
              ...(data || []),
              {
                id: 'total',
                url: 'Total',
                green: data?.every((scan) => scan.green),
                transferSize: data?.reduce(
                  (acc, scan) => acc + scan.transferSize,
                  0,
                ),

                contentSize: data?.reduce(
                  (acc, scan) => acc + scan.contentSize,
                  0,
                ),

                countryCode: '',
                // Average co2 intensity
                co2Intensity:
                  (data?.reduce((acc, scan) => acc + scan.co2Intensity, 0) ||
                    0.0) / (data?.length || 1.0),
              },
            ]}
            columns={columns}
          />
        </Grid>
      </Box>
    </Box>
  )
}

export default ScanPage
