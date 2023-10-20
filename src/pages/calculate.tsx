import { Box, Button, Typography } from '@mui/material'
import { AccountInput } from '@src/components/Account/AccountInput'
import CountrySelect from '@src/components/Calculate/CountrySelect'
import { countryISO3Mapping } from '@src/utils/countryISOMapping'
import { api } from '@src/utils/network'
import convert from 'convert'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { toast } from 'sonner'

interface CalculateResult {
  co2perPageview: number
  transferSize: number
  carbonIntensity?: number
}

const CalculatePage = () => {
  const [url, setUrl] = useState('')
  const [country, setCountry] = useState<string | null>(null)
  const [pageviews, setPageviews] = useState(10000)

  // Result
  const [result, setResult] = useState<CalculateResult>()

  // Layout
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      // Call calculate endpoint
      const response = await api.post<CalculateResult>(
        '/database/website/calculate',
        {
          url,
          country: countryISO3Mapping[country || ''],
        },
      )

      setResult(response.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <NextSeo
        title="Calculate"
        description="Calculate the carbon footprint of a website"
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            padding: 4,
            width: { sm: '100%', md: '60%' },
            height: '100%',
            gap: 2,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--joy-palette-background-backdrop)',
          }}
        >
          {!result ? (
            <>
              <Typography component="h1" sx={{ fontSize: '25px' }}>
                Calculate the carbon footprint of a website
              </Typography>
              <AccountInput
                label="URL"
                value={url}
                placeholder="https://..."
                onChange={(e) => setUrl(e.target.value)}
              />
              <CountrySelect
                value={country}
                onChange={setCountry}
                placeholder="Majority userbase country"
              />
              <Button
                disabled={loading}
                loading={loading}
                onClick={submit}
                fullWidth
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <Typography component="h1" sx={{ fontSize: '25px' }}>
                Result
              </Typography>
              <AccountInput
                label="Page Views"
                value={pageviews}
                onChange={(e) => {
                  try {
                    setPageviews(parseInt(e.target.value))
                  } catch (err) {
                    console.log(err)
                  }
                }}
              />

              <Typography component="h4">
                This website uses{' '}
                {convert(result.co2perPageview, 'grams').to('best').toString(2)}{' '}
                CO2e/page visit
              </Typography>

              <Typography component="h4">
                This means that {pageviews} pageviews will emit{' '}
                {convert(result.co2perPageview * pageviews, 'grams')
                  .to('best')
                  .toString(2)}{' '}
                CO2e
              </Typography>
              {result.carbonIntensity && (
                <Typography component="h4">
                  The carbon intensity of {country} is{' '}
                  {convert(result.carbonIntensity, 'grams')
                    .to('best')
                    .toString(2)}{' '}
                  CO2e/kWh
                </Typography>
              )}
              {result.transferSize && (
                <Typography component="h4">
                  The transfer size of {url} is{' '}
                  {convert(result.transferSize, 'bytes').to('best').toString(2)}
                </Typography>
              )}
            </>
          )}
        </Box>
        NNB
      </Box>
    </Box>
  )
}

export default CalculatePage
