import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  Poll as PollIcon,
  Groups as GraduationCapIcon,
  PersonAdd as PersonAddIcon,
  Tune as TuneIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,

  Notifications,
  TrendingUp,
  AttachMoney,
  Group,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext.jsx';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import YearManagement from '../components/YearManagement';
import AdminCourseManagement from '../components/AdminCourseManagement';
import SurveyManagement from '../components/SurveyManagement';
import yearManagementService from '../services/yearManagementService';
import dataIsolationService from '../services/dataIsolationService';
import { 
  collection, 
  addDoc as mockAddDoc, 
  doc as mockDoc, 
  updateDoc as mockUpdateDoc, 
  serverTimestamp as mockServerTimestamp,
  getDocs,
  deleteDoc,
  query,
  isDemoMode
} from '../services/mockFirestore';
import { 
  collection as firebaseCollection,
  addDoc as firebaseAddDoc,
  doc as firebaseDoc,
  updateDoc as firebaseUpdateDoc,
  serverTimestamp as firebaseServerTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';

const SIDEBAR_WIDTH = 280;

function AdminPanel() {
  const { currentUser, logout, currentYear, createUser } = useAuth();
  const { featureVisibility, setAllFeatureVisibility } = useFeatures();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [reportedMessages, setReportedMessages] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'student', customPassword: '', generatePassword: true });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserPasswordDialog, setShowUserPasswordDialog] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  // Mock data
  const mockUsers = [
    { id: 1, firstName: 'Max', lastName: 'Mustermann', email: `max@rse-abschluss${yearManagementService.getCurrentYear()}.de`, role: 'student', status: 'active' },
    { id: 2, firstName: 'Anna', lastName: 'Schmidt', email: `anna@rse-abschluss${yearManagementService.getCurrentYear()}.de`, role: 'teacher', status: 'active' },
    { id: 3, firstName: 'Tom', lastName: 'Weber', email: `tom@rse-abschluss${yearManagementService.getCurrentYear()}.de`, role: 'student', status: 'inactive' }
  ];

  const mockReportedMessages = [
    { id: 1, content: 'Unangemessene Nachricht...', reporter: 'Anna Schmidt', reported: 'Max Mustermann', timestamp: '2024-01-15 14:30' },
    { id: 2, content: 'Spam-Nachricht...', reporter: 'Tom Weber', reported: 'Lisa Müller', timestamp: '2024-01-15 12:15' }
  ];

  const mockActivityLog = [
    { id: 1, action: 'Benutzer erstellt', user: 'Admin', target: 'Max Mustermann', timestamp: '2024-01-15 10:00' },
    { id: 2, action: 'Nachricht gemeldet', user: 'Anna Schmidt', target: 'Nachricht #123', timestamp: '2024-01-15 09:30' }
  ];

  // Load users from MockFirestore and localStorage
  const loadUsers = async () => {
    try {
      console.log('🔍 AdminPanel: Loading users...');
      
      // Load from MockFirestore
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const firestoreUsers = [];
      
      // Handle MockFirestore response format
      if (usersSnapshot && usersSnapshot.docs) {
        usersSnapshot.docs.forEach((doc) => {
          const userData = doc.data();
          firestoreUsers.push({
            id: doc.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            status: 'active'
          });
        });
      }
      
      // Also load from localStorage as backup
      const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
      const formattedLocalUsers = localStorageUsers.map(user => ({
        id: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: 'active'
      }));
      
      // Combine and deduplicate users
      const allUsers = [...firestoreUsers, ...formattedLocalUsers];
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      // Add mock users if no real users exist
      if (uniqueUsers.length === 0 && hasYearData()) {
        setUsers(mockUsers);
      } else {
        setUsers(uniqueUsers);
      }
      
      console.log('✅ AdminPanel: Loaded users:', uniqueUsers);
    } catch (error) {
      console.error('❌ AdminPanel: Error loading users:', error);
      // Fallback to mock users
      if (hasYearData()) {
        setUsers(mockUsers);
      } else {
        setUsers([]);
      }
    }
  };

  // Load reported messages from localStorage (Mock Firestore)
  const loadReportedMessages = async () => {
    try {
      console.log('🔍 AdminPanel: Loading reported messages...');
      
      // Get data directly from localStorage
      const storedData = localStorage.getItem('mockFirestoreData');
      if (!storedData) {
        console.log('📭 AdminPanel: No data in localStorage');
        setReportedMessages([]);
        return;
      }
      
      const mockData = JSON.parse(storedData);
      const reportsData = mockData.years?.[currentYear]?.reports || [];
      
      console.log(`📊 AdminPanel: Found ${reportsData.length} reports for year ${currentYear}`);
      console.log('📄 AdminPanel: Raw reports data:', reportsData);
      
      const reports = reportsData.map(data => {
        console.log('📄 AdminPanel: Processing report:', data);
        
        // Handle different timestamp formats
        let formattedTimestamp = 'Unbekannt';
        
        if (data.reportedAt) {
          if (typeof data.reportedAt.toDate === 'function') {
            formattedTimestamp = data.reportedAt.toDate().toLocaleString('de-DE');
          } else if (data.reportedAt.seconds) {
            formattedTimestamp = new Date(data.reportedAt.seconds * 1000).toLocaleString('de-DE');
          } else if (data.reportedAt instanceof Date) {
            formattedTimestamp = data.reportedAt.toLocaleString('de-DE');
          } else if (typeof data.reportedAt === 'string') {
            formattedTimestamp = new Date(data.reportedAt).toLocaleString('de-DE');
          }
        }
        
        const mappedReport = {
          id: data.id,
          content: data.commentText || data.messageText || 'Kein Text verfügbar',
          reporter: data.reportedByName || data.reportedBy || 'Unbekannt',
          reported: data.messageSenderName || data.commentAuthor || data.authorName || data.messageSender || 'Unbekannt',
          timestamp: formattedTimestamp,
          reason: data.reason || 'Kein Grund angegeben',
          rawTimestamp: data.reportedAt,
          ...data
        };
        
        // Debug info for development
        console.log('🔍 AdminPanel: Processing report', data.id, '- Reporter:', mappedReport.reporter, '- Reported:', mappedReport.reported, '- Timestamp:', mappedReport.timestamp);
        
        return mappedReport;
      });
      
      // Sort reports by timestamp (newest first)
      reports.sort((a, b) => {
        const timeA = a.rawTimestamp?.seconds || 0;
        const timeB = b.rawTimestamp?.seconds || 0;
        return timeB - timeA;
      });
      
      console.log('✅ AdminPanel: Loaded and sorted reports:', reports);
      setReportedMessages(reports);
    } catch (error) {
      console.error('❌ AdminPanel: Error loading reported messages:', error);
      setReportedMessages([]);
    }
  };

  const loadArchivedReports = () => {
    try {
      const archived = JSON.parse(localStorage.getItem('archivedReports') || '[]');
      console.log('✅ AdminPanel: Loaded archived reports:', archived);
      setArchivedReports(archived);
    } catch (error) {
      console.error('❌ AdminPanel: Error loading archived reports:', error);
      setArchivedReports([]);
    }
  };

  const archiveReport = (report, action) => {
    try {
      const archivedReport = {
        ...report,
        archivedAt: new Date().toISOString(),
        archivedBy: currentUser?.firstName + ' ' + currentUser?.lastName,
        moderationAction: action,
        id: report.id + '_archived_' + Date.now()
      };
      
      const existingArchived = JSON.parse(localStorage.getItem('archivedReports') || '[]');
      const updatedArchived = [archivedReport, ...existingArchived];
      
      localStorage.setItem('archivedReports', JSON.stringify(updatedArchived));
      setArchivedReports(updatedArchived);
      
      console.log('✅ AdminPanel: Report archived:', archivedReport);
    } catch (error) {
      console.error('❌ AdminPanel: Error archiving report:', error);
    }
  };

  // Make archiveReport globally available
  useEffect(() => {
    window.archiveReport = archiveReport;
    return () => {
      delete window.archiveReport;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }
    
    // Initialize data isolation service
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
      dataIsolationService.initializeYearData(currentYear);
      
      // Load real reported messages
      loadReportedMessages();
      
      // Load archived reports
      loadArchivedReports();
    }
    
    // Load real users
    loadUsers();
    
    // Only show mock activity log if year has existing data
    if (hasYearData()) {
      setActivityLog(mockActivityLog);
    } else {
      setActivityLog([]);
    }
    
    setSettings({
      maintenanceMode: false,
      registrationEnabled: true,
      chatEnabled: true,
      notificationsEnabled: true
    });
    setLoading(false);
  }, [currentUser, currentYear]);

  const generateEmail = (firstName, lastName) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@rse-abschluss${yearManagementService.getCurrentYear()}.de`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateUser = async () => {
    try {
      // Generate or use custom password
      const password = newUser.generatePassword ? generatePassword() : newUser.customPassword;
      
      // Generate or use custom email
      const email = newUser.email.trim() || generateEmail(newUser.firstName, newUser.lastName);
      
      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: email,
        role: newUser.role,
        password: password
      };
      
      // Use the createUser function from AuthContext
      const createdUser = await createUser(userData);
      
      // Reload users list to show the new user
      await loadUsers();
      
      setGeneratedPassword(password);
      setCreateUserDialog(false);
      setShowPasswordDialog(true);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'student', customPassword: '', generatePassword: true });
      
      console.log('✅ Benutzer erfolgreich erstellt:', createdUser.uid);
      console.log('✅ E-Mail:', email);
      console.log('✅ Passwort:', newUser.generatePassword ? 'automatisch generiert' : 'benutzerdefiniert');
      console.log('✅ Benutzerliste neu geladen');
    } catch (error) {
      console.error('❌ Fehler beim Erstellen des Benutzers:', error);
      alert('Fehler beim Erstellen des Benutzers: ' + error.message);
    }
  };

  const handleUserClick = async (user) => {
    try {
      console.log('👤 AdminPanel: Loading user details for:', user.id);
      
      // Load user password from localStorage (demo mode)
      const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
      const userWithPassword = localStorageUsers.find(u => u.uid === user.id);
      
      let password = '';
      if (userWithPassword && userWithPassword.password) {
        password = userWithPassword.password;
      } else {
        // Try to get from demo passwords
        const demoPasswords = JSON.parse(localStorage.getItem('demoPasswords') || '{}');
        password = demoPasswords[user.email] || 'Nicht verfügbar';
      }
      
      setSelectedUser(user);
      setUserPassword(password);
      setNewPassword('');
      setShowPassword(false);
      setShowUserPasswordDialog(true);
      
    } catch (error) {
      console.error('❌ AdminPanel: Error loading user details:', error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!newPassword || newPassword.length < 6) {
        alert('Passwort muss mindestens 6 Zeichen lang sein');
        return;
      }
      
      console.log('🔑 AdminPanel: Changing password for user:', selectedUser.id);
      
      // Update password in localStorage
      const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
      const updatedUsers = localStorageUsers.map(user => {
        if (user.uid === selectedUser.id) {
          return { ...user, password: newPassword };
        }
        return user;
      });
      localStorage.setItem('createdUsers', JSON.stringify(updatedUsers));
      
      // Update demo passwords
      const demoPasswords = JSON.parse(localStorage.getItem('demoPasswords') || '{}');
      demoPasswords[selectedUser.email] = newPassword;
      localStorage.setItem('demoPasswords', JSON.stringify(demoPasswords));
      
      setUserPassword(newPassword);
      setNewPassword('');
      console.log('✅ AdminPanel: Password changed successfully');
      
    } catch (error) {
      console.error('❌ AdminPanel: Error changing password:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
    setEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      console.log('📝 AdminPanel: Updating user:', editingUser.id);
      
      // Update in MockFirestore
      const userDocRef = mockDoc(db, 'users', editingUser.id);
      await mockUpdateDoc(userDocRef, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.role,
        displayName: `${editingUser.firstName} ${editingUser.lastName}`,
        updatedAt: new Date().toISOString()
      });
      
      // Update in localStorage backup
      const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
      const updatedUsers = localStorageUsers.map(user => {
        if (user.uid === editingUser.id) {
          return {
            ...user,
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            email: editingUser.email,
            role: editingUser.role,
            displayName: `${editingUser.firstName} ${editingUser.lastName}`
          };
        }
        return user;
      });
      localStorage.setItem('createdUsers', JSON.stringify(updatedUsers));
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editingUser, displayName: `${editingUser.firstName} ${editingUser.lastName}` }
          : user
      ));
      
      setEditUserDialog(false);
      setEditingUser(null);
      console.log('✅ AdminPanel: User updated successfully');
      
    } catch (error) {
      console.error('❌ AdminPanel: Error updating user:', error);
      alert('Fehler beim Aktualisieren des Benutzers: ' + error.message);
    }
  };

  // Handle user deletion with proper cleanup
  const handleDeleteUser = async (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🗑️ DELETE: Starting deletion for user:', user.id, user);
    
    // Confirm deletion
    if (!window.confirm(`Benutzer ${user.firstName} ${user.lastName} wirklich löschen?`)) {
      console.log('🗑️ DELETE: Cancelled by user');
      return;
    }
    
    try {
      const userId = user.id || user.uid;
      console.log('🗑️ DELETE: Using userId:', userId);
      
      // Step 1: Delete from MockFirestore
      try {
        const userDocRef = mockDoc(db, 'users', userId);
        await deleteDoc(userDocRef);
        console.log('✅ DELETE: Removed from MockFirestore');
      } catch (firestoreError) {
        console.warn('⚠️ DELETE: MockFirestore deletion failed:', firestoreError.message);
      }
      
      // Step 2: Remove user from all chat participants
      try {
        console.log('🗑️ DELETE: Removing user from all chats...');
        
        // Get all conversations from MockFirestore
        const conversationsQuery = query(collection(db, dataIsolationService.getChatsCollection()));
        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        const updatePromises = [];
        
        if (conversationsSnapshot.docs) {
          conversationsSnapshot.docs.forEach(async (docSnap) => {
            const conversationData = docSnap.data();
            
            // Check if user is in participants array
            if (conversationData.participants && conversationData.participants.includes(userId)) {
              console.log(`🗑️ DELETE: Removing user from conversation ${docSnap.id}`);
              
              // Remove user from participants array
              const updatedParticipants = conversationData.participants.filter(id => id !== userId);
              
              // Update the conversation
              const conversationRef = mockDoc(db, dataIsolationService.getChatsCollection(), docSnap.id);
              updatePromises.push(
                mockUpdateDoc(conversationRef, {
                  participants: updatedParticipants,
                  updatedAt: new Date().toISOString()
                })
              );
            }
          });
        }
        
        // Wait for all conversation updates to complete
        await Promise.all(updatePromises);
        console.log('✅ DELETE: Removed user from all chat participants');
        
        // Also clean up localStorage mockFirestoreData
        const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
        if (mockData.years && mockData.years[currentYear]) {
          const yearData = mockData.years[currentYear];
          
          // Clean conversations
          Object.keys(yearData).forEach(key => {
            if (key === 'conversations' && Array.isArray(yearData[key])) {
              yearData[key] = yearData[key].map(conversation => {
                if (conversation.participants && conversation.participants.includes(userId)) {
                  return {
                    ...conversation,
                    participants: conversation.participants.filter(id => id !== userId),
                    updatedAt: new Date().toISOString()
                  };
                }
                return conversation;
              });
            }
            // Clean chat collections (conversations/chatId/messages)
            else if (key.startsWith('conversations/') && key.includes('/messages')) {
              // Remove messages from this user
              if (Array.isArray(yearData[key])) {
                yearData[key] = yearData[key].filter(message => message.senderId !== userId);
              }
            }
          });
          
          localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
          console.log('✅ DELETE: Cleaned localStorage chat data');
        }
        
      } catch (chatError) {
        console.warn('⚠️ DELETE: Chat cleanup failed:', chatError.message);
      }
      
      // Step 3: Clean localStorage.createdUsers
      try {
        const createdUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        const filteredUsers = createdUsers.filter(u => u.uid !== userId && u.id !== userId);
        localStorage.setItem('createdUsers', JSON.stringify(filteredUsers));
        console.log('✅ DELETE: Cleaned localStorage.createdUsers');
      } catch (localError) {
        console.warn('⚠️ DELETE: localStorage.createdUsers cleanup failed:', localError.message);
      }
      
      // Step 4: Clean demo passwords
      try {
        const demoPasswords = JSON.parse(localStorage.getItem('demoPasswords') || '{}');
        delete demoPasswords[user.email];
        localStorage.setItem('demoPasswords', JSON.stringify(demoPasswords));
        console.log('✅ DELETE: Cleaned demo passwords');
      } catch (passwordError) {
        console.warn('⚠️ DELETE: Demo password cleanup failed:', passwordError.message);
      }
      
      // Step 5: Update local state immediately
      setUsers(currentUsers => currentUsers.filter(u => u.id !== userId && u.uid !== userId));
      console.log('✅ DELETE: Updated local state');
      
      // Step 6: Reload users to ensure consistency
      setTimeout(() => {
        loadUsers();
        console.log('✅ DELETE: Reloaded users list');
      }, 100);
      
      console.log('🎉 DELETE: User completely removed from system');
      
    } catch (error) {
      console.error('❌ DELETE: Unexpected error:', error);
      alert('Fehler beim Löschen des Benutzers: ' + error.message);
    }
  };

  const handleGenerateNewPassword = () => {
    const generatedPassword = generatePassword();
    setNewPassword(generatedPassword);
  };

  const removeReportFromStorage = (reportId) => {
    try {
      const existingData = localStorage.getItem('mockFirestoreData');
      if (existingData) {
        const mockData = JSON.parse(existingData);
        
        if (mockData.years && mockData.years[currentYear] && mockData.years[currentYear].reports) {
          mockData.years[currentYear].reports = mockData.years[currentYear].reports.filter(
            report => report.id !== reportId
          );
          localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
          console.log('🗑️ Report removed from localStorage:', reportId, 'for year:', currentYear);
        }
      }
    } catch (error) {
      console.error('❌ Error removing report from localStorage:', error);
    }
  };

  const handleApproveReport = (reportId) => {
    console.log('✅ Report approved:', reportId);
    
    // Find the reported message
    const reportedMessage = reportedMessages.find(msg => msg.id === reportId);
    
    // Archive the report before processing
    if (reportedMessage) {
      archiveReport(reportedMessage, 'approved');
    }
    
    // Delete the comment from Actions component if function is available
    if (window.deleteCommentFromActions && reportedMessage?.commentId) {
      console.log('🗑️ Deleting comment from Actions (approved):', reportedMessage.commentId);
      window.deleteCommentFromActions(reportedMessage.commentId);
    }
    
    // Delete the message from Chat component if function is available
    if (window.deleteMessageFromChat && reportedMessage?.messageId) {
      console.log('🗑️ Deleting message from Chat (approved):', reportedMessage.messageId);
      window.deleteMessageFromChat(reportedMessage.messageId);
    }
    
    removeReportFromStorage(reportId);
    setReportedMessages(reportedMessages.filter(msg => msg.id !== reportId));
  };

  const handleWarnReport = async (reportId) => {
    try {
      console.log('⚠️ Warning issued for report:', reportId);
      
      // Find the reported message
      const reportedMessage = reportedMessages.find(msg => msg.id === reportId);
      if (!reportedMessage) {
        console.error('Report not found:', reportId);
        return;
      }
      
      // Archive the report before processing
        archiveReport(reportedMessage, 'warned');
      
      // Create warning notification for the reported user
      // Use messageSender for real reports, reported for mock data
      const targetUserId = reportedMessage.messageSender || reportedMessage.reported;
      console.log('📍 Target user ID for warning:', targetUserId);
      
      const warningData = {
        userId: targetUserId, // The person who was reported
        type: 'warning',
        title: 'Verwarnung erhalten',
        body: `Ihre Nachricht wurde gemeldet und überprüft. Bitte beachten Sie unsere Community-Richtlinien.`,
        priority: 'high',
        createdAt: isDemoMode() ? mockServerTimestamp() : firebaseServerTimestamp(),
        read: false,
        reportId: reportId,
        reason: 'Gemeldeter Inhalt',
        messageContent: reportedMessage.content
      };
      
      // Add notification to database
      console.log('📍 isDemoMode:', isDemoMode());
      console.log('📍 Warning data to save:', warningData);
      
      if (isDemoMode()) {
        console.log('📍 Using mock addDoc');
        const result = await mockAddDoc(collection(db, 'notifications'), warningData);
        console.log('📍 Mock addDoc result:', result);
      } else {
        console.log('📍 Using firebase addDoc');
        await firebaseAddDoc(firebaseCollection(db, 'notifications'), warningData);
      }
      
      // Update report status if it exists in database
      try {
          const reportsCollection = dataIsolationService.getReportsCollection();
          console.log('📍 Using reports collection path:', reportsCollection);
          console.log('📍 Updating report with ID:', reportId);
          
          const updateData = {
            status: 'warned',
            reviewedBy: currentUser?.uid,
            reviewedAt: isDemoMode() ? mockServerTimestamp() : firebaseServerTimestamp(),
            action: 'warn'
          };
          console.log('📍 Report update data:', updateData);
          
          if (isDemoMode()) {
            console.log('📍 Using mock updateDoc for report');
            const result = await mockUpdateDoc(mockDoc(db, 'reports', reportId), updateData);
            console.log('📍 Mock updateDoc result:', result);
          } else {
            console.log('📍 Using firebase updateDoc for report');
            await firebaseUpdateDoc(firebaseDoc(db, 'reports', reportId), updateData);
          }
        } catch (updateError) {
          console.warn('Could not update report status:', updateError);
        }
      
      console.log('✅ Warning notification sent to:', targetUserId);
      
      // Delete the comment from Actions component if function is available
      if (window.deleteCommentFromActions && reportedMessage.commentId) {
        console.log('🗑️ Deleting comment from Actions:', reportedMessage.commentId);
        window.deleteCommentFromActions(reportedMessage.commentId);
      }
      
      // Delete the message from Chat component if function is available
      if (window.deleteMessageFromChat && reportedMessage.messageId) {
        console.log('🗑️ Deleting message from Chat (warned):', reportedMessage.messageId);
        window.deleteMessageFromChat(reportedMessage.messageId);
      }
      
      // Remove from localStorage and local state
      removeReportFromStorage(reportId);
      setReportedMessages(reportedMessages.filter(msg => msg.id !== reportId));
      
    } catch (error) {
      console.error('❌ Error sending warning:', error);
    }
  };

  const handleRejectReport = async (reportId) => {
    try {
      console.log('❌ Report rejected (user blocked):', reportId);
      
      // Find the reported message
      const reportedMessage = reportedMessages.find(msg => msg.id === reportId);
      if (!reportedMessage) {
        console.error('Report not found:', reportId);
        return;
      }
      
      // Archive the report before processing
      archiveReport(reportedMessage, 'rejected');
      
      // Create block notification for the reported user
      // Use messageSender for real reports, reported for mock data
      const targetUserId = reportedMessage.messageSender || reportedMessage.reported;
      console.log('📍 Target user ID for block:', targetUserId);
      
      const blockData = {
        userId: targetUserId, // The person who was reported
        type: 'block',
        title: 'Account gesperrt',
        body: `Ihr Account wurde aufgrund von gemeldeten Inhalten temporär gesperrt. Kontaktieren Sie einen Administrator für weitere Informationen.`,
        priority: 'critical',
        createdAt: isDemoMode() ? mockServerTimestamp() : firebaseServerTimestamp(),
        read: false,
        reportId: reportId,
        reason: 'Schwerwiegender Verstoß',
        messageContent: reportedMessage.content
      };
      
      // Add notification to database
      console.log('📍 Saving block notification for user:', targetUserId);
      
      if (isDemoMode()) {
        await mockAddDoc(collection(db, 'notifications'), blockData);
      } else {
        await firebaseAddDoc(firebaseCollection(db, 'notifications'), blockData);
      }
      
      // Update report status if it exists in database
      try {
        const reportsCollection = dataIsolationService.getReportsCollection();
        console.log('📍 Using reports collection path for block:', reportsCollection);
        
        if (isDemoMode()) {
          await mockUpdateDoc(mockDoc(db, 'reports', reportId), {
            status: 'blocked',
            reviewedBy: currentUser?.uid,
            reviewedAt: mockServerTimestamp(),
            action: 'block'
          });
        } else {
          await firebaseUpdateDoc(firebaseDoc(db, 'reports', reportId), {
            status: 'blocked',
            reviewedBy: currentUser?.uid,
            reviewedAt: firebaseServerTimestamp(),
            action: 'block'
          });
        }
      } catch (updateError) {
        console.warn('Could not update report status:', updateError);
      }
      
      console.log('✅ Block notification sent to:', reportedMessage.reported);
      
      // Delete the comment from Actions component if function is available
      if (window.deleteCommentFromActions && reportedMessage.commentId) {
        console.log('🗑️ Deleting comment from Actions:', reportedMessage.commentId);
        window.deleteCommentFromActions(reportedMessage.commentId);
      }
      
      // Delete the message from Chat component if function is available
      if (window.deleteMessageFromChat && reportedMessage.messageId) {
        console.log('🗑️ Deleting message from Chat (blocked):', reportedMessage.messageId);
        window.deleteMessageFromChat(reportedMessage.messageId);
      }
      
      // Remove from localStorage and local state
      removeReportFromStorage(reportId);
      setReportedMessages(reportedMessages.filter(msg => msg.id !== reportId));
      
    } catch (error) {
      console.error('❌ Error blocking user:', error);
    }
  };

  const handleDenyReport = (reportId) => {
    console.log('=== DENYING REPORT ===');
    console.log('🚫 Report denied:', reportId);
    
    // Find the reported message
    const reportedMessage = reportedMessages.find(msg => msg.id === reportId);
    console.log('Found reported message:', reportedMessage);
    
    // Archive the report before processing
    if (reportedMessage) {
      archiveReport(reportedMessage, 'denied');
    }
    
    // Restore the comment from Actions component if function is available
    if (window.restoreCommentFromActions && reportedMessage?.commentId) {
      console.log('🔄 Restoring comment from Actions (denied):', reportedMessage.commentId);
      console.log('Function available:', typeof window.restoreCommentFromActions);
      window.restoreCommentFromActions(reportedMessage.commentId);
      console.log('✅ Restore function called');
    } else {
      console.log('❌ Cannot restore comment:');
      console.log('- Function available:', !!window.restoreCommentFromActions);
      console.log('- Comment ID:', reportedMessage?.commentId);
    }
    
    // Restore the message from Chat component if function is available
    if (window.restoreMessageFromChat && reportedMessage?.messageId) {
      console.log('🔄 Restoring message from Chat (denied):', reportedMessage.messageId);
      window.restoreMessageFromChat(reportedMessage.messageId);
    }
    
    removeReportFromStorage(reportId);
    setReportedMessages(reportedMessages.filter(msg => msg.id !== reportId));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'users', label: 'Benutzerverwaltung', icon: PeopleIcon },
    { id: 'features', label: 'Funktionsverwaltung', icon: TuneIcon },
    { id: 'moderation', label: 'Moderation', icon: SecurityIcon },
    { id: 'archive', label: 'Moderationsarchiv', icon: ArchiveIcon },
    { id: 'courses', label: 'Kursverwaltung', icon: SchoolIcon },
    { id: 'surveys', label: 'Umfragen', icon: PollIcon },
    { id: 'years', label: 'Jahrgänge', icon: GraduationCapIcon }
  ];

  const getSectionTitle = () => {
    const item = menuItems.find(item => item.id === activeSection);
    return item ? item.label : 'Dashboard';
  };

  const renderDashboard = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1F2937 0%, #374151 100%)'
              : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            color: 'white',
            height: 120
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">{users.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Benutzer</Typography>
                </Box>
                <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: isDarkMode 
              ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
              : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: 'white',
            height: 120
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">{reportedMessages.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Meldungen</Typography>
                </Box>
                <Notifications sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: isDarkMode 
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            height: 120
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">12</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Aktive Projekte</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ 
        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB'
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Neueste Aktivitäten</Typography>
          <List>
            {activityLog.slice(0, 5).map((activity) => (
              <ListItem key={activity.id}>
                <ListItemIcon>
                  <TrendingUp color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={activity.action}
                  secondary={`${activity.user} → ${activity.target} • ${activity.timestamp}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  const renderUserManagement = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant="h5"
          sx={{
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            fontWeight: 600,
            mb: 3
          }}
        >
          Benutzerverwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setCreateUserDialog(true)}
          sx={{
            backgroundColor: isDarkMode ? '#38BDF8' : '#3B82F6',
            '&:hover': {
              backgroundColor: isDarkMode ? '#0EA5E9' : '#2563EB'
            }
          }}
        >
          Neuer Benutzer
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ 
        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>E-Mail</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                onClick={() => handleUserClick(user)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6'
                  }
                }}
              >
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small"
                    color={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small"
                    color={user.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUser(user);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const userId = user.id || user.uid;
                      setUsers(currentUsers => currentUsers.filter(u => u.id !== userId && u.uid !== userId));
                      const createdUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
                      const filteredUsers = createdUsers.filter(u => u.uid !== userId && u.id !== userId);
                      localStorage.setItem('createdUsers', JSON.stringify(filteredUsers));
                      console.log('User deleted immediately:', userId);
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderFeatureManagement = () => (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: isDarkMode ? '#F9FAFB' : '#1F2937',
          fontWeight: 600,
          mb: 3
        }}
      >
        Funktionsverwaltung
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(featureVisibility).map(([feature, isVisible]) => (
          <Grid item xs={12} md={6} lg={4} key={feature}>
            <Card sx={{ 
              backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
              border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
              height: 120
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isVisible}
                        onChange={(e) => setAllFeatureVisibility({ ...featureVisibility, [feature]: e.target.checked })}
                        color="primary"
                      />
                    }
                    label=""
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {isVisible ? 'Für Schüler sichtbar' : 'Für Schüler ausgeblendet'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderModeration = () => (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: isDarkMode ? '#F9FAFB' : '#1F2937',
          fontWeight: 600,
          mb: 3
        }}
      >
        Moderation ({reportedMessages.length} Meldungen)
      </Typography>
      
      {reportedMessages.length === 0 ? (
        <Card sx={{ 
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
          textAlign: 'center',
          py: 4
        }}>
          <CardContent>
            <SecurityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Keine gemeldeten Nachrichten
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alle Nachrichten sind moderiert oder es wurden noch keine Meldungen eingereicht.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {reportedMessages.map((message) => (
            <Grid item xs={12} md={6} key={message.id}>
              <Card sx={{ 
                backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" gutterBottom>Gemeldete Nachricht</Typography>
                    <Chip 
                      label={message.reason} 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" paragraph sx={{ 
                    backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                    p: 2,
                    borderRadius: 1,
                    fontStyle: 'italic'
                  }}>
                    "{message.content}"
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Gemeldet von:</strong> {message.reporter}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Autor der Nachricht:</strong> {message.reported}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Gemeldet am:</strong> {message.timestamp}
                    </Typography>
                  </Box>
                  
                  <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApproveReport(message.id)}
                    >
                      Akzeptieren
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<WarningIcon />}
                      onClick={() => handleWarnReport(message.id)}
                    >
                      Warnen
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<BlockIcon />}
                      onClick={() => handleRejectReport(message.id)}
                    >
                      Sperren
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDenyReport(message.id)}
                    >
                      Ablehnen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderArchive = () => (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: isDarkMode ? '#F9FAFB' : '#1F2937',
          fontWeight: 600,
          mb: 3
        }}
      >
        Moderationsarchiv ({archivedReports.length} Einträge)
      </Typography>
      
      {archivedReports.length === 0 ? (
        <Card sx={{ 
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
          textAlign: 'center',
          py: 4
        }}>
          <CardContent>
            <ArchiveIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Keine archivierten Berichte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bearbeitete Moderationsberichte werden hier archiviert.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {archivedReports.map((report) => (
            <Grid item xs={12} md={6} key={report.id}>
              <Card sx={{ 
                backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" gutterBottom>Archivierter Bericht</Typography>
                    <Chip 
                      label={report.moderationAction} 
                      size="small" 
                      color={report.moderationAction === 'approved' ? 'success' : 
                             report.moderationAction === 'rejected' ? 'error' : 
                             report.moderationAction === 'warned' ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" paragraph sx={{ 
                    backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                    p: 2,
                    borderRadius: 1,
                    fontStyle: 'italic'
                  }}>
                    "{report.content}"
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Ursprünglich gemeldet von:</strong> {report.reporter}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Autor der Nachricht:</strong> {report.reported}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Grund:</strong> {report.reason}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Archiviert von:</strong> {report.archivedBy}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>Archiviert am:</strong> {new Date(report.archivedAt).toLocaleString('de-DE')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderYearManagement = () => (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: isDarkMode ? '#F9FAFB' : '#1F2937',
          fontWeight: 600,
          mb: 3
        }}
      >
        Jahrgangsverwaltung
      </Typography>
      <YearManagement />
    </Box>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUserManagement();
      case 'features': return renderFeatureManagement();
      case 'moderation': return renderModeration();
      case 'archive': return renderArchive();
      case 'years': return renderYearManagement();
      case 'courses': return <AdminCourseManagement />;
      case 'surveys': return <SurveyManagement />;
      default: return renderDashboard();
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">
          Sie haben keine Berechtigung, auf das Admin-Panel zuzugreifen.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Lade Admin-Panel...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
          borderRight: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1200
        }}
      >
        <Box sx={{ p: 3, borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
          <Typography variant="h6" fontWeight="bold" color={isDarkMode ? '#38BDF8' : '#3B82F6'}>
            Admin Panel
          </Typography>
        </Box>
        
        <List sx={{ p: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <ListItem
                key={item.id}
                button
                onClick={() => setActiveSection(item.id)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  backgroundColor: isActive 
                    ? (isDarkMode ? '#374151' : '#EBF4FF')
                    : 'transparent',
                  color: isActive 
                    ? (isDarkMode ? '#38BDF8' : '#3B82F6')
                    : (isDarkMode ? '#D1D5DB' : '#6B7280'),
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive 
                    ? (isDarkMode ? '#38BDF8' : '#3B82F6')
                    : (isDarkMode ? '#9CA3AF' : '#9CA3AF'),
                  minWidth: 40
                }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, marginLeft: `${SIDEBAR_WIDTH}px` }}>
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
            borderBottom: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
            height: 60
          }}
        >
          <Toolbar sx={{ minHeight: '60px !important' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                color: isDarkMode ? '#F9FAFB' : '#1F2937',
                fontWeight: 600
              }}
            >
              {getSectionTitle()}
            </Typography>
            

          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box sx={{ p: 3, backgroundColor: isDarkMode ? '#111827' : '#F9FAFB', minHeight: 'calc(100vh - 60px)' }}>
          {renderContent()}
        </Box>
      </Box>

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onClose={() => setCreateUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            Neuen Benutzer erstellen
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                label="Vorname"
                fullWidth
                variant="outlined"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nachname"
                fullWidth
                variant="outlined"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="E-Mail-Adresse"
                fullWidth
                variant="outlined"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder={newUser.firstName && newUser.lastName ? 
                  `${newUser.firstName.toLowerCase()}.${newUser.lastName.toLowerCase()}@rse-abschluss${yearManagementService.getCurrentYear()}.de` : 
                  'E-Mail-Adresse (optional - wird automatisch generiert)'
                }
                helperText="Leer lassen für automatische Generierung basierend auf Vor- und Nachname"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Rolle</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  label="Rolle"
                >
                  <MenuItem value="student">Schüler</MenuItem>
                  <MenuItem value="committee">Komitee-Mitglied</MenuItem>
                  <MenuItem value="teacher">Lehrer</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newUser.generatePassword}
                    onChange={(e) => setNewUser({ ...newUser, generatePassword: e.target.checked, customPassword: e.target.checked ? '' : newUser.customPassword })}
                  />
                }
                label="Passwort automatisch generieren"
              />
            </Grid>
            {!newUser.generatePassword && (
              <Grid item xs={12}>
                <TextField
                  label="Benutzerdefiniertes Passwort"
                  fullWidth
                  variant="outlined"
                  type="password"
                  value={newUser.customPassword}
                  onChange={(e) => setNewUser({ ...newUser, customPassword: e.target.value })}
                  helperText="Mindestens 6 Zeichen"
                  required={!newUser.generatePassword}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateUserDialog(false);
            setNewUser({ firstName: '', lastName: '', email: '', role: 'student', customPassword: '', generatePassword: true });
          }}>Abbrechen</Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            disabled={!newUser.firstName || !newUser.lastName || (!newUser.generatePassword && (!newUser.customPassword || newUser.customPassword.length < 6))}
            startIcon={<PersonAddIcon />}
          >
            Benutzer erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generated Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
        <DialogTitle>Benutzer erfolgreich erstellt</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Der Benutzer wurde erfolgreich erstellt!
          </Alert>
          <Typography variant="body2" gutterBottom>
            Generiertes Passwort:
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              value={generatedPassword}
              variant="outlined"
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ flexGrow: 1 }}
            />
            <IconButton
              onClick={() => navigator.clipboard.writeText(generatedPassword)}
              size="small"
            >
              <CopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Password Dialog */}
      <Dialog 
        open={showUserPasswordDialog} 
        onClose={() => setShowUserPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <KeyIcon color="primary" />
            Passwort für {selectedUser?.firstName} {selectedUser?.lastName}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              E-Mail: {selectedUser?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Rolle: {selectedUser?.role}
            </Typography>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Aktuelles Passwort:
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
            <TextField
              value={showPassword ? userPassword : '••••••••'}
              variant="outlined"
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ flexGrow: 1 }}
            />
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              size="small"
            >
              {showPassword ? <HideIcon /> : <ViewIcon />}
            </IconButton>
            <IconButton
              onClick={() => navigator.clipboard.writeText(userPassword)}
              size="small"
            >
              <CopyIcon />
            </IconButton>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Neues Passwort (optional):
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              size="small"
              placeholder="Neues Passwort eingeben..."
              helperText="Mindestens 6 Zeichen"
              sx={{ flexGrow: 1 }}
            />
            <Button
              onClick={handleGenerateNewPassword}
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
            >
              Generieren
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserPasswordDialog(false)}>
            Schließen
          </Button>
          {newPassword && (
            <Button 
              onClick={handlePasswordChange}
              variant="contained"
              color="primary"
            >
              Passwort ändern
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon color="primary" />
            Benutzer bearbeiten
          </Box>
        </DialogTitle>
        <DialogContent>
          {editingUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vorname"
                  fullWidth
                  variant="outlined"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nachname"
                  fullWidth
                  variant="outlined"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="E-Mail-Adresse"
                  fullWidth
                  variant="outlined"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Rolle</InputLabel>
                  <Select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    label="Rolle"
                  >
                    <MenuItem value="student">Schüler</MenuItem>
                    <MenuItem value="committee">Komitee-Mitglied</MenuItem>
                    <MenuItem value="teacher">Lehrer</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditUserDialog(false);
            setEditingUser(null);
          }}>Abbrechen</Button>
          <Button 
            onClick={handleUpdateUser}
            variant="contained"
            disabled={!editingUser?.firstName || !editingUser?.lastName || !editingUser?.email}
            startIcon={<EditIcon />}
          >
            Aktualisieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;
