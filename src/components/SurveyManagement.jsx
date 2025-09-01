import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
  Alert,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Poll as PollIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  BarChart as ResultsIcon
} from '@mui/icons-material';

function SurveyManagement() {
  const [surveys, setSurveys] = useState([]);
  const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
  const [openResultsDialog, setOpenResultsDialog] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    type: 'single', // single, multiple, text
    options: ['', ''],
    isActive: true,
    allowAnonymous: false
  });
  const [errors, setErrors] = useState([]);

  // Load surveys from localStorage
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    try {
      const savedSurveys = localStorage.getItem('adminSurveys');
      if (savedSurveys) {
        setSurveys(JSON.parse(savedSurveys));
      } else {
        // Default surveys
        const defaultSurveys = [
          {
            id: 1,
            title: 'Abschlussfeier Location',
            description: 'Wo soll unsere Abschlussfeier stattfinden?',
            type: 'single',
            options: ['Hotel Maritim', 'Stadthalle', 'Schule', 'Restaurant Zur Post'],
            isActive: true,
            allowAnonymous: false,
            createdAt: new Date().toISOString(),
            responses: [
              { option: 'Hotel Maritim', count: 15 },
              { option: 'Stadthalle', count: 8 },
              { option: 'Schule', count: 3 },
              { option: 'Restaurant Zur Post', count: 12 }
            ]
          },
          {
            id: 2,
            title: 'Jahrbuch Design',
            description: 'Welches Design gefällt euch am besten für unser Jahrbuch?',
            type: 'single',
            options: ['Modern & Minimalistisch', 'Klassisch & Elegant', 'Bunt & Kreativ', 'Schwarz-Weiß Vintage'],
            isActive: true,
            allowAnonymous: true,
            createdAt: new Date().toISOString(),
            responses: [
              { option: 'Modern & Minimalistisch', count: 22 },
              { option: 'Klassisch & Elegant', count: 18 },
              { option: 'Bunt & Kreativ', count: 7 },
              { option: 'Schwarz-Weiß Vintage', count: 5 }
            ]
          }
        ];
        setSurveys(defaultSurveys);
        saveSurveys(defaultSurveys);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
      setErrors(['Fehler beim Laden der Umfragen']);
    }
  };

  const saveSurveys = (surveysToSave) => {
    try {
      localStorage.setItem('adminSurveys', JSON.stringify(surveysToSave));
      setSurveys(surveysToSave);
    } catch (error) {
      console.error('Error saving surveys:', error);
      setErrors(['Fehler beim Speichern der Umfragen']);
    }
  };

  const handleAddSurvey = () => {
    setEditingSurvey(null);
    setNewSurvey({
      title: '',
      description: '',
      type: 'single',
      options: ['', ''],
      isActive: true,
      allowAnonymous: false
    });
    setOpenSurveyDialog(true);
  };

  const handleEditSurvey = (survey) => {
    setEditingSurvey(survey);
    setNewSurvey({ ...survey });
    setOpenSurveyDialog(true);
  };

  const handleSaveSurvey = () => {
    const validationErrors = [];
    
    if (!newSurvey.title.trim()) {
      validationErrors.push('Titel ist erforderlich');
    }
    
    if (!newSurvey.description.trim()) {
      validationErrors.push('Beschreibung ist erforderlich');
    }
    
    if (newSurvey.type !== 'text' && newSurvey.options.filter(opt => opt.trim()).length < 2) {
      validationErrors.push('Mindestens 2 Antwortoptionen sind erforderlich');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const surveyToSave = {
      ...newSurvey,
      id: editingSurvey ? editingSurvey.id : Date.now(),
      createdAt: editingSurvey ? editingSurvey.createdAt : new Date().toISOString(),
      options: newSurvey.type === 'text' ? [] : newSurvey.options.filter(opt => opt.trim()),
      responses: editingSurvey ? editingSurvey.responses : []
    };
    
    let updatedSurveys;
    if (editingSurvey) {
      updatedSurveys = surveys.map(survey => 
        survey.id === editingSurvey.id ? surveyToSave : survey
      );
    } else {
      updatedSurveys = [...surveys, surveyToSave];
    }
    
    saveSurveys(updatedSurveys);
    setOpenSurveyDialog(false);
    setErrors([]);
  };

  const handleDeleteSurvey = (surveyId) => {
    const updatedSurveys = surveys.filter(survey => survey.id !== surveyId);
    saveSurveys(updatedSurveys);
  };

  const handleToggleSurveyStatus = (surveyId) => {
    const updatedSurveys = surveys.map(survey => 
      survey.id === surveyId ? { ...survey, isActive: !survey.isActive } : survey
    );
    saveSurveys(updatedSurveys);
  };

  const handleViewResults = (survey) => {
    setSelectedSurvey(survey);
    setOpenResultsDialog(true);
  };

  const addOption = () => {
    setNewSurvey({
      ...newSurvey,
      options: [...newSurvey.options, '']
    });
  };

  const removeOption = (index) => {
    if (newSurvey.options.length > 2) {
      const newOptions = newSurvey.options.filter((_, i) => i !== index);
      setNewSurvey({ ...newSurvey, options: newOptions });
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...newSurvey.options];
    newOptions[index] = value;
    setNewSurvey({ ...newSurvey, options: newOptions });
  };

  const getTotalResponses = (survey) => {
    if (!survey.responses) return 0;
    return survey.responses.reduce((total, response) => total + response.count, 0);
  };

  return (
    <Box>
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Aktuelle Umfragen
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSurvey}
                >
                  Neue Umfrage
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Titel</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Antworten</TableCell>
                      <TableCell>Erstellt</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{survey.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {survey.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={survey.isActive ? 'Aktiv' : 'Inaktiv'} 
                            color={survey.isActive ? 'success' : 'default'}
                            size="small"
                          />
                          {survey.allowAnonymous && (
                            <Chip 
                              label="Anonym" 
                              color="info"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={survey.type === 'single' ? 'Einfachauswahl' : 
                                   survey.type === 'multiple' ? 'Mehrfachauswahl' : 'Text'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getTotalResponses(survey)}</TableCell>
                        <TableCell>
                          {new Date(survey.createdAt).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewResults(survey)}
                            title="Ergebnisse anzeigen"
                          >
                            <ResultsIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditSurvey(survey)}
                            title="Bearbeiten"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleSurveyStatus(survey.id)}
                            title={survey.isActive ? 'Deaktivieren' : 'Aktivieren'}
                          >
                            {survey.isActive ? <ViewIcon /> : <ViewIcon />}
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteSurvey(survey.id)}
                            title="Löschen"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Survey Dialog */}
      <Dialog open={openSurveyDialog} onClose={() => setOpenSurveyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSurvey ? 'Umfrage bearbeiten' : 'Neue Umfrage erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titel"
                value={newSurvey.title}
                onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                multiline
                rows={3}
                value={newSurvey.description}
                onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Umfragetyp</InputLabel>
                <Select
                  value={newSurvey.type}
                  onChange={(e) => setNewSurvey({ ...newSurvey, type: e.target.value })}
                >
                  <MenuItem value="single">Einfachauswahl</MenuItem>
                  <MenuItem value="multiple">Mehrfachauswahl</MenuItem>
                  <MenuItem value="text">Textantwort</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newSurvey.allowAnonymous}
                    onChange={(e) => setNewSurvey({ ...newSurvey, allowAnonymous: e.target.checked })}
                  />
                }
                label="Anonyme Teilnahme erlauben"
              />
            </Grid>
            
            {newSurvey.type !== 'text' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Antwortoptionen
                </Typography>
                {newSurvey.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    {newSurvey.options.length > 2 && (
                      <IconButton onClick={() => removeOption(index)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  sx={{ mt: 1 }}
                >
                  Option hinzufügen
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSurveyDialog(false)} startIcon={<CancelIcon />}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveSurvey} variant="contained" startIcon={<SaveIcon />}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={openResultsDialog} onClose={() => setOpenResultsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Umfrageergebnisse: {selectedSurvey?.title}
        </DialogTitle>
        <DialogContent>
          {selectedSurvey && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {selectedSurvey.description}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Gesamtantworten: {getTotalResponses(selectedSurvey)}
              </Typography>
              
              {selectedSurvey.responses && selectedSurvey.responses.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedSurvey.responses.map((response, index) => {
                    const percentage = getTotalResponses(selectedSurvey) > 0 
                      ? ((response.count / getTotalResponses(selectedSurvey)) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <Grid item xs={12} key={index}>
                        <Paper sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{response.option}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{response.count} Stimmen</Typography>
                              <Chip label={`${percentage}%`} size="small" />
                            </Box>
                          </Box>
                          <Box sx={{ mt: 1, height: 8, backgroundColor: 'grey.200', borderRadius: 1 }}>
                            <Box 
                              sx={{ 
                                height: '100%', 
                                backgroundColor: 'primary.main', 
                                borderRadius: 1,
                                width: `${percentage}%`,
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Alert severity="info">
                  Noch keine Antworten vorhanden.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResultsDialog(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SurveyManagement;