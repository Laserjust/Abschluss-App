import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,

} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import yearManagementService from '../services/yearManagementService';
import { useAuth } from '../context/AuthContext';

function YearManagement() {
  const theme = useTheme();
  const { switchYear } = useAuth();
  const [years, setYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminAccounts, setAdminAccounts] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadYears();
    loadAdminAccounts();
    setCurrentYear(yearManagementService.getCurrentYear());
  }, []);

  const loadYears = () => {
    const availableYears = yearManagementService.getAvailableYears();
    setYears(availableYears);
  };

  const loadAdminAccounts = () => {
    const accounts = yearManagementService.getAdminAccounts();
    setAdminAccounts(accounts);
  };

  const handleCreateYear = async () => {
    if (!newYear) {
      setError('Bitte geben Sie ein Jahr ein.');
      return;
    }

    const year = parseInt(newYear);
    if (isNaN(year) || year < 20 || year > 99) {
      setError('Bitte geben Sie eine gültige Jahreszahl zwischen 20 und 99 ein.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await yearManagementService.createNewYear(year);
      
      if (result.success) {
        setSuccess(`Jahrgang ${year} wurde erfolgreich erstellt!`);
        setSnackbar({
          open: true,
          message: `Admin-Account: ${result.adminAccount.email}`,
          severity: 'success'
        });
        loadYears();
        loadAdminAccounts();
        setCreateDialogOpen(false);
        setNewYear('');
        
        // Automatisch zu dem neuen Jahrgang wechseln
        await handleSwitchYear(year);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Fehler beim Erstellen des Jahrgangs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (year) => {
    console.log('handleDeleteYear called with year:', year);
    if (window.confirm(`Sind Sie sicher, dass Sie Jahrgang ${year} löschen möchten? Alle Daten gehen verloren!`)) {
      console.log('User confirmed deletion');
      const result = yearManagementService.deleteYear(year);
      console.log('Delete result:', result);
      if (result.success) {
        setSuccess(result.message);
        loadYears();
        loadAdminAccounts();
      } else {
        setError(result.error);
      }
    } else {
      console.log('User cancelled deletion');
    }
  };



  const handleResetPassword = (year) => {
    const result = yearManagementService.resetAdminPassword(year);
    if (result.success) {
      setSnackbar({
        open: true,
        message: `Neues Passwort: ${result.password}`,
        severity: 'info'
      });
      loadAdminAccounts();
    } else {
      setError(result.error);
    }
  };

  const togglePasswordVisibility = (year) => {
    setShowPasswords(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({
        open: true,
        message: `${label} wurde in die Zwischenablage kopiert`,
        severity: 'success'
      });
    });
  };

  const getYearInfo = (year) => {
    return yearManagementService.getYearInfo(year);
  };

  const handleSwitchYear = async (year) => {
    try {
      await switchYear(year);
      setCurrentYear(year);
      setSnackbar({
        open: true,
        message: `Zu Jahrgang ${year} gewechselt`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Fehler beim Wechseln: ${error.message}`,
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Jahrgangs-Verwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
              : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
                : 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
            }
          }}
        >
          Neuer Jahrgang
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Aktuelle Jahrgänge ({years.length})
      </Typography>

      <Grid container spacing={3}>
        {years.map((year) => {
          const yearInfo = getYearInfo(year);
          const adminAccount = adminAccounts[year];
          const isActive = year === currentYear;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={year}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: isActive ? `2px solid ${theme.palette.primary.main}` : 'none',
                  background: theme.palette.mode === 'dark' 
                    ? (isActive ? '#1a237e' : '#2C2C2C')
                    : (isActive ? '#e3f2fd' : '#ffffff')
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      Abi {year}
                    </Typography>
                    {isActive && (
                      <Chip 
                        label="Aktiv" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    RSE Abschluss 20{year}
                  </Typography>

                  {adminAccount && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        <AdminIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Admin-Zugang
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1, fontFamily: 'monospace' }}>
                          {adminAccount.email}
                        </Typography>
                        <Tooltip title="E-Mail kopieren">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(adminAccount.email, 'E-Mail')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1, fontFamily: 'monospace' }}>
                          {showPasswords[year] ? adminAccount.password : '••••••••••••'}
                        </Typography>
                        <Tooltip title="Passwort anzeigen/verstecken">
                          <IconButton 
                            size="small" 
                            onClick={() => togglePasswordVisibility(year)}
                          >
                            {showPasswords[year] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Passwort kopieren">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(adminAccount.password, 'Passwort')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}

                  {yearInfo && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Erstellt: {new Date(yearInfo.createdAt).toLocaleDateString('de-DE')}
                    </Typography>
                  )}
                </CardContent>

                <CardActions 
                  sx={{ 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    p: 2
                  }}
                >
                  {!isActive && (
                    <Button 
                      size="small" 
                      onClick={() => handleSwitchYear(year)}
                      startIcon={<CheckIcon />}
                      sx={{ minWidth: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
                    >
                      Aktivieren
                    </Button>
                  )}
                  
                  <Button 
                    size="small" 
                    onClick={() => handleResetPassword(year)}
                    startIcon={<RefreshIcon />}
                    sx={{ minWidth: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
                  >
                    Passwort zurücksetzen
                  </Button>
                  
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteYear(year)}
                    startIcon={<DeleteIcon />}
                    disabled={isActive}
                    sx={{ minWidth: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
                  >
                    Löschen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {years.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Noch keine Jahrgänge erstellt
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Erstellen Sie Ihren ersten Jahrgang, um zu beginnen.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Ersten Jahrgang erstellen
          </Button>
        </Paper>
      )}

      {/* Create Year Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Neuen Jahrgang erstellen
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Erstellen Sie einen neuen Abiturjahrgang mit separater Datenbasis und eigenem Admin-Zugang.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Jahrgang (z.B. 28 für 2028)"
            type="number"
            fullWidth
            variant="outlined"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            inputProps={{ min: 20, max: 99 }}
            helperText="Geben Sie die letzten zwei Ziffern des Abschlussjahres ein (20-99)"
          />

          {newYear && parseInt(newYear) >= 20 && parseInt(newYear) <= 99 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Vorschau:</Typography>
              <Typography variant="body2">
                • Jahrgang: RSE Abschluss 20{newYear}<br/>
                • Admin-E-Mail: admin@rse-abschluss{newYear}.de<br/>
                • Passwort: Wird automatisch generiert
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleCreateYear} 
            variant="contained"
            disabled={loading || !newYear}
          >
            {loading ? 'Erstelle...' : 'Jahrgang erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default YearManagement;