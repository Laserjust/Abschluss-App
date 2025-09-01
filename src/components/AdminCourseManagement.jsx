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
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import dataIsolationService from '../services/dataIsolationService';

const AVAILABLE_SUBJECTS = [
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
];

function AdminCourseManagement() {
  const { currentYear } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Hilfsfunktion zur Überprüfung vorhandener Jahrgangsdaten
  const hasYearData = () => {
    const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
    return mockData.years && mockData.years[currentYear] && Object.keys(mockData.years[currentYear]).length > 0;
  };
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openTeacherDialog, setOpenTeacherDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newCourse, setNewCourse] = useState({
    subject: '',
    type: '',
    teacher: '',
    room: '',
    schedule: '',
    maxStudents: 25
  });
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    subjects: []
  });
  const [errors, setErrors] = useState([]);

  // Load initial data
  useEffect(() => {
    // Initialize data isolation service
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
      dataIsolationService.initializeYearData(currentYear);
    }
    
    loadCourses();
    loadTeachers();
  }, [currentYear]);

  const loadCourses = () => {
    // In a real app, this would fetch from backend
    const savedCourses = localStorage.getItem(`adminCourses_${currentYear}`);
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses([]);
    }
  };

  const loadTeachers = () => {
    // In a real app, this would fetch from backend
    const savedTeachers = localStorage.getItem(`adminTeachers_${currentYear}`);
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers));
    } else {
      // Only show default teachers if year has existing data
      if (hasYearData()) {
        const defaultTeachers = [
          { id: 1, name: 'Herr Schmidt', email: 'schmidt@schule.de', subjects: ['mathematik', 'physik'] },
          { id: 2, name: 'Frau Mueller', email: 'mueller@schule.de', subjects: ['deutsch', 'literatur'] },
          { id: 3, name: 'Herr Weber', email: 'weber@schule.de', subjects: ['sport'] },
          { id: 4, name: 'Frau Klein', email: 'klein@schule.de', subjects: ['englisch', 'spanisch'] },
          { id: 5, name: 'Mrs. Johnson', email: 'johnson@schule.de', subjects: ['englisch'] },
          { id: 6, name: 'Herr Bauer', email: 'bauer@schule.de', subjects: ['geschichte', 'sozialwissenschaften'] },
          { id: 7, name: 'Frau Fischer', email: 'fischer@schule.de', subjects: ['biologie', 'chemie'] }
        ];
        setTeachers(defaultTeachers);
        localStorage.setItem(`adminTeachers_${currentYear}`, JSON.stringify(defaultTeachers));
      } else {
        setTeachers([]);
      }
    }
  };

  const saveCourses = (updatedCourses) => {
    setCourses(updatedCourses);
    localStorage.setItem(`adminCourses_${currentYear}`, JSON.stringify(updatedCourses));
  };

  const saveTeachers = (updatedTeachers) => {
    setTeachers(updatedTeachers);
    localStorage.setItem(`adminTeachers_${currentYear}`, JSON.stringify(updatedTeachers));
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setNewCourse({
      subject: '',
      type: '',
      teacher: '',
      room: '',
      schedule: '',
      maxStudents: 25
    });
    setOpenCourseDialog(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({ ...course });
    setOpenCourseDialog(true);
  };

  const handleSaveCourse = () => {
    const validationErrors = [];
    
    if (!newCourse.subject) validationErrors.push('Fach ist erforderlich');
    if (!newCourse.type) validationErrors.push('Kurstyp ist erforderlich');
    if (!newCourse.teacher) validationErrors.push('Lehrer ist erforderlich');
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const subject = AVAILABLE_SUBJECTS.find(s => s.id === newCourse.subject);
    const teacher = teachers.find(t => t.id === parseInt(newCourse.teacher));
    
    const courseData = {
      ...newCourse,
      id: editingCourse ? editingCourse.id : Date.now(),
      subjectName: subject?.name || '',
      teacherName: teacher?.name || '',
      students: editingCourse ? editingCourse.students || [] : []
    };

    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map(course => 
        course.id === editingCourse.id ? courseData : course
      );
    } else {
      updatedCourses = [...courses, courseData];
    }

    saveCourses(updatedCourses);
    setOpenCourseDialog(false);
    setErrors([]);
  };

  const handleDeleteCourse = (courseId) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    saveCourses(updatedCourses);
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setNewTeacher({
      name: '',
      email: '',
      subjects: []
    });
    setOpenTeacherDialog(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({ ...teacher });
    setOpenTeacherDialog(true);
  };

  const handleSaveTeacher = () => {
    const validationErrors = [];
    
    if (!newTeacher.name) validationErrors.push('Name ist erforderlich');
    if (!newTeacher.email) validationErrors.push('E-Mail ist erforderlich');
    if (newTeacher.subjects.length === 0) validationErrors.push('Mindestens ein Fach muss ausgewählt werden');
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const teacherData = {
      ...newTeacher,
      id: editingTeacher ? editingTeacher.id : Date.now()
    };

    let updatedTeachers;
    if (editingTeacher) {
      updatedTeachers = teachers.map(teacher => 
        teacher.id === editingTeacher.id ? teacherData : teacher
      );
    } else {
      updatedTeachers = [...teachers, teacherData];
    }

    saveTeachers(updatedTeachers);
    setOpenTeacherDialog(false);
    setErrors([]);
  };

  const handleDeleteTeacher = (teacherId) => {
    const updatedTeachers = teachers.filter(teacher => teacher.id !== teacherId);
    saveTeachers(updatedTeachers);
  };

  const getTeachersForSubject = (subjectId) => {
    return teachers.filter(teacher => teacher.subjects.includes(subjectId));
  };

  const getCoursesBySubject = () => {
    const grouped = {};
    AVAILABLE_SUBJECTS.forEach(subject => {
      grouped[subject.id] = {
        subject: subject,
        courses: courses.filter(course => course.subject === subject.id)
      };
    });
    return grouped;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Kursverwaltung
      </Typography>
      
      <Grid container spacing={3} sx={{ marginTop: 4 }}>
        {/* Teachers Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Lehrer verwalten
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddTeacher}
                >
                  Lehrer hinzufügen
                </Button>
              </Box>
              
              <List>
                {teachers.map((teacher) => (
                  <ListItem key={teacher.id} divider>
                    <ListItemText
                      primary={teacher.name}
                      secondary={
                        <Box component="span">
                          <Box component="span" sx={{ display: 'block', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>
                            {teacher.email}
                          </Box>
                          <Box component="span" sx={{ marginTop: '8px', display: 'block' }}>
                            {teacher.subjects.map(subjectId => {
                              const subject = AVAILABLE_SUBJECTS.find(s => s.id === subjectId);
                              return (
                                <Chip
                                  key={subjectId}
                                  label={subject?.name || subjectId}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEditTeacher(teacher)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTeacher(teacher.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Courses Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Kurse verwalten
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCourse}
                >
                  Kurs hinzufügen
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fach</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Lehrer</TableCell>
                      <TableCell>Raum</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.subjectName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={course.type} 
                            size="small"
                            color={course.type.includes('LK') ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{course.teacherName}</TableCell>
                        <TableCell>{course.room}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditCourse(course)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteCourse(course.id)}>
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

      {/* Course Dialog */}
      <Dialog open={openCourseDialog} onClose={() => setOpenCourseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Kurs bearbeiten' : 'Neuen Kurs hinzufügen'}
        </DialogTitle>
        <DialogContent>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <Box component="span" key={index} sx={{ display: 'block' }}>{error}</Box>
              ))}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fach</InputLabel>
                <Select
                  value={newCourse.subject}
                  onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                >
                  {AVAILABLE_SUBJECTS.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kurstyp</InputLabel>
                <Select
                  value={newCourse.type}
                  onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value })}
                >
                  <MenuItem value="LK1">LK1</MenuItem>
                  <MenuItem value="LK2">LK2</MenuItem>
                  <MenuItem value="Abifach 3">Abifach 3</MenuItem>
                  <MenuItem value="Abifach 4">Abifach 4</MenuItem>
                  <MenuItem value="GK">Grundkurs</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lehrer</InputLabel>
                <Select
                  value={newCourse.teacher}
                  onChange={(e) => setNewCourse({ ...newCourse, teacher: e.target.value })}
                >
                  {getTeachersForSubject(newCourse.subject).map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Raum"
                value={newCourse.room}
                onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stundenplan"
                value={newCourse.schedule}
                onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                placeholder="z.B. Mo 1-2, Mi 3-4"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max. Schüler"
                type="number"
                value={newCourse.maxStudents}
                onChange={(e) => setNewCourse({ ...newCourse, maxStudents: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDialog(false)} startIcon={<CancelIcon />}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveCourse} variant="contained" startIcon={<SaveIcon />}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Dialog */}
      <Dialog open={openTeacherDialog} onClose={() => setOpenTeacherDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTeacher ? 'Lehrer bearbeiten' : 'Neuen Lehrer hinzufügen'}
        </DialogTitle>
        <DialogContent>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Fächer</InputLabel>
                <Select
                  multiple
                  value={newTeacher.subjects}
                  onChange={(e) => setNewTeacher({ ...newTeacher, subjects: e.target.value })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const subject = AVAILABLE_SUBJECTS.find(s => s.id === value);
                        return (
                          <Chip key={value} label={subject?.name || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {AVAILABLE_SUBJECTS.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeacherDialog(false)} startIcon={<CancelIcon />}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveTeacher} variant="contained" startIcon={<SaveIcon />}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminCourseManagement;