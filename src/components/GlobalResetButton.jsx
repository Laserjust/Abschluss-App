import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  AccountBalance as FinanceIcon,
  PlayArrow as ActionsIcon,
  Archive as ArchiveIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import globalResetService from '../services/globalResetService';

const GlobalResetButton = ({ variant = 'contained', color = 'error', size = 'medium' }) => {
  const [open, setOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [createBackup, setCreateBackup] = useState(true);
  const [selectedFunctions, setSelectedFunctions] = useState({
    dashboard: true,
    chat: true,
    members: true,
    abiVorabi: true,
    committeesProjects: true,
    calendar: true,
    files: true,
    finance: true,
    actions: true,
    archive: true,
    notifications: true
  });

  const functionDetails = {
    dashboard: {
      name: 'Dashboard',
      description: 'Hauptseite mit Übersicht und Schnellzugriff',
      icon: <DashboardIcon />
    },
    chat: {
      name: 'Chat',
      description: 'Chat-Funktionalität und Nachrichten',
      icon: <ChatIcon />
    },
    members: {
      name: 'Mitgliederliste',
      description: 'Mitgliederübersicht und Kontakte',
      icon: <PeopleIcon />
    },
    abiVorabi: {
      name: 'Abi/Vorabi',
      description: 'Abitur-Vorbereitung und Kurswahl',
      icon: <SchoolIcon />
    },
    committeesProjects: {
      name: 'Komitees & Projekte',
      description: 'Ausschüsse und Projektmanagement',
      icon: <AssignmentIcon />
    },
    calendar: {
      name: 'Kalender',
      description: 'Terminkalender und Veranstaltungen',
      icon: <EventIcon />
    },
    files: {
      name: 'Dateien & Belege',
      description: 'Dateimanagement und Downloads',
      icon: <FolderIcon />
    },
    finance: {
      name: 'Finanzen',
      description: 'Finanzübersicht und Budgetverwaltung',
      icon: <FinanceIcon />
    },
    actions: {
      name: 'Aktionen',
      description: 'Aktionen und Maßnahmen',
      icon: <ActionsIcon />
    },
    archive: {
      name: 'Archiv',
      description: 'Archivierte Inhalte und Dokumente',
      icon: <ArchiveIcon />
    },
    notifications: {
      name: 'Benachrichtigungen',
      description: 'Benachrichtigungen und Mitteilungen',
      icon: <NotificationsIcon />
    }
  };

  const handleOpen = () => {
    console.log('🔄 GlobalResetButton: Opening reset dialog');
    setOpen(true);
    setResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    setConfirmationOpen(false);
    setResult(null);
  };

  const handleFunctionToggle = (functionName) => {
    setSelectedFunctions(prev => ({
      ...prev,
      [functionName]: !prev[functionName]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedFunctions).every(selected => selected);
    const newState = {};
    Object.keys(selectedFunctions).forEach(key => {
      newState[key] = !allSelected;
    });
    setSelectedFunctions(newState);
  };

  const getSelectedCount = () => {
    return Object.values(selectedFunctions).filter(selected => selected).length;
  };

  const handleProceedToConfirmation = () => {
    if (getSelectedCount() === 0) {
      setResult({ success: false, error: 'Bitte wählen Sie mindestens eine Funktion zum Zurücksetzen aus.' });
      return;
    }
    setConfirmationOpen(true);
  };

  const handleReset = async () => {
    console.log('🔄 GlobalResetButton: Starting reset process');
    setLoading(true);
    setResult(null);

    try {
      let backupKey = null;
      
      // Erstelle Backup falls gewünscht
      if (createBackup) {
        console.log('💾 GlobalResetButton: Creating backup');
        backupKey = globalResetService.createBackupBeforeReset();
      }

      // Führe Reset durch
      const selectedFunctionNames = Object.keys(selectedFunctions).filter(
        key => selectedFunctions[key]
      );

      if (selectedFunctionNames.length === Object.keys(selectedFunctions).length) {
        // Alle Funktionen ausgewählt - verwende globales Reset
        console.log('🔄 GlobalResetButton: Performing global reset');
        const resetResult = globalResetService.resetAllFunctions();
        
        if (resetResult.success) {
          setResult({
            success: true,
            message: resetResult.message,
            backupKey: backupKey
          });
        } else {
          setResult({
            success: false,
            error: resetResult.error
          });
        }
      } else {
        // Selektives Reset
        console.log('🔄 GlobalResetButton: Performing selective reset', selectedFunctionNames);
        const results = [];
        
        for (const functionName of selectedFunctionNames) {
          const resetResult = globalResetService.resetFunction(functionName);
          results.push({ function: functionName, ...resetResult });
        }
        
        const failedResets = results.filter(r => !r.success);
        
        if (failedResets.length === 0) {
          setResult({
            success: true,
            message: `${selectedFunctionNames.length} Funktionen wurden erfolgreich zurückgesetzt.`,
            backupKey: backupKey
          });
        } else {
          setResult({
            success: false,
            error: `Fehler beim Zurücksetzen von ${failedResets.length} Funktionen: ${failedResets.map(f => f.function).join(', ')}`
          });
        }
      }

      // Nach erfolgreichem Reset die Seite neu laden
      if (result?.success !== false) {
        setTimeout(() => {
          console.log('🔄 GlobalResetButton: Reloading page after successful reset');
          window.location.reload();
        }, 2000);
      }

    } catch (error) {
      console.error('❌ GlobalResetButton: Error during reset:', error);
      setResult({
        success: false,
        error: `Unerwarteter Fehler: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        color={color}
        size={size}
        onClick={handleOpen}
        startIcon={<WarningIcon />}
      >
        Alle Funktionen zurücksetzen
      </Button>

      {/* Funktionsauswahl Dialog */}
      <Dialog
        open={open && !confirmationOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Funktionen zum Zurücksetzen auswählen
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Wählen Sie die Funktionen aus, die zurückgesetzt werden sollen. 
            Alle Daten der ausgewählten Funktionen werden unwiderruflich gelöscht.
          </Alert>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Object.values(selectedFunctions).every(selected => selected)}
                  indeterminate={
                    Object.values(selectedFunctions).some(selected => selected) &&
                    !Object.values(selectedFunctions).every(selected => selected)
                  }
                  onChange={handleSelectAll}
                />
              }
              label="Alle auswählen/abwählen"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List>
            {Object.entries(functionDetails).map(([key, details]) => (
              <ListItem key={key} dense>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedFunctions[key]}
                    onChange={() => handleFunctionToggle(key)}
                  />
                </ListItemIcon>
                <ListItemIcon>
                  {details.icon}
                </ListItemIcon>
                <ListItemText
                  primary={details.name}
                  secondary={details.description}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={createBackup}
                onChange={(e) => setCreateBackup(e.target.checked)}
              />
            }
            label="Backup vor dem Zurücksetzen erstellen (empfohlen)"
          />

          {result && (
            <Alert 
              severity={result.success ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {result.success ? result.message : result.error}
              {result.backupKey && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Backup erstellt: {result.backupKey}
                </Typography>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleProceedToConfirmation}
            color="warning"
            variant="contained"
            disabled={getSelectedCount() === 0}
          >
            Weiter ({getSelectedCount()} ausgewählt)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bestätigungs Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="error" />
            Zurücksetzen bestätigen
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              ⚠️ WARNUNG: Diese Aktion kann nicht rückgängig gemacht werden!
            </Typography>
            <Typography>
              Sie sind dabei, {getSelectedCount()} Funktionen zurückzusetzen:
            </Typography>
          </Alert>

          <List dense>
            {Object.entries(selectedFunctions)
              .filter(([key, selected]) => selected)
              .map(([key]) => (
                <ListItem key={key}>
                  <ListItemIcon>
                    {functionDetails[key].icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={functionDetails[key].name}
                    secondary={functionDetails[key].description}
                  />
                </ListItem>
              ))
            }
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            Alle Daten dieser Funktionen werden permanent gelöscht.
            {createBackup && ' Ein Backup wird vor dem Löschen erstellt.'}
          </Alert>

          {result && (
            <Alert 
              severity={result.success ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {result.success ? result.message : result.error}
              {result.backupKey && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Backup erstellt: {result.backupKey}
                </Typography>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>
            Zurück
          </Button>
          <Button onClick={handleClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleReset}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
          >
            {loading ? 'Wird zurückgesetzt...' : 'Jetzt zurücksetzen'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GlobalResetButton;