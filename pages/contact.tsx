import Link from '@components/Link'
import { Box, Typography } from '@mui/material'
import React from 'react'

const contact = () => {
  return (
    <Box>
      <Typography>
        While this page is being created, you can contact us by email:{' '}
        <Link href="mailto:markus@green-analytics.com">
          markus@green-analytics.com
        </Link>
      </Typography>
    </Box>
  )
}

export default contact
