import { Box, Button, Typography } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

interface AccountBoxInterface {
  label: string
  actionButton?: {
    label: string
    onClick: () => void
  }
}

const AccountBox: FC<PropsWithChildren<AccountBoxInterface>> = ({
  label,
  actionButton,
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
          width: { sm: '100%', md: '85%', lg: '70%' },
          padding: { sm: '1rem', md: '2rem' },
          margin: 1,
          borderRadius: 16,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.5rem' },
              fontWeight: 'bold',
            }}
          >
            {label}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {actionButton && (
            <Button onClick={actionButton.onClick}>{actionButton.label}</Button>
          )}
        </Box>
        {children}
      </Box>
    </Box>
  )
}

export default AccountBox
