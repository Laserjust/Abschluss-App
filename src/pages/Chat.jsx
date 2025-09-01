import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Drawer,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
  Badge,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Reply as ReplyIcon,
  ContentCopy as CopyIcon,
  Report as ReportIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Block as BlockIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
  PhotoCamera as PhotoCameraIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  GetApp as DownloadIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Backup as BackupIcon,
  RestoreFromTrash as RestoreFromTrashIcon
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { getFirestore as getFirebaseFirestore, collection as firebaseCollection, query as firebaseQuery, where as firebaseWhere, orderBy as firebaseOrderBy, onSnapshot as firebaseOnSnapshot, addDoc as firebaseAddDoc, doc as firebaseDoc, updateDoc as firebaseUpdateDoc, deleteDoc as firebaseDeleteDoc, serverTimestamp as firebaseServerTimestamp, getDocs as firebaseGetDocs, getDoc as firebaseGetDoc } from 'firebase/firestore';
import { isDemoMode, getFirestore as getMockFirestore, collection as mockCollection, query as mockQuery, where as mockWhere, orderBy as mockOrderBy, onSnapshot as mockOnSnapshot, addDoc as mockAddDoc, doc as mockDoc, updateDoc as mockUpdateDoc, deleteDoc as mockDeleteDoc, serverTimestamp as mockServerTimestamp, getDocs as mockGetDocs, getDoc as mockGetDoc } from '../services/mockFirestore';
import NotificationService from '../services/notificationService';
import backupService from '../services/backupService';
import BackupManager from '../components/BackupManager';
import yearManagementService from '../services/yearManagementService';
import dataIsolationService from '../services/dataIsolationService';

// Use mock or real Firestore based on demo mode
const getFirestore = isDemoMode() ? getMockFirestore : getFirebaseFirestore;
const collection = isDemoMode() ? mockCollection : firebaseCollection;
const query = isDemoMode() ? mockQuery : firebaseQuery;
const where = isDemoMode() ? mockWhere : firebaseWhere;
const orderBy = isDemoMode() ? mockOrderBy : firebaseOrderBy;
const onSnapshot = isDemoMode() ? mockOnSnapshot : firebaseOnSnapshot;
const addDoc = isDemoMode() ? mockAddDoc : firebaseAddDoc;
const doc = isDemoMode() ? mockDoc : firebaseDoc;
const updateDoc = isDemoMode() ? mockUpdateDoc : firebaseUpdateDoc;
const deleteDoc = isDemoMode() ? mockDeleteDoc : firebaseDeleteDoc;
const serverTimestamp = isDemoMode() ? mockServerTimestamp : firebaseServerTimestamp;
const getDocs = isDemoMode() ? mockGetDocs : firebaseGetDocs;
const getDoc = isDemoMode() ? mockGetDoc : firebaseGetDoc;

// Database instance
const dbInstance = getFirestore();

function Chat() {
  const { currentUser, currentYear } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0); // 0: Private, 1: Groups, 2: Subject-specific
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  // Menu state management with refs for stability
  // Menu refs and states removed to fix MUI warning
  
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportAdditionalInfo, setReportAdditionalInfo] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [securityAlert, setSecurityAlert] = useState(null);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  // Debug: Monitor userRole changes
  useEffect(() => {
    console.log('userRole changed to:', userRole);
  }, [userRole]);

  // Initialize data isolation service with current year
  useEffect(() => {
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
    }
  }, [currentYear]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState('class');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState(null);
  const [subjectType, setSubjectType] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [chatDeleteDialogOpen, setChatDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deleteAllMessagesDialogOpen, setDeleteAllMessagesDialogOpen] = useState(false);
  
  // Media upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(null); // Track which message is being deleted
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [backupManagerOpen, setBackupManagerOpen] = useState(false);
  const [reportedMessages, setReportedMessages] = useState([]);
  const navigationProcessedRef = useRef(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dbInstance = getFirestore();
  

  
  // Starte automatische Backups
  useEffect(() => {
    backupService.startAutoBackup();
    
    return () => {
      backupService.stopAutoBackup();
    };
  }, []);

  // Report reasons
  const reportReasons = [
    'Spam / Werbung',
    'Beleidigung / Mobbing',
    'Gewalt / Drohung',
    'Unerlaubte Inhalte (z. B. Drogen, Waffen)',
    'Illegale Inhalte (z. B. Missbrauch, Extremismus)'
  ];

  const userRoles = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  };

  // Security and role management
  const checkUserPermissions = (action, targetUser = null) => {
    if (!currentUser || !userRole) return false;
    
    switch (action) {
      case 'send_message':
        // Check if user has valid role and is not blocked by others
        const hasValidRole = userRole && (userRole === userRoles.STUDENT || userRole === userRoles.TEACHER || userRole === userRoles.ADMIN);
        const isNotBlocked = !blockedByUsers.includes(currentUser.uid);
        return hasValidRole && isNotBlocked;
      case 'create_group':
        return userRole === userRoles.TEACHER || userRole === userRoles.ADMIN;
      case 'moderate_chat':
        return userRole === userRoles.ADMIN;
      case 'view_reports':
        return userRole === userRoles.ADMIN;
      case 'block_user':
        return userRole === userRoles.ADMIN;
      case 'delete_any_message':
        return userRole === userRoles.ADMIN;
      case 'delete_own_message':
        return userRole === userRoles.STUDENT || userRole === userRoles.TEACHER || userRole === userRoles.ADMIN;
      case 'delete_all_messages':
        return userRole === userRoles.ADMIN;
      default:
        return false;
    }
  };
  
  const isUserBlocked = (userId) => {
    return blockedUsers.includes(userId);
  };
  
  const validateMessage = (message) => {
    if (!message || typeof message !== 'string') return false;
    const trimmed = message.trim();
    if (!trimmed || trimmed.length === 0) return false;
    if (trimmed.length > 1000) return false; // Character limit
    // Check for potentially harmful content
    if (/<script[^>]*>.*?<\/script>/gi.test(trimmed)) return false;
    return true;
  };
  
  const validateUserData = (userData) => {
    if (!userData || typeof userData !== 'object') return false;
    // Support both uid (Firebase) and id (AdminPanel) formats
    const userId = userData.uid || userData.id;
    if (!userId || typeof userId !== 'string') return false;
    if (!userData.displayName && !userData.email && !userData.firstName && !userData.lastName) return false;
    return true;
  };
  
  const validateConversationData = (conversationData) => {
    if (!conversationData || typeof conversationData !== 'object') return false;
    if (!conversationData.type || !['private', 'group', 'subject'].includes(conversationData.type)) return false;
    if (!conversationData.participants || !Array.isArray(conversationData.participants)) return false;
    if (conversationData.participants.length === 0) return false;
    
    // Validate participants are valid user IDs
    for (const participant of conversationData.participants) {
      if (!participant || typeof participant !== 'string') return false;
    }
    
    // Type-specific validation
    if (conversationData.type === 'group') {
      if (!conversationData.name || typeof conversationData.name !== 'string' || conversationData.name.trim().length === 0) return false;
      if (conversationData.participants.length < 2) return false;
    }
    
    if (conversationData.type === 'private') {
      if (conversationData.participants.length !== 2) return false;
    }
    
    return true;
  };
  
  const sanitizeMessageText = (text) => {
    if (!text || typeof text !== 'string') return '';
    // Remove potentially harmful content
    return text
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 1000); // Limit length
  };
  
  const validateAndSanitizeGroupData = (groupData) => {
    if (!groupData || typeof groupData !== 'object') return null;
    
    const sanitized = {
      name: groupData.name && typeof groupData.name === 'string' ? groupData.name.trim().substring(0, 100) : '',
      description: groupData.description && typeof groupData.description === 'string' ? groupData.description.trim().substring(0, 500) : '',
      groupType: groupData.groupType && ['class', 'project', 'study', 'other'].includes(groupData.groupType) ? groupData.groupType : 'other',
      participants: Array.isArray(groupData.participants) ? groupData.participants.filter(p => p && typeof p === 'string') : []
    };
    
    if (!sanitized.name || sanitized.participants.length === 0) return null;
    return sanitized;
  };

  // Note: Individual message reports do not affect chat accessibility

  // Fetch user role and security settings
  // Check for subject-specific chat from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const type = urlParams.get('type');
    const course = urlParams.get('course');
    const courseName = urlParams.get('courseName');
    
    if (subject && type) {
      setSubjectFilter(subject);
      setSubjectType(type);
      setActiveTab(2); // Switch to subject-specific tab
      
      // Create or find subject-specific conversation
      createSubjectChat(subject, type);
    } else if (course && courseName) {
      // Handle course-specific chat
      setSubjectFilter(courseName);
      setSubjectType('course');
      setActiveTab(2); // Switch to subject-specific tab
      
      // Create or find course-specific conversation
      createCourseChat(course, courseName);
    }
  }, []);
  
  // Initialize NotificationService
  useEffect(() => {
    const initializeNotifications = async () => {
      if (!currentUser || isDemoMode()) return;
      
      try {
        await NotificationService.initialize();
        const token = await NotificationService.getToken();
        
        if (token) {
          // Save FCM token to user document
          await updateDoc(doc(dbInstance, 'users', currentUser.uid), {
            fcmToken: token,
            lastTokenUpdate: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    initializeNotifications();
  }, [currentUser]);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      console.log('fetchUserRole called with currentUser:', currentUser);
      if (!currentUser) {
        console.log('No currentUser in fetchUserRole');
        return;
      }
      
      // Check if role is already available in currentUser (demo mode)
      if (currentUser.role) {
        console.log('Setting userRole from currentUser.role:', currentUser.role);
        setUserRole(currentUser.role);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(dbInstance, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || userRoles.STUDENT;
          console.log('Setting userRole from Firestore:', role);
          setUserRole(role);
          setNotificationSettings(userData.notificationSettings || {});
          
          // Check if user is blocked
          if (userData.isBlocked) {
            setSecurityAlert('Ihr Account wurde gesperrt. Kontaktieren Sie einen Administrator.');
          }
        } else {
          // Default to student role if no user document exists
          console.log('No user document found, setting default role:', userRoles.STUDENT);
          setUserRole(userRoles.STUDENT);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Default to student role in demo mode
        console.log('Error occurred, setting default role:', userRoles.STUDENT);
        setUserRole(userRoles.STUDENT);
      }
    };
    
    const fetchBlockedUsers = async () => {
      if (!currentUser) return;
      
      try {
        const blockedQuery = query(
          collection(dbInstance, 'blockedUsers'),
          where('blockedBy', '==', currentUser.uid)
        );
        
        const unsubscribe = onSnapshot(blockedQuery, (snapshot) => {
          const blocked = snapshot.docs.map(doc => doc.data().blockedUser);
          setBlockedUsers(blocked);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      }
    };
    
    const fetchBlockedByUsers = async () => {
      if (!currentUser) return;
      
      try {
        const blockedUsersQuery = query(
        collection(dbInstance, 'blockedUsers'),
          where('blockedUser', '==', currentUser.uid)
        );
        
        const unsubscribe = onSnapshot(blockedUsersQuery, (snapshot) => {
          const blockedBy = snapshot.docs.map(doc => doc.data().blockedBy);
          setBlockedByUsers(blockedBy);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching users who blocked current user:', error);
      }
    };
    
    const fetchReportedMessages = async () => {
    if (!currentUser) return;
    
    try {
      // Check if we're in demo mode (using localStorage)
      const isDemoMode = () => {
        const testUser = localStorage.getItem('testUser');
        const isDemoConfig = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return !!testUser || isDemoConfig;
      };
      
      if (isDemoMode()) {
        // Load reported messages from localStorage (mock data)
        console.log('🔍 Chat: Loading reported messages from localStorage...');
        
        const storedData = localStorage.getItem('mockFirestoreData');
        if (storedData) {
          const mockData = JSON.parse(storedData);
          const currentYear = new Date().getFullYear();
          const reportsData = mockData.years?.[currentYear]?.reports || [];
          
          console.log(`📊 Chat: Found ${reportsData.length} reports for year ${currentYear}`);
          
          // Extract message IDs from reports
          const reportedMessageIds = reportsData
            .filter(report => report.reportType === 'message' && report.messageId)
            .map(report => report.messageId);
          
          console.log('📄 Chat: Reported message IDs:', reportedMessageIds);
          setReportedMessages(reportedMessageIds);
          
          // Set up periodic check for changes in localStorage
          const interval = setInterval(() => {
            const updatedData = localStorage.getItem('mockFirestoreData');
            if (updatedData) {
              const updatedMockData = JSON.parse(updatedData);
              const updatedReports = updatedMockData.years?.[currentYear]?.reports || [];
              const updatedMessageIds = updatedReports
                .filter(report => report.reportType === 'message' && report.messageId)
                .map(report => report.messageId);
              setReportedMessages(updatedMessageIds);
            }
          }, 1000);
          
          return () => clearInterval(interval);
        } else {
          console.log('📭 Chat: No mock data found in localStorage');
          setReportedMessages([]);
        }
      } else {
        // Use real Firestore
        const reportsQuery = query(
          collection(dbInstance, 'reports'),
          where('reportType', '==', 'message')
        );
        
        const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
          const reportedMessageIds = snapshot.docs.map(doc => doc.data().messageId).filter(Boolean);
          setReportedMessages(reportedMessageIds);
        });
        
        return unsubscribe;
      }
    } catch (error) {
      console.error('Error fetching reported messages:', error);
      // Fallback to empty array
      setReportedMessages([]);
    }
  };
    
    fetchUserRole();
    fetchBlockedUsers();
    fetchBlockedByUsers();
    fetchReportedMessages();
  }, [currentUser, dbInstance]);

  // Handle navigation from Members page
  useEffect(() => {
    if (location.state?.startPrivateChat && location.state?.targetUser && !isCreatingChat && !navigationProcessedRef.current) {
      const targetUser = location.state.targetUser;
      
      // Mark navigation as processed
      navigationProcessedRef.current = true;
      
      // Set active tab to private chats
      setActiveTab(0);
      
      // Start private chat with the target user
      createPrivateChat(targetUser);
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
      
      // Reset the flag after a short delay
      setTimeout(() => {
        navigationProcessedRef.current = false;
      }, 1000);
    }
  }, [location.state, isCreatingChat]);

  // Handle navigation from Admin panel (report details)
  useEffect(() => {
    if (location.state?.selectedConversationId && !navigationProcessedRef.current) {
      const conversationId = location.state.selectedConversationId;
      
      // Mark navigation as processed
      navigationProcessedRef.current = true;
      
      // Function to find and select the conversation
      const findAndSelectConversation = () => {
        const targetConversation = conversations.find(conv => conv.id === conversationId);
        
        if (targetConversation) {
          // Set the appropriate tab based on conversation type
          if (targetConversation.type === 'private') {
            setActiveTab(0);
          } else if (targetConversation.type === 'group') {
            setActiveTab(1);
          } else if (targetConversation.type === 'subject') {
            setActiveTab(2);
          }
          
          // Select the conversation
          setSelectedConversation(targetConversation);
          
          // Clear the navigation state
          window.history.replaceState({}, document.title);
          
          return true; // Found and selected
        }
        return false; // Not found yet
      };
      
      // Try to find the conversation immediately
      if (!findAndSelectConversation() && conversations.length === 0) {
        // If not found and conversations are still loading, wait for them
        const checkInterval = setInterval(() => {
          if (findAndSelectConversation()) {
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Clear interval after 5 seconds to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 5000);
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        navigationProcessedRef.current = false;
      }, 1000);
    }
  }, [location.state, conversations]);

  // Note: Chats remain accessible even if individual messages are reported
  // Only entire chat reports would prevent access (not implemented in current logic)

  useEffect(() => {
    let unsubscribe = null;
    
    const fetchConversations = async () => {
      console.log('fetchConversations called', { currentUser: currentUser?.uid, activeTab, securityAlert });
      if (!currentUser) {
        console.log('No current user, returning');
        setLoading(false);
        return;
      }
      
      // Security check
      if (securityAlert) {
        console.log('Security alert present, returning');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        let conversationsQuery;
        
        if (activeTab === 0) {
          // Private conversations
          conversationsQuery = query(
            collection(dbInstance, dataIsolationService.getChatsCollection()),
            where('type', '==', 'private'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('lastMessageAt', 'desc')
          );
        } else if (activeTab === 1) {
          // Group conversations
          conversationsQuery = query(
            collection(dbInstance, dataIsolationService.getChatsCollection()),
            where('type', '==', 'group'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('lastMessageAt', 'desc')
          );
        } else {
          // Subject-specific conversations (public forums)
          conversationsQuery = query(
            collection(dbInstance, dataIsolationService.getChatsCollection()),
            where('type', '==', 'subject'),
            orderBy('lastMessageAt', 'desc')
          );
        }
        
        unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
          const conversationsData = [];
          
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            let conversationData = {
              id: docSnap.id,
              ...data
            };
            
            // For private chats, get the other participant's info
            if (data.type === 'private') {
              const otherParticipantId = data.participants.find(id => id !== currentUser.uid);
              if (otherParticipantId && !isUserBlocked(otherParticipantId)) {
                try {
                  const userDoc = await getDoc(doc(dbInstance, 'users', otherParticipantId));
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    conversationData.displayName = userData.displayName || 
                      (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.email);
                    conversationData.photoURL = userData.photoURL;
                  }
                } catch (error) {
                  console.error('Error fetching user data:', error);
                }
              } else if (isUserBlocked(otherParticipantId)) {
                // Skip blocked users
                continue;
              }
            }
            
            conversationsData.push(conversationData);
          }
          
          setConversations(conversationsData);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching conversations:', error);
        console.log('Using mock conversations for activeTab:', activeTab);
        setLoading(false);
        
        // Mock data for demo
        let mockConversations = [];
        
        if (activeTab === 0) {
          // Private chats
          mockConversations = [
            {
              id: 'private1',
              type: 'private',
              displayName: 'Max Mustermann',
              lastMessage: 'Hey, wie geht es dir?',
              lastMessageAt: new Date().toISOString(),
              participants: [currentUser.uid, 'user2']
            },
            {
              id: 'private2',
              type: 'private',
              displayName: 'Anna Schmidt',
              lastMessage: 'Danke für die Hilfe!',
              lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
              participants: [currentUser.uid, 'user3']
            },
            {
              id: 'private3',
              type: 'private',
              displayName: 'Tom Weber',
              lastMessage: 'Bis morgen!',
              lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
              participants: [currentUser.uid, 'user4']
            }
          ];
        } else if (activeTab === 1) {
          // Group chats
          mockConversations = [
            {
              id: 'group1',
              type: 'group',
              name: 'Klasse 12A',
              lastMessage: 'Wann ist die nächste Prüfung?',
              lastMessageAt: new Date().toISOString(),
              participants: [currentUser.uid, 'user2', 'user3', 'user4']
            },
            {
              id: 'group2',
              type: 'group',
              name: 'Mathe-LK',
              lastMessage: 'Hausaufgaben für morgen nicht vergessen!',
              lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
              participants: [currentUser.uid, 'user5', 'user6']
            },
            {
              id: 'group3',
              type: 'group',
              name: 'Projektgruppe Website',
              lastMessage: 'Meeting um 15 Uhr im Computerraum',
              lastMessageAt: new Date(Date.now() - 10800000).toISOString(),
              participants: [currentUser.uid, 'user7', 'user8', 'user9']
            }
          ];
        } else {
          // Subject-specific chats (public forums)
          mockConversations = [
            {
              id: 'subject1',
              type: 'subject',
              name: `Mathematik - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              displayName: `Mathematik - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              subjectName: 'Mathematik',
              subjectType: `Jahrgang 20${yearManagementService.getCurrentYear()}`,
              lastMessage: 'Kann mir jemand bei Aufgabe 5 helfen?',
              lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
              participants: [] // Public, all users can participate
            },
            {
              id: 'subject2',
              type: 'subject',
              name: `Englisch - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              displayName: `Englisch - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              subjectName: 'Englisch',
              subjectType: `Jahrgang 20${yearManagementService.getCurrentYear()}`,
              lastMessage: 'Wer hat das Buch "To Kill a Mockingbird" gelesen?',
              lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
              participants: []
            },
            {
              id: 'subject3',
              type: 'subject',
              name: `Physik - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              displayName: `Physik - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              subjectName: 'Physik',
              subjectType: `Jahrgang 20${yearManagementService.getCurrentYear()}`,
              lastMessage: 'Experiment zur Lichtbrechung war interessant!',
              lastMessageAt: new Date(Date.now() - 5400000).toISOString(),
              participants: []
            },
            {
              id: 'subject4',
              type: 'subject',
              name: `Geschichte - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              displayName: `Geschichte - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              subjectName: 'Geschichte',
              subjectType: `Jahrgang 20${yearManagementService.getCurrentYear()}`,
              lastMessage: 'Diskussion über den Ersten Weltkrieg',
              lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
              participants: []
            },
            {
              id: 'subject5',
              type: 'subject',
              name: `Biologie - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              displayName: `Biologie - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              subjectName: 'Biologie',
              subjectType: `Jahrgang 20${yearManagementService.getCurrentYear()}`,
              lastMessage: 'Zellteilung verstehen - Tipps?',
              lastMessageAt: new Date(Date.now() - 9000000).toISOString(),
              participants: []
            },
            {
              id: 'subject6',
              type: 'subject',
              name: `Informatik - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              displayName: `Informatik - Jahrgang 20${yearManagementService.getCurrentYear()}`,
              subjectName: 'Informatik',
              subjectType: `Jahrgang 20${yearManagementService.getCurrentYear()}`,
              lastMessage: 'Python oder Java für Anfänger?',
              lastMessageAt: new Date(Date.now() - 10800000).toISOString(),
              participants: []
            }
          ];
        }
        
        console.log('Setting mock conversations:', mockConversations.length, mockConversations);
        setConversations(mockConversations);
      }
    };

    fetchConversations();
    
    // Cleanup function to unsubscribe from listeners
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dbInstance, currentUser, activeTab, securityAlert]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    
    let unsubscribe = null;
    
    const fetchMessages = async () => {
      console.log('fetchMessages called for conversation:', selectedConversation?.id);
      try {
        const messagesQuery = query(
          collection(dbInstance, dataIsolationService.getMessagesCollection(selectedConversation.id)),
          orderBy('createdAt', 'asc')
        );
        
        unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || new Date()).toISOString ? (doc.data().createdAt || new Date()).toISOString() : new Date().toISOString()
          }));
          
          console.log('=== CHAT MESSAGE DEBUG ===');
          console.log('Messages loaded from Firestore:', messagesData.length);
          console.log('Message IDs:', messagesData.map(m => m.id));
          console.log('Message texts:', messagesData.map(m => m.text?.substring(0, 50) + '...'));
          console.log('Reported messages:', reportedMessages);
          
          // Check if a message that was being deleted is no longer in the list
          if (isDeletingMessage) {
            const messageStillExists = messagesData.some(msg => msg.id === isDeletingMessage);
            if (!messageStillExists) {
              console.log('Message successfully deleted from UI, clearing loading state');
              setIsDeletingMessage(null);
            }
          }
          
          setMessages(messagesData);
        });
        
      } catch (error) {
        console.error('Error fetching messages:', error);
        console.log('No messages found for conversation:', selectedConversation?.id);
        // Set empty messages array for new chats
        setMessages([]);
      }
    };

    fetchMessages();
    
    // Cleanup function to unsubscribe from messages listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dbInstance, selectedConversation, currentUser]);

  // Load participants when dialog opens or conversation changes
  useEffect(() => {
    if (participantsDialogOpen && selectedConversation) {
      fetchParticipants(selectedConversation);
    }
  }, [participantsDialogOpen, selectedConversation]);

  // Removed automatic scrolling to bottom when messages change

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    // Security checks
    if (!checkUserPermissions('send_message')) {
      setSnackbar({
        open: true,
        message: 'Sie haben keine Berechtigung, Nachrichten zu senden.',
        severity: 'error'
      });
      return;
    }
    
    if (!validateMessage(newMessage)) {
      setSnackbar({
        open: true,
        message: 'Nachricht ist zu lang oder ungültig (max. 1000 Zeichen).',
        severity: 'warning'
      });
      return;
    }
    
    const messageText = sanitizeMessageText(newMessage);
    
    // Validate sanitized message
    if (!validateMessage(messageText)) {
      setSnackbar({
        open: true,
        message: 'Nachricht konnte nicht verarbeitet werden.',
        severity: 'error'
      });
      return;
    }
    
    // Store reply info before clearing
    const currentReplyTo = replyTo;
    
    // Clear input immediately for better UX
    setNewMessage('');
    setReplyTo(null);
    
    // Store message locally as backup
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pendingMessage = {
      id: tempId,
      text: messageText,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      conversationId: selectedConversation.id,
      replyTo: currentReplyTo,
      timestamp: Date.now()
    };
    
    const pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
    pendingMessages.push(pendingMessage);
    localStorage.setItem('pendingMessages', JSON.stringify(pendingMessages));
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log('=== SEND MESSAGE DEBUG ===');
        console.log('Attempting to send message:', messageText);
        console.log('Selected conversation:', selectedConversation);
        console.log('Current user:', currentUser);
        console.log('DB instance:', dbInstance);
        console.log('Messages collection path:', dataIsolationService.getMessagesCollection(selectedConversation.id));
        
        const messageData = {
          text: messageText,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          createdAt: serverTimestamp(),
          replyTo: currentReplyTo,
          reported: false,
          edited: false
        };
        
        console.log('Message data to send:', messageData);
        
        // Add message to conversation
        console.log('Calling addDoc...');
        const docRef = await addDoc(collection(dbInstance, dataIsolationService.getMessagesCollection(selectedConversation.id)), messageData);
        console.log('addDoc successful, docRef:', docRef);
        
        // Update conversation's last message
        await updateDoc(doc(dbInstance, dataIsolationService.getChatsCollection(), selectedConversation.id), {
          lastMessage: messageText,
          lastMessageAt: serverTimestamp(),
          lastMessageSender: currentUser.uid
        });
        
        // Remove from pending messages
        const updatedPending = pendingMessages.filter(msg => msg.id !== tempId);
        localStorage.setItem('pendingMessages', JSON.stringify(updatedPending));
        
        // Send notifications to other participants
        await sendNotifications(selectedConversation, messageText);
        
        console.log('=== MESSAGE SENT SUCCESSFULLY ===');
        console.log('Nachricht erfolgreich gespeichert:', docRef.id);
        break;
        
      } catch (error) {
        retryCount++;
        console.error('=== MESSAGE SEND ERROR ===');
        console.error(`Nachricht-Speicherversuch ${retryCount} fehlgeschlagen:`, error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (retryCount >= maxRetries) {
          setSnackbar({
            open: true,
            message: 'Nachricht konnte nicht gesendet werden. Sie wird lokal gespeichert und später synchronisiert.',
            severity: 'warning'
          });
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  };
  
  const sendNotifications = async (conversation, messageText) => {
    try {
      const participants = (conversation.participants || []).filter(id => id !== currentUser.uid);
      
      for (const participantId of participants) {
        // Check notification settings for each participant
        const userDoc = await getDoc(doc(dbInstance, 'users', participantId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const settings = userData.notificationSettings || {};
          
          if (settings[conversation.id] !== false) { // Default to enabled
            // Create in-app notification
            await addDoc(collection(dbInstance, 'notifications'), {
              userId: participantId,
              type: 'message',
              title: conversation.type === 'private' 
                ? `Neue Nachricht von ${currentUser.displayName}`
                : `Neue Nachricht in ${conversation.name}`,
              body: messageText.length > 50 
                ? `${messageText.substring(0, 50)}...` 
                : messageText,
              conversationId: conversation.id,
              senderId: currentUser.uid,
              createdAt: serverTimestamp(),
              read: false
            });
            
            // Send push notification if enabled
            if (settings.pushNotifications !== false && userData.fcmToken) {
              try {
                await NotificationService.sendPushNotification({
                  token: userData.fcmToken,
                  title: conversation.type === 'private' 
                    ? `Neue Nachricht von ${currentUser.displayName}`
                    : `Neue Nachricht in ${conversation.name}`,
                  body: messageText.length > 50 
                    ? `${messageText.substring(0, 50)}...` 
                    : messageText,
                  data: {
                    type: 'message',
                    conversationId: conversation.id,
                    senderId: currentUser.uid
                  }
                });
              } catch (pushError) {
                console.error('Error sending push notification:', pushError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSwipe = (message) => {
    setReplyTo({
      id: message.id,
      text: message.text,
      senderName: message.senderName
    });
  };

  // Menu functions removed to fix MUI warning

  const handleReply = () => {
    if (selectedMessage) {
      setReplyTo({
        id: selectedMessage.id,
        text: selectedMessage.text,
        senderName: selectedMessage.senderName
      });
    }
    // handleMessageMenuClose removed to fix MUI anchorEl warning
  };

  const handleCopy = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.text);
    }
    // handleMessageMenuClose removed to fix MUI anchorEl warning
  };

  const handleReport = () => {
    // handleMessageMenuClose removed to fix MUI anchorEl warning
    setReportDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setEditedText(selectedMessage.text);
    }
    // handleMessageMenuClose removed to fix MUI anchorEl warning
  };

  const handleDelete = () => {
    if (selectedMessage) {
      setMessageToDelete(selectedMessage);
      setDeleteDialogOpen(true);
    }
    // handleMessageMenuClose removed to fix MUI anchorEl warning
  };

  const handleDeleteAllMessages = () => {
    if (!checkUserPermissions('delete_all_messages')) {
      setSnackbar({
        open: true,
        message: 'Sie haben keine Berechtigung, alle Nachrichten zu löschen.',
        severity: 'error'
      });
      return;
    }
    setDeleteAllMessagesDialogOpen(true);
  };

  const canDeleteMessage = (message) => {
    console.log('🔍 canDeleteMessage - VEREINFACHTE VERSION');
    console.log('message:', message);
    console.log('currentUser:', currentUser);
    
    // Vereinfachte Prüfung: Jeder eingeloggte Benutzer kann löschen (zum Testen)
    if (currentUser) {
      console.log('✅ Benutzer ist eingeloggt - Löschen erlaubt (TEST-MODUS)');
      return true;
    }
    
    console.log('❌ Kein Benutzer eingeloggt');
    return false;
  };

  const saveEditedMessage = async () => {
    if (!editingMessage || !editedText.trim()) return;
    
    try {
      const messageRef = doc(dbInstance, 'conversations', selectedConversation.id, 'messages', editingMessage.id);
      await updateDoc(messageRef, {
        text: editedText.trim(),
        edited: true,
        editedAt: serverTimestamp()
      });
      
      setSnackbar({
        open: true,
        message: 'Nachricht bearbeitet.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error editing message:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Bearbeiten der Nachricht.',
        severity: 'error'
      });
    }
    
    setEditingMessage(null);
    setEditedText('');
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditedText('');
  };

  const confirmDelete = async () => {
    console.log('confirmDelete called with messageToDelete:', messageToDelete);
    if (!messageToDelete) {
      console.log('No message to delete');
      return;
    }
    
    // Check permissions before deleting
    if (!canDeleteMessage(messageToDelete)) {
      setSnackbar({
        open: true,
        message: 'Sie haben keine Berechtigung, diese Nachricht zu löschen.',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      return;
    }
    
    try {
      console.log('Attempting to delete message:', messageToDelete.id);
      const messageRef = doc(dbInstance, 'conversations', selectedConversation.id, 'messages', messageToDelete.id);
      await deleteDoc(messageRef);
      console.log('Message deleted successfully');
      
      setSnackbar({
        open: true,
        message: 'Nachricht gelöscht.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Löschen der Nachricht.',
        severity: 'error'
      });
    }
    
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const confirmDeleteAllMessages = async () => {
    if (!checkUserPermissions('delete_all_messages')) {
      setSnackbar({
        open: true,
        message: 'Sie haben keine Berechtigung, alle Nachrichten zu löschen.',
        severity: 'error'
      });
      setDeleteAllMessagesDialogOpen(false);
      return;
    }

    if (!selectedConversation) {
      setSnackbar({
        open: true,
        message: 'Keine Konversation ausgewählt.',
        severity: 'error'
      });
      setDeleteAllMessagesDialogOpen(false);
      return;
    }

    try {
      // Get all messages in the current conversation
      const messagesQuery = query(
        collection(dbInstance, 'conversations', selectedConversation.id, 'messages')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(messageDoc.ref)
      );

      await Promise.all(deletePromises);

      setSnackbar({
        open: true,
        message: `${messagesSnapshot.docs.length} Nachrichten erfolgreich gelöscht.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting all messages:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Löschen der Nachrichten.',
        severity: 'error'
      });
    }

    setDeleteAllMessagesDialogOpen(false);
  };

  const confirmChatDelete = async () => {
    if (!chatToDelete) {
      console.error('No chat selected for deletion');
      return;
    }
    
    console.log('Deleting chat:', chatToDelete);
    console.log('Using db instance:', dbInstance);
    
    try {
      // Create document reference
      const docRef = doc(dbInstance, 'conversations', chatToDelete.id);
      console.log('Document reference created:', docRef);
      
      // Delete the conversation document
      await deleteDoc(docRef);
      console.log('Conversation document deleted successfully');
      
      // Delete all messages in the conversation
      const messagesQuery = query(
        collection(dbInstance, 'conversations', chatToDelete.id, 'messages')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      console.log('Messages found:', messagesSnapshot.docs.length);
      
      // Delete each message
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(messageDoc.ref)
      );
      await Promise.all(deletePromises);
      console.log('All messages deleted successfully');
      
      // Clear selected conversation if it was the deleted one
      if (selectedConversation?.id === chatToDelete.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      setSnackbar({
        open: true,
        message: 'Chat wurde erfolgreich gelöscht.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        chatToDelete,
        db: dbInstance
      });
      setSnackbar({
        open: true,
        message: `Fehler beim Löschen des Chats: ${error.message}`,
        severity: 'error'
      });
    }
    
    setChatDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  // Emoji Reaction Handlers removed to fix MUI warning

  const handleEmojiSelect = async (emoji) => {
    if (!selectedMessageForReaction) return;
    
    try {
      const messageRef = doc(dbInstance, 'conversations', selectedConversation.id, 'messages', selectedMessageForReaction.id);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        const reactions = messageData.reactions || {};
        
        if (reactions[emoji]) {
          // Toggle reaction
          if (reactions[emoji].includes(currentUser.uid)) {
            reactions[emoji] = reactions[emoji].filter(uid => uid !== currentUser.uid);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].push(currentUser.uid);
          }
        } else {
          // Add new reaction
          reactions[emoji] = [currentUser.uid];
        }
        
        await updateDoc(messageRef, { reactions });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Hinzufügen der Reaktion.',
        severity: 'error'
      });
    }
    
    // handleReactionMenuClose() call removed - menu component was deleted
  };

  const handleReactionToggle = async (messageId, emoji) => {
    try {
      const messageRef = doc(dbInstance, 'conversations', selectedConversation.id, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        const reactions = messageData.reactions || {};
        
        if (reactions[emoji]) {
          // Toggle reaction
          if (reactions[emoji].includes(currentUser.uid)) {
            reactions[emoji] = reactions[emoji].filter(uid => uid !== currentUser.uid);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].push(currentUser.uid);
          }
        } else {
          // Add new reaction
          reactions[emoji] = [currentUser.uid];
        }
        
        await updateDoc(messageRef, { reactions });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Hinzufügen der Reaktion.',
        severity: 'error'
      });
    }
  };

  // Function to handle message deletion
  const handleDeleteMessage = async (message) => {
    console.log('handleDeleteMessage called with:', message);
    
    // Prevent multiple clicks on the same message
    if (isDeletingMessage === message.id) {
      console.log('Message deletion already in progress');
      return;
    }
    
    const canDelete = canDeleteMessage(message);
    if (!canDelete) {
      console.log('Cannot delete message - permission denied');
      return;
    }
    
    // Set loading state for this specific message
    setIsDeletingMessage(message.id);
    
    console.log('Deleting message from Firestore first, then UI will update via onSnapshot');
    
    // Delete from Firestore first - the onSnapshot listener will update the UI automatically
    try {
      if (selectedConversation?.id) {
        const messageRef = doc(dbInstance, dataIsolationService.getMessagesCollection(selectedConversation.id), message.id);
        console.log('Using correct path:', dataIsolationService.getMessagesCollection(selectedConversation.id));
        await deleteDoc(messageRef);
        console.log('Message deleted from Firestore successfully');
        setSnackbar({
          open: true,
          message: 'Nachricht gelöscht.',
          severity: 'success'
        });
        // Loading state will be cleared when onSnapshot detects the message is gone
      } else {
        console.log('Cannot delete - no selectedConversation.id:', selectedConversation);
        setSnackbar({
          open: true,
          message: 'Fehler: Keine Unterhaltung ausgewählt.',
          severity: 'error'
        });
        // Clear loading state on error
        setIsDeletingMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message from Firestore:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Löschen der Nachricht.',
        severity: 'error'
      });
      // Clear loading state on error
      setIsDeletingMessage(null);
    }
  };

  // Function to handle reply to message
  const handleReplyToMessage = (message) => {
    setReplyTo({
      id: message.id,
      text: message.text,
      senderName: message.senderName
    });
  };

  // Function to cancel reply
  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleReportSubmit = async () => {
    if (!reportReason) return;
    
    try {
      let reportData;
      
      if (selectedMessage) {
        // Report a specific message
        reportData = {
          messageId: selectedMessage.id,
          conversationId: selectedConversation.id,
          reportedBy: currentUser.uid,
          reportedByName: currentUser.displayName,
          reportedAt: serverTimestamp(),
          reason: reportReason,
          additionalInfo: reportAdditionalInfo || '',
          messageText: selectedMessage.text,
          messageSender: selectedMessage.senderId,
          messageSenderName: selectedMessage.senderName,
          status: 'pending',
          priority: reportReason.includes('Beleidigung') || reportReason.includes('Gewalt') ? 'high' : 'medium',
          conversationType: selectedConversation.type,
          conversationName: selectedConversation.type === 'group' 
            ? selectedConversation.name 
            : selectedConversation.displayName,
          reportType: 'message'
        };
        
        // Mark message as reported
        try {
          await updateDoc(doc(dbInstance, 'conversations', selectedConversation.id, 'messages', selectedMessage.id), {
            reported: true,
            reportedAt: serverTimestamp()
          });
        } catch (updateError) {
          console.warn('Could not update message report status:', updateError);
        }
      } else {
        // Report the entire chat/conversation
        reportData = {
          conversationId: selectedConversation.id,
          reportedBy: currentUser.uid,
          reportedByName: currentUser.displayName,
          reportedAt: serverTimestamp(),
          reason: reportReason,
          additionalInfo: reportAdditionalInfo || '',
          status: 'pending',
          priority: reportReason.includes('Beleidigung') || reportReason.includes('Gewalt') ? 'high' : 'medium',
          conversationType: selectedConversation.type,
          conversationName: selectedConversation.type === 'group' 
            ? selectedConversation.name 
            : selectedConversation.displayName,
          reportType: 'chat',
          participants: selectedConversation.participants
        };
      }
      
      await addDoc(collection(dbInstance, 'reports'), reportData);
      
      // Notify admins
      await notifyAdmins(reportData);
      
      setSnackbar({
        open: true,
        message: 'Danke. Deine Meldung wurde weitergeleitet.',
        severity: 'success'
      });
      
      // Close dialog and reset
      setReportDialogOpen(false);
      setReportReason('');
      setReportAdditionalInfo('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error reporting:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Melden. Bitte versuchen Sie es erneut.',
        severity: 'error'
      });
      // Just close dialog for demo
      setReportDialogOpen(false);
      setReportReason('');
      setReportAdditionalInfo('');
      setSelectedMessage(null);
    }
  };

  // Media upload handlers
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Datei ist zu groß. Maximale Größe: 10MB',
        severity: 'error'
      });
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: 'Dateityp nicht unterstützt. Erlaubt: JPG, PNG, GIF, PDF, TXT, DOC, DOCX',
        severity: 'error'
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedConversation || !currentUser) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real app, you would upload to Firebase Storage here
      // For demo, we'll just create a message with file info
      const fileMessage = {
        type: 'file',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        fileUrl: filePreview || '#', // In real app, this would be the download URL
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Ich',
        conversationId: selectedConversation.id,
        createdAt: serverTimestamp(),
        replyTo: replyTo
      };

      // Save to database
      await addDoc(collection(dbInstance, 'messages'), fileMessage);
      
      // Update conversation's last message
      await updateDoc(doc(dbInstance, 'conversations', selectedConversation.id), {
        lastMessage: `📎 ${selectedFile.name}`,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: currentUser.uid
      });
      
      // Complete upload
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        setFilePreview(null);
        setReplyTo(null);
      }, 500);

      setSnackbar({
        open: true,
        message: 'Datei erfolgreich gesendet',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Hochladen der Datei',
        severity: 'error'
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Zugriff auf das Mikrofon',
        severity: 'error'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedConversation || !currentUser) return;

    try {
      // In a real app, you would upload the audio blob to Firebase Storage
      const voiceMessage = {
        type: 'voice',
        duration: recordingTime,
        audioUrl: URL.createObjectURL(audioBlob), // In real app, this would be the download URL
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Ich',
        conversationId: selectedConversation.id,
        createdAt: serverTimestamp(),
        replyTo: replyTo
      };

      // Save to database
      await addDoc(collection(dbInstance, 'messages'), voiceMessage);
      
      // Update conversation's last message
      await updateDoc(doc(dbInstance, 'conversations', selectedConversation.id), {
        lastMessage: `🎤 Sprachnachricht (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: currentUser.uid
      });
      setAudioBlob(null);
      setRecordingTime(0);
      setReplyTo(null);

      setSnackbar({
        open: true,
        message: 'Sprachnachricht gesendet',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error sending voice message:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Senden der Sprachnachricht',
        severity: 'error'
      });
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const cancelVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const notifyAdmins = async (reportData) => {
    try {
      // Get all admin users
      const adminsQuery = query(
        collection(dbInstance, 'users'),
        where('role', '==', userRoles.ADMIN)
      );
      
      const adminSnapshot = await getDocs(adminsQuery);
      
      for (const adminDoc of adminSnapshot.docs) {
        // Create notification body based on report type
        let notificationBody;
        if (reportData.reportType === 'message' && reportData.messageText) {
          notificationBody = `${reportData.reason}: "${reportData.messageText.substring(0, 50)}..."`;
        } else {
          notificationBody = `${reportData.reason}: Chat "${reportData.conversationName}" gemeldet`;
        }
        
        await addDoc(collection(dbInstance, 'notifications'), {
          userId: adminDoc.id,
          type: 'report',
          title: 'Neue Meldung eingegangen',
          body: notificationBody,
          reportId: reportData.id,
          priority: reportData.priority,
          createdAt: serverTimestamp(),
          read: false
        });
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  };
  
  const toggleNotifications = async (conversationId, enabled) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [conversationId]: enabled
      };
      
      await updateDoc(doc(dbInstance, 'users', currentUser.uid), {
        notificationSettings: newSettings
      });
      
      setNotificationSettings(newSettings);
      
      setSnackbar({
        open: true,
        message: enabled 
          ? 'Benachrichtigungen aktiviert' 
          : 'Benachrichtigungen deaktiviert',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };
  
  const blockUser = async (userId) => {
    if (!checkUserPermissions('block_user')) {
      setSnackbar({
        open: true,
        message: 'Sie haben keine Berechtigung, Benutzer zu blockieren.',
        severity: 'error'
      });
      return;
    }
    
    try {
      await addDoc(collection(dbInstance, 'blockedUsers'), {
        blockedUser: userId,
        blockedBy: currentUser.uid,
        blockedAt: serverTimestamp(),
        reason: 'Manual block'
      });
      
      setSnackbar({
        open: true,
        message: 'Benutzer wurde blockiert.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };
  
  // Private chat functions
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    console.log('🔍 Searching users with term:', searchTerm);
    
    try {
      // In demo mode, get all users and filter locally for better compatibility
      if (isDemoMode()) {
        console.log('📱 Demo mode: Getting all users for local filtering');
        const usersQuery = query(collection(dbInstance, 'users'));
        const snapshot = await getDocs(usersQuery);
        const allUsers = [];
        
        // Handle mock Firestore snapshots
        if (snapshot.docs) {
          snapshot.docs.forEach(doc => {
            const userData = doc.data();
            if (doc.id !== currentUser.uid && !isUserBlocked(doc.id)) {
              allUsers.push({
                id: doc.id,
                ...userData
              });
            }
          });
        }
        
        // Also load users from AdminPanel (localStorage)
        try {
          const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
          const adminUsers = localStorageUsers
            .filter(user => user.uid !== currentUser.uid && !isUserBlocked(user.uid))
            .map(user => ({
              id: user.uid,
              displayName: user.displayName || `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              photoURL: user.photoURL || null
            }));
          
          // Combine and deduplicate users
          const combinedUsers = [...allUsers, ...adminUsers];
          const uniqueUsers = combinedUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id || u.email === user.email)
          );
          
          allUsers.splice(0, allUsers.length, ...uniqueUsers);
          console.log('👥 Combined users (Firestore + AdminPanel):', allUsers);
        } catch (error) {
          console.error('Error loading AdminPanel users:', error);
        }
        
        // Filter users locally by displayName, firstName, lastName, or email
        const filteredUsers = allUsers.filter(user => {
          const searchLower = searchTerm.toLowerCase();
          const displayName = user.displayName || '';
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const email = user.email || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          return displayName.toLowerCase().includes(searchLower) ||
                 firstName.toLowerCase().includes(searchLower) ||
                 lastName.toLowerCase().includes(searchLower) ||
                 fullName.toLowerCase().includes(searchLower) ||
                 email.toLowerCase().includes(searchLower);
        });
        
        console.log('🎯 Filtered users:', filteredUsers);
        setSearchResults(filteredUsers);
      } else {
        // For real Firestore, use range query
        const usersQuery = query(
          collection(dbInstance, 'users'),
          where('displayName', '>=', searchTerm),
          where('displayName', '<=', searchTerm + '\uf8ff')
        );
        
        const snapshot = await getDocs(usersQuery);
        const users = [];
        
        // Handle real Firestore snapshots
        if (snapshot.forEach) {
          snapshot.forEach(doc => {
            const userData = doc.data();
            if (doc.id !== currentUser.uid && !isUserBlocked(doc.id)) {
              users.push({
                id: doc.id,
                ...userData
              });
            }
          });
        } else if (snapshot.docs) {
          snapshot.docs.forEach(doc => {
            const userData = doc.data();
            if (doc.id !== currentUser.uid && !isUserBlocked(doc.id)) {
              users.push({
                id: doc.id,
                ...userData
              });
            }
          });
        }
        
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      // Fallback mock data for demo
      const mockUsers = [
        {
          id: 'user1',
          displayName: 'Max Mustermann',
          email: 'max@example.com',
          role: 'student'
        },
        {
          id: 'user2',
          displayName: 'Anna Schmidt',
          email: 'anna@example.com',
          role: 'student'
        },
        {
          id: 'teacher1',
          displayName: 'Dr. Mueller',
          email: 'mueller@example.com',
          role: 'teacher'
        }
      ].filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log('🔄 Using fallback mock users:', mockUsers);
      setSearchResults(mockUsers);
    }
    
    setSearchLoading(false);
  };
  
  const fetchParticipants = async (conversation) => {
    if (!conversation || !conversation.participants) {
      setParticipants([]);
      return;
    }
    
    try {
      const participantPromises = conversation.participants.map(async (participantId) => {
        const userDoc = await getDoc(doc(dbInstance, 'users', participantId));
        if (userDoc.exists()) {
          return {
            id: participantId,
            ...userDoc.data()
          };
        }
        return null;
      });
      
      const participantData = await Promise.all(participantPromises);
      setParticipants(participantData.filter(p => p !== null));
    } catch (error) {
      console.error('Error fetching participants:', error);
      // Mock data for demo
      const mockParticipants = conversation.participants.map((participantId, index) => ({
        id: participantId,
        name: `Benutzer ${index + 1}`,
        email: `user${index + 1}@example.com`,
        role: index === 0 ? 'teacher' : 'student'
      }));
      setParticipants(mockParticipants);
    }
  };
  
  const createGroupChat = async () => {
    if (!groupName.trim()) {
      setSnackbar({
        open: true,
        message: 'Bitte geben Sie einen Gruppennamen ein.',
        severity: 'error'
      });
      return;
    }
    
    if (selectedMembers.length === 0) {
      setSnackbar({
        open: true,
        message: 'Bitte wählen Sie mindestens ein Mitglied aus.',
        severity: 'error'
      });
      return;
    }
    
    const participants = [currentUser.uid, ...selectedMembers.map(member => member.id)];
    
    // Validate and sanitize group data
    const sanitizedGroupData = validateAndSanitizeGroupData({
      name: groupName,
      description: groupDescription,
      groupType: groupType,
      participants: participants
    });
    
    if (!sanitizedGroupData) {
      setSnackbar({
        open: true,
        message: 'Gruppendaten sind ungültig. Bitte überprüfen Sie Ihre Eingaben.',
        severity: 'error'
      });
      return;
    }
    
    const tempId = `temp-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store group chat data locally as backup
    const pendingGroupChats = JSON.parse(localStorage.getItem('pendingGroupChats') || '[]');
    const groupChatData = {
      id: tempId,
      type: 'group',
      name: sanitizedGroupData.name,
      description: sanitizedGroupData.description,
      groupType: sanitizedGroupData.groupType,
      participants: sanitizedGroupData.participants,
      admins: [currentUser.uid],
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      pending: true
    };
    
    // Validate conversation data before proceeding
    if (!validateConversationData(groupChatData)) {
      setSnackbar({
        open: true,
        message: 'Konversationsdaten sind ungültig.',
        severity: 'error'
      });
      return;
    }
    
    pendingGroupChats.push({
      ...groupChatData,
      timestamp: Date.now()
    });
    localStorage.setItem('pendingGroupChats', JSON.stringify(pendingGroupChats));
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const conversationData = {
          type: 'group',
          name: groupName,
          description: groupDescription,
          groupType: groupType,
          participants: participants,
          admins: [currentUser.uid],
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
          lastMessage: '',
          lastMessageAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(dbInstance, dataIsolationService.getChatsCollection()), conversationData);
        
        // Remove from pending group chats
        const updatedPending = pendingGroupChats.filter(chat => chat.id !== tempId);
        localStorage.setItem('pendingGroupChats', JSON.stringify(updatedPending));
        
        // Select the new group conversation
        setSelectedConversation({
          id: docRef.id,
          ...conversationData,
          displayName: groupName,
          photoURL: null
        });
        
        setNewGroupDialogOpen(false);
        setGroupName('');
        setGroupDescription('');
        setGroupType('class');
        setSelectedMembers([]);
        setUserSearchQuery('');
        setSearchResults([]);
        
        setSnackbar({
          open: true,
          message: `Gruppe \"${groupName}\" wurde erfolgreich erstellt.`,
          severity: 'success'
        });
        
        console.log('Gruppenchat erfolgreich erstellt:', docRef.id);
        break;
        
      } catch (error) {
        retryCount++;
        console.warn(`Gruppenchat-Erstellungsversuch ${retryCount} fehlgeschlagen:`, error);
        
        if (retryCount >= maxRetries) {
          setSnackbar({
            open: true,
            message: 'Gruppenchat konnte nicht erstellt werden. Die Daten werden lokal gespeichert und später synchronisiert.',
            severity: 'warning'
          });
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  };
  
  const toggleMemberSelection = (user) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(member => member.id === user.id);
      if (isSelected) {
        return prev.filter(member => member.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };
  
  const createPrivateChat = async (otherUser) => {
    // Prevent multiple simultaneous chat creations
    if (isCreatingChat) {
      console.log('Chat creation already in progress, skipping...');
      return;
    }
    
    // Get consistent user IDs for checking
    const otherUserId = otherUser.uid || otherUser.id;
    
    // Additional check to prevent duplicate creation
    const existingChat = conversations.find(conv => 
      conv.type === 'private' && 
      conv.participants && 
      conv.participants.includes(otherUserId)
    );
    
    if (existingChat) {
      console.log('Chat already exists in local state, selecting existing chat...');
      setSelectedConversation({
        ...existingChat,
        displayName: otherUser.displayName || otherUser.firstName + ' ' + otherUser.lastName || otherUser.email,
        photoURL: otherUser.photoURL
      });
      setNewChatDialogOpen(false);
      return;
    }
    

    
    try {
      setIsCreatingChat(true);
      
      // Get consistent user IDs
      const currentUserId = currentUser.uid || currentUser.id;
      
      // Check if conversation already exists
      const existingQuery = query(
          collection(dbInstance, dataIsolationService.getChatsCollection()),
          where('type', '==', 'private'),
          where('participants', 'array-contains', currentUserId)
        );
      
      const existingSnapshot = await getDocs(existingQuery);
      let existingConversation = null;
      
      // Handle both real Firestore and mock Firestore snapshots
      if (existingSnapshot.forEach) {
        existingSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.participants && data.participants.includes(otherUserId)) {
            existingConversation = { id: doc.id, ...data };
          }
        });
      } else if (existingSnapshot.docs) {
        existingSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.participants && data.participants.includes(otherUserId)) {
            existingConversation = { id: doc.id, ...data };
          }
        });
      }
      
      if (existingConversation) {
        // Select existing conversation
        setSelectedConversation({
          ...existingConversation,
          displayName: otherUser.displayName,
          photoURL: otherUser.photoURL
        });
        setNewChatDialogOpen(false);
        setIsCreatingChat(false);
        return;
      }
      
      // Create new conversation with retry mechanism
      const tempId = `temp-private-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const displayName = otherUser.displayName || otherUser.firstName + ' ' + otherUser.lastName || otherUser.email;
      
      // Store private chat data locally as backup
      const pendingPrivateChats = JSON.parse(localStorage.getItem('pendingPrivateChats') || '[]');
      const privateChatData = {
        id: tempId,
        type: 'private',
        participants: [currentUserId, otherUserId],
        displayName: displayName,
        photoURL: otherUser.photoURL,
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        pending: true
      };
      
      pendingPrivateChats.push({
        ...privateChatData,
        timestamp: Date.now()
      });
      localStorage.setItem('pendingPrivateChats', JSON.stringify(pendingPrivateChats));
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const conversationData = {
            type: 'private',
            participants: [currentUserId, otherUserId],
            displayName: displayName,
            photoURL: otherUser.photoURL,
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageAt: serverTimestamp()
          };
          
          // Validate conversation data before saving
          if (!validateConversationData(conversationData)) {
            throw new Error('Ungültige Konversationsdaten');
          }
          
          // Validate user data
          if (!validateUserData(otherUser) || !validateUserData(currentUser)) {
            throw new Error('Ungültige Benutzerdaten');
          }
          
          const docRef = await addDoc(collection(dbInstance, dataIsolationService.getChatsCollection()), conversationData);
          
          // Remove from pending private chats
          const updatedPending = pendingPrivateChats.filter(chat => chat.id !== tempId);
          localStorage.setItem('pendingPrivateChats', JSON.stringify(updatedPending));
          
          // Select the new conversation
          setSelectedConversation({
            id: docRef.id,
            ...conversationData,
            displayName: displayName,
            photoURL: otherUser.photoURL
          });
          
          setNewChatDialogOpen(false);
          setUserSearchQuery('');
          setSearchResults([]);
          
          setSnackbar({
            open: true,
            message: `Chat mit ${displayName} erfolgreich erstellt.`,
            severity: 'success'
          });
          
          console.log('Privater Chat erfolgreich erstellt:', docRef.id);
          break;
          
        } catch (error) {
          retryCount++;
          console.warn(`Privater Chat-Erstellungsversuch ${retryCount} fehlgeschlagen:`, error);
          
          if (retryCount >= maxRetries) {
            setSnackbar({
              open: true,
              message: 'Chat konnte nicht erstellt werden. Die Daten werden lokal gespeichert und später synchronisiert.',
              severity: 'warning'
            });
            break;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (error) {
      console.error('Error in createPrivateChat:', error);
      setSnackbar({
        open: true,
        message: 'Unerwarteter Fehler beim Erstellen des Chats.',
        severity: 'error'
      });
    } finally {
      setIsCreatingChat(false);
    }
  };
  
  const createSubjectChat = async (subjectName, subjectType) => {
    try {
      // Check if subject conversation already exists
      const existingQuery = query(
        collection(dbInstance, dataIsolationService.getChatsCollection()),
        where('type', '==', 'subject'),
        where('subjectName', '==', subjectName),
        where('subjectType', '==', subjectType)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      let existingConversation = null;
      
      existingSnapshot.docs.forEach(doc => {
        existingConversation = { id: doc.id, ...doc.data() };
      });
      
      if (existingConversation) {
        // Select existing subject conversation
        setSelectedConversation({
          ...existingConversation,
          displayName: `${subjectName} (${subjectType})`,
          photoURL: null
        });
        return;
      }
      
      // Create new subject conversation
      const conversationData = {
        type: 'subject',
        subjectName: subjectName,
        subjectType: subjectType,
        participants: [], // All users with this subject can participate
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(dbInstance, dataIsolationService.getChatsCollection()), conversationData);
      
      // Select the new subject conversation
      setSelectedConversation({
        id: docRef.id,
        ...conversationData,
        displayName: `${subjectName} (${subjectType})`,
        photoURL: null
      });
      
      setSnackbar({
        open: true,
        message: `Fach-Chat für ${subjectName} geöffnet.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating subject chat:', error);
      // Use mock data for demo
      const mockSubjectConversation = {
        id: `subject-${subjectName.toLowerCase()}-${subjectType.toLowerCase()}`,
        type: 'subject',
        subjectName: subjectName,
        subjectType: subjectType,
        displayName: `${subjectName} (${subjectType})`,
        photoURL: null,
        lastMessage: 'Willkommen im Fach-Chat!',
        lastMessageAt: new Date()
      };
      
      setSelectedConversation(mockSubjectConversation);
    }
  };

  const createCourseChat = async (courseId, courseName) => {
    try {
      // Check if course conversation already exists
      const existingQuery = query(
        collection(dbInstance, dataIsolationService.getChatsCollection()),
        where('type', '==', 'course'),
        where('courseId', '==', courseId)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      let existingConversation = null;
      
      // Handle both real Firestore and mock Firestore snapshots
      if (existingSnapshot.forEach) {
        existingSnapshot.forEach(doc => {
          existingConversation = { id: doc.id, ...doc.data() };
        });
      } else if (existingSnapshot.docs) {
        existingSnapshot.docs.forEach(doc => {
          existingConversation = { id: doc.id, ...doc.data() };
        });
      }
      
      if (existingConversation) {
        // Select existing course conversation
        setSelectedConversation({
          ...existingConversation,
          displayName: `Kurs: ${courseName}`,
          photoURL: null
        });
        return;
      }
      
      // Create new course conversation
      const conversationData = {
        type: 'course',
        courseId: courseId,
        courseName: courseName,
        participants: [], // All users in this course can participate
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(dbInstance, dataIsolationService.getChatsCollection()), conversationData);
      
      // Select the new course conversation
      setSelectedConversation({
        id: docRef.id,
        ...conversationData,
        displayName: `Kurs: ${courseName}`,
        photoURL: null
      });
      
      setSnackbar({
        open: true,
        message: `Kurs-Chat für ${courseName} geöffnet.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating course chat:', error);
      // Use mock data for demo
      const mockCourseConversation = {
        id: `course-${courseId}`,
        type: 'course',
        courseId: courseId,
        courseName: courseName,
        displayName: `Kurs: ${courseName}`,
        photoURL: null,
        lastMessage: 'Willkommen im Kurs-Chat!',
        lastMessageAt: new Date()
      };
      
      setSelectedConversation(mockCourseConversation);
    }
  };
  
  const handleNewChatClick = () => {
    if (activeTab === 0) {
      // Private chat
      setNewChatDialogOpen(true);
      setUserSearchQuery('');
      setSearchResults([]);
    } else if (activeTab === 1) {
      // Group chat
      setNewGroupDialogOpen(true);
      setGroupName('');
      setGroupDescription('');
      setGroupType('class');
      setSelectedMembers([]);
      setUserSearchQuery('');
      setSearchResults([]);
    }
    // Subject chats are created automatically, no manual creation needed
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Separate component for message rendering to avoid hook issues
  const MessageItem = ({ 
    message, 
    onSwipe, 
    onSaveEdit, 
    onCancelEdit, 
    onReactionToggle, 
    formatRecordingTime,
    editingMessage,
    editedText,
    setEditedText
  }) => {
    const isCurrentUser = message.senderId === currentUser?.uid;
    
    // Touch handlers for long press
    const [touchStart, setTouchStart] = useState(null);
    const [longPressTimer, setLongPressTimer] = useState(null);

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
      
      // Store the currentTarget before setTimeout to prevent it from becoming invalid
      const currentTarget = e.currentTarget;
      
      const timer = setTimeout(() => {
        // Only proceed if the currentTarget is still valid and in the DOM
        if (currentTarget && currentTarget.isConnected) {
          const syntheticEvent = {
            currentTarget: currentTarget,
            preventDefault: () => {},
            stopPropagation: () => {}
          };
          // onMenuOpen removed to fix MUI anchorEl warning
          // Add haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }, 500); // 500ms for long press
      
      setLongPressTimer(timer);
    };

    const handleTouchEnd = (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setTouchStart(null);
    };

    const handleTouchMove = (e) => {
      if (touchStart && longPressTimer) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStart.x);
        const deltaY = Math.abs(touch.clientY - touchStart.y);
        
        // Cancel long press if user moves finger too much
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      }
    };
    
    return (
      <Box
        className="message-container"
        sx={{
          display: 'flex',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          mb: 3,
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            '& .message-menu-button': {
              opacity: 1,
              visibility: 'visible'
            }
          }
        }}
        onDoubleClick={() => onSwipe(message)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {!isCurrentUser && (
          <ListItemAvatar sx={{ minWidth: 48 }}>
            <Avatar sx={{ width: 40, height: 40, fontSize: '1.2rem' }}>
              {message.senderName?.charAt(0) || '?'}
            </Avatar>
          </ListItemAvatar>
        )}
        
        <Box
          sx={{
            maxWidth: '70%',
            position: 'relative'
          }}
        >
          {selectedConversation?.type === 'group' && !isCurrentUser && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {message.senderName}
            </Typography>
          )}
          
          {message.replyTo && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: '16px',
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.03)',
                borderLeft: '4px solid',
                borderColor: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
                mx: 1,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="caption" sx={{ 
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
                fontSize: '0.75rem'
              }}>
                {message.replyTo.senderName}
              </Typography>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(245, 245, 247, 0.6)' 
                  : 'rgba(29, 29, 31, 0.6)',
                fontSize: '0.8rem',
                mt: 0.5
              }}>
                {message.replyTo.text.length > 50 
                  ? `${message.replyTo.text.substring(0, 50)}...` 
                  : message.replyTo.text}
              </Typography>
            </Paper>
          )}
          
          <Paper
            className="message-bubble"
            elevation={0}
            sx={{
              p: 3,
              borderRadius: isCurrentUser ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
              bgcolor: reportedMessages.includes(message.id)
                ? theme.palette.error.light
                : isCurrentUser 
                  ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                  : (theme.palette.mode === 'dark' ? '#2C2C2E' : '#F2F2F2'),
              color: isCurrentUser 
                ? '#FFFFFF' 
                : (theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F'),
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)' 
                : '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
              maxWidth: 'fit-content',
              wordBreak: 'break-word',
              fontSize: '1.1rem',
              lineHeight: 1.5,
              transform: 'translateZ(0)', // Hardware acceleration for smooth shadows
              '&:hover': {
                transform: 'translateY(-1px) translateZ(0)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 6px 16px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {editingMessage?.id === message.id ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      color: 'text.primary'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton size="small" onClick={onSaveEdit} color="primary">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={onCancelEdit}>
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <>
                {/* Render different message types */}
                {message.type === 'file' ? (
                  <Box>
                    {message.fileType?.startsWith('image/') ? (
                      <Box sx={{ mb: 1 }}>
                        <img 
                          src={message.fileUrl} 
                          alt={message.fileName}
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '200px', 
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(message.fileUrl, '_blank')}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AttachFileIcon fontSize="small" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {message.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(message.fileUrl, '_blank')}
                          sx={{ color: 'inherit' }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ) : message.type === 'voice' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '150px' }}>
                    <IconButton 
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={() => {
                        const audio = new Audio(message.audioUrl);
                        audio.play();
                      }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ 
                      flexGrow: 1, 
                      height: '20px', 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '10px', 
                      position: 'relative' 
                    }}>
                      <Box sx={{ 
                        height: '100%', 
                        width: '60%', 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', 
                        borderRadius: '10px' 
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '11px' }}>
                      {formatRecordingTime(message.duration)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      lineHeight: 1.5,
                      fontSize: '16px',
                      mb: 0.5
                    }}
                  >
                    {message.text}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                  {message.edited && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: '11px',
                        color: isCurrentUser ? 'rgba(255, 255, 255, 0.6)' : 'text.disabled'
                      }}
                    >
                      bearbeitet
                    </Typography>
                  )}
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '11px',
                      color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatTime(message.createdAt)}
                  </Typography>
                  
                  {/* Status indicators for sent messages */}
                  {isCurrentUser && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                      {/* Status indicators with Apple-style design */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '-0.5px'
                      }}>
                        {message.status === 'sent' && (
                          <Box sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            transform: 'scale(0.9)'
                          }}>
                            ✓
                          </Box>
                        )}
                        {message.status === 'delivered' && (
                          <Box sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            transform: 'scale(0.9)'
                          }}>
                            ✓✓
                          </Box>
                        )}
                        {(message.status === 'read' || !message.status) && (
                          <Box sx={{ 
                            color: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
                            transform: 'scale(0.9)',
                            filter: 'drop-shadow(0 0 2px rgba(10, 132, 255, 0.3))'
                          }}>
                            ✓✓
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}
            
            {/* Emoji Reactions */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.5, 
                mt: 1,
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
              }}>
                {Object.entries(message.reactions).map(([emoji, users]) => (
                  <Chip
                    key={emoji}
                    label={`${emoji} ${users.length}`}
                    size="small"
                    variant={users.includes(currentUser?.uid) ? "filled" : "outlined"}
                    onClick={() => onReactionToggle(message.id, emoji)}
                    sx={{
                      height: '24px',
                      fontSize: '12px',
                      bgcolor: users.includes(currentUser?.uid) 
                        ? (theme.palette.mode === 'dark' ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)')
                        : 'transparent',
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.2)',
                      '&:hover': {
                        bgcolor: users.includes(currentUser?.uid)
                          ? (theme.palette.mode === 'dark' ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)')
                          : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                      }
                    }}
                  />
                ))}
              </Box>
            )}
            
            {/* Action buttons for messages */}
            <Box sx={{
              position: 'absolute',
              top: -8,
              right: isCurrentUser ? -8 : 'auto',
              left: isCurrentUser ? 'auto' : -8,
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.2s ease-in-out',
              '.message-container:hover &': {
                opacity: 1,
                visibility: 'visible'
              }
            }}>
              {/* Reply button */}
              <IconButton
                size="small"
                onClick={() => handleReplyToMessage(message)}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <ReplyIcon fontSize="small" />
              </IconButton>
              
              {/* Report button */}
              {!isCurrentUser && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedMessage(message);
                    handleReport();
                  }}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: theme.palette.mode === 'dark' ? '#FF9500' : '#FF8C00',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 140, 0, 0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <ReportIcon fontSize="small" />
                </IconButton>
              )}
              
              {/* Delete button */}
              {canDeleteMessage(message) && (
                <IconButton
                  size="small"
                  onClick={() => handleDeleteMessage(message)}
                  disabled={isDeletingMessage === message.id}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: isDeletingMessage === message.id 
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 69, 58, 0.5)' : 'rgba(255, 59, 48, 0.5)')
                      : (theme.palette.mode === 'dark' ? '#FF453A' : '#FF3B30'),
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 69, 58, 0.2)' : 'rgba(255, 59, 48, 0.1)',
                      transform: isDeletingMessage === message.id ? 'none' : 'scale(1.1)'
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  {isDeletingMessage === message.id ? (
                    <CircularProgress size={16} sx={{ color: 'inherit' }} />
                  ) : (
                    <RestoreFromTrashIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  const filteredConversations = conversations.filter(conversation => {
    // Filter by active tab
    if (activeTab === 0 && conversation.type !== 'private') return false;
    if (activeTab === 1 && conversation.type !== 'group') return false;
    if (activeTab === 2 && conversation.type !== 'subject') return false;
    
    // Only filter out chats that were reported as entire chats (not individual messages)
    // Individual message reports should not hide the entire chat
    
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (conversation.type === 'private') {
      return conversation.displayName?.toLowerCase().includes(query);
    } else if (conversation.type === 'subject') {
      return conversation.subject?.toLowerCase().includes(query) || 
             conversation.name?.toLowerCase().includes(query);
    } else {
      return conversation.name?.toLowerCase().includes(query);
    }
  });

  const conversationsList = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: 1, 
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.06)',
        bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FAFAFA',
        backdropFilter: 'blur(20px)'
      }}>
        <Typography variant="h5" sx={{ 
          mb: 3,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
          letterSpacing: '-0.5px'
        }}>
          Nachrichten
        </Typography>
        
        <TextField
          fullWidth
          placeholder="Suchen..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(245, 245, 247, 0.6)' 
                    : 'rgba(29, 29, 31, 0.6)' 
                }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
              border: theme.palette.mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.12)' 
                  : 'rgba(0, 0, 0, 0.06)',
                borderColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.1)'
              },
              '&.Mui-focused': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.12)' 
                  : 'rgba(0, 0, 0, 0.06)',
                borderColor: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 0 0 3px rgba(10, 132, 255, 0.2)' 
                  : '0 0 0 3px rgba(0, 122, 255, 0.2)'
              },
              '& fieldset': {
                border: 'none'
              }
            },
            '& .MuiInputBase-input': {
              fontSize: '16px',
              fontWeight: 500,
              color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F'
            }
          }}
        />
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
              height: '3px',
              borderRadius: '2px'
            },
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'none',
              color: theme.palette.mode === 'dark' 
                ? 'rgba(245, 245, 247, 0.6)' 
                : 'rgba(29, 29, 31, 0.6)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&.Mui-selected': {
                color: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF'
              }
            }
          }}
        >
          <Tab label="Privat" />
          <Tab label="Gruppen" />
          <Tab label="Fächer" />
        </Tabs>
      </Box>
      
      <Box 
        className="chat-conversations"
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          bgcolor: theme.palette.mode === 'dark' ? '#000000' : '#F2F2F7'
        }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ 
              color: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF' 
            }} />
          </Box>
        ) : filteredConversations.length > 0 ? (
          <List sx={{ p: 1 }}>
            {filteredConversations.map((conversation) => (
              <ListItem 
                key={conversation.id} 
                button 
                selected={selectedConversation?.id === conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                sx={{ 
                  borderRadius: '16px',
                  mx: 1,
                  mb: 1,
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? (selectedConversation?.id === conversation.id ? '#0A84FF' : '#1C1C1E')
                    : (selectedConversation?.id === conversation.id ? '#007AFF' : '#FFFFFF'),
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.08)' 
                    : '1px solid rgba(0, 0, 0, 0.04)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? (selectedConversation?.id === conversation.id 
                        ? '0 4px 20px rgba(10, 132, 255, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.3)')
                    : (selectedConversation?.id === conversation.id 
                        ? '0 4px 20px rgba(0, 122, 255, 0.3)'
                        : '0 1px 3px rgba(0, 0, 0, 0.1)'),
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedConversation?.id === conversation.id ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? (selectedConversation?.id === conversation.id ? '#0A84FF' : '#2C2C2E')
                      : (selectedConversation?.id === conversation.id ? '#007AFF' : '#F8F8F8'),
                    transform: 'scale(1.02)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 16px rgba(0, 0, 0, 0.4)'
                      : '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={conversation.photoURL}
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: '20px',
                      fontWeight: 600,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.08)',
                      color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                      border: theme.palette.mode === 'dark' 
                        ? '2px solid rgba(255, 255, 255, 0.1)' 
                        : '2px solid rgba(0, 0, 0, 0.05)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                        : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {conversation.type === 'private' 
                      ? conversation.displayName?.charAt(0) || '?'
                      : conversation.name?.charAt(0) || 'G'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primaryTypographyProps={{
                    component: 'div',
                    sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }
                  }}
                  secondaryTypographyProps={{
                    component: 'div',
                    sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
                  }}
                  primary={
                    <>
                      <Typography 
                        variant="subtitle1" 
                        component="span"
                        sx={{ 
                          fontWeight: 700,
                          color: selectedConversation?.id === conversation.id 
                            ? '#FFFFFF' 
                            : (theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F'),
                          fontSize: '17px',
                          letterSpacing: '-0.3px'
                        }}
                      >
                        {conversation.type === 'private' ? conversation.displayName : conversation.name}
                      </Typography>
                      
                      {conversation.lastMessageAt && (
                        <Typography 
                          variant="caption" 
                          component="span"
                          sx={{ 
                            color: selectedConversation?.id === conversation.id 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : (theme.palette.mode === 'dark' 
                                  ? 'rgba(245, 245, 247, 0.6)' 
                                  : 'rgba(29, 29, 31, 0.6)'),
                            fontSize: '13px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatTime(conversation.lastMessageAt)}
                        </Typography>
                      )}
                    </>
                  }
                  secondary={
                    <>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{ 
                          color: selectedConversation?.id === conversation.id 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : (theme.palette.mode === 'dark' 
                                ? 'rgba(245, 245, 247, 0.7)' 
                                : 'rgba(29, 29, 31, 0.7)'),
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                          fontSize: '15px',
                          fontWeight: 400,
                          lineHeight: 1.3
                        }}
                      >
                        {conversation.lastMessage || 'Keine Nachrichten'}
                      </Typography>
                      
                      {/* Unread message indicator */}
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          badgeContent={conversation.unreadCount} 
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '12px',
                              height: '22px',
                              minWidth: '22px',
                              fontWeight: 700,
                              bgcolor: theme.palette.mode === 'dark' ? '#FF453A' : '#FF3B30',
                              color: '#FFFFFF',
                              border: theme.palette.mode === 'dark' 
                                ? '2px solid #1C1C1E' 
                                : '2px solid #FFFFFF',
                              boxShadow: theme.palette.mode === 'dark'
                                ? '0 2px 8px rgba(255, 69, 58, 0.4)'
                                : '0 1px 3px rgba(255, 59, 48, 0.3)'
                            }
                          }}
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(245, 245, 247, 0.6)' 
                  : 'rgba(29, 29, 31, 0.6)',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              {searchQuery 
                ? 'Keine Ergebnisse gefunden.'
                : activeTab === 0 
                  ? 'Keine privaten Chats vorhanden.'
                  : activeTab === 1
                    ? 'Keine Gruppenchats vorhanden.'
                    : 'Keine Fach-Chats vorhanden.'}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Box sx={{ 
        p: 3, 
        borderTop: 1, 
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.06)',
        bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FAFAFA',
        textAlign: 'center'
      }}>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewChatClick}
            sx={{
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 16px rgba(10, 132, 255, 0.4)'
                : '0 2px 8px rgba(0, 122, 255, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? '#0056CC' : '#0056CC',
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 6px 20px rgba(10, 132, 255, 0.5)'
                  : '0 4px 12px rgba(0, 122, 255, 0.4)'
              }
            }}
          >
            Neuer Chat
          </Button>
        )}
        {activeTab === 1 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewChatClick}
            sx={{
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 16px rgba(10, 132, 255, 0.4)'
                : '0 2px 8px rgba(0, 122, 255, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? '#0056CC' : '#0056CC',
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 6px 20px rgba(10, 132, 255, 0.5)'
                  : '0 4px 12px rgba(0, 122, 255, 0.4)'
              }
            }}
          >
            Neue Gruppe
          </Button>
        )}
        {activeTab === 2 && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              textAlign: 'center',
              color: theme.palette.mode === 'dark' 
                ? 'rgba(245, 245, 247, 0.6)' 
                : 'rgba(29, 29, 31, 0.6)',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Fach-Chats werden automatisch erstellt
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      height: 'calc(100vh - 128px)',
      bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
      p: 2
    }}>
      {/* Security Alert */}
      {securityAlert && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: '16px',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
              : '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
          icon={<SecurityIcon />}
        >
          {securityAlert}
        </Alert>
      )}
      
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '24px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          height: securityAlert ? 'calc(100% - 80px)' : '100%',
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Grid container sx={{ height: '100%' }}>
          {/* Conversations List - Desktop */}
          {!isMobile && (
            <Grid item xs={12} md={4} lg={3} sx={{ 
              borderRight: 1, 
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.08)',
              height: '100%',
              bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FAFAFA'
            }}>
              {conversationsList}
            </Grid>
          )}
          
          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              sx={{
                '& .MuiDrawer-paper': { 
                  width: '80%', 
                  maxWidth: 350,
                  bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FAFAFA',
                  borderRadius: '0 24px 24px 0'
                },
              }}
            >
              {conversationsList}
            </Drawer>
          )}
          
          {/* Chat Area */}
          <Grid item xs={12} md={8} lg={9} sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF'
          }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ 
                  p: 3, 
                  borderBottom: 1, 
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.08)',
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
                  backdropFilter: 'blur(20px)'
                }}>
                  {isMobile && (
                    <IconButton 
                      edge="start" 
                      onClick={() => setMobileDrawerOpen(true)} 
                      sx={{ 
                        mr: 2,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : 'rgba(0, 0, 0, 0.08)'
                        }
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  
                  <Avatar sx={{ 
                    mr: 3, 
                    width: 48, 
                    height: 48,
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    fontSize: '1.2rem',
                    fontWeight: 600
                  }}>
                    {selectedConversation.type === 'private' 
                      ? selectedConversation.displayName?.charAt(0) || '?'
                      : selectedConversation.name?.charAt(0) || 'G'}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                      mb: 0.5
                    }}>
                      {selectedConversation.type === 'private' 
                        ? selectedConversation.displayName 
                        : selectedConversation.name}
                    </Typography>
                    {selectedConversation.type === 'group' && (
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.6)' 
                          : 'rgba(29, 29, 31, 0.6)',
                        fontSize: '0.875rem'
                      }}>
                        {selectedConversation.participants?.length || 0} Mitglieder
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {/* Info Button */}
                    <IconButton
                      onClick={() => setParticipantsDialogOpen(true)}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '12px',
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.8)' 
                          : 'rgba(29, 29, 31, 0.8)',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.06)',
                          transform: 'scale(1.05)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <PersonIcon sx={{ fontSize: '20px' }} />
                    </IconButton>

                    {/* Notification Settings */}
                    <IconButton
                      onClick={() => toggleNotifications(
                        selectedConversation.id, 
                        !notificationSettings[selectedConversation.id]
                      )}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '12px',
                        color: notificationSettings[selectedConversation.id] !== false 
                          ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                          : (theme.palette.mode === 'dark' ? 'rgba(245, 245, 247, 0.6)' : 'rgba(29, 29, 31, 0.6)'),
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.06)',
                          transform: 'scale(1.05)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      {notificationSettings[selectedConversation.id] !== false 
                        ? <NotificationsIcon sx={{ fontSize: '20px' }} /> 
                        : <NotificationsOffIcon sx={{ fontSize: '20px' }} />}
                    </IconButton>

                    {/* Delete All Messages Button (Admin only) */}
                    {checkUserPermissions('delete_all_messages') && (
                      <IconButton
                        onClick={handleDeleteAllMessages}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 59, 48, 0.1)' 
                            : 'rgba(255, 59, 48, 0.08)',
                          borderRadius: '12px',
                          color: '#FF3B30',
                          border: theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 59, 48, 0.2)' 
                            : '1px solid rgba(255, 59, 48, 0.15)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 59, 48, 0.15)' 
                              : 'rgba(255, 59, 48, 0.12)',
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)'
                          }
                        }}
                      >
                        <RestoreFromTrashIcon sx={{ fontSize: '20px' }} />
                      </IconButton>
                    )}

                    {/* More Options */}
                    <IconButton
                      onClick={(e) => {
                        const target = e.currentTarget;
                        // Menu functionality removed to fix MUI warning
                      }}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '12px',
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.8)' 
                          : 'rgba(29, 29, 31, 0.8)',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.06)',
                          transform: 'scale(1.05)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: '20px' }} />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Messages */}
                <Box 
                  className="chat-messages"
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    overflow: 'auto', 
                    bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
                    backgroundImage: theme.palette.mode === 'dark' 
                      ? 'none'
                      : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
                    position: 'relative'
                  }}>
                  {messages.length > 0 ? (
                    (() => {
                      const filteredMessages = messages.filter(message => !reportedMessages.includes(message.id));
                      console.log('=== RENDERING DEBUG ===');
                      console.log('Total messages:', messages.length);
                      console.log('Reported messages to filter:', reportedMessages);
                      console.log('Messages after filtering:', filteredMessages.length);
                      console.log('Filtered message IDs:', filteredMessages.map(m => m.id));
                      
                      return filteredMessages.map((message) => (
                        <MessageItem 
                          key={message.id} 
                          message={message} 
                          // onMenuOpen removed to fix MUI anchorEl warning
                          onSwipe={handleSwipe}
                          onSaveEdit={saveEditedMessage}
                          onCancelEdit={cancelEdit}
                          onReactionToggle={handleReactionToggle}
                          formatRecordingTime={formatRecordingTime}
                          editingMessage={editingMessage}
                          editedText={editedText}
                          setEditedText={setEditedText}
                        />
                      ));
                    })()
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.6)' 
                          : 'rgba(29, 29, 31, 0.6)',
                        fontWeight: 500
                      }}>
                        Keine Nachrichten vorhanden
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.4)' 
                          : 'rgba(29, 29, 31, 0.4)',
                        textAlign: 'center'
                      }}>
                        Starte die Unterhaltung mit einer Nachricht
                      </Typography>

                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                
                {/* Reply Preview */}
                {replyTo && (
                  <Box 
                    sx={{ 
                      p: 1, 
                      bgcolor: 'background.paper', 
                      borderTop: 1, 
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        flexGrow: 1, 
                        ml: 2, 
                        p: 1, 
                        borderLeft: 3, 
                        borderColor: 'primary.main',
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        Antwort an {replyTo.senderName}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {replyTo.text.length > 50 
                          ? `${replyTo.text.substring(0, 50)}...` 
                          : replyTo.text}
                      </Typography>
                    </Box>
                    <IconButton onClick={cancelReply}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
                
                {/* File Preview */}
                {selectedFile && (
                  <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider', 
                    bgcolor: 'background.paper'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }}>
                      {filePreview ? (
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          style={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'cover', 
                            borderRadius: 8 
                          }} 
                        />
                      ) : (
                        <AttachFileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                      )}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        {isUploading && (
                          <Box sx={{ mt: 1 }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={uploadProgress} 
                              size={20} 
                            />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {uploadProgress}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <IconButton 
                        onClick={cancelFileUpload} 
                        size="small"
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    {!isUploading && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          onClick={handleFileUpload}
                          startIcon={<SendIcon />}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF',
                            color: '#FFFFFF',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? '#0066CC' : '#0056B3'
                            }
                          }}
                        >
                          Datei senden
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={cancelFileUpload}
                          size="small"
                          sx={{
                            borderColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.3)' 
                              : 'rgba(0, 0, 0, 0.23)',
                            color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                            '&:hover': {
                              borderColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.5)' 
                                : 'rgba(0, 0, 0, 0.4)',
                              bgcolor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          Abbrechen
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Voice Recording */}
                {isRecording && (
                  <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.08)', 
                    bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      border: 1,
                      borderColor: theme.palette.mode === 'dark' ? '#FF453A' : '#FF3B30',
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 69, 58, 0.15)' 
                        : 'rgba(255, 59, 48, 0.1)',
                      color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F'
                    }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: 'error.main',
                        animation: 'pulse 1s infinite'
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Aufnahme läuft... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton 
                        onClick={stopRecording}
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' ? '#FF453A' : '#FF3B30', 
                          color: '#FFFFFF',
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' ? '#FF6961' : '#E6342A'
                          }
                        }}
                        size="small"
                      >
                        <StopIcon />
                      </IconButton>
                      <IconButton 
                        onClick={cancelVoiceRecording}
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}

                {/* Message Input */}
                <Box sx={{ 
                  p: 3, 
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(28, 28, 30, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)'}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 2
                }}>
                  {/* Media Buttons */}
                  {!selectedFile && !isRecording && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,.txt,.doc,.docx"
                        style={{ display: 'none' }}
                      />
                      <IconButton 
                        onClick={() => fileInputRef.current?.click()}
                        size="medium"
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.05)',
                          color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                          borderRadius: '12px',
                          width: 44,
                          height: 44,
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.08)',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => {
                          fileInputRef.current.accept = 'image/*';
                          fileInputRef.current?.click();
                        }}
                        size="medium"
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.05)',
                          color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                          borderRadius: '12px',
                          width: 44,
                          height: 44,
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.08)',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <AttachFileIcon />
                      </IconButton>
                      <IconButton 
                        onClick={startRecording}
                        size="medium"
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.05)',
                          color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                          borderRadius: '12px',
                          width: 44,
                          height: 44,
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.08)',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <MicIcon />
                      </IconButton>
                    </Box>
                  )}
                  
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Nachricht schreiben…"
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={selectedFile || isRecording}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '24px',
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(44, 44, 46, 0.8)' 
                          : 'rgba(242, 242, 242, 0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                          : '0 1px 4px rgba(0, 0, 0, 0.1)',
                        '& fieldset': {
                          border: 'none'
                        },
                        '&:hover fieldset': {
                          border: 'none'
                        },
                        '&.Mui-focused': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(44, 44, 46, 1)' 
                            : 'rgba(255, 255, 255, 1)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 4px 16px rgba(10, 132, 255, 0.3)' 
                            : '0 2px 12px rgba(0, 122, 255, 0.2)',
                          '& fieldset': {
                            border: `2px solid ${theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF'}`
                          }
                        },
                        transition: 'all 0.2s ease-in-out'
                      },
                      '& .MuiInputBase-input': {
                        py: 2,
                        px: 3,
                        fontSize: '1rem',
                        color: theme.palette.mode === 'dark' ? '#F5F5F7' : '#1D1D1F',
                        '&::placeholder': {
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(245, 245, 247, 0.6)' 
                            : 'rgba(29, 29, 31, 0.6)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                  
                  <IconButton 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || selectedFile || isRecording}
                    sx={{
                      bgcolor: (newMessage.trim() && !selectedFile && !isRecording) 
                        ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                        : (theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'),
                      color: (newMessage.trim() && !selectedFile && !isRecording) 
                        ? '#FFFFFF' 
                        : (theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.4)' 
                          : 'rgba(29, 29, 31, 0.4)'),
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      boxShadow: (newMessage.trim() && !selectedFile && !isRecording) 
                        ? (theme.palette.mode === 'dark' 
                          ? '0 4px 12px rgba(10, 132, 255, 0.4)' 
                          : '0 2px 8px rgba(0, 122, 255, 0.3)')
                        : 'none',
                      '&:hover': {
                        bgcolor: (newMessage.trim() && !selectedFile && !isRecording) 
                          ? (theme.palette.mode === 'dark' ? '#0066CC' : '#0056B3')
                          : (theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : 'rgba(0, 0, 0, 0.15)'),
                        transform: (newMessage.trim() && !selectedFile && !isRecording) 
                          ? 'scale(1.05)' 
                          : 'none'
                      },
                      '&.Mui-disabled': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.05)',
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(245, 245, 247, 0.3)' 
                          : 'rgba(29, 29, 31, 0.3)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                {isMobile && (
                  <IconButton 
                    edge="start" 
                    onClick={() => setMobileDrawerOpen(true)} 
                    sx={{ position: 'absolute', top: 16, left: 16 }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                )}
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Wähle einen Chat aus
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Wähle einen bestehenden Chat aus oder starte eine neue Unterhaltung.
                </Typography>
                
                {isMobile && (
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    sx={{ mt: 3 }}
                    onClick={() => setMobileDrawerOpen(true)}
                  >
                    Chat auswählen
                  </Button>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Message Menu removed to fix MUI warning */}
      
      {/* Emoji Reaction Menu removed to fix MUI warning */}
      {/* Box and Menu components removed to fix MUI warning */}
      
      {/* Report Dialog - Mobile Bottom Sheet / Desktop Dialog */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
              maxHeight: '80vh'
            }
          }}
          BackdropProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <Box sx={{ p: 3, pb: 4 }}>
            {/* Handle bar */}
            <Box sx={{ 
              width: 36, 
              height: 4, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)', 
              borderRadius: 2, 
              mx: 'auto', 
              mb: 3 
            }} />
            
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
              Nachricht melden
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', opacity: 0.7 }}>
              Bitte wähle den Grund aus.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {reportReasons.map((reason) => (
                <Button
                  key={reason}
                  variant={reportReason === reason ? 'contained' : 'outlined'}
                  onClick={() => setReportReason(reason)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    bgcolor: reportReason === reason 
                      ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                      : 'transparent',
                    borderColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(0, 0, 0, 0.2)',
                    color: reportReason === reason 
                      ? '#FFFFFF'
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                    '&:hover': {
                      bgcolor: reportReason === reason 
                        ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                        : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                    }
                  }}
                >
                  {reason}
                </Button>
              ))}
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Weitere Infos (optional)"
              variant="outlined"
              value={reportAdditionalInfo}
              onChange={(e) => setReportAdditionalInfo(e.target.value)}
              sx={{ 
                mt: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button 
                fullWidth
                variant="outlined"
                onClick={() => {
                  setReportDialogOpen(false);
                  setReportReason('');
                  setReportAdditionalInfo('');
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
                }}
              >
                Abbrechen
              </Button>
              <Button 
                fullWidth
                variant="contained"
                onClick={handleReportSubmit}
                disabled={!reportReason}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#FF3B30',
                  color: '#FFFFFF',
                  '&:hover': {
                    bgcolor: '#D70015'
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                Melden
              </Button>
            </Box>
          </Box>
        </Drawer>
      ) : (
        <Dialog 
          open={reportDialogOpen} 
          onClose={() => setReportDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 20px 40px rgba(0, 0, 0, 0.8)'
                : '0 20px 40px rgba(0, 0, 0, 0.15)'
            }
          }}
          BackdropProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, textAlign: 'center', fontWeight: 600 }}>
            Nachricht melden
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', opacity: 0.7 }}>
              Bitte wähle den Grund aus.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {reportReasons.map((reason) => (
                <Button
                  key={reason}
                  variant={reportReason === reason ? 'contained' : 'outlined'}
                  onClick={() => setReportReason(reason)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    bgcolor: reportReason === reason 
                      ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                      : 'transparent',
                    borderColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(0, 0, 0, 0.2)',
                    color: reportReason === reason 
                      ? '#FFFFFF'
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                    '&:hover': {
                      bgcolor: reportReason === reason 
                        ? (theme.palette.mode === 'dark' ? '#0A84FF' : '#007AFF')
                        : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                    }
                  }}
                >
                  {reason}
                </Button>
              ))}
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Weitere Infos (optional)"
              variant="outlined"
              value={reportAdditionalInfo}
              onChange={(e) => setReportAdditionalInfo(e.target.value)}
              sx={{ 
                mt: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button 
              variant="outlined"
              onClick={() => {
                setReportDialogOpen(false);
                setReportReason('');
                setReportAdditionalInfo('');
              }}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
              }}
            >
              Abbrechen
            </Button>
            <Button 
              variant="contained"
              onClick={handleReportSubmit}
              disabled={!reportReason}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#FF3B30',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#D70015'
                },
                '&:disabled': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              Melden
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Delete Message Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nachricht löschen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Möchten Sie diese Nachricht wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
          {messageToDelete && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                borderLeft: '3px solid',
                borderColor: 'error.main'
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "{messageToDelete.text}"
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Chat Dialog */}
      <Dialog open={chatDeleteDialogOpen} onClose={() => setChatDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chat löschen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Möchten Sie diesen Chat wirklich löschen? Alle Nachrichten werden dauerhaft entfernt und diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
          {chatToDelete && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                borderLeft: '3px solid',
                borderColor: 'error.main'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {chatToDelete.name || 'Unbenannter Chat'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {chatToDelete.type === 'private' ? 'Privater Chat' : 'Gruppenchat'}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={confirmChatDelete} 
            color="error" 
            variant="contained"
          >
            Chat löschen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete All Messages Dialog */}
      <Dialog open={deleteAllMessagesDialogOpen} onClose={() => setDeleteAllMessagesDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Alle Nachrichten löschen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Möchten Sie wirklich ALLE Nachrichten in diesem Chat löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2,
              borderRadius: 2,
              bgcolor: 'background.default',
              borderLeft: '3px solid',
              borderColor: 'error.main'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              ⚠️ Warnung: Alle {messages.length} Nachrichten werden dauerhaft gelöscht!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Diese Aktion betrifft alle Teilnehmer des Chats.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllMessagesDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={confirmDeleteAllMessages} 
            color="error" 
            variant="contained"
          >
            Alle löschen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Chat Dialog */}
      <Dialog open={newChatDialogOpen} onClose={() => setNewChatDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Chat erstellen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Suche nach Benutzern, um einen neuen privaten Chat zu starten:
          </DialogContentText>
          
          <TextField
            fullWidth
            placeholder="Benutzer suchen..."
            variant="outlined"
            value={userSearchQuery}
            onChange={(e) => {
              setUserSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchLoading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          {searchResults.length > 0 && (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {searchResults.map((user) => (
                <ListItem 
                  key={user.id} 
                  button 
                  onClick={() => createPrivateChat(user)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.photoURL}>
                      {user.displayName?.charAt(0) || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName || user.email}
                    secondary={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography 
                          component="span" 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: user.role === 'teacher' ? 'primary.main' : 'grey.300',
                            color: user.role === 'teacher' ? 'white' : 'text.primary',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {user.role === 'teacher' ? <PersonIcon sx={{ fontSize: '12px' }} /> : <GroupIcon sx={{ fontSize: '12px' }} />}
                          {user.role === 'teacher' ? 'Lehrer' : 'Schüler'}
                        </Typography>
                      </span>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {userSearchQuery && searchResults.length === 0 && !searchLoading && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Keine Benutzer gefunden.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialogOpen(false)}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
       
       {/* New Group Dialog */}
       <Dialog open={newGroupDialogOpen} onClose={() => setNewGroupDialogOpen(false)} maxWidth="md" fullWidth>
         <DialogTitle>Neue Gruppe erstellen</DialogTitle>
         <DialogContent>
           <Box sx={{ mb: 3 }}>
             <TextField
               fullWidth
               label="Gruppenname"
               variant="outlined"
               value={groupName}
               onChange={(e) => setGroupName(e.target.value)}
               sx={{ mb: 2 }}
               required
             />
             
             <TextField
               fullWidth
               label="Beschreibung (optional)"
               variant="outlined"
               multiline
               rows={2}
               value={groupDescription}
               onChange={(e) => setGroupDescription(e.target.value)}
               sx={{ mb: 2 }}
             />
             
             <FormControl fullWidth sx={{ mb: 2 }}>
               <InputLabel>Gruppentyp</InputLabel>
               <Select
                 value={groupType}
                 label="Gruppentyp"
                 onChange={(e) => setGroupType(e.target.value)}
               >
                 <MenuItem value="class">Klasse</MenuItem>
                 <MenuItem value="project">Projektgruppe</MenuItem>
                 <MenuItem value="committee">Komitee</MenuItem>
                 <MenuItem value="study">Lerngruppe</MenuItem>
                 <MenuItem value="other">Sonstiges</MenuItem>
               </Select>
             </FormControl>
           </Box>
           
           <Divider sx={{ mb: 2 }} />
           
           <Typography variant="h6" sx={{ mb: 2 }}>
             Mitglieder hinzufügen
           </Typography>
           
           <TextField
             fullWidth
             placeholder="Benutzer suchen..."
             variant="outlined"
             value={userSearchQuery}
             onChange={(e) => {
               setUserSearchQuery(e.target.value);
               searchUsers(e.target.value);
             }}
             InputProps={{
               startAdornment: (
                 <InputAdornment position="start">
                   <SearchIcon />
                 </InputAdornment>
               ),
               endAdornment: searchLoading && (
                 <InputAdornment position="end">
                   <CircularProgress size={20} />
                 </InputAdornment>
               )
             }}
             sx={{ mb: 2 }}
           />
           
           {selectedMembers.length > 0 && (
             <Box sx={{ mb: 2 }}>
               <Typography variant="subtitle2" sx={{ mb: 1 }}>
                 Ausgewählte Mitglieder ({selectedMembers.length}):
               </Typography>
               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                 {selectedMembers.map((member) => (
                   <Chip
                     key={member.id}
                     label={member.displayName || member.email}
                     onDelete={() => toggleMemberSelection(member)}
                     avatar={<Avatar src={member.photoURL}>{member.displayName?.charAt(0) || '?'}</Avatar>}
                     color="primary"
                     variant="outlined"
                   />
                 ))}
               </Box>
             </Box>
           )}
           
           {searchResults.length > 0 && (
             <List sx={{ maxHeight: 300, overflow: 'auto' }}>
               {searchResults.map((user) => {
                 const isSelected = selectedMembers.some(member => member.id === user.id);
                 return (
                   <ListItem 
                     key={user.id} 
                     button 
                     onClick={() => toggleMemberSelection(user)}
                     sx={{ 
                       borderRadius: 1, 
                       mb: 0.5,
                       bgcolor: isSelected ? 'action.selected' : 'transparent'
                     }}
                   >
                     <ListItemAvatar>
                       <Avatar src={user.photoURL}>
                         {user.displayName?.charAt(0) || '?'}
                       </Avatar>
                     </ListItemAvatar>
                     <ListItemText 
                       primary={user.displayName || user.email}
                       secondary={
                         <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Typography component="span" variant="caption" color="text.secondary">
                             {user.email}
                           </Typography>
                           <Typography 
                             component="span" 
                             variant="caption" 
                             sx={{ 
                               backgroundColor: user.role === 'teacher' ? 'primary.main' : 'grey.300',
                               color: user.role === 'teacher' ? 'white' : 'text.primary',
                               padding: '2px 8px',
                               borderRadius: '12px',
                               fontSize: '0.75rem',
                               display: 'inline-flex',
                               alignItems: 'center',
                               gap: '4px'
                             }}
                           >
                             {user.role === 'teacher' ? <PersonIcon sx={{ fontSize: '12px' }} /> : <GroupIcon sx={{ fontSize: '12px' }} />}
                             {user.role === 'teacher' ? 'Lehrer' : 'Schüler'}
                           </Typography>
                         </span>
                       }
                     />
                     {isSelected && (
                       <ListItemIcon>
                         <Chip label="Ausgewählt" size="small" color="primary" />
                       </ListItemIcon>
                     )}
                   </ListItem>
                 );
               })}
             </List>
           )}
           
           {userSearchQuery && searchResults.length === 0 && !searchLoading && (
             <Box sx={{ textAlign: 'center', py: 3 }}>
               <Typography variant="body2" color="text.secondary">
                 Keine Benutzer gefunden.
               </Typography>
             </Box>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setNewGroupDialogOpen(false)}>Abbrechen</Button>
           <Button 
             onClick={createGroupChat}
             variant="contained"
             disabled={!groupName.trim() || selectedMembers.length === 0}
           >
             Gruppe erstellen
           </Button>
         </DialogActions>
       </Dialog>
       
       {/* Participants Dialog */}
       <Dialog
         open={participantsDialogOpen}
         onClose={() => setParticipantsDialogOpen(false)}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle>
           Teilnehmer
           <IconButton
             onClick={() => setParticipantsDialogOpen(false)}
             sx={{ position: 'absolute', right: 8, top: 8 }}
           >
             <CloseIcon />
           </IconButton>
         </DialogTitle>
         <DialogContent>
           {selectedConversation && (
             <List>
               {participants.map((participant) => {
                 if (!participant) return null;
                 
                 return (
                   <ListItem key={participant.id || participant.email}>
                     <ListItemAvatar>
                       <Avatar sx={{ bgcolor: 'primary.main' }}>
                         {participant.name?.charAt(0) || participant.email?.charAt(0)}
                       </Avatar>
                     </ListItemAvatar>
                     <ListItemText
                       primary={participant.name || participant.email}
                       secondary={
                         <Typography
                           component="span"
                           variant="caption"
                           sx={{
                             backgroundColor: participant.role === 'teacher' ? 'primary.main' : 'grey.300',
                             color: participant.role === 'teacher' ? 'white' : 'text.primary',
                             padding: '2px 8px',
                             borderRadius: '12px',
                             fontSize: '0.75rem',
                             display: 'inline-flex',
                             alignItems: 'center',
                             gap: '4px'
                           }}
                         >
                           {participant.role === 'teacher' ? <PersonIcon sx={{ fontSize: '12px' }} /> : <GroupIcon sx={{ fontSize: '12px' }} />}
                           {participant.role === 'teacher' ? 'Lehrer' : 'Schüler'}
                         </Typography>
                       }
                     />
                   </ListItem>
                 );
               })}
             </List>
           )}
         </DialogContent>
       </Dialog>

       {/* Chat Options Menu removed to fix MUI warning */}



       {/* Snackbar for notifications */}
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
      
      {/* Backup Manager */}
      <BackupManager 
        open={backupManagerOpen} 
        onClose={() => setBackupManagerOpen(false)} 
      />
    </Box>
  );

  // Function to delete a message when admin approves/warns/blocks the report
  const deleteMessageFromData = async (messageId) => {
    try {
      console.log('=== DELETING MESSAGE ===');
      console.log('🗑️ Deleting message from Chat:', messageId);
      
      // Check if we're in demo mode
      const isDemoMode = () => {
        const testUser = localStorage.getItem('testUser');
        const isDemoConfig = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return !!testUser || isDemoConfig;
      };
      
      if (isDemoMode()) {
        console.log('🔧 Demo mode: Removing message from reported list');
        
        // In demo mode, just remove from reported messages list
        setReportedMessages(prev => {
          const newReported = prev.filter(id => id !== messageId);
          console.log('Updated reported messages:', newReported);
          return newReported;
        });
        
        // Update localStorage to remove the report
        const storedData = localStorage.getItem('mockFirestoreData');
        if (storedData) {
          const mockData = JSON.parse(storedData);
          const currentYear = new Date().getFullYear();
          if (mockData.years?.[currentYear]?.reports) {
            mockData.years[currentYear].reports = mockData.years[currentYear].reports.filter(
              report => report.messageId !== messageId
            );
            localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
            console.log('✅ Report removed from localStorage');
          }
        }
        
        console.log('✅ Message deleted successfully (demo mode):', messageId);
        return;
      }
      
      // Search through all conversations to find the message
      let targetConversationId = null;
      let messageFound = false;
      
      // First, try to find the message in all conversations
      for (const conv of conversations) {
        try {
          const messagesQuery = query(
            collection(dbInstance, dataIsolationService.getMessagesCollection(conv.id)),
            where('__name__', '==', messageId)
          );
          const snapshot = await getDocs(messagesQuery);
          
          if (!snapshot.empty) {
            targetConversationId = conv.id;
            messageFound = true;
            console.log('Found message to delete in conversation:', conv.id);
            break;
          }
        } catch (searchError) {
          console.log('Error searching in conversation', conv.id, ':', searchError);
          continue;
        }
      }
      
      // If not found in loaded conversations, try direct approach
      if (!messageFound) {
        console.log('Message not found in loaded conversations, trying direct approach...');
        
        // Try to find the message directly in all possible conversation paths
        const conversationsQuery = query(
          collection(dbInstance, dataIsolationService.getChatsCollection())
        );
        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        for (const convDoc of conversationsSnapshot.docs) {
          try {
            const messageRef = doc(dbInstance, dataIsolationService.getMessagesCollection(convDoc.id), messageId);
            const messageDoc = await getDoc(messageRef);
            
            if (messageDoc.exists()) {
              targetConversationId = convDoc.id;
              messageFound = true;
              console.log('Found message to delete via direct search in conversation:', convDoc.id);
              break;
            }
          } catch (directError) {
            continue; // Message doesn't exist in this conversation
          }
        }
      }
      
      if (messageFound && targetConversationId) {
        console.log('Target conversation:', targetConversationId);
        
        // Delete the message from Firestore
        const messageRef = doc(dbInstance, dataIsolationService.getMessagesCollection(targetConversationId), messageId);
        await deleteDoc(messageRef);
        
        // Update local state only if the message is in the currently loaded conversation
        if (selectedConversation && selectedConversation.id === targetConversationId) {
          setMessages(prev => {
            const newMessages = prev.filter(msg => msg.id !== messageId);
            console.log('Messages after local deletion:', newMessages.length);
            console.log('Message IDs after local deletion:', newMessages.map(m => m.id));
            return newMessages;
          });
        }
        
        console.log('✅ Message deleted successfully:', messageId);
      } else {
        console.warn('Message not found for deletion:', messageId);
      }
      
      // Remove from reported messages regardless
      setReportedMessages(prev => prev.filter(id => id !== messageId));
      
    } catch (error) {
      console.error('❌ Error deleting message:', error);
    }
  };
  
  // Function to restore a message when admin denies the report
  const restoreMessageFromData = async (messageId) => {
    try {
      console.log('🔄 Restoring message from Chat:', messageId);
      
      // Check if we're in demo mode
      const isDemoMode = () => {
        const testUser = localStorage.getItem('testUser');
        const isDemoConfig = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return !!testUser || isDemoConfig;
      };
      
      if (isDemoMode()) {
        console.log('🔧 Demo mode: Restoring message (removing from reported list)');
        
        // In demo mode, just remove from reported messages list
        setReportedMessages(prev => {
          const newReported = prev.filter(id => id !== messageId);
          console.log('Updated reported messages after restore:', newReported);
          return newReported;
        });
        
        // Update localStorage to remove the report
        const storedData = localStorage.getItem('mockFirestoreData');
        if (storedData) {
          const mockData = JSON.parse(storedData);
          const currentYear = new Date().getFullYear();
          if (mockData.years?.[currentYear]?.reports) {
            mockData.years[currentYear].reports = mockData.years[currentYear].reports.filter(
              report => report.messageId !== messageId
            );
            localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
            console.log('✅ Report removed from localStorage (restore)');
          }
        }
        
        console.log('✅ Message restored successfully (demo mode):', messageId);
        return;
      }
      
      // Search through all conversations to find the message
      let targetConversationId = null;
      let messageFound = false;
      
      // First, try to find the message in all conversations
      for (const conv of conversations) {
        try {
          const messagesQuery = query(
            collection(dbInstance, dataIsolationService.getMessagesCollection(conv.id)),
            where('__name__', '==', messageId)
          );
          const snapshot = await getDocs(messagesQuery);
          
          if (!snapshot.empty) {
            targetConversationId = conv.id;
            messageFound = true;
            console.log('Found message in conversation:', conv.id);
            break;
          }
        } catch (searchError) {
          console.log('Error searching in conversation', conv.id, ':', searchError);
          continue;
        }
      }
      
      // If not found in loaded conversations, try direct approach
      if (!messageFound) {
        console.log('Message not found in loaded conversations, trying direct approach...');
        
        // Try to update the message directly in all possible conversation paths
        const conversationsQuery = query(
          collection(dbInstance, dataIsolationService.getChatsCollection())
        );
        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        for (const convDoc of conversationsSnapshot.docs) {
          try {
            const messageRef = doc(dbInstance, dataIsolationService.getMessagesCollection(convDoc.id), messageId);
            const messageDoc = await getDoc(messageRef);
            
            if (messageDoc.exists()) {
              targetConversationId = convDoc.id;
              messageFound = true;
              console.log('Found message via direct search in conversation:', convDoc.id);
              break;
            }
          } catch (directError) {
            continue; // Message doesn't exist in this conversation
          }
        }
      }
      
      if (messageFound && targetConversationId) {
        // Update the message in Firestore to remove reported status
        const messageRef = doc(dbInstance, dataIsolationService.getMessagesCollection(targetConversationId), messageId);
        await updateDoc(messageRef, {
          reported: false,
          reportedAt: null
        });
        
        console.log('✅ Message reported status removed from Firestore');
      } else {
        console.warn('Message not found for restoration:', messageId);
      }
      
      // Remove from reported messages regardless
      setReportedMessages(prev => prev.filter(id => id !== messageId));
      
      console.log('✅ Message restored successfully:', messageId);
    } catch (error) {
      console.error('❌ Error restoring message:', error);
    }
  };
  
  // Make functions available globally for AdminPanel
  useEffect(() => {
    window.deleteMessageFromChat = deleteMessageFromData;
    window.restoreMessageFromChat = restoreMessageFromData;
    return () => {
      delete window.deleteMessageFromChat;
      delete window.restoreMessageFromChat;
    };
  }, [conversations, messages, dbInstance]);
}

export default Chat;
