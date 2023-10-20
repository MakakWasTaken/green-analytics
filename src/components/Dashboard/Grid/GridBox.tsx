import { Help } from '@mui/icons-material'
import { Box, Grid, GridProps, Sheet, Tooltip, Typography } from '@mui/material'
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
          <Typography level="h6" sx={{ marginBottom: 2 }}>
            {label}
          </Typography>
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
