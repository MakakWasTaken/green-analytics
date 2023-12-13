import { Edit, Help } from '@mui/icons-material'
import {
  Box,
  Grid,
  IconButton,
  Sheet,
  Tooltip,
  Typography,
} from '@mui/material'
import { DashboardCell } from '@prisma/client'
import { FC, useMemo } from 'react'

export interface CellGridBoxProps {
  cell: DashboardCell
  setEditCell: (cell: DashboardCell) => void
}

const CellGridBox: FC<CellGridBoxProps> = ({ cell, setEditCell }) => {
  const onEditClicked = () => {
    setEditCell(cell)
  }

  const cellContent = useMemo(
    () => JSON.parse(cell.content as string),
    [cell.content],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: tmp
  const view = useMemo(() => {
    const tmpView: JSX.Element | null = null

    return tmpView
  }, [cellContent])

  return (
    <Grid
      xs={12} // Full width
      md={cellContent.layout?.width ?? 4}
    >
      <Sheet
        sx={{
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
              {cellContent.label}
            </Typography>
            <IconButton
              sx={{ width: '40px', height: '40px', borderRadius: '20px' }}
              onClick={onEditClicked}
            >
              <Edit />
            </IconButton>
          </Box>
          {cellContent.helpLabel && (
            <Tooltip
              title={
                <span style={{ whiteSpace: 'pre-line' }}>
                  {cellContent.helpLabel}
                </span>
              }
            >
              <Help sx={{ margin: 0.75 }} />
            </Tooltip>
          )}
        </Box>
        {view}
      </Sheet>
    </Grid>
  )
}

export default CellGridBox
