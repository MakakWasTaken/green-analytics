import { Edit, Help } from '@mui/icons-material'
import {
  Box,
  Grid,
  GridProps,
  IconButton,
  Sheet,
  Tooltip,
  Typography,
} from '@mui/material'
import { FC, PropsWithChildren } from 'react'

export interface GridBoxProps {
  label: string
  helpLabel?: string
  sx?: GridProps['sx']
  xs?: GridProps['xs']
  md?: GridProps['md']
  lg?: GridProps['lg']
}

const GridBox: FC<PropsWithChildren<GridBoxProps>> = ({
  label,
  helpLabel,
  children,
  ...rest
}) => {
  const onEditClicked = () => {
    // TODO: Implement method
  }

  return (
    <Grid
      xs={rest.xs ?? 12} // Full width
      md={rest.md} // Full width
      lg={rest.lg} // Full width
    >
      <Sheet
        sx={{
          ...rest.sx,

          backgroundColor: 'var(--joy-palette-background-surface)',
          color: 'var(--joy-palette-text-tertiary)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 16,

          height: '100%',
          padding: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Typography level="h4" sx={{ marginBottom: 2 }}>
              {label}
            </Typography>
            <IconButton
              sx={{ width: '40px', height: '40px', borderRadius: '20px' }}
              onClick={onEditClicked}
            >
              <Edit />
            </IconButton>
          </Box>
          {helpLabel && (
            <Tooltip
              title={
                <span style={{ whiteSpace: 'pre-line' }}>{helpLabel}</span>
              }
            >
              <Help sx={{ margin: 0.75 }} />
            </Tooltip>
          )}
        </Box>
        {children}
      </Sheet>
    </Grid>
  )
}

export default GridBox
