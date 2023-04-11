import { extendTheme } from '@mui/joy/styles'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          mainChannel: '#aaf0bc',
        },
        background: {
          surface: '#fff',
          popup: '#fff',
        },
        text: {
          primary: '#202124',
          secondary: '#5f6368',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          mainChannel: '#0f6925',
        },
        background: {
          surface: '#202124',
          popup: '#202124',
        },
        text: {
          primary: '#fff',
          secondary: '#5f6368',
        },
      },
    },
  },
})

export default theme
