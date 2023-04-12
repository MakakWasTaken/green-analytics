import { Box, Grid, Typography } from '@mui/joy'
import { FC, ReactElement } from 'react'
import { AccountInputProps } from './AccountInput'

interface AccountBoxProps {
  label: string
  inputs: ReactElement<AccountInputProps>[]
}

const AccountBox: FC<AccountBoxProps> = ({ label, inputs }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '70%' },
          padding: { xs: '1rem', md: '2rem' },
          border: (theme) => `1px solid ${theme.palette.divider})`,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.5rem' },
            fontWeight: 'bold',
          }}
        >
          {label}
        </Typography>
        <Grid
          container
          sx={{
            columnGap: 2,
            columns: { xs: 1, md: 2 },
          }}
        >
          {inputs}
        </Grid>
      </Box>
    </Box>
  )
}

export default AccountBox
