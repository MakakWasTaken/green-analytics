import { Box, Button, Typography } from '@mui/joy'
import { AccountInput } from '@src/components/Account/AccountInput'
import CountrySelect from '@src/components/Calculate/CountrySelect'
import { countryISO3Mapping } from '@src/utils/countryISOMapping'
import { api } from '@src/utils/network'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface CalculateResult {
  co2perPageview: number
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
      <h1>Calculate Page</h1>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: { sm: '100%', md: '60%' },
        }}
      >
        <Box
          sx={{
            padding: 4,
            width: '90%',
            height: '100%',
            gap: 2,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: (theme) => theme.palette.background.backdrop,
          }}
        >
          {!result ? (
            <>
              <AccountInput
                label="URL"
                value={url}
                placeholder="https://..."
                onChange={(e) => setUrl(e.target.value)}
              />
              <CountrySelect value={country} onChange={setCountry} />
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
              <AccountInput
                label="Page Views"
                value={pageviews}
                onChange={(e) => setPageviews(e.target.valueAsNumber)}
              />

              <Typography component="h4">
                This website uses {result.co2perPageview.toFixed(2)}g CO2e/page
                visit
              </Typography>

              <Typography component="h4">
                This means that {pageviews} pageviews will emit{' '}
                {(result.co2perPageview * pageviews).toFixed(2)}g CO2e
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CalculatePage
