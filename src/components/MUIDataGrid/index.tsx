import {
  Experimental_CssVarsProvider as MUICssVarsProvider,
  experimental_extendTheme as experimentalExtendTheme,
} from '@mui/material/styles'
import { DataGrid, DataGridProps } from '@mui/x-data-grid'
import { themeDefinitions } from '@src/styles/theme'
import { FC } from 'react'

const MUIDataGrid: FC<DataGridProps> = (props) => {
  return (
    <MUICssVarsProvider
      theme={experimentalExtendTheme({
        ...themeDefinitions,
        components: {
          MuiDataGrid: {
            styleOverrides: {
              root: {
                color: 'var(--joy-pallette-text-primary)',
                backgroundColor: 'transparent',
                borderColor: 'var(--joy-palette-divider)',
              },
              overlay: {
                backgroundColor: 'var(--joy-pallette-background-primary)',
              },
              withBorderColor: {
                borderColor: 'var(--joy-palette-divider)',
              },
              footerContainer: {
                color: 'var(--joy-pallette-text-primary)',
              },
            },
          },
        },
      })}
    >
      <DataGrid {...props} />
    </MUICssVarsProvider>
  )
}

export default MUIDataGrid
