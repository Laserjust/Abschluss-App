import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Download as DownloadIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Backup as BackupIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import backupService from '../services/backupService';

const BackupManager = ({ open, onClose }) => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (open) {
      loadBackups();
      loadStats();
    }
  }, [open]);

  const loadBackups = () => {
    try {
      const backupList = backupService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Fehler beim Laden der Backups:', error);
      showSnackbar('Fehler beim Laden der Backups', 'error');
    }
  };

  const loadStats = () => {
    try {
      const backupStats = backupService.getBackupStats();
      setStats(backupStats);
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupKey = backupService.createBackup();
      if (backupKey) {
        showSnackbar('Backup erfolgreich erstellt', 'success');
        loadBackups();
        loadStats();
      } else {
        showSnackbar('Fehler beim Erstellen des Backups', 'error');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Backups:', error);
      showSnackbar('Fehler beim Erstellen des Backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async (backupKey) => {
    try {
      const success = backupService.exportBackup(backupKey);
      if (success) {
        showSnackbar('Backup erfolgreich exportiert', 'success');
      } else {
        showSnackbar('Fehler beim Exportieren des Backups', 'error');
      }
    } catch (error) {
      console.error('Fehler beim Exportieren:', error);
      showSnackbar('Fehler beim Exportieren des Backups', 'error');
    }
  };

  const handleRestoreBackup = async (backupKey) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Backup wiederherstellen möchten? Alle aktuellen Daten werden überschrieben.')) {
      return;
    }

    setLoading(true);
    try {
      const success = backupService.restoreFromBackup(backupKey);
      if (success) {
        showSnackbar('Backup erfolgreich wiederhergestellt. Seite wird neu geladen...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showSnackbar('Fehler beim Wiederherstellen des Backups', 'error');
      }
    } catch (error) {
      console.error('Fehler beim Wiederherstellen:', error);
      showSnackbar('Fehler beim Wiederherstellen des Backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (backupKey) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Backup löschen möchten?')) {
      return;
    }

    try {
      localStorage.removeItem(backupKey);
      showSnackbar('Backup erfolgreich gelöscht', 'success');
      loadBackups();
      loadStats();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      showSnackbar('Fehler beim Löschen des Backups', 'error');
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setLoading(true);
      try {
        const backupKey = await backupService.importBackup(file);
        showSnackbar('Backup erfolgreich importiert', 'success');
        loadBackups();
        loadStats();
      } catch (error) {
        console.error('Fehler beim Importieren:', error);
        showSnackbar('Fehler beim Importieren des Backups', 'error');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getBackupStatus = (backupKey) => {
    const validation = backupService.validateBackup(backupKey);
    return validation.valid ? 'Gültig' : `Ungültig: ${validation.error}`;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BackupIcon />
            Backup-Verwaltung
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {/* Statistiken */}
          {stats && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <InfoIcon />
                <Typography variant="body2">
                  {stats.count} Backups • {stats.formattedSize} • 
                  Durchschnitt: {backupService.formatBytes(stats.averageSize)}
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Aktionen */}
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant="contained"
              startIcon={<BackupIcon />}
              onClick={handleCreateBackup}
              disabled={loading}
            >
              Backup erstellen
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleImportBackup}
              disabled={loading}
            >
              Importieren
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Backup-Liste */}
          {backups.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              Keine Backups vorhanden
            </Typography>
          ) : (
            <List>
              {backups.map((backup, index) => {
                const status = getBackupStatus(backup.key);
                const isValid = status === 'Gültig';
                
                return (
                  <React.Fragment key={backup.key}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {formatDate(backup.timestamp)}
                            </Typography>
                            <Chip 
                              label={status} 
                              size="small" 
                              color={isValid ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Größe: {backupService.formatBytes(backup.size)} • 
                              Version: {backup.version}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {backup.key}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleExportBackup(backup.key)}
                            title="Exportieren"
                            disabled={loading}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreBackup(backup.key)}
                            title="Wiederherstellen"
                            disabled={loading || !isValid}
                            color="primary"
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteBackup(backup.key)}
                            title="Löschen"
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < backups.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BackupManager;