import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode = 'light') => createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode,
    primary: {
      main: '#0071e3',
      light: '#3395ff',
      dark: '#004fa0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#86868b',
      light: '#a1a1a6',
      dark: '#5d5d61',
      contrastText: '#ffffff',
    },
    error: {
      main: mode === 'dark' ? '#ff453a' : '#ff3b30',
    },
    warning: {
      main: mode === 'dark' ? '#ff9f0a' : '#ff9500',
    },
    info: {
      main: '#0071e3',
    },
    success: {
      main: mode === 'dark' ? '#30d158' : '#34c759',
    },
    background: {
      default: mode === 'dark' ? '#1c1c1e' : '#ffffff',
      paper: mode === 'dark' ? '#2c2c2e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#1d1d1f',
      secondary: mode === 'dark' ? '#a1a1a6' : '#86868b',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 3px -2px rgba(0,0,0,0.05),0px 2px 6px 0px rgba(0,0,0,0.03),0px 1px 8px 0px rgba(0,0,0,0.05)',
    '0px 3px 4px -2px rgba(0,0,0,0.05),0px 3px 8px 0px rgba(0,0,0,0.03),0px 1px 12px 0px rgba(0,0,0,0.05)',
    '0px 4px 5px -2px rgba(0,0,0,0.05),0px 4px 10px 0px rgba(0,0,0,0.03),0px 1px 14px 0px rgba(0,0,0,0.05)',
    '0px 5px 8px -3px rgba(0,0,0,0.05),0px 5px 12px 0px rgba(0,0,0,0.03),0px 2px 16px 0px rgba(0,0,0,0.05)',
    '0px 6px 10px -4px rgba(0,0,0,0.05),0px 6px 14px 0px rgba(0,0,0,0.03),0px 2px 18px 0px rgba(0,0,0,0.05)',
    '0px 7px 12px -4px rgba(0,0,0,0.05),0px 7px 16px 0px rgba(0,0,0,0.03),0px 2px 20px 0px rgba(0,0,0,0.05)',
    '0px 8px 14px -5px rgba(0,0,0,0.05),0px 8px 18px 0px rgba(0,0,0,0.03),0px 3px 22px 0px rgba(0,0,0,0.05)',
    '0px 9px 16px -6px rgba(0,0,0,0.05),0px 9px 20px 0px rgba(0,0,0,0.03),0px 3px 24px 0px rgba(0,0,0,0.05)',
    '0px 10px 18px -6px rgba(0,0,0,0.05),0px 10px 22px 0px rgba(0,0,0,0.03),0px 4px 26px 0px rgba(0,0,0,0.05)',
    '0px 11px 20px -7px rgba(0,0,0,0.05),0px 11px 24px 0px rgba(0,0,0,0.03),0px 4px 28px 0px rgba(0,0,0,0.05)',
    '0px 12px 22px -8px rgba(0,0,0,0.05),0px 12px 26px 0px rgba(0,0,0,0.03),0px 5px 30px 0px rgba(0,0,0,0.05)',
    '0px 13px 24px -8px rgba(0,0,0,0.05),0px 13px 28px 0px rgba(0,0,0,0.03),0px 5px 32px 0px rgba(0,0,0,0.05)',
    '0px 14px 26px -9px rgba(0,0,0,0.05),0px 14px 30px 0px rgba(0,0,0,0.03),0px 6px 34px 0px rgba(0,0,0,0.05)',
    '0px 15px 28px -10px rgba(0,0,0,0.05),0px 15px 32px 0px rgba(0,0,0,0.03),0px 6px 36px 0px rgba(0,0,0,0.05)',
    '0px 16px 30px -10px rgba(0,0,0,0.05),0px 16px 34px 0px rgba(0,0,0,0.03),0px 7px 38px 0px rgba(0,0,0,0.05)',
    '0px 17px 32px -11px rgba(0,0,0,0.05),0px 17px 36px 0px rgba(0,0,0,0.03),0px 7px 40px 0px rgba(0,0,0,0.05)',
    '0px 18px 34px -12px rgba(0,0,0,0.05),0px 18px 38px 0px rgba(0,0,0,0.03),0px 8px 42px 0px rgba(0,0,0,0.05)',
    '0px 19px 36px -12px rgba(0,0,0,0.05),0px 19px 40px 0px rgba(0,0,0,0.03),0px 8px 44px 0px rgba(0,0,0,0.05)',
    '0px 20px 38px -13px rgba(0,0,0,0.05),0px 20px 42px 0px rgba(0,0,0,0.03),0px 9px 46px 0px rgba(0,0,0,0.05)',
    '0px 21px 40px -14px rgba(0,0,0,0.05),0px 21px 44px 0px rgba(0,0,0,0.03),0px 9px 48px 0px rgba(0,0,0,0.05)',
    '0px 22px 42px -14px rgba(0,0,0,0.05),0px 22px 46px 0px rgba(0,0,0,0.03),0px 10px 50px 0px rgba(0,0,0,0.05)',
    '0px 23px 44px -15px rgba(0,0,0,0.05),0px 23px 48px 0px rgba(0,0,0,0.03),0px 10px 52px 0px rgba(0,0,0,0.05)',
    '0px 24px 46px -16px rgba(0,0,0,0.05),0px 24px 50px 0px rgba(0,0,0,0.03),0px 11px 54px 0px rgba(0,0,0,0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#d2d2d7',
            },
            '&:hover fieldset': {
              borderColor: '#0071e3',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0071e3',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1C1C1E' : '#F2F2F7',
          borderRight: 'none',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (max-width: 600px)': {
            paddingLeft: '12px',
            paddingRight: '12px',
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        container: {
          '@media (max-width: 600px)': {
            margin: '0 -8px',
            width: 'calc(100% + 16px)',
          },
        },
        item: {
          '@media (max-width: 600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          '@media (max-width: 600px)': {
            fontSize: '2rem',
          },
        },
        h2: {
          '@media (max-width: 600px)': {
            fontSize: '1.75rem',
          },
        },
        h3: {
          '@media (max-width: 600px)': {
            fontSize: '1.5rem',
          },
        },
        h4: {
          '@media (max-width: 600px)': {
            fontSize: '1.25rem',
          },
        },
      },
    },
  },
});

export default createAppTheme;