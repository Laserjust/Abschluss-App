import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Fab
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Euro as EuroIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Reply as ReplyIcon,
  Report as ReportIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import dataIsolationService from '../services/dataIsolationService';
import DocumentPreview from '../components/DocumentPreview';
import { 
  getFirestore as getFirebaseFirestore, 
  collection as firebaseCollection, 
  query as firebaseQuery, 
  orderBy as firebaseOrderBy, 
  getDocs as firebaseGetDocs, 
  addDoc as firebaseAddDoc, 
  doc as firebaseDoc, 
  updateDoc as firebaseUpdateDoc, 
  deleteDoc as firebaseDeleteDoc,
  serverTimestamp as firebaseServerTimestamp 
} from 'firebase/firestore';
import { 
  isDemoMode, 
  getFirestore as getMockFirestore, 
  collection as mockCollection, 
  query as mockQuery, 
  orderBy as mockOrderBy, 
  getDocs as mockGetDocs, 
  addDoc as mockAddDoc, 
  doc as mockDoc, 
  updateDoc as mockUpdateDoc, 
  deleteDoc as mockDeleteDoc,
  serverTimestamp as mockServerTimestamp 
} from '../services/mockFirestore';

// Use mock or real Firestore based on demo mode
const getFirestore = isDemoMode() ? getMockFirestore : getFirebaseFirestore;
const collection = isDemoMode() ? mockCollection : firebaseCollection;
const query = isDemoMode() ? mockQuery : firebaseQuery;
const orderBy = isDemoMode() ? mockOrderBy : firebaseOrderBy;
const getDocs = isDemoMode() ? mockGetDocs : firebaseGetDocs;
const addDoc = isDemoMode() ? mockAddDoc : firebaseAddDoc;
const doc = isDemoMode() ? mockDoc : firebaseDoc;
const updateDoc = isDemoMode() ? mockUpdateDoc : firebaseUpdateDoc;
const deleteDoc = isDemoMode() ? mockDeleteDoc : firebaseDeleteDoc;
const serverTimestamp = isDemoMode() ? mockServerTimestamp : firebaseServerTimestamp;

const Actions = () => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const darkMode = theme === 'dark';
  const { currentUser: user, currentYear } = useAuth();
  const db = getFirestore();

  // Initialize data isolation service with current year
  React.useEffect(() => {
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
      dataIsolationService.initializeYearData(currentYear);
    }
  }, [currentYear]);

  // Helper function to check if year has existing data
  const hasYearData = () => {
    try {
      const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      const yearData = mockData.years && mockData.years[currentYear];
      return yearData && Object.keys(yearData).length > 0 && 
             Object.values(yearData).some(collection => Array.isArray(collection) && collection.length > 0);
    } catch {
      return false;
    }
  };

  // Funktion zur automatischen Status-Berechnung basierend auf dem Datum
  const calculateActionStatus = (actionDate) => {
    const today = new Date();
    const actionDateObj = new Date(actionDate);
    
    // Setze Zeit auf Mitternacht für genauen Vergleich
    today.setHours(0, 0, 0, 0);
    actionDateObj.setHours(0, 0, 0, 0);
    
    if (actionDateObj > today) {
      return 'geplant';
    } else if (actionDateObj < today) {
      return 'abgeschlossen';
    } else {
      return 'laufend';
    }
  };
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAction, setEditAction] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedActionForJoin, setSelectedActionForJoin] = useState(null);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '' });
  const [newExpenseDialogOpen, setNewExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    actionDate: '',
    budget: '',
    status: 'geplant'
  });
  const [newComment, setNewComment] = useState('');
  const [replyToComment, setReplyToComment] = useState(null);
  // Load persistent comment states from localStorage
  const loadCommentStates = () => {
    try {
      const reportedData = localStorage.getItem(`reportedComments_${currentYear}`);
      const deletedData = localStorage.getItem(`deletedComments_${currentYear}`);
      
      const reported = reportedData ? new Set(JSON.parse(reportedData)) : new Set();
      const deleted = deletedData ? new Set(JSON.parse(deletedData)) : new Set();
      
      return { reported, deleted };
    } catch (error) {
      console.error('Error loading comment states:', error);
      return { reported: new Set(), deleted: new Set() };
    }
  };
  
  const { reported: initialReported, deleted: initialDeleted } = loadCommentStates();
  const [reportedComments, setReportedComments] = useState(initialReported);
  const [deletedComments, setDeletedComments] = useState(initialDeleted);
  
  // Save comment states to localStorage whenever they change
  React.useEffect(() => {
    if (currentYear) {
      localStorage.setItem(`reportedComments_${currentYear}`, JSON.stringify([...reportedComments]));
    }
  }, [reportedComments, currentYear]);
  
  React.useEffect(() => {
    if (currentYear) {
      localStorage.setItem(`deletedComments_${currentYear}`, JSON.stringify([...deletedComments]));
    }
  }, [deletedComments, currentYear]);
  
  // Reload comment states when year changes
  React.useEffect(() => {
    if (currentYear) {
      const { reported, deleted } = loadCommentStates();
      setReportedComments(reported);
      setDeletedComments(deleted);
    }
  }, [currentYear]);

  // Function to fetch reported comments from localStorage (similar to Chat.jsx)
  const fetchReportedComments = () => {
    try {
      const reports = JSON.parse(localStorage.getItem('commentReports') || '[]');
      const reportedCommentIds = reports
        .filter(report => report.type === 'comment')
        .map(report => report.commentId);
      
      setReportedComments(new Set(reportedCommentIds));
      console.log('📊 Loaded reported comments from localStorage:', reportedCommentIds);
    } catch (error) {
      console.error('❌ Error loading reported comments:', error);
    }
  };

  // Load reported comments on component mount and set up periodic check
  React.useEffect(() => {
    fetchReportedComments();
    
    // Check for changes in localStorage every 2 seconds
    const interval = setInterval(() => {
      fetchReportedComments();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentYear]);
  
  // Report dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportAdditionalInfo, setReportAdditionalInfo] = useState('');
  const [selectedCommentForReport, setSelectedCommentForReport] = useState(null);
  
  // Document preview states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Mock-Daten für Aktionen
  const mockActionsData = [
    {
      id: 1,
      title: 'Abi-Pulli Bestellung',
      description: 'Organisation und Bestellung der Abschluss-Pullover für den gesamten Jahrgang',
      committee: 'Abi-Komitee',
      actionDate: '2025-02-15',
      progress: 65,
      budget: 350,
      spent: 200,
      tasks: [
        { id: 1, title: 'Designs sammeln', assignee: 'Lisa M.', completed: true },
        { id: 2, title: 'Angebote einholen', assignee: 'Max K.', completed: true },
        { id: 3, title: 'Bestellung aufgeben', assignee: 'Anna S.', completed: false },
        { id: 4, title: 'Lieferung koordinieren', assignee: 'Tom B.', completed: false }
      ],
      comments: [
        { id: 1, author: 'Lisa M.', text: 'Designs sind fertig! Bitte um Feedback.', date: '2024-01-20', replies: [] },
        { id: 2, author: 'Max K.', text: 'Beste Angebote von Firma XY - 15€ pro Pulli', date: '2024-01-22', replies: [
          { id: 3, author: 'Anna S.', text: 'Super Preis! Können wir bestellen.', date: '2024-01-23' }
        ] }
      ],
      documents: [
        { id: 1, name: 'Design_Entwurf_v2.pdf', size: '2.3 MB', url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y=' },
        { id: 2, name: 'Kostenvoranschlag_XY.pdf', size: '1.1 MB', url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y=' }
      ],
      approved: true,
      approvedBy: 'Herr Schmidt',
      approvedDate: '2024-01-18',
      participants: ['Max Mustermann', 'Lisa Schmidt', 'Tom Weber'],
      maxParticipants: 50,
      requiresParticipation: true
    },
    {
      id: 2,
      title: 'Abschlussfahrt Berlin',
      description: 'Planung und Organisation der mehrtägigen Abschlussfahrt nach Berlin',
      committee: 'Fahrt-Komitee',
      actionDate: '2025-06-15',
      progress: 25,
      budget: 1200,
      spent: 150,
      tasks: [
        { id: 1, title: 'Unterkünfte recherchieren', assignee: 'Sarah L.', completed: true },
        { id: 2, title: 'Busunternehmen kontaktieren', assignee: 'Mike R.', completed: false },
        { id: 3, title: 'Programm erstellen', assignee: 'Julia W.', completed: false }
      ],
      comments: [
        { id: 1, author: 'Sarah L.', text: 'Hostel in Mitte gefunden - 25€/Nacht pro Person', date: '2024-02-03' }
      ],
      documents: [
        { id: 1, name: 'Unterkunft_Optionen.xlsx', size: '890 KB', url: 'https://file-examples.com/storage/fe86c96f5b80c61c9c1e9b5/2017/10/file_example_XLS_10.xls' }
      ],
      approved: false,
      approvedBy: null,
      approvedDate: null,
      participants: ['Sarah Mueller', 'Mike Richter'],
      maxParticipants: 30,
      requiresParticipation: true
    },
    {
      id: 3,
      title: 'Abi-Zeitung',
      description: 'Erstellung der Abschlusszeitung mit Steckbriefen und Erinnerungen',
      committee: 'Medien-Komitee',
      actionDate: '2024-01-30',
      progress: 100,
      budget: 800,
      spent: 750,
      tasks: [
        { id: 1, title: 'Steckbriefe sammeln', assignee: 'Emma T.', completed: true },
        { id: 2, title: 'Layout erstellen', assignee: 'Leon H.', completed: true },
        { id: 3, title: 'Druckerei beauftragen', assignee: 'Nina K.', completed: true },
        { id: 4, title: 'Verteilung organisieren', assignee: 'Paul M.', completed: true }
      ],
      comments: [
        { id: 1, author: 'Emma T.', text: 'Alle Steckbriefe sind da!', date: '2024-01-15' },
        { id: 2, author: 'Leon H.', text: 'Layout ist fertig - sieht super aus!', date: '2024-02-20' }
      ],
      documents: [
        { id: 1, name: 'Abi_Zeitung_Final.pdf', size: '15.2 MB', url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y=' },
        { id: 2, name: 'Druckauftrag_Rechnung.pdf', size: '456 KB', url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEZW1vIFBERikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTkKJSVFT0Y=' }
      ],
      approved: true,
      approvedBy: 'Frau Müller',
      approvedDate: '2023-12-15',
      participants: [],
      maxParticipants: 0,
      requiresParticipation: false
    },
    {
      id: 4,
      title: 'Mottowoche Organisation',
      description: 'Planung der Mottowoche mit täglichen Themen und Aktivitäten',
      committee: 'Event-Komitee',
      actionDate: '2025-05-20',
      progress: 40,
      budget: 500,
      spent: 120,
      tasks: [
        { id: 1, title: 'Mottos festlegen', assignee: 'Clara B.', completed: true },
        { id: 2, title: 'Kostüm-Wettbewerb planen', assignee: 'Felix G.', completed: false },
        { id: 3, title: 'Dekoration besorgen', assignee: 'Lara S.', completed: false }
      ],
      comments: [
        { id: 1, author: 'Clara B.', text: 'Mottos stehen fest: Kindheitshelden, 80er, Pyjama, Tausch, Abimotto', date: '2024-03-05' }
      ],
      documents: [
        { id: 1, name: 'Mottowoche_Plan.docx', size: '1.2 MB' }
      ],
      approved: true,
      approvedBy: 'Herr Weber',
      approvedDate: '2024-03-02',
      participants: ['Clara Bauer', 'Felix Graf', 'Lara Stein', 'Anna Klein'],
      maxParticipants: 100,
      requiresParticipation: true
    }
  ];

  // Mock-Daten mit automatischer Status-Berechnung
  const mockActions = mockActionsData.map(action => ({
    ...action,
    status: calculateActionStatus(action.actionDate)
  }));

  // Automatische Archivierung: Filtere abgeschlossene Aktionen aus
  const filterActiveActions = (actions) => {
    return actions.filter(action => action.status !== 'abgeschlossen');
  };

  const [actionsList, setActionsList] = useState([]);
  const committees = ['Abi-Komitee', 'Fahrt-Komitee', 'Medien-Komitee', 'Event-Komitee', 'Finanz-Komitee'];

  // Load actions from Firestore/localStorage
  const loadActions = async () => {
    try {
      const collectionPath = dataIsolationService.getActionsCollection();
      const actionsQuery = query(
        collection(db, collectionPath),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(actionsQuery);
      const loadedActions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        actionDate: doc.data().actionDate?.toDate ? doc.data().actionDate.toDate().toISOString().split('T')[0] : doc.data().actionDate,
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));
      
      // Apply status calculation and filter active actions
      const actionsWithStatus = loadedActions.map(action => ({
        ...action,
        status: calculateActionStatus(action.actionDate)
      }));
      
      setActionsList(filterActiveActions(actionsWithStatus));
      console.log('Actions loaded from Firestore:', loadedActions.length);
      console.log('First action comments:', loadedActions[0]?.comments);
    } catch (error) {
      console.error('Error loading actions:', error);
      // Fallback to mock data if loading fails
      if (hasYearData()) {
        setActionsList(filterActiveActions(mockActions));
        console.log('Using mock data fallback');
        console.log('Mock actions loaded:', mockActions.length);
        console.log('First mock action comments:', mockActions[0]?.comments);
      } else {
        console.log('No year data available, using empty list');
      }
    }
  };

  // Load actions on component mount
  React.useEffect(() => {
    if (currentYear) {
      loadActions();
    }
  }, [currentYear]);

  // Automatische Archivierung: Überprüfe regelmäßig den Status der Aktionen
  React.useEffect(() => {
    const checkAndArchiveActions = () => {
      setActionsList(prevActions => {
        const updatedActions = prevActions.map(action => ({
          ...action,
          status: calculateActionStatus(action.actionDate)
        }));
        
        // Filtere abgeschlossene Aktionen aus
        return filterActiveActions(updatedActions);
      });
    };

    // Überprüfe alle 24 Stunden (86400000 ms)
    const interval = setInterval(checkAndArchiveActions, 86400000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Teilnahme-Handler
  const handleParticipation = (actionId) => {
    const userName = user?.name || 'Aktueller Benutzer';
    
    const updateParticipation = async () => {
      try {
        const collectionPath = dataIsolationService.getActionsCollection();
        const actionToUpdate = actionsList.find(a => a.id === actionId);
        
        if (actionToUpdate) {
          const isParticipating = actionToUpdate.participants.includes(userName);
          const updatedParticipants = isParticipating
            ? actionToUpdate.participants.filter(p => p !== userName)
            : [...actionToUpdate.participants, userName];
          
          const updatedAction = {
            ...actionToUpdate,
            participants: updatedParticipants,
            updatedAt: new Date()
          };
          
          // Firestore-Dokument aktualisieren
          await updateDoc(doc(db, collectionPath, actionId), {
            participants: updatedParticipants,
            updatedAt: new Date()
          });
          
          // Lokale Liste aktualisieren
          setActionsList(prevActions => 
            prevActions.map(action => 
              action.id === actionId ? updatedAction : action
            )
          );
          
          // Auch selectedAction aktualisieren falls es die gleiche Aktion ist
          if (selectedAction && selectedAction.id === actionId) {
            setSelectedAction(updatedAction);
          }
          
          console.log(`${isParticipating ? 'Abmeldung von' : 'Anmeldung für'} Aktion in Firestore gespeichert: ${actionToUpdate.title}`);
        }
      } catch (error) {
        console.error('Fehler beim Speichern der Teilnahme:', error);
        // Fallback: Nur lokale Aktualisierung
        setActionsList(prevActions => 
          prevActions.map(action => {
            if (action.id === actionId) {
              const isParticipating = action.participants.includes(userName);
              const updatedParticipants = isParticipating
                ? action.participants.filter(p => p !== userName)
                : [...action.participants, userName];
              
              return {
                ...action,
                participants: updatedParticipants
              };
            }
            return action;
          })
        );
        
        if (selectedAction && selectedAction.id === actionId) {
          const updatedAction = actionsList.find(a => a.id === actionId);
          if (updatedAction) {
            const isParticipating = updatedAction.participants.includes(userName);
            const updatedParticipants = isParticipating
              ? updatedAction.participants.filter(p => p !== userName)
              : [...updatedAction.participants, userName];
            
            setSelectedAction({
              ...updatedAction,
              participants: updatedParticipants
            });
          }
        }
      }
    };
    
    updateParticipation();
  };

  const handleJoinAction = (action) => {
    setSelectedActionForJoin(action);
    setJoinDialogOpen(true);
  };

  const confirmJoinAction = () => {
    if (selectedActionForJoin) {
      // Verwende die handleParticipation-Funktion für korrekte Firestore-Persistierung
      handleParticipation(selectedActionForJoin.id);
    }
    setJoinDialogOpen(false);
    setSelectedActionForJoin(null);
  };

  // Kommentar hinzufügen
  const handleAddComment = async () => {
    console.log('=== ADDING COMMENT ===');
    console.log('newComment:', newComment);
    console.log('selectedAction:', selectedAction);
    console.log('selectedAction.comments before:', selectedAction?.comments);
    console.log('deletedComments set:', Array.from(deletedComments));
    console.log('reportedComments set:', Array.from(reportedComments));
    
    if (newComment.trim() && selectedAction) {
      const existingIds = [
        ...selectedAction.comments.map(c => c.id),
        ...selectedAction.comments.flatMap(c => c.replies?.map(r => r.id) || []),
        ...Array.from(deletedComments),
        ...Array.from(reportedComments)
      ];
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      console.log('Generated new comment ID:', newId);
      
      const comment = {
        id: newId,
        author: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Aktueller Benutzer',
        text: newComment,
        date: new Date().toISOString().split('T')[0]
      };
      
      let updatedComments;
      
      if (replyToComment) {
        // Antwort zu einem bestehenden Kommentar hinzufügen
        updatedComments = selectedAction.comments.map(c => {
          if (c.id === replyToComment.id) {
            return {
              ...c,
              replies: [...(c.replies || []), comment]
            };
          }
          return c;
        });
        setReplyToComment(null);
      } else {
        // Neuen Hauptkommentar hinzufügen
        comment.replies = [];
        updatedComments = [...selectedAction.comments, comment];
      }
      
      // Aktualisiere die lokalen Zustände SOFORT, unabhängig von Firestore
      setActionsList(prevActions => 
        prevActions.map(action => {
          if (action.id === selectedAction.id) {
            return {
              ...action,
              comments: updatedComments
            };
          }
          return action;
        })
      );
      
      // Aktualisiere auch selectedAction
      console.log('Updating selectedAction with new comments:', updatedComments);
      setSelectedAction({
        ...selectedAction,
        comments: updatedComments
      });
      
      setNewComment('');
      console.log('Kommentar lokal hinzugefügt:', comment);
      console.log('selectedAction after update should have comments:', updatedComments.length);
      
      try {
        // Firestore-Dokument aktualisieren (im Hintergrund)
        const collectionPath = dataIsolationService.getActionsCollection();
        await updateDoc(doc(db, collectionPath, selectedAction.id), {
          comments: updatedComments,
          updatedAt: new Date()
        });
        
        console.log('Kommentar in Firestore gespeichert:', comment);
      } catch (error) {
        console.error('Fehler beim Speichern des Kommentars in Firestore:', error);
        // Kommentar bleibt trotzdem lokal sichtbar
      }
    }
  };
  
  const handleReplyToComment = (comment) => {
    setReplyToComment(comment);
    setNewComment(`@${comment.author} `);
  };
  
  const handleReportComment = (comment) => {
    setSelectedCommentForReport(comment);
    setReportDialogOpen(true);
  };
  
  // Function to check if user can delete a comment
  const canDeleteComment = (comment) => {
    if (!user) return false;
    
    // Admins can delete any comment
    if (user.role === 'admin') {
      return true;
    }
    
    // Users can delete their own comments
    if (comment.author === user.name || comment.author === user.displayName) {
      return true;
    }
    
    return false;
  };
  
  // Function to handle comment deletion
  const handleDeleteComment = (comment) => {
    if (!canDeleteComment(comment)) return;
    
    // Mark comment as deleted locally
    setDeletedComments(prev => new Set([...prev, comment.id]));
    
    // Also delete from mock data for persistence
    deleteCommentFromData(comment.id);
  };
  
  // Function to delete a comment from mock data when admin takes action
  const deleteCommentFromData = (commentId) => {
    console.log('=== DELETING COMMENT FROM DATA ===');
    console.log('Comment ID to delete:', commentId);
    console.log('Current deletedComments set:', Array.from(deletedComments));
    console.log('Current selectedAction comments:', selectedAction?.comments);
    
    try {
      const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      if (!mockData.years || !mockData.years[currentYear]) return;
      
      // Find and remove the comment from actions
      const actions = mockData.years[currentYear].actions || [];
      let commentFound = false;
      
      actions.forEach(action => {
        if (action.comments) {
          // Remove main comments
          action.comments = action.comments.filter(comment => {
            if (comment.id === commentId) {
              commentFound = true;
              return false;
            }
            // Remove replies
            if (comment.replies) {
              comment.replies = comment.replies.filter(reply => {
                if (reply.id === commentId) {
                  commentFound = true;
                  return false;
                }
                return true;
              });
            }
            return true;
          });
        }
      });
      
      if (commentFound) {
        // Save updated data
        localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
        
        // In demo mode, also remove any reports for this comment
        if (isDemoMode()) {
          const existingReports = JSON.parse(localStorage.getItem('commentReports') || '[]');
          const updatedReports = existingReports.filter(report => report.commentId !== commentId);
          localStorage.setItem('commentReports', JSON.stringify(updatedReports));
          console.log('✅ Comment reports removed from localStorage for deleted comment');
        }
        
        // Mark comment as deleted locally
        setDeletedComments(prev => new Set([...prev, commentId]));
        
        // Remove from reported comments set as well
        setReportedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          localStorage.setItem(`reportedComments_${currentYear}`, JSON.stringify([...newSet]));
          return newSet;
        });
        
        // Update the actions list immediately
        setActionsList(prevActions => 
          prevActions.map(action => ({
            ...action,
            comments: action.comments ? action.comments.filter(comment => {
              if (comment.id === commentId) return false;
              if (comment.replies) {
                comment.replies = comment.replies.filter(reply => reply.id !== commentId);
              }
              return true;
            }) : []
          }))
        );
        
        // Update selectedAction if it exists
        if (selectedAction) {
          const updatedComments = selectedAction.comments ? selectedAction.comments.filter(comment => {
            if (comment.id === commentId) return false;
            if (comment.replies) {
              comment.replies = comment.replies.filter(reply => reply.id !== commentId);
            }
            return true;
          }) : [];
          
          setSelectedAction({
            ...selectedAction,
            comments: updatedComments
          });
        }
        
        console.log('✅ Kommentar gelöscht:', commentId);
        console.log('Updated deletedComments set:', Array.from(deletedComments));
        console.log('Updated selectedAction comments:', selectedAction?.comments);
        console.log('=== END DELETE COMMENT ===');
      }
    } catch (error) {
      console.error('❌ Fehler beim Löschen des Kommentars:', error);
    }
  };
  
  // Function to restore a comment when admin denies the report
  const restoreCommentFromData = async (commentId) => {
    console.log('=== RESTORING COMMENT ===');
    console.log('Comment ID to restore:', commentId);
    console.log('Deleted comments before:', Array.from(deletedComments));
    console.log('Reported comments before:', Array.from(reportedComments));
    console.log('Demo mode:', isDemoMode());
    
    try {
      // In demo mode, also remove from localStorage reports
      if (isDemoMode()) {
        const existingReports = JSON.parse(localStorage.getItem('commentReports') || '[]');
        const updatedReports = existingReports.filter(report => report.commentId !== commentId);
        localStorage.setItem('commentReports', JSON.stringify(updatedReports));
        console.log('✅ Comment report removed from localStorage');
      } else {
        // Find the action containing this comment
        let targetAction = null;
        let targetComment = null;
        
        for (const action of actionsList) {
          // Check main comments
          const mainComment = action.comments?.find(comment => comment.id === commentId);
          if (mainComment) {
            targetAction = action;
            targetComment = mainComment;
            break;
          }
          
          // Check replies
          for (const comment of action.comments || []) {
            const reply = comment.replies?.find(reply => reply.id === commentId);
            if (reply) {
              targetAction = action;
              targetComment = reply;
              break;
            }
          }
          
          if (targetComment) break;
        }
        
        if (targetAction && targetComment) {
          console.log('Target action:', targetAction.id);
          console.log('Target comment text:', targetComment.text?.substring(0, 50) + '...');
          
          // Update the comment in Firestore to remove reported status
          const commentRef = doc(getFirestore(), 'actions', targetAction.id, 'comments', commentId);
          await updateDoc(commentRef, {
            reported: false,
            reportedAt: null
          });
          
          console.log('✅ Comment reported status removed from Firestore');
        } else {
          console.warn('Comment or action not found for restoration:', commentId);
        }
      }
      
      // Remove from deleted comments set
      setDeletedComments(prev => {
        const newSet = new Set(prev);
        const wasDeleted = newSet.has(commentId);
        newSet.delete(commentId);
        console.log('Was in deleted set:', wasDeleted);
        console.log('Deleted comments after removal:', Array.from(newSet));
        
        // Update localStorage for deleted comments
        localStorage.setItem(`deletedComments_${currentYear}`, JSON.stringify([...newSet]));
        
        return newSet;
      });
      
      // Remove from reported comments set
      setReportedComments(prev => {
        const newSet = new Set(prev);
        const wasReported = newSet.has(commentId);
        newSet.delete(commentId);
        console.log('Was in reported set:', wasReported);
        console.log('Reported comments after removal:', Array.from(newSet));
        
        // Update localStorage for reported comments
        localStorage.setItem(`reportedComments_${currentYear}`, JSON.stringify([...newSet]));
        
        return newSet;
      });
      
      console.log('🔄 Kommentar wiederhergestellt:', commentId);
      
      // Force re-render by updating the actions list
      setActionsList(prevActions => [...prevActions]);
      
      // Force re-render of selectedAction if it exists
      if (selectedAction) {
        setSelectedAction({...selectedAction});
      }
      
      console.log('✅ LocalStorage aktualisiert für wiederhergestellten Kommentar');
    } catch (error) {
      console.error('❌ Fehler beim Wiederherstellen des Kommentars:', error);
    }
  };
  
  // Make functions available globally for AdminPanel
  React.useEffect(() => {
    window.deleteCommentFromActions = deleteCommentFromData;
    window.restoreCommentFromActions = restoreCommentFromData;
    return () => {
      delete window.deleteCommentFromActions;
      delete window.restoreCommentFromActions;
    };
  }, [deleteCommentFromData, restoreCommentFromData]);

  // Function to approve an action (Admin only)
  const handleApproveAction = async (actionId) => {
    if (user?.role !== 'admin') {
      console.log('❌ Nur Admins können Aktionen genehmigen');
      return;
    }

    try {
      console.log('✅ Genehmige Aktion:', actionId);
      
      // Update local state immediately
      setActionsList(prevActions => 
        prevActions.map(action => {
          if (action.id === actionId) {
            return {
              ...action,
              approved: true,
              approvedBy: user.name || user.displayName || 'Admin',
              approvedAt: new Date().toISOString()
            };
          }
          return action;
        })
      );
      
      // Update selectedAction if it's the one being approved
      if (selectedAction && selectedAction.id === actionId) {
        setSelectedAction({
          ...selectedAction,
          approved: true,
          approvedBy: user.name || user.displayName || 'Admin',
          approvedAt: new Date().toISOString()
        });
      }
      
      // Update in Firestore
      const collectionPath = dataIsolationService.getActionsCollection();
      await updateDoc(doc(db, collectionPath, actionId), {
        approved: true,
        approvedBy: user.name || user.displayName || 'Admin',
        approvedAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Aktion erfolgreich genehmigt:', actionId);
    } catch (error) {
      console.error('❌ Fehler beim Genehmigen der Aktion:', error);
    }
  };

  const handleReportSubmit = async () => {
    if (!selectedCommentForReport || !reportReason) {
      console.log('❌ Report submission failed: Missing comment or reason', { selectedCommentForReport, reportReason });
      return;
    }
    
    try {
      console.log('📝 Starting report submission...');
      console.log('📍 Collection path:', dataIsolationService.getReportsCollection());
      console.log('👤 Current user:', user);
      console.log('💬 Selected comment:', selectedCommentForReport);
      console.log('🎯 Selected action:', selectedAction);
      
      const reportData = {
        type: 'comment',
        actionId: selectedAction?.id,
        actionTitle: selectedAction?.title,
        commentId: selectedCommentForReport.id,
        commentText: selectedCommentForReport.text,
        commentAuthor: selectedCommentForReport.author,
        reportedBy: user?.uid,
        reportedByName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email,
        reason: reportReason,
        additionalInfo: reportAdditionalInfo,
        reportedAt: serverTimestamp(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      console.log('📊 Report data to be saved:', reportData);
      
      // Add report to Firestore using dataIsolationService
      const reportsCollection = collection(db, dataIsolationService.getReportsCollection());
      const docRef = await addDoc(reportsCollection, reportData);
      
      console.log('✅ Report saved successfully with ID:', docRef.id);
      
      // In demo mode, also save to localStorage for AdminPanel integration
      if (isDemoMode()) {
        try {
          const existingReports = JSON.parse(localStorage.getItem('commentReports') || '[]');
          const reportWithId = {
            ...reportData,
            id: docRef.id || `report_${Date.now()}`,
            reportedAt: new Date().toISOString()
          };
          existingReports.push(reportWithId);
          localStorage.setItem('commentReports', JSON.stringify(existingReports));
          console.log('📊 Report also saved to localStorage for demo mode');
        } catch (localStorageError) {
          console.error('❌ Error saving report to localStorage:', localStorageError);
        }
      }
      
      // Mark comment as reported locally
      setReportedComments(prev => new Set([...prev, selectedCommentForReport.id]));
      
      // Close dialog and reset state
      setReportDialogOpen(false);
      setReportReason('');
      setReportAdditionalInfo('');
      setSelectedCommentForReport(null);
      
      console.log('✅ Kommentar erfolgreich gemeldet');
    } catch (error) {
      console.error('❌ Fehler beim Melden des Kommentars:', error);
    }
  };
  
  const cancelReply = () => {
    setReplyToComment(null);
    setNewComment('');
  };

  // Filter-Funktionen
  const getFilteredActions = () => {
    let filtered = actionsList;

    // Status-Filter basierend auf Tab
    if (selectedTab === 1) filtered = filtered.filter(action => action.status === 'laufend');
    if (selectedTab === 2) filtered = filtered.filter(action => action.status === 'geplant');
    if (selectedTab === 3) filtered = filtered.filter(action => action.status === 'abgeschlossen');

    // Suchfilter
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Komitee-Filter
    if (filterCommittee) {
      filtered = filtered.filter(action => action.committee === filterCommittee);
    }

    // Budget-Filter
    if (filterBudget) {
      if (filterBudget === 'low') filtered = filtered.filter(action => action.budget < 500);
      if (filterBudget === 'medium') filtered = filtered.filter(action => action.budget >= 500 && action.budget < 1000);
      if (filterBudget === 'high') filtered = filtered.filter(action => action.budget >= 1000);
    }

    return filtered;
  };

  // Status-Farben
  const getStatusColor = (status) => {
    switch (status) {
      case 'abgeschlossen': return 'success';
      case 'laufend': return 'primary';
      case 'geplant': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'abgeschlossen': return <CheckCircleIcon />;
      case 'laufend': return <PlayArrowIcon />;
      case 'geplant': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  // Aktions-Karte Komponente
  const ActionCard = ({ action }) => {
    const budgetPercentage = (action.spent / action.budget) * 100;
    const isOverBudget = budgetPercentage > 100;

    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: action.status === 'laufend' ? '2px solid' : '1px solid',
          borderColor: action.status === 'laufend' ? 'primary.main' : 'divider',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {action.title}
            </Typography>
            <Chip 
              icon={getStatusIcon(action.status)}
              label={action.status.charAt(0).toUpperCase() + action.status.slice(1)}
              color={getStatusColor(action.status)}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {action.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(action.actionDate).toLocaleDateString('de-DE')}
            </Typography>
          </Box>
          
          {/* Fortschrittsanzeige */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Fortschritt</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {action.progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={action.progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: darkMode ? 'grey.800' : 'grey.200'
              }}
            />
          </Box>
          
          {/* Budget-Status */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Budget</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: isOverBudget ? 'error.main' : 'success.main'
                }}
              >
                {action.spent}€ / {action.budget}€
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(budgetPercentage, 100)} 
              color={isOverBudget ? 'error' : 'success'}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: darkMode ? 'grey.800' : 'grey.200'
              }}
            />
          </Box>
          
          {/* Genehmigungsstatus */}
          {action.approved ? (
            <Chip 
              icon={<CheckCircleIcon />}
              label={`Genehmigt von ${action.approvedBy}`}
              color="success"
              size="small"
              sx={{ mb: 1 }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip 
                label="Wartet auf Genehmigung"
                color="warning"
                size="small"
              />
              {user?.role === 'admin' && (
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleApproveAction(action.id)}
                  sx={{ 
                    bgcolor: 'success.light',
                    '&:hover': { bgcolor: 'success.main' },
                    width: 28,
                    height: 28
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
          
          {/* Aufgaben-Übersicht */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AssignmentIcon fontSize="small" color="action" />
            <Typography variant="caption">
              {action.tasks.filter(task => task.completed).length} / {action.tasks.length} Aufgaben
            </Typography>
          </Box>
          
          {/* Kommentare */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CommentIcon fontSize="small" color="action" />
            <Typography variant="caption">
              {action.comments.length} Kommentare
            </Typography>
          </Box>
          
          {/* Teilnehmer-Anzeige */}
          {action.requiresParticipation && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon fontSize="small" color="action" />
              <Typography variant="caption">
                {action.participants.length} / {action.maxParticipants} Teilnehmer
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              startIcon={<VisibilityIcon />}
              onClick={() => {
                        console.log('=== SETTING SELECTED ACTION ===');
                        console.log('Action being selected:', action);
                        console.log('Action comments:', action.comments);
                        console.log('Comments count:', action.comments?.length);
                        setSelectedAction(action);
                        setDetailDialogOpen(true);
                        console.log('=== DIALOG OPENED ===');
                      }}
            >
              Details
            </Button>
            
            {(() => {
              const currentUser = user?.name || 'Aktueller Benutzer';
              const isJoined = action.participants.includes(currentUser);
              
              return (
                <Button
                  size="small"
                  variant={isJoined ? "outlined" : "contained"}
                  color={isJoined ? "success" : "primary"}
                  startIcon={isJoined ? <CheckCircleIcon /> : <GroupIcon />}
                  onClick={() => handleJoinAction(action)}
                  disabled={isJoined}
                >
                  {isJoined ? 'Beigetreten' : 'Beitreten'}
                </Button>
              );
            })()}
            
            {action.requiresParticipation && user?.role === 'student' && (
              <Button
                size="small"
                variant={action.participants.includes(user?.name || 'Aktueller Benutzer') ? 'outlined' : 'contained'}
                color={action.participants.includes(user?.name || 'Aktueller Benutzer') ? 'error' : 'primary'}
                startIcon={action.participants.includes(user?.name || 'Aktueller Benutzer') ? <PersonIcon /> : <GroupIcon />}
                onClick={() => handleParticipation(action.id)}
                disabled={!action.participants.includes(user?.name || 'Aktueller Benutzer') && action.participants.length >= action.maxParticipants}
              >
                {action.participants.includes(user?.name || 'Aktueller Benutzer') ? 'Abmelden' : 'Teilnehmen'}
              </Button>
            )}
          </Box>
          
          {(user?.role === 'admin' || user?.role === 'committee') && (
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => {
                setEditAction(action);
                setEditDialogOpen(true);
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Aktionen
        </Typography>
        
        {(user?.role === 'admin' || user?.role === 'committee') && (
          <Fab 
            color="primary" 
            onClick={() => setCreateDialogOpen(true)}
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      
      {/* Filter und Suche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Aktionen durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          

        </Grid>
      </Paper>
      
      {/* Status-Tabs */}
      <Tabs 
        value={selectedTab} 
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Alle" />
        <Tab label="Laufend" />
        <Tab label="Geplant" />
        <Tab label="Abgeschlossen" />
      </Tabs>
      
      {/* Aktions-Grid */}
      <Grid container spacing={3}>
        {getFilteredActions().map(action => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={action.id}>
            <ActionCard action={action} />
          </Grid>
        ))}
      </Grid>
      
      {getFilteredActions().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Keine Aktionen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versuche andere Filtereinstellungen oder erstelle eine neue Aktion.
          </Typography>
        </Box>
      )}
      
      {/* Detail-Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAction && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">{selectedAction.title}</Typography>
                <Chip 
                  icon={getStatusIcon(selectedAction.status)}
                  label={selectedAction.status.charAt(0).toUpperCase() + selectedAction.status.slice(1)}
                  color={getStatusColor(selectedAction.status)}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Tabs value={detailTab} onChange={(e, newValue) => setDetailTab(newValue)}>
                <Tab label="Übersicht" />
                <Tab label="Aufgaben" />
                <Tab label="Finanzen" />
                <Tab label="Dokumente" />
                <Tab label="Diskussion" />
                {selectedAction?.requiresParticipation && <Tab label="Teilnehmer" />}
              </Tabs>
              
              {/* Tab Content */}
              {detailTab === 0 && (
                <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAction.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Datum:</Typography>
                    <Typography variant="body2">
                      {new Date(selectedAction.actionDate).toLocaleDateString('de-DE')}
                    </Typography>
                  </Grid>
                </Grid>
                </Box>
              )}
              
              {/* Aufgaben Tab */}
              {detailTab === 1 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Aufgaben</Typography>
                    {(() => {
                      const currentUser = user?.name || 'Aktueller Benutzer';
                      const isJoined = selectedAction.participants.includes(currentUser);
                      return isJoined && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setNewTaskDialogOpen(true)}
                        >
                          Aufgabe hinzufügen
                        </Button>
                      );
                    })()}
                  </Box>
                  <List>
                    {selectedAction.tasks.map(task => (
                      <ListItem key={task.id}>
                        <ListItemIcon>
                          <Checkbox 
                            checked={task.completed} 
                            onChange={(e) => {
                              // Task-Status umschalten
                              const updatedTasks = selectedAction.tasks.map(t => 
                                t.id === task.id ? { ...t, completed: e.target.checked } : t
                              );
                              const updatedAction = { ...selectedAction, tasks: updatedTasks };
                              setSelectedAction(updatedAction);
                              
                              // Actions-State auch aktualisieren
                              setActionsList(prevActions => 
                                prevActions.map(action => 
                                  action.id === selectedAction.id ? updatedAction : action
                                )
                              );
                              
                              console.log('Task-Status geändert:', task.id, e.target.checked);
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={task.title}
                          secondary={`Zugewiesen an: ${task.assignee}`}
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            opacity: task.completed ? 0.7 : 1
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {/* Finanzen Tab */}
              {detailTab === 2 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Finanzübersicht</Typography>
                    {(() => {
                      const currentUser = user?.name || 'Aktueller Benutzer';
                      const isJoined = selectedAction.participants.includes(currentUser);
                      return isJoined && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EuroIcon />}
                          onClick={() => setNewExpenseDialogOpen(true)}
                        >
                          Ausgabe hinzufügen
                        </Button>
                      );
                    })()}
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Budget:</Typography>
                      <Typography variant="h6" color="primary">{selectedAction.budget}€</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Ausgegeben:</Typography>
                      <Typography variant="h6" color={selectedAction.spent > selectedAction.budget ? 'error' : 'success'}>
                        {selectedAction.spent}€
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Verbleibendes Budget:</Typography>
                      <Typography variant="h6" color={selectedAction.budget - selectedAction.spent < 0 ? 'error' : 'success'}>
                        {selectedAction.budget - selectedAction.spent}€
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {/* Ausgaben-Liste */}
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Ausgaben</Typography>
                  <List>
                    {(selectedAction.expenses || []).map(expense => (
                      <ListItem key={expense.id}>
                        <ListItemIcon>
                          <EuroIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={expense.description}
                          secondary={`${expense.amount}€ - ${expense.date} - ${expense.createdBy}`}
                        />
                      </ListItem>
                    ))}
                    {(!selectedAction.expenses || selectedAction.expenses.length === 0) && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Noch keine Ausgaben erfasst
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
              
              {/* Dokumente Tab */}
              {detailTab === 3 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Dokumente</Typography>
                    {(() => {
                      const currentUser = user?.name || 'Aktueller Benutzer';
                      const isJoined = selectedAction.participants.includes(currentUser);
                      return isJoined && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AttachFileIcon />}
                          onClick={() => setUploadDialogOpen(true)}
                          size="small"
                        >
                          Dokument hochladen
                        </Button>
                      );
                    })()} 
                  </Box>
                  <List>
                    {selectedAction.documents && selectedAction.documents.length > 0 ? (
                      selectedAction.documents.map(doc => (
                        <ListItem key={doc.id}>
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={doc.name}
                            secondary={`${doc.size} - Hochgeladen von ${doc.uploadedBy} am ${doc.uploadDate}`}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setPreviewDialogOpen(true);
                              }}
                            >
                              Vorschau
                            </Button>
                            <Button size="small" variant="outlined">Download</Button>
                          </Box>
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Noch keine Dokumente hochgeladen
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
              
              {/* Diskussion Tab */}
              {detailTab === 4 && (
                <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Diskussion</Typography>
                  
                  {/* Kommentare Container mit fester Höhe und Scroll */}
                  <Box 
                    sx={{ 
                      flex: 1,
                      overflowY: 'auto',
                      mb: 2,
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'rgba(0,0,0,0.5)',
                      },
                    }}
                  >
                    {(() => {
                       console.log('=== COMMENT RENDERING DEBUG ===');
                       console.log('selectedAction:', selectedAction);
                       console.log('selectedAction.comments:', selectedAction?.comments);
                       console.log('Comments is array:', Array.isArray(selectedAction?.comments));
                       console.log('Deleted comments set:', deletedComments);
                       
                       if (!selectedAction?.comments) {
                         console.log('No comments found - returning empty array');
                         return [];
                       }
                       
                       const filteredComments = selectedAction.comments.filter(comment => {
                         const isDeleted = deletedComments.has(comment.id);
                         console.log(`Comment ${comment.id}: deleted=${isDeleted}`);
                         return !isDeleted;
                       });
                       
                       console.log('Final filtered comments:', filteredComments);
                       console.log('=== END DEBUG ===');
                       return filteredComments;
                     })().map(comment => (
                      <Box key={comment.id}>
                        {/* Hauptkommentar */}
                        <Box sx={{ 
                          mb: 2, 
                          p: 2, 
                          bgcolor: 'background.paper', 
                          borderRadius: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              {comment.author.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle2">{comment.author}</Typography>
                            <Typography variant="caption" sx={{ ml: 'auto' }}>
                              {new Date(comment.date).toLocaleDateString('de-DE')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {comment.text}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleReplyToComment(comment)}
                            >
                              <ReplyIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleReportComment(comment)}
                            >
                              <ReportIcon fontSize="small" />
                            </IconButton>
                            {canDeleteComment(comment) && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteComment(comment)}
                                color="error"
                              >
                                <RestoreFromTrashIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Antworten */}
                        {comment.replies && comment.replies.length > 0 && (
                          <Box sx={{ ml: 4, mb: 2 }}>
                            {comment.replies
                              .filter(reply => !deletedComments.has(reply.id))
                              .map(reply => (
                              <Box key={reply.id} sx={{ 
                                mb: 1, 
                                p: 1.5, 
                                bgcolor: reportedComments.has(reply.id) ? 'error.light' : 'grey.50', 
                                borderRadius: 1,
                                borderLeft: '3px solid',
                                borderLeftColor: 'primary.main',
                                opacity: reportedComments.has(reply.id) ? 0.6 : 1
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Avatar sx={{ width: 20, height: 20, mr: 1 }}>
                                    {reply.author.charAt(0)}
                                  </Avatar>
                                  <Typography variant="caption" fontWeight="bold">{reply.author}</Typography>
                                  <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                                    {new Date(reply.date).toLocaleDateString('de-DE')}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" fontSize="0.875rem">
                                  {reply.text}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleReportComment(reply)}
                                  >
                                    <ReportIcon fontSize="small" />
                                  </IconButton>
                                  {canDeleteComment(reply) && (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleDeleteComment(reply)}
                                      color="error"
                                    >
                                      <RestoreFromTrashIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Eingabebereich am unteren Rand */}
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    {replyToComment && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption">
                          Antwort auf {replyToComment.author}: "{replyToComment.text.substring(0, 50)}..."
                        </Typography>
                        <IconButton size="small" onClick={cancelReply}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder={replyToComment ? "Antwort schreiben..." : "Kommentar hinzufügen..."}
                      variant="outlined"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newComment.trim()) {
                            handleAddComment();
                          }
                        }
                      }}
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        {replyToComment ? 'Antwort senden' : 'Kommentar senden'}
                      </Button>
                      {replyToComment && (
                        <Button 
                          variant="outlined" 
                          onClick={cancelReply}
                        >
                          Abbrechen
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Teilnehmer Tab */}
              {selectedAction?.requiresParticipation && detailTab === 5 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Teilnehmer ({selectedAction.participants.length}/{selectedAction.maxParticipants})</Typography>
                  {selectedAction.participants.length > 0 ? (
                    <List>
                      {selectedAction.participants.map((participant, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {participant.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText primary={participant} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Noch keine Teilnehmer angemeldet.
                    </Typography>
                  )}
                  
                  {user?.role === 'student' && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant={selectedAction.participants.includes(user?.name || 'Aktueller Benutzer') ? 'outlined' : 'contained'}
                        color={selectedAction.participants.includes(user?.name || 'Aktueller Benutzer') ? 'error' : 'primary'}
                        startIcon={selectedAction.participants.includes(user?.name || 'Aktueller Benutzer') ? <PersonIcon /> : <GroupIcon />}
                        onClick={() => handleParticipation(selectedAction.id)}
                        disabled={!selectedAction.participants.includes(user?.name || 'Aktueller Benutzer') && selectedAction.participants.length >= selectedAction.maxParticipants}
                        fullWidth
                      >
                        {selectedAction.participants.includes(user?.name || 'Aktueller Benutzer') ? 'Von Aktion abmelden' : 'Für Aktion anmelden'}
                      </Button>
                      {selectedAction.participants.length >= selectedAction.maxParticipants && !selectedAction.participants.includes(user?.name || 'Aktueller Benutzer') && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                          Maximale Teilnehmerzahl erreicht
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => {
                setDetailDialogOpen(false);
                setDetailTab(0);
              }}>Schließen</Button>
              {(user?.role === 'admin' || user?.role === 'committee') && (
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditAction(selectedAction);
                    setEditDialogOpen(true);
                  }}
                >
                  Bearbeiten
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Neue Aktion Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Neue Aktion erstellen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titel"
                value={newAction.title}
                onChange={(e) => setNewAction({...newAction, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Beschreibung"
                value={newAction.description}
                onChange={(e) => setNewAction({...newAction, description: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Aktionsdatum"
                value={newAction.actionDate}
                onChange={(e) => setNewAction({...newAction, actionDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Budget (€)"
                value={newAction.budget}
                onChange={(e) => setNewAction({...newAction, budget: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Neue Aktion erstellen
              const newActionWithId = {
                ...newAction,
                id: Date.now(),
                budget: parseFloat(newAction.budget) || 0,
                status: calculateActionStatus(newAction.actionDate),
                progress: 0,
                spent: 0,
                tasks: [],
                comments: [],
                documents: [],
                approved: false,
                approvedBy: null,
                approvedDate: null,
                participants: [],
                maxParticipants: 50,
                requiresParticipation: false
              };
              
              // Neue Aktion in Firestore speichern
              const saveAction = async () => {
                try {
                  const collectionPath = dataIsolationService.getActionsCollection();
                  const actionToSave = {
                    ...newActionWithId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  delete actionToSave.id; // ID wird von Firestore generiert
                  
                  const docRef = await addDoc(collection(db, collectionPath), actionToSave);
                  const savedAction = { ...actionToSave, id: docRef.id };
                  
                  // Neue Aktion zur Liste hinzufügen (nur wenn nicht abgeschlossen)
                  if (savedAction.status !== 'abgeschlossen') {
                    setActionsList(prevActions => [savedAction, ...prevActions]);
                  }
                  console.log('Neue Aktion gespeichert:', savedAction);
                } catch (error) {
                  console.error('Fehler beim Speichern der Aktion:', error);
                  // Fallback: Aktion nur lokal hinzufügen
                  if (newActionWithId.status !== 'abgeschlossen') {
                    setActionsList(prevActions => [newActionWithId, ...prevActions]);
                  }
                }
              };
              
              saveAction();
              
              // Dialog schließen und Form zurücksetzen
              setCreateDialogOpen(false);
              setNewAction({
                title: '',
                description: '',
                actionDate: '',
                budget: ''
              });
            }}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bearbeiten Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aktion bearbeiten</DialogTitle>
        <DialogContent>
          {editAction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Titel"
                  value={editAction.title}
                  onChange={(e) => setEditAction({...editAction, title: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Beschreibung"
                  value={editAction.description}
                  onChange={(e) => setEditAction({...editAction, description: e.target.value})}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Aktionsdatum"
                  value={editAction.actionDate}
                  onChange={(e) => setEditAction({...editAction, actionDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Budget (€)"
                  value={editAction.budget}
                  onChange={(e) => setEditAction({...editAction, budget: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editAction.status}
                    onChange={(e) => setEditAction({...editAction, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="geplant">Geplant</MenuItem>
                    <MenuItem value="laufend">Laufend</MenuItem>
                    <MenuItem value="abgeschlossen">Abgeschlossen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Aktion in Firestore aktualisieren
              const updateAction = async () => {
                try {
                  const collectionPath = dataIsolationService.getActionsCollection();
                  const updatedAction = {
                    ...editAction,
                    budget: parseFloat(editAction.budget) || 0,
                    updatedAt: new Date()
                  };
                  
                  // Firestore-Dokument aktualisieren
                  await updateDoc(doc(db, collectionPath, editAction.id), updatedAction);
                  
                  // Aktion in der lokalen Liste aktualisieren
                  setActionsList(prevActions => 
                    prevActions.map(action => 
                      action.id === editAction.id 
                        ? updatedAction
                        : action
                    )
                  );
                  
                  // Auch selectedAction aktualisieren falls es die gleiche Aktion ist
                  if (selectedAction && selectedAction.id === editAction.id) {
                    setSelectedAction(updatedAction);
                  }
                  
                  console.log('Aktion in Firestore gespeichert:', updatedAction);
                } catch (error) {
                  console.error('Fehler beim Speichern der Aktion:', error);
                  // Fallback: Nur lokale Aktualisierung
                  const fallbackAction = { ...editAction, budget: parseFloat(editAction.budget) || 0 };
                  setActionsList(prevActions => 
                    prevActions.map(action => 
                      action.id === editAction.id 
                        ? fallbackAction
                        : action
                    )
                  );
                  
                  if (selectedAction && selectedAction.id === editAction.id) {
                    setSelectedAction(fallbackAction);
                  }
                }
              };
              
              updateAction();
              
              // Dialog schließen
              setEditDialogOpen(false);
              setEditAction(null);
            }}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Beitreten Bestätigungsdialog */}
      <Dialog 
        open={joinDialogOpen} 
        onClose={() => setJoinDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aktion beitreten</DialogTitle>
        <DialogContent>
          {selectedActionForJoin && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Möchten Sie der Aktion "{selectedActionForJoin.title}" beitreten?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedActionForJoin.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Aktuelle Teilnehmer: {selectedActionForJoin.participants.length} / {selectedActionForJoin.maxParticipants}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Abbrechen</Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={confirmJoinAction}
          >
            Beitreten
          </Button>
        </DialogActions>
       </Dialog>
       
       {/* Neue Aufgabe Dialog */}
       <Dialog 
         open={newTaskDialogOpen} 
         onClose={() => {
           setNewTaskDialogOpen(false);
           setNewTask({ title: '', assignee: '' });
         }}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
         <DialogContent>
           <TextField
             autoFocus
             margin="dense"
             label="Aufgaben-Titel"
             fullWidth
             variant="outlined"
             value={newTask.title}
             onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
             sx={{ mb: 2 }}
           />
           <TextField
             margin="dense"
             label="Zugewiesen an"
             fullWidth
             variant="outlined"
             value={newTask.assignee}
             onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
             placeholder="Name des Verantwortlichen"
           />
         </DialogContent>
         <DialogActions>
           <Button onClick={() => {
             setNewTaskDialogOpen(false);
             setNewTask({ title: '', assignee: '' });
           }}>Abbrechen</Button>
           <Button 
             variant="contained"
             color="primary"
             onClick={() => {
               if (newTask.title.trim() && selectedAction) {
                 const taskId = Date.now().toString();
                 const updatedTasks = [...selectedAction.tasks, {
                   id: taskId,
                   title: newTask.title,
                   assignee: newTask.assignee || user?.name || 'Aktueller Benutzer',
                   completed: false
                 }];
                 
                 const updatedAction = { ...selectedAction, tasks: updatedTasks };
                 setSelectedAction(updatedAction);
                 
                 // Actions-State aktualisieren
                 setActions(prevActions => 
                   prevActions.map(action => 
                     action.id === selectedAction.id ? updatedAction : action
                   )
                 );
                 
                 setNewTaskDialogOpen(false);
                 setNewTask({ title: '', assignee: '' });
                 console.log('Neue Aufgabe erstellt:', newTask);
               }
             }}
             disabled={!newTask.title.trim()}
           >
             Erstellen
           </Button>
         </DialogActions>
        </Dialog>
        
        {/* Neue Ausgabe Dialog */}
        <Dialog 
          open={newExpenseDialogOpen} 
          onClose={() => {
            setNewExpenseDialogOpen(false);
            setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Beschreibung"
              fullWidth
              variant="outlined"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Betrag (€)"
              type="number"
              fullWidth
              variant="outlined"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Datum"
              type="date"
              fullWidth
              variant="outlined"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setNewExpenseDialogOpen(false);
              setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
            }}>Abbrechen</Button>
            <Button 
              variant="contained"
              color="primary"
              onClick={() => {
                if (newExpense.description.trim() && newExpense.amount && selectedAction) {
                  const expenseId = Date.now().toString();
                  const expense = {
                    id: expenseId,
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    date: newExpense.date,
                    createdBy: user?.name || 'Aktueller Benutzer'
                  };
                  
                  const updatedExpenses = [...(selectedAction.expenses || []), expense];
                  const newSpent = selectedAction.spent + expense.amount;
                  const updatedAction = { 
                    ...selectedAction, 
                    expenses: updatedExpenses,
                    spent: newSpent
                  };
                  setSelectedAction(updatedAction);
                  
                  // Actions-State aktualisieren
                  setActionsList(prevActions => 
                    prevActions.map(action => 
                      action.id === selectedAction.id ? updatedAction : action
                    )
                  );
                  
                  setNewExpenseDialogOpen(false);
                  setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
                  console.log('Neue Ausgabe erstellt:', expense);
                }
              }}
              disabled={!newExpense.description.trim() || !newExpense.amount}
            >
              Erfassen
            </Button>
          </DialogActions>
         </Dialog>
         
         {/* Dokument Upload Dialog */}
         <Dialog 
           open={uploadDialogOpen} 
           onClose={() => {
             setUploadDialogOpen(false);
             setSelectedFile(null);
           }}
           maxWidth="sm"
           fullWidth
         >
           <DialogTitle>Dokument hochladen</DialogTitle>
           <DialogContent>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
               <input
                 type="file"
                 onChange={(e) => setSelectedFile(e.target.files[0])}
                 style={{ marginBottom: '16px' }}
                 accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
               />
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
           </DialogContent>
           <DialogActions>
             <Button onClick={() => {
               setUploadDialogOpen(false);
               setSelectedFile(null);
             }}>Abbrechen</Button>
             <Button 
               variant="contained"
               color="primary"
               onClick={async () => {
                 if (selectedFile && selectedAction) {
                   try {
                     const documentId = Date.now().toString();
                     const document = {
                       id: documentId,
                       name: selectedFile.name,
                       size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
                       uploadedBy: user?.name || 'Aktueller Benutzer',
                       uploadDate: new Date().toLocaleDateString('de-DE'),
                       uploadedAt: new Date(),
                       url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKERlbW8gRG9rdW1lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTQKJSVFT0Y=' // Base64-encoded minimal PDF
                     };
                     
                     const updatedDocuments = [...(selectedAction.documents || []), document];
                     const updatedAction = { 
                       ...selectedAction, 
                       documents: updatedDocuments,
                       updatedAt: new Date()
                     };
                     
                     // Update in Firestore/localStorage
                     const collectionPath = dataIsolationService.getActionsCollection();
                     await updateDoc(doc(db, collectionPath, selectedAction.id), {
                       documents: updatedDocuments,
                       updatedAt: new Date()
                     });
                     
                     setSelectedAction(updatedAction);
                     
                     // Actions-State aktualisieren
                     setActionsList(prevActions => 
                       prevActions.map(action => 
                         action.id === selectedAction.id ? updatedAction : action
                       )
                     );
                     
                     setUploadDialogOpen(false);
                     setSelectedFile(null);
                     console.log('✅ Dokument hochgeladen und gespeichert:', document);
                   } catch (error) {
                     console.error('❌ Fehler beim Speichern des Dokuments:', error);
                   }
                 }
               }}
               disabled={!selectedFile}
             >
               Hochladen
             </Button>
           </DialogActions>
         </Dialog>

         {/* Report Dialog */}
         <Dialog
           open={reportDialogOpen}
           onClose={() => {
             setReportDialogOpen(false);
             setReportReason('');
             setReportAdditionalInfo('');
             setSelectedCommentForReport(null);
           }}
           maxWidth="sm"
           fullWidth
         >
           <DialogTitle>Kommentar melden</DialogTitle>
           <DialogContent>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
               <Typography variant="body2" color="text.secondary">
                 Warum möchten Sie diesen Kommentar melden?
               </Typography>
               
               <FormControl fullWidth>
                 <InputLabel>Grund der Meldung</InputLabel>
                 <Select
                   value={reportReason}
                   onChange={(e) => setReportReason(e.target.value)}
                   label="Grund der Meldung"
                 >
                   <MenuItem value="spam">Spam</MenuItem>
                   <MenuItem value="harassment">Belästigung</MenuItem>
                   <MenuItem value="inappropriate">Unangemessener Inhalt</MenuItem>
                   <MenuItem value="misinformation">Falschinformation</MenuItem>
                   <MenuItem value="hate_speech">Hassrede</MenuItem>
                   <MenuItem value="other">Sonstiges</MenuItem>
                 </Select>
               </FormControl>
               
               <TextField
                 label="Zusätzliche Informationen (optional)"
                 multiline
                 rows={3}
                 value={reportAdditionalInfo}
                 onChange={(e) => setReportAdditionalInfo(e.target.value)}
                 placeholder="Bitte beschreiben Sie das Problem genauer..."
                 fullWidth
               />
               
               {selectedCommentForReport && (
                 <Box sx={{ 
                   p: 2, 
                   bgcolor: muiTheme.palette.mode === 'dark' ? '#2c2c2e' : 'background.paper', 
                   borderRadius: 1, 
                   border: 1, 
                   borderColor: 'divider' 
                 }}>
                   <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Gemeldeter Kommentar:</Typography>
                   <Typography variant="body2" sx={{ color: muiTheme.palette.mode === 'dark' ? '#ffffff' : 'text.secondary' }}>
                     "{selectedCommentForReport.text}"
                   </Typography>
                   <Typography variant="caption" sx={{ color: muiTheme.palette.mode === 'dark' ? '#cccccc' : 'text.secondary' }}>
                     Von: {selectedCommentForReport.author}
                   </Typography>
                 </Box>
               )}
             </Box>
           </DialogContent>
           <DialogActions>
             <Button onClick={() => {
               setReportDialogOpen(false);
               setReportReason('');
               setReportAdditionalInfo('');
               setSelectedCommentForReport(null);
             }}>
               Abbrechen
             </Button>
             <Button 
               variant="contained"
               color="error"
               onClick={handleReportSubmit}
               disabled={!reportReason}
             >
               Melden
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
};

export default Actions;
