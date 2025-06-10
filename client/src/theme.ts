import { createTheme } from '@mui/material/styles';

// Font family configuration
const fontFamily = [
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

const theme = createTheme({
  typography: {
    fontFamily,
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  palette: {
    primary: {
      main: '#f6339a',
      light: '#ff69b4',
      dark: '#d1006b',
      contrastText: '#fff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontSize: '1rem',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontFamily,
        },
        h2: {
          fontFamily,
        },
        h3: {
          fontFamily,
        },
        h4: {
          fontFamily,
        },
        h5: {
          fontFamily,
        },
        h6: {
          fontFamily,
        },
      },
    },
  },
});

export default theme;
