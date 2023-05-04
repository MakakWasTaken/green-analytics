import {
  Experimental_CssVarsProvider as MUICssVarsProvider,
  experimental_extendTheme as experimentalExtendTheme,
} from '@mui/material/styles'
import { DataGridProps } from '@mui/x-data-grid'
import { poppins } from '@src/styles/font'
import { themeDefinitions } from '@src/styles/theme'
import dynamic from 'next/dynamic'
import { FC } from 'react'
const DataGrid = dynamic(() =>
  import('@mui/x-data-grid').then((mod) => mod.DataGrid),
)

const MUIDataGrid: FC<DataGridProps> = (props) => {
  return (
    <MUICssVarsProvider
      theme={experimentalExtendTheme({
        ...themeDefinitions,
        typography: {
          fontFamily: poppins.style.fontFamily,
        },
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
          MuiIconButton: {
            styleOverrides: {
              root: {
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
