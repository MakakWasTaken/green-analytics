// src/componetns/Footer.tsx

import Link from '@components/Link'
import { Box, Typography } from '@mui/material'
import { FC, ReactElement } from 'react'

export const Footer: FC = (): ReactElement => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'auto',
        backgroundColor: 'var(--joy-palette-background-backdrop)',
        paddingTop: '1rem',
        paddingBottom: '1rem',
      }}
    >
      <Box sx={{ display: 'flex', margin: { xs: '0 12px', md: '0 128px' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography color="primary" level="title-md">
            Green Analytics
          </Typography>
          <Typography color="neutral" level="body-md">
            {`${new Date().getFullYear()} © Green Analytics`}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Link href="/policies/terms" color="neutral" level="body-md">
            Terms of Service
          </Link>
          <Link href="/policies/privacy" color="neutral" level="body-md">
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
