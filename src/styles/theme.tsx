import { extendTheme } from '@mui/joy/styles'

export const themeDefinitions = {
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#e9f5ea',
          100: '#cbe7cc',
          200: '#aad8ab',
          300: '#89c98a',
          400: '#70bd72',
          500: '#59b259',
          600: '#50a350',
          700: '#459145',
          800: '#3b803b',
          900: '#2a602a',
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
          600: '#3e8d42',
          700: '#347b39',
          800: '#2a6930',
          900: '#1f4e1f',
        },
      },
    },
  },
}

const theme = extendTheme(themeDefinitions)

export default theme
