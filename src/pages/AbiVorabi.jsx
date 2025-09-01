import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Grade as GradeIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import yearManagementService from '../services/yearManagementService';
import DocumentPreview from '../components/DocumentPreview';

function AbiVorabi() {
  const muiTheme = useTheme();
  const { currentUser } = useAuth();
  const currentYear = yearManagementService.getCurrentYear();
  
  // State variables
  const [selectedCourse, setSelectedCourse] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [materialCategory, setMaterialCategory] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [showCourseOverview, setShowCourseOverview] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [hasSelectedCourses, setHasSelectedCourses] = useState(false);
  const [userCourseSelection, setUserCourseSelection] = useState(null);
  const [editingRoom, setEditingRoom] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [tempRoom, setTempRoom] = useState('');
  const [tempSchedule, setTempSchedule] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Create ref for file input
  const fileInputRef = useRef(null);

  // Mock data for courses
  const mockCourses = [
    {
      id: 'lk1',
      name: 'Mathematik LK',
      type: 'LK1',
      teacher: 'Herr Schmidt',
      room: 'A201',
      schedule: 'Mo 1-2, Mi 3-4, Fr 5-6',
      nextExam: {
        title: 'Klausur Analysis',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        duration: '4 Stunden',
        topics: ['Integralrechnung', 'Kurvendiskussion', 'Extremwertaufgaben']
      },
      materials: [],
      assignments: [],
      examInfos: []
    }
  ];

  // Load courses on component mount
  useEffect(() => {
    const loadCourses = () => {
      try {
        const userSelection = JSON.parse(localStorage.getItem(`userCourseSelection_${currentYear}`) || '{}');
        
        if (Object.keys(userSelection).length > 0) {
          const selectedCourses = Object.values(userSelection).filter(course => course && course.id);
          
          if (selectedCourses.length > 0) {
            setCourses(selectedCourses);
            setHasSelectedCourses(true);
            setUserCourseSelection(userSelection);
          } else {
            setCourses(mockCourses);
            setHasSelectedCourses(false);
          }
        } else {
          setCourses(mockCourses);
          setHasSelectedCourses(false);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses(mockCourses);
        setHasSelectedCourses(false);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [currentYear]);

  const currentCourse = courses[selectedCourse];

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadDescription || !currentCourse) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }
    
    if (uploadType !== 'exam-info' && !uploadTitle) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }

    try {
      const documentId = Date.now().toString();
      const document = {
        id: documentId,
        name: selectedFile.name,
        title: uploadTitle || uploadDescription,
        description: uploadDescription,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadedBy: currentUser?.name || currentUser?.displayName || 'Aktueller Benutzer',
        uploadDate: new Date().toLocaleDateString('de-DE'),
        uploadedAt: new Date(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        category: materialCategory || 'other',
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKERlbW8gRG9rdW1lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTQKJSVFT0Y='
      };

      // Update course data based on upload type
      const updatedCourses = courses.map((course, index) => {
        if (index === selectedCourse) {
          if (uploadType === 'material') {
            return {
              ...course,
              materials: [...course.materials, {
                ...document,
                type: selectedFile.name.split('.').pop().toLowerCase()
              }]
            };
          } else if (uploadType === 'assignment') {
            return {
              ...course,
              assignments: [...course.assignments, {
                ...document,
                dueDate: assignmentDueDate ? new Date(assignmentDueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                completed: false
              }]
            };
          } else if (uploadType === 'exam-info') {
            return {
              ...course,
              examInfos: [...(course.examInfos || []), document]
            };
          }
        }
        return course;
      });

      setCourses(updatedCourses);

      // Save to localStorage
      const userSelection = JSON.parse(localStorage.getItem(`userCourseSelection_${currentYear}`) || '{}');
      const courseKey = Object.keys(userSelection).find(key => 
        userSelection[key] && userSelection[key].id === currentCourse.id
      );
      
      if (courseKey && userSelection[courseKey]) {
        if (uploadType === 'material') {
          userSelection[courseKey].materials = updatedCourses[selectedCourse].materials;
        } else if (uploadType === 'assignment') {
          userSelection[courseKey].assignments = updatedCourses[selectedCourse].assignments;
        } else if (uploadType === 'exam-info') {
          userSelection[courseKey].examInfos = updatedCourses[selectedCourse].examInfos || [];
        }
        localStorage.setItem(`userCourseSelection_${currentYear}`, JSON.stringify(userSelection));
      }

      // Show success message
      alert(`${uploadType === 'material' ? 'Material' : uploadType === 'assignment' ? 'Aufgabe' : 'Prüfungsinfo'} erfolgreich hochgeladen!`);
      
      // Reset form
      setUploadDialog(false);
      setSelectedFile(null);
      setUploadDescription('');
      setUploadTitle('');
      setMaterialCategory('');
      setAssignmentDueDate('');
      setUploadType('');
      
      console.log('✅ Dokument hochgeladen und gespeichert:', document);
    } catch (error) {
      console.error('❌ Fehler beim Hochladen:', error);
      alert('Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Lade Kurse...</Typography>
      </Box>
    );
  }

  if (!hasSelectedCourses || courses.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Keine Kurse ausgewählt
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Bitte wählen Sie zunächst Ihre Kurse aus, um auf Abi-Vorabi-Funktionen zugreifen zu können.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/dashboard'}
          startIcon={<ArrowBackIcon />}
        >
          Zurück zum Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon sx={{ fontSize: 32 }} />
        Abi-Vorabi
      </Typography>

      {/* Course Selection Tabs */}
      <Tabs
        value={selectedCourse}
        onChange={(e, newValue) => setSelectedCourse(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {courses.map((course, index) => (
          <Tab
            key={course.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={course.type}
                  size="small"
                  color={course.type.includes('LK') ? 'primary' : 'secondary'}
                  sx={{ fontSize: '0.7rem' }}
                />
                {course.name}
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* Current Course Content */}
      {currentCourse && (
        <Grid container spacing={3}>
          {/* Course Info Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {currentCourse.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {currentCourse.teacher}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  📍 Raum: {currentCourse.room}
                </Typography>
                <Typography variant="body2">
                  📅 {currentCourse.schedule}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => setUploadDialog(true)}
                  startIcon={<UploadIcon />}
                >
                  Upload
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Materials */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📚 Materialien ({currentCourse.materials?.length || 0})
                </Typography>
                {currentCourse.materials && currentCourse.materials.length > 0 ? (
                  <List>
                    {currentCourse.materials.map((material) => (
                      <ListItem key={material.id}>
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={material.title || material.name}
                          secondary={`Hochgeladen: ${material.uploadDate || 'Unbekannt'}`}
                        />
                        <IconButton
                          onClick={() => {
                            setSelectedDocument(material);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                      Noch keine Materialien hochgeladen.
                    </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => {
          setUploadDialog(false);
          setSelectedFile(null);
          setUploadDescription('');
          setUploadTitle('');
          setMaterialCategory('');
          setAssignmentDueDate('');
          setUploadType('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dokument hochladen</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Upload Type Selection */}
            <FormControl fullWidth>
              <InputLabel>Upload-Typ</InputLabel>
              <Select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                label="Upload-Typ"
              >
                <MenuItem value="material">📚 Lernmaterial</MenuItem>
                <MenuItem value="assignment">📝 Aufgabe</MenuItem>
                <MenuItem value="exam-info">📋 Prüfungsinfo</MenuItem>
              </Select>
            </FormControl>

            {/* Title Field */}
            {uploadType !== 'exam-info' && (
              <TextField
                label="Titel"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                fullWidth
                required
              />
            )}

            {/* Description Field */}
            <TextField
              label="Beschreibung"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            {/* File Upload Area */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
              />
              
              {/* Visible File Input as Alternative */}
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                style={{ marginBottom: '16px' }}
              />
              
              {/* Upload Button */}
              <Button
                variant="contained"
                onClick={() => {
                  console.log('Upload button clicked, fileInputRef:', fileInputRef.current);
                  fileInputRef.current?.click();
                }}
                startIcon={<CloudUploadIcon />}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Datei hochladen
              </Button>
              
              {/* Upload Drop Zone */}
              <Box
                onClick={() => {
                  console.log('Upload zone clicked, fileInputRef:', fileInputRef.current);
                  fileInputRef.current?.click();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.dark' : 'primary.main',
                  borderRadius: 2,
                  bgcolor: dragOver ? 'action.hover' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  transform: dragOver ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'primary.dark',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <CloudUploadIcon sx={{ 
                  fontSize: 48, 
                  color: dragOver ? 'primary.dark' : 'primary.main', 
                  mb: 1,
                  transition: 'color 0.3s ease'
                }} />
                <Typography variant="body1" gutterBottom sx={{ 
                  fontWeight: 500,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  Datei hier ablegen oder klicken zum Auswählen
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  Unterstützte Formate: PDF, DOC, XLS, PNG, JPG (max. 10MB)
                </Typography>
              </Box>
              {selectedFile && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: muiTheme.palette.mode === 'dark' ? '#2c2c2e' : 'background.paper', 
                  borderRadius: 1, 
                  border: 1, 
                  borderColor: 'divider' 
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Ausgewählte Datei:</Typography>
                  <Typography variant="body2">{selectedFile.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Größe: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary">
                Unterstützte Formate: PDF, DOC, DOCX, TXT, JPG, PNG, XLSX, XLS (Max. 10 MB)
              </Typography>
            </Box>
            
            {/* Category Selection for Materials */}
            {uploadType === 'material' && (
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={materialCategory || ''}
                  onChange={(e) => setMaterialCategory(e.target.value)}
                  label="Kategorie"
                >
                  <MenuItem value="notes">📝 Notizen</MenuItem>
                  <MenuItem value="summary">📋 Zusammenfassung</MenuItem>
                  <MenuItem value="exercise">💪 Übungen</MenuItem>
                  <MenuItem value="reference">📚 Nachschlagewerk</MenuItem>
                  <MenuItem value="other">📄 Sonstiges</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {/* Due Date for Assignments */}
            {uploadType === 'assignment' && (
              <TextField
                label="Abgabetermin"
                type="datetime-local"
                value={assignmentDueDate || ''}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUploadDialog(false);
              setSelectedFile(null);
              setUploadDescription('');
              setUploadTitle('');
              setMaterialCategory('');
              setAssignmentDueDate('');
              setUploadType('');
            }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || !uploadDescription || !uploadType}
          >
            Hochladen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Preview Dialog */}
      <DocumentPreview
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        file={selectedDocument}
        fileUrl={selectedDocument?.url}
      />
    </Box>
  );
}

export default AbiVorabi;
