import { Box, Typography } from '@mui/joy'
import { FC, PropsWithChildren } from 'react'

interface AccountBoxInterface {
  label: string
}

const AccountBox: FC<PropsWithChildren<AccountBoxInterface>> = ({
  label,
  children,
}) => {
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
          margin: 1,
          borderRadius: 16,
          border: (theme) => `1px solid ${theme.palette.divider}`,
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
        {children}
      </Box>
    </Box>
  )
}

export default AccountBox
