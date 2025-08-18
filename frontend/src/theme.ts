import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',     
    },
    secondary: {
      main: '#f50057',     
    },
    background: {
      default: '#f4f6f8',  
      paper:    '#ffffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    h5: {
      fontWeight: 600,
    },
    body2: {
      color: '#555',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0,0,0,0.12)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '4px 8px',
          '&.Mui-selected, &:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
