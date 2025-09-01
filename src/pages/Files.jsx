import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
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
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Archive as ArchiveIcon,
  Receipt as ReceiptIcon,
  School as SchoolIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import dataIsolationService from '../services/dataIsolationService';
import DocumentPreview from '../components/DocumentPreview';

function Files() {
  const { currentUser, currentYear } = useAuth();

  // Initialize data isolation service with current year
  useEffect(() => {
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
    }
  }, [currentYear]);

  // Helper function to check if year has existing data
  const hasYearData = () => {
    if (!currentYear) return false;
    const yearKey = `year_${currentYear}`;
    const yearData = localStorage.getItem(yearKey);
    return yearData !== null;
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mock data for files
  const mockFiles = [
    {
      id: 1,
      name: 'Mathematik_Klausur_Q1.pdf',
      type: 'pdf',
      size: '2.4 MB',
      category: 'Abi/Vorabi',
      subcategory: 'Mathematik LK',
      uploadedBy: 'Max Mustermann',
      uploadedAt: new Date('2024-02-15'),
      status: 'approved',
      downloads: 23,
      url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y='
    },
    {
      id: 2,
      name: 'Abschlussfeier_Budget.xlsx',
      type: 'excel',
      size: '156 KB',
      category: 'Komitee',
      subcategory: 'Abschlussfeier',
      uploadedBy: 'Anna Schmidt',
      uploadedAt: new Date('2024-02-10'),
      status: 'approved',
      downloads: 8,
      url: 'data:application/vnd.ms-excel;base64,UEsDBBQAAAAIAAgAAABQSwMEFAAAAAgACAAAAFBLAwQUAAAACAAIAAAAUEsDBBQAAAAIAAgAAABQSwMEFAAAAAgACAAAAA=='
    },
    {
      id: 3,
      name: 'Jahrbuch_Layout_Entwurf.png',
      type: 'image',
      size: '5.2 MB',
      category: 'Projekt',
      subcategory: 'Jahrbuch',
      uploadedBy: 'Lisa Weber',
      uploadedAt: new Date('2024-02-12'),
      status: 'pending',
      downloads: 0,
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDA2NmNjIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkphaHJidWNoIExheW91dCBFbnR3dXJmPC90ZXh0Pgo8L3N2Zz4='
     }
   ];

  const [activeTab, setActiveTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [files, setFiles] = useState(hasYearData() ? mockFiles : []);
  // Mock data for receipts
  const mockReceipts = [
    {
      id: 1,
      name: 'Catering_Rechnung_Abschlussfeier.pdf',
      amount: 1250.00,
      category: 'Veranstaltung',
      project: 'Abschlussfeier',
      uploadedBy: 'Tom Mueller',
      uploadedAt: new Date('2024-02-08'),
      status: 'approved',
      url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y='
    },
    {
      id: 2,
      name: 'Druckkosten_Jahrbuch.pdf',
      amount: 890.50,
      category: 'Material',
      project: 'Jahrbuch',
      uploadedBy: 'Sarah Klein',
      uploadedAt: new Date('2024-02-14'),
      status: 'pending',
      url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y='
     }
   ];

  const [receipts, setReceipts] = useState(hasYearData() ? mockReceipts : []);
  
  // Load files from localStorage when component mounts or year changes
  useEffect(() => {
    const loadFiles = async () => {
      try {
        if (currentYear) {
          const { mockFirestore } = await import('../services/mockFirestore');
          const filesCollection = mockFirestore.collection(`years/${currentYear}/files`);
          const snapshot = await filesCollection.get();
          
          const loadedFiles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // If no files in localStorage, use mock data for demo
          if (loadedFiles.length === 0 && hasYearData()) {
            setFiles(mockFiles);
          } else {
            setFiles(loadedFiles);
          }
          
          console.log('📁 Loaded files from localStorage:', loadedFiles.length);
        } else {
          setFiles([]);
        }
        
        // Handle receipts (keep existing logic for now)
        if (hasYearData()) {
          setReceipts(mockReceipts);
        } else {
          setReceipts([]);
        }
      } catch (error) {
        console.error('❌ Error loading files:', error);
        // Fallback to mock data
        if (hasYearData()) {
          setFiles(mockFiles);
          setReceipts(mockReceipts);
        } else {
          setFiles([]);
          setReceipts([]);
        }
      }
    };
    
    loadFiles();
  }, [currentYear]);
  
  const [newFile, setNewFile] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: ''
  });
  
  // Document preview states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const categories = {
    'Abi/Vorabi': ['Mathematik LK', 'Deutsch LK', 'Englisch', 'Geschichte', 'Biologie', 'Physik', 'Chemie'],
    'Komitee': ['Abschlussfeier', 'Jahrbuch', 'Abschlussfahrt', 'Mottowoche'],
    'Projekt': ['Jahrbuch', 'Zeitkapsel', 'Abschlussfilm', 'Website'],
    'Verwaltung': ['Protokolle', 'Verträge', 'Genehmigungen', 'Sonstiges']
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <PdfIcon sx={{ color: '#f44336' }} />;
      case 'image': return <ImageIcon sx={{ color: '#4caf50' }} />;
      case 'excel': case 'word': return <DocIcon sx={{ color: '#2196f3' }} />;
      default: return <FileIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Freigegeben';
      case 'pending': return 'Ausstehend';
      case 'rejected': return 'Abgelehnt';
      default: return 'Unbekannt';
    }
  };

  const filteredFiles = selectedCategory === 'all' 
    ? files 
    : files.filter(file => file.category === selectedCategory);

  const handleUpload = async () => {
    try {
      // Create file object with all necessary data
      const fileData = {
        ...newFile,
        type: 'pdf',
        size: '1.2 MB',
        uploadedBy: currentUser?.displayName || 'Unbekannt',
        uploadedAt: new Date(),
        status: 'pending',
        downloads: 0,
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKERlbW8gRG9rdW1lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTQKJSVFT0Y=' // Base64-encoded minimal PDF
      };

      // Save to mockFirestore (which uses localStorage)
      const { mockFirestore } = await import('../services/mockFirestore');
      const filesCollection = mockFirestore.collection(`years/${currentYear}/files`);
      const docRef = await filesCollection.add(fileData);
      
      // Add the new file to local state with the generated ID
      const newFileWithId = { ...fileData, id: docRef.id };
      setFiles([...files, newFileWithId]);
      
      setUploadDialogOpen(false);
      setNewFile({ name: '', category: '', subcategory: '', description: '' });
      
      console.log('✅ File uploaded and saved to localStorage:', newFileWithId);
    } catch (error) {
      console.error('❌ Error uploading file:', error);
    }
  };

  const handleApprove = async (fileId) => {
    try {
      const updatedFiles = files.map(file => 
        file.id === fileId ? { ...file, status: 'approved' } : file
      );
      setFiles(updatedFiles);
      
      // Update in localStorage
      const { mockFirestore } = await import('../services/mockFirestore');
      const updatedFile = updatedFiles.find(f => f.id === fileId);
      if (updatedFile) {
        // Save updated file data to localStorage
        const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
        if (storedData.years && storedData.years[currentYear] && storedData.years[currentYear].files) {
          const fileIndex = storedData.years[currentYear].files.findIndex(f => f.id === fileId);
          if (fileIndex !== -1) {
            storedData.years[currentYear].files[fileIndex] = updatedFile;
            localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
          }
        }
      }
      console.log('✅ File approved and saved to localStorage');
    } catch (error) {
      console.error('❌ Error approving file:', error);
    }
  };

  const handleReject = async (fileId) => {
    try {
      const updatedFiles = files.map(file => 
        file.id === fileId ? { ...file, status: 'rejected' } : file
      );
      setFiles(updatedFiles);
      
      // Update in localStorage
      const updatedFile = updatedFiles.find(f => f.id === fileId);
      if (updatedFile) {
        const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
        if (storedData.years && storedData.years[currentYear] && storedData.years[currentYear].files) {
          const fileIndex = storedData.years[currentYear].files.findIndex(f => f.id === fileId);
          if (fileIndex !== -1) {
            storedData.years[currentYear].files[fileIndex] = updatedFile;
            localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
          }
        }
      }
      console.log('✅ File rejected and saved to localStorage');
    } catch (error) {
      console.error('❌ Error rejecting file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      
      // Remove from localStorage
      const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      if (storedData.years && storedData.years[currentYear] && storedData.years[currentYear].files) {
        storedData.years[currentYear].files = storedData.years[currentYear].files.filter(f => f.id !== fileId);
        localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
      }
      console.log('✅ File deleted and removed from localStorage');
    } catch (error) {
      console.error('❌ Error deleting file:', error);
    }
  };

  const tabLabels = ['Dateien', 'Belege', 'Archiv'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          📂 Dateien & Belege
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Datei hochladen
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Paper>

      {/* Files Tab */}
      {activeTab === 0 && (
        <>
          {/* Category Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">Alle Kategorien</MenuItem>
                {Object.keys(categories).map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Files Grid */}
          <Grid container spacing={3}>
            {filteredFiles.map(file => (
              <Grid item xs={12} sm={6} md={4} key={file.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getFileIcon(file.type)}
                      <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                        {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {file.size} • {file.downloads} Downloads
                    </Typography>
                    
                    <Chip 
                      label={file.category}
                      size="small"
                      sx={{ mb: 1, mr: 1 }}
                    />
                    <Chip 
                      label={file.subcategory}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      Von: {file.uploadedBy}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {file.uploadedAt.toLocaleDateString('de-DE')}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={getStatusText(file.status)}
                        color={getStatusColor(file.status)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <IconButton 
                      size="small" 
                      title="Vorschau"
                      onClick={() => {
                        setSelectedDocument(file);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" title="Herunterladen">
                      <DownloadIcon />
                    </IconButton>
                    {(currentUser?.role === 'admin' || file.uploadedBy === currentUser?.displayName) && (
                      <IconButton size="small" title="Löschen" onClick={() => handleDelete(file.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                    {currentUser?.role === 'admin' && file.status === 'pending' && (
                      <>
                        <Button size="small" onClick={() => handleApprove(file.id)}>Freigeben</Button>
                        <Button size="small" color="error" onClick={() => handleReject(file.id)}>Ablehnen</Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Receipts Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Hochgeladene Belege
          </Typography>
          
          <List>
            {receipts.map((receipt, index) => (
              <div key={receipt.id}>
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={receipt.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {receipt.amount.toFixed(2)} € • {receipt.category} • {receipt.project}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Von: {receipt.uploadedBy} • {receipt.uploadedAt.toLocaleDateString('de-DE')}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={getStatusText(receipt.status)}
                        color={getStatusColor(receipt.status)}
                        size="small"
                      />
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedDocument(receipt);
                          setPreviewDialogOpen(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < receipts.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Paper>
      )}

      {/* Archive Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ArchiveIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Archivierte Dateien
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hier werden archivierte Dateien und Belege angezeigt.
          </Typography>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Datei hochladen</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Uploads sind nur in freigegebenen Bereichen möglich. Dateien werden vor der Veröffentlichung geprüft.
          </Alert>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Dateiname"
              value={newFile.name}
              onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={newFile.category}
                onChange={(e) => setNewFile({ ...newFile, category: e.target.value, subcategory: '' })}
              >
                {Object.keys(categories).map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {newFile.category && (
              <FormControl fullWidth>
                <InputLabel>Unterkategorie</InputLabel>
                <Select
                  value={newFile.subcategory}
                  onChange={(e) => setNewFile({ ...newFile, subcategory: e.target.value })}
                >
                  {categories[newFile.category]?.map(subcategory => (
                    <MenuItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <TextField
              label="Beschreibung"
              value={newFile.description}
              onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            
            <Box 
              sx={{ 
                border: 2, 
                borderColor: 'divider', 
                borderStyle: 'dashed', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Datei hier ablegen oder klicken zum Auswählen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unterstützte Formate: PDF, DOC, XLS, PNG, JPG (max. 10MB)
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={!newFile.name || !newFile.category}
          >
            Hochladen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Preview Dialog */}
      <DocumentPreview
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          setSelectedDocument(null);
        }}
        file={selectedDocument}
        fileUrl={selectedDocument?.file ? URL.createObjectURL(selectedDocument.file) : null}
      />
    </Box>
  );
}

export default Files;
