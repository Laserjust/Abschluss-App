import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Vollständige Fächerdatenbank
const AVAILABLE_SUBJECTS = {
  // Hauptfächer (für LK geeignet)
  main: [
    { id: 'deutsch', name: 'Deutsch', category: 'Sprachen' },
    { id: 'mathematik', name: 'Mathematik', category: 'MINT' },
    { id: 'englisch', name: 'Englisch', category: 'Sprachen' },
    { id: 'geschichte', name: 'Geschichte', category: 'Gesellschaftswissenschaften' },
    { id: 'sport', name: 'Sport', category: 'Sport' },
    { id: 'biologie', name: 'Biologie', category: 'MINT' },
    { id: 'paedagogik', name: 'Pädagogik', category: 'Gesellschaftswissenschaften' }
  ],
  // Alle weiteren Fächer
  all: [
    { id: 'deutsch', name: 'Deutsch', category: 'Sprachen' },
    { id: 'englisch', name: 'Englisch', category: 'Sprachen' },
    { id: 'spanisch', name: 'Spanisch', category: 'Sprachen' },
    { id: 'literatur', name: 'Literatur', category: 'Sprachen' },
    { id: 'mathematik', name: 'Mathematik', category: 'MINT' },
    { id: 'physik', name: 'Physik', category: 'MINT' },
    { id: 'chemie', name: 'Chemie', category: 'MINT' },
    { id: 'biologie', name: 'Biologie', category: 'MINT' },
    { id: 'geschichte', name: 'Geschichte', category: 'Gesellschaftswissenschaften' },
    { id: 'sozialwissenschaften', name: 'Sozialwissenschaften', category: 'Gesellschaftswissenschaften' },
    { id: 'paedagogik', name: 'Pädagogik', category: 'Gesellschaftswissenschaften' },
    { id: 'philosophie', name: 'Philosophie', category: 'Gesellschaftswissenschaften' },
    { id: 'kunst', name: 'Kunst', category: 'Künstlerisch' },
    { id: 'sport', name: 'Sport', category: 'Sport' },
    { id: 'religion_ev', name: 'Religion (ev.)', category: 'Religion/Ethik' },
    { id: 'religion_kath', name: 'Religion (kath.)', category: 'Religion/Ethik' }
  ]
};

const STEPS = [
  'LK1 wählen',
  'LK2 wählen', 
  'Abifächer wählen',
  'Grundkurse wählen',
  'Bestätigung'
];

function CourseSelectionWizard({ onComplete, onCancel }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState({
    lk1: null,
    lk2: null,
    abifach1: null,
    abifach2: null,
    grundkurse: []
  });
  const [errors, setErrors] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Verfügbare Fächer für aktuellen Schritt berechnen
  const getAvailableSubjects = (step) => {
    const selectedIds = [
      selectedCourses.lk1?.id,
      selectedCourses.lk2?.id,
      selectedCourses.abifach1?.id,
      selectedCourses.abifach2?.id,
      ...selectedCourses.grundkurse.map(course => course.id)
    ].filter(Boolean);

    switch (step) {
      case 0: // LK1
        return AVAILABLE_SUBJECTS.main.filter(subject => 
          ['deutsch', 'mathematik', 'englisch'].includes(subject.id)
        );
      case 1: // LK2
        return AVAILABLE_SUBJECTS.main.filter(subject => 
          ['geschichte', 'sport', 'biologie', 'paedagogik'].includes(subject.id) &&
          !selectedIds.includes(subject.id)
        );
      case 2: // Abifächer
        return AVAILABLE_SUBJECTS.all.filter(subject => 
          !selectedIds.includes(subject.id)
        );
      case 3: // Grundkurse
        return AVAILABLE_SUBJECTS.all.filter(subject => 
          !selectedIds.includes(subject.id)
        );
      default:
        return [];
    }
  };

  const handleSubjectSelect = (subject, type, index = null) => {
    setSelectedCourses(prev => {
      const newSelection = { ...prev };
      
      if (type === 'grundkurse') {
        if (prev.grundkurse.find(course => course.id === subject.id)) {
          // Entfernen wenn bereits ausgewählt
          newSelection.grundkurse = prev.grundkurse.filter(course => course.id !== subject.id);
        } else {
          // Hinzufügen
          newSelection.grundkurse = [...prev.grundkurse, subject];
        }
      } else {
        newSelection[type] = subject;
      }
      
      return newSelection;
    });
    setErrors([]);
  };

  const validateStep = (step) => {
    const newErrors = [];
    
    switch (step) {
      case 0:
        if (!selectedCourses.lk1) {
          newErrors.push('Bitte wählen Sie Ihren ersten Leistungskurs.');
        }
        break;
      case 1:
        if (!selectedCourses.lk2) {
          newErrors.push('Bitte wählen Sie Ihren zweiten Leistungskurs.');
        }
        break;
      case 2:
        if (!selectedCourses.abifach1 || !selectedCourses.abifach2) {
          newErrors.push('Bitte wählen Sie beide Abifächer.');
        }
        if (selectedCourses.abifach1?.id === selectedCourses.abifach2?.id) {
          newErrors.push('Die beiden Abifächer müssen unterschiedlich sein.');
        }
        break;
      case 3:
        // Keine Mindestanzahl für Grundkurse erforderlich
        break;
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === STEPS.length - 2) {
        setShowConfirmDialog(true);
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setErrors([]);
  };

  const handleComplete = () => {
    const courseSelection = {
      lk1: selectedCourses.lk1,
      lk2: selectedCourses.lk2,
      abifach1: selectedCourses.abifach1,
      abifach2: selectedCourses.abifach2,
      grundkurse: selectedCourses.grundkurse
    };
    onComplete(courseSelection);
  };

  const renderStepContent = (step) => {
    const availableSubjects = getAvailableSubjects(step);
    
    switch (step) {
      case 0: // LK1 Auswahl
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihren ersten Leistungskurs (LK1)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Zur Auswahl stehen: Deutsch, Mathematik, Englisch
            </Typography>
            <Grid container spacing={2}>
              {availableSubjects.map(subject => (
                <Grid item xs={12} sm={6} md={4} key={subject.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedCourses.lk1?.id === subject.id ? '2px solid' : '1px solid',
                      borderColor: selectedCourses.lk1?.id === subject.id ? 'primary.main' : 'divider',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleSubjectSelect(subject, 'lk1')}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6">{subject.name}</Typography>
                      <Chip label={subject.category} size="small" sx={{ mt: 1 }} />
                      {selectedCourses.lk1?.id === subject.id && (
                        <CheckCircleIcon sx={{ color: 'success.main', mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1: // LK2 Auswahl
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihren zweiten Leistungskurs (LK2)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Zur Auswahl stehen: Geschichte, Sport, Biologie, Pädagogik
            </Typography>
            <Grid container spacing={2}>
              {availableSubjects.map(subject => (
                <Grid item xs={12} sm={6} md={4} key={subject.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedCourses.lk2?.id === subject.id ? '2px solid' : '1px solid',
                      borderColor: selectedCourses.lk2?.id === subject.id ? 'primary.main' : 'divider',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleSubjectSelect(subject, 'lk2')}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6">{subject.name}</Typography>
                      <Chip label={subject.category} size="small" sx={{ mt: 1 }} />
                      {selectedCourses.lk2?.id === subject.id && (
                        <CheckCircleIcon sx={{ color: 'success.main', mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2: // Abifächer
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihre beiden Abifächer (3. und 4. Abiturfach)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Diese können aus allen verfügbaren Fächern gewählt werden (außer bereits gewählten).
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>3. Abiturfach</InputLabel>
                  <Select
                    value={selectedCourses.abifach1?.id || ''}
                    onChange={(e) => {
                      const subject = availableSubjects.find(s => s.id === e.target.value);
                      handleSubjectSelect(subject, 'abifach1');
                    }}
                    label="3. Abiturfach"
                  >
                    {availableSubjects.map(subject => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.category})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>4. Abiturfach</InputLabel>
                  <Select
                    value={selectedCourses.abifach2?.id || ''}
                    onChange={(e) => {
                      const subject = availableSubjects.find(s => s.id === e.target.value);
                      handleSubjectSelect(subject, 'abifach2');
                    }}
                    label="4. Abiturfach"
                  >
                    {availableSubjects
                      .filter(subject => subject.id !== selectedCourses.abifach1?.id)
                      .map(subject => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.category})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Grundkurse
        const groupedSubjects = availableSubjects.reduce((acc, subject) => {
          if (!acc[subject.category]) acc[subject.category] = [];
          acc[subject.category].push(subject);
          return acc;
        }, {});

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihre Grundkurse
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mindestens 6 Grundkurse erforderlich. Gewählt: {selectedCourses.grundkurse.length}
            </Typography>
            
            {Object.entries(groupedSubjects).map(([category, subjects]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {category}
                </Typography>
                <Grid container spacing={1}>
                  {subjects.map(subject => {
                    const isSelected = selectedCourses.grundkurse.find(course => course.id === subject.id);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={subject.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: isSelected ? '2px solid' : '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            '&:hover': { boxShadow: 2 }
                          }}
                          onClick={() => handleSubjectSelect(subject, 'grundkurse')}
                        >
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2">{subject.name}</Typography>
                              {isSelected && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Box>
        );

      case 4: // Bestätigung
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Bestätigen Sie Ihre Kurswahl
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Überprüfen Sie Ihre Auswahl vor der finalen Bestätigung.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Leistungskurse
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StarIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography><strong>LK1:</strong> {selectedCourses.lk1?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography><strong>LK2:</strong> {selectedCourses.lk2?.name}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Abifächer
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>3. Abifach:</strong> {selectedCourses.abifach1?.name}
                    </Typography>
                    <Typography>
                      <strong>4. Abifach:</strong> {selectedCourses.abifach2?.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Grundkurse ({selectedCourses.grundkurse.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCourses.grundkurse.map(course => (
                        <Chip key={course.id} label={course.name} variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Kurswahl für die Oberstufe
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">{error}</Typography>
          ))}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Zurück
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onCancel} variant="outlined">
            Abbrechen
          </Button>
          <Button
            onClick={handleNext}
            variant="contained"
          >
            {activeStep === STEPS.length - 1 ? 'Abschließen' : 'Weiter'}
          </Button>
        </Box>
      </Box>

      {/* Bestätigungsdialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Kurswahl bestätigen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Sind Sie sicher, dass Sie diese Kurswahl bestätigen möchten? Diese Auswahl kann später nur schwer geändert werden.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Ihre Auswahl:</strong><br/>
              LK1: {selectedCourses.lk1?.name}<br/>
              LK2: {selectedCourses.lk2?.name}<br/>
              Abifächer: {selectedCourses.abifach1?.name}, {selectedCourses.abifach2?.name}<br/>
              Grundkurse: {selectedCourses.grundkurse.length} Fächer
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Zurück zur Auswahl</Button>
          <Button onClick={handleComplete} variant="contained" color="primary">
            Ja, bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CourseSelectionWizard;