import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import yearManagementService from '../services/yearManagementService';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('Bitte geben Sie E-Mail und Passwort ein.');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType) => {
    setError('');
    try {
      setLoading(true);
      
      const currentYear = yearManagementService.getCurrentYear();
      if (demoType === 'admin') {
        await login(`admin@rse-abschluss${currentYear}.de`, 'admin123');
      } else if (demoType === 'teacher') {
        await login(`lehrer@rse-abschluss${currentYear}.de`, 'lehrer123');
      } else if (demoType === 'student') {
        await login(`schueler@rse-abschluss${currentYear}.de`, 'schueler123');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Test-Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Anmelden
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="E-Mail Adresse"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Passwort"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={toggleShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mb: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Anmelden'}
      </Button>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        Oder verwenden Sie einen Test-Zugang:
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleDemoLogin('admin')}
          disabled={loading}
          sx={{ py: 1 }}
        >
          Administrator
        </Button>
        

      </Box>
    </Box>
  );
}

export default Login;