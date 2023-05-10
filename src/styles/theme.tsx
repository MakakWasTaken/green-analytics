import { extendTheme } from '@mui/joy/styles'
import { poppins } from './font'

export const themeDefinitions = {
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#97d09c',
          100: '#81c583',
          200: '#68ba6a',
          300: '#50ae51',
          400: '#479a49',
          500: '#3f893f',
          600: '#3c7a3c',
          700: '#346d34',
          800: '#2c602c',
          900: '#1f481f',
        },
        background: {
          body: '#f5faf5',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#d2eddf',
          100: '#adcdbd',
          200: '#8cc69c',
          300: '#6abf7a',
          400: '#58ac62',
          500: '#468949',
          600: '#3b763f',
          700: '#347b39',
          800: '#2a6930',
          900: '#1f4e1f',
        },
        background: {
          body: '#0c180d',
        },
      },
    },
  },
}

const theme = extendTheme({
  fontFamily: {
    body: poppins.style.fontFamily,
  },
  fontWeight: { xs: 400 },
  ...themeDefinitions,
})

export default theme
