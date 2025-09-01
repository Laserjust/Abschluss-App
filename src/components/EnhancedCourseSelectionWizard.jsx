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
  Divider,
  Avatar,
  ListItemAvatar
} from '@mui/material';
import {
  School as SchoolIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  'LK1 wählen',
  'LK2 wählen', 
  'Abifächer wählen',
  'Grundkurse wählen',
  'Bestätigung'
];

function EnhancedCourseSelectionWizard({ onComplete, onCancel }) {
  const { currentYear } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState({
    lk1: null,
    lk2: null,
    abifach1: null,
    abifach2: null,
    grundkurse: []
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Load courses and teachers from localStorage
  useEffect(() => {
    if (!currentYear) return;
    
    const savedCourses = localStorage.getItem(`adminCourses_${currentYear}`);
    const savedTeachers = localStorage.getItem(`adminTeachers_${currentYear}`);
    
    if (savedCourses) {
      setAvailableCourses(JSON.parse(savedCourses));
    }
    
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers));
    }
  }, [currentYear]);

  const getCoursesForStep = (step) => {
    const selectedCourseIds = [
      selectedCourses.lk1?.id,
      selectedCourses.lk2?.id,
      selectedCourses.abifach1?.id,
      selectedCourses.abifach2?.id,
      ...selectedCourses.grundkurse.map(course => course.id)
    ].filter(Boolean);

    switch (step) {
      case 0: // LK1
        return availableCourses.filter(course => 
          course.type === 'LK1' && !selectedCourseIds.includes(course.id)
        );
      case 1: // LK2
        return availableCourses.filter(course => 
          course.type === 'LK2' && !selectedCourseIds.includes(course.id)
        );
      case 2: // Abifächer
        return availableCourses.filter(course => 
          (course.type === 'Abifach 3' || course.type === 'Abifach 4') && 
          !selectedCourseIds.includes(course.id)
        );
      case 3: // Grundkurse
        return availableCourses.filter(course => 
          course.type === 'GK' && !selectedCourseIds.includes(course.id)
        );
      default:
        return [];
    }
  };

  const handleCourseSelect = (course, courseType) => {
    setSelectedCourses(prev => ({
      ...prev,
      [courseType]: course
    }));
  };

  const handleGrundkursToggle = (course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.grundkurse.some(gk => gk.id === course.id);
      if (isSelected) {
        return {
          ...prev,
          grundkurse: prev.grundkurse.filter(gk => gk.id !== course.id)
        };
      } else {
        return {
          ...prev,
          grundkurse: [...prev.grundkurse, course]
        };
      }
    });
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      setConfirmDialogOpen(true);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleConfirm = () => {
    onComplete(selectedCourses);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return selectedCourses.lk1 !== null;
      case 1:
        return selectedCourses.lk2 !== null;
      case 2:
        return selectedCourses.abifach1 !== null && selectedCourses.abifach2 !== null;
      case 3:
        return true; // Grundkurse sind optional
      default:
        return true;
    }
  };

  const renderCourseCard = (course, isSelected, onClick) => {
    const teacher = teachers.find(t => t.id === parseInt(course.teacher));
    
    return (
      <Grid item xs={12} sm={6} md={4} key={course.id}>
        <Card 
          sx={{ 
            cursor: 'pointer',
            border: isSelected ? '2px solid' : '1px solid',
            borderColor: isSelected ? 'primary.main' : 'divider',
            '&:hover': { boxShadow: 3 }
          }}
          onClick={onClick}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6">{course.subjectName}</Typography>
                <Chip 
                  label={course.type} 
                  size="small" 
                  color={course.type.includes('LK') ? 'primary' : 'default'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              {isSelected && (
                <CheckCircleIcon sx={{ color: 'success.main' }} />
              )}
            </Box>
            
            {teacher && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                  <PersonIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {teacher.name}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Raum: {course.room}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {course.schedule}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderStepContent = (step) => {
    const courses = getCoursesForStep(step);
    
    switch (step) {
      case 0: // LK1 Auswahl
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihren ersten Leistungskurs (LK1)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Verfügbare LK1-Kurse mit Lehrern
            </Typography>
            {courses.length === 0 ? (
              <Alert severity="warning">
                Keine LK1-Kurse verfügbar. Bitte wenden Sie sich an die Administration.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {courses.map(course => 
                  renderCourseCard(
                    course,
                    selectedCourses.lk1?.id === course.id,
                    () => handleCourseSelect(course, 'lk1')
                  )
                )}
              </Grid>
            )}
          </Box>
        );

      case 1: // LK2 Auswahl
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihren zweiten Leistungskurs (LK2)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Verfügbare LK2-Kurse mit Lehrern
            </Typography>
            {courses.length === 0 ? (
              <Alert severity="warning">
                Keine LK2-Kurse verfügbar. Bitte wenden Sie sich an die Administration.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {courses.map(course => 
                  renderCourseCard(
                    course,
                    selectedCourses.lk2?.id === course.id,
                    () => handleCourseSelect(course, 'lk2')
                  )
                )}
              </Grid>
            )}
          </Box>
        );

      case 2: // Abifächer Auswahl
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihre Abifächer (3. und 4. Abiturfach)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Wählen Sie zwei verschiedene Fächer für Ihr 3. und 4. Abiturfach
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              3. Abiturfach:
            </Typography>
            {courses.filter(course => course.type === 'Abifach 3').length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Keine Kurse für das 3. Abiturfach verfügbar.
              </Alert>
            ) : (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {courses.filter(course => course.type === 'Abifach 3').map(course => 
                  renderCourseCard(
                    course,
                    selectedCourses.abifach1?.id === course.id,
                    () => handleCourseSelect(course, 'abifach1')
                  )
                )}
              </Grid>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              4. Abiturfach:
            </Typography>
            {courses.filter(course => course.type === 'Abifach 4').length === 0 ? (
              <Alert severity="warning">
                Keine Kurse für das 4. Abiturfach verfügbar.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {courses.filter(course => course.type === 'Abifach 4').map(course => 
                  renderCourseCard(
                    course,
                    selectedCourses.abifach2?.id === course.id,
                    () => handleCourseSelect(course, 'abifach2')
                  )
                )}
              </Grid>
            )}
          </Box>
        );

      case 3: // Grundkurse Auswahl
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Wählen Sie Ihre Grundkurse (optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sie können beliebig viele Grundkurse wählen oder auch keine.
            </Typography>
            {courses.length === 0 ? (
              <Alert severity="info">
                Keine Grundkurse verfügbar.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {courses.map(course => {
                  const isSelected = selectedCourses.grundkurse.some(gk => gk.id === course.id);
                  return renderCourseCard(
                    course,
                    isSelected,
                    () => handleGrundkursToggle(course)
                  );
                })}
              </Grid>
            )}
          </Box>
        );

      case 4: // Bestätigung
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Bestätigen Sie Ihre Kursauswahl
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Überprüfen Sie Ihre Auswahl bevor Sie fortfahren.
            </Typography>
            
            <Grid container spacing={3}>
              {selectedCourses.lk1 && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        1. Leistungskurs
                      </Typography>
                      <Typography variant="h6">{selectedCourses.lk1.subjectName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourses.lk1.teacherName} • {selectedCourses.lk1.room}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {selectedCourses.lk2 && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        2. Leistungskurs
                      </Typography>
                      <Typography variant="h6">{selectedCourses.lk2.subjectName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourses.lk2.teacherName} • {selectedCourses.lk2.room}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {selectedCourses.abifach1 && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="secondary" gutterBottom>
                        3. Abiturfach
                      </Typography>
                      <Typography variant="h6">{selectedCourses.abifach1.subjectName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourses.abifach1.teacherName} • {selectedCourses.abifach1.room}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {selectedCourses.abifach2 && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="secondary" gutterBottom>
                        4. Abiturfach
                      </Typography>
                      <Typography variant="h6">{selectedCourses.abifach2.subjectName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourses.abifach2.teacherName} • {selectedCourses.abifach2.room}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {selectedCourses.grundkurse.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Grundkurse ({selectedCourses.grundkurse.length})
                      </Typography>
                      <Grid container spacing={1}>
                        {selectedCourses.grundkurse.map(course => (
                          <Grid item key={course.id}>
                            <Chip 
                              label={`${course.subjectName} (${course.teacherName})`}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Kursauswahl-Assistent
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 400 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
        >
          Abbrechen
        </Button>
        
        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Zurück
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid(activeStep)}
          >
            {activeStep === STEPS.length - 1 ? 'Bestätigen' : 'Weiter'}
          </Button>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Kursauswahl bestätigen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie diese Kursauswahl übernehmen möchten? 
            Diese Entscheidung kann später geändert werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleConfirm} variant="contained">Bestätigen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EnhancedCourseSelectionWizard;