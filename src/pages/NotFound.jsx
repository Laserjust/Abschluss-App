import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentDissatisfied as SadIcon } from '@mui/icons-material';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 3,
          maxWidth: 500,
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <SadIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Seite nicht gefunden
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Die von dir gesuchte Seite existiert nicht oder wurde verschoben.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Zurück zur Startseite
        </Button>
      </Paper>
    </Box>
  );
}

export default NotFound;