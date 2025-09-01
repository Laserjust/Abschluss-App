import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import yearManagementService from '../../services/yearManagementService';

function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom 
            sx={{ fontWeight: 600, mb: 3 }}
          >
            RSE Abschluss {yearManagementService.getCurrentYear()}
          </Typography>
          
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;