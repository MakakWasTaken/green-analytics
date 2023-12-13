import NavigationMenu from '@components/Dashboard/NavigationMenu'
import SimpleGrid, { SimpleGridColumnDefinition } from '@components/SimpleGrid'
import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import OilBarrelIcon from '@mui/icons-material/OilBarrel'
import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import { Scan } from '@prisma/client'
import { countryISO2Mapping } from '@utils/countryISOMapping'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { FC, useContext, useMemo } from 'react'
import useSWR from 'swr'

/**
 * This page allows the user to see the latest scan result for their website.
 * @returns
 */
const ScanPage: FC = () => {
  const { selectedWebsite, loadingTeams } = useContext(HeaderContext)

  const { data } = useSWR<Scan[]>(
    selectedWebsite ? `website/${selectedWebsite.id}/scan` : null,
  )

  const columns: SimpleGridColumnDefinition[] = [
    {
      field: 'url',
      width: '40%',
      headerName: 'URL',
    },
    {
      field: 'green',
      headerName: 'Green',
      renderCell: (value: boolean) =>
        value ? (
          <LocalFloristIcon color="success" />
        ) : (
          <OilBarrelIcon color="warning" />
        ),
    },
    {
      field: 'transferSize',
      headerName: 'Transfer Size',
      type: 'number',
      renderCell: (value: number) => (
        <p>{`${(value / 1000.0).toFixed(3)} KB`}</p>
      ),
    },
    {
      field: 'contentSize',
      headerName: 'Content Size',
      type: 'number',
      renderCell: (value: number) => (
        <p>{`${(value / 1000.0).toFixed(3)} KB`}</p>
      ),
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      renderCell: (value: string) => (
        <Box>
          <Image
            loading="lazy"
            height={17}
            width={20}
            src={`https://flagcdn.com/w20/${countryISO2Mapping[
              value
            ]?.toLowerCase()}.png`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            alt={`${value} flag`}
          />{' '}
          {value}
        </Box>
      ),
    },
    {
      field: 'co2Intensity',
      headerName: 'CO2 Intensity',
      type: 'number',
      renderCell: (value: number) => <p>{`${value.toFixed(2)}g CO2/kWh`}</p>,
    },
  ]

  const dataWithTotal = useMemo(() => {
    return [
      ...(data || []),
      {
        id: 'total',
        url: 'Total',
        green: data?.every((scan) => scan.green),
        transferSize: data?.reduce((acc, scan) => acc + scan.transferSize, 0),

        contentSize: data?.reduce((acc, scan) => acc + scan.contentSize, 0),

        countryCode: '',
        // Average co2 intensity
        co2Intensity:
          (data?.reduce((acc, scan) => acc + scan.co2Intensity, 0) || 0.0) /
          (data?.length || 1.0),
      },
    ]
  }, [data])

  return (
    <Box sx={{ margin: 8 }}>
      <NextSeo title="Dashboard - Scan Results" />
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
            sx={{ margin: { xs: 0, md: 4 }, flexGrow: 1, overflowX: 'scroll' }}
          >
            <SimpleGrid rows={dataWithTotal} columns={columns} />
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default ScanPage
