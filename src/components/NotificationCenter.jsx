import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  Divider,
  Button,
  Chip,
  Paper,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Message as MessageIcon,
  Report as ReportIcon,
  Assignment as AssignmentIcon,
  Poll as PollIcon,
  Euro as EuroIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { isDemoMode } from '../services/mockFirestore';
import { db } from '../services/firebase';

function NotificationCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const anchorElRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: false,
    soundEnabled: true,
    messageNotifications: true,
    reportNotifications: true,
    warningNotifications: true,
    projectNotifications: true,
    surveyNotifications: true,
    financeNotifications: true
  });

  const open = menuOpen;

  const loadNotificationsFromLocalStorage = () => {
    try {
      setLoading(true);
      const storedData = localStorage.getItem('mockFirestoreData');
      if (storedData) {
        const mockData = JSON.parse(storedData);
        const currentYear = new Date().getFullYear();
        const notificationsData = mockData.years?.[currentYear]?.notifications || [];
        
        // Filter notifications for current user
        // In demo mode, check for various demo user IDs
        const demoUserIds = ['demo-user', 'admin-test-uid', 'teacher-test-uid', 'student-test-uid'];
        const userNotifications = notificationsData.filter(notification => {
          if (isDemoMode()) {
            return notification.userId === currentUser.uid || 
                   demoUserIds.includes(notification.userId) ||
                   notification.userId === 'demo-user';
          }
          return notification.userId === currentUser.uid;
        });
        
        // Sort by creation date (newest first)
        userNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
        console.log('📱 NotificationCenter: Loaded', userNotifications.length, 'notifications from localStorage');
        console.log('📱 NotificationCenter: Current user UID:', currentUser?.uid);
        console.log('📱 NotificationCenter: All notifications:', notificationsData.length);
        console.log('📱 NotificationCenter: User notifications:', userNotifications);
        console.log('📱 NotificationCenter: Unread count:', userNotifications.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Load notification settings
    loadNotificationSettings();

    // In demo mode, load from localStorage
    if (isDemoMode()) {
      loadNotificationsFromLocalStorage();
      return;
    }

    // Set up real-time listener for notifications (production mode)
    if (db) {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationList = [];
        let unread = 0;

        snapshot.forEach((doc) => {
           const notification = { id: doc.id, ...doc.data() };
           notificationList.push(notification);
           if (!notification.read) {
             unread++;
           }
         });

         setNotifications(notificationList);
         setUnreadCount(unread);
       });

       return () => unsubscribe();
     }
  }, [currentUser, db]);

  useEffect(() => {
    // Listen for foreground messages
    const handleForegroundMessage = (event) => {
      const payload = event.detail;
      
      // Show in-app notification if enabled
      if (notificationSettings.soundEnabled) {
        // Play notification sound
        playNotificationSound();
      }
    };

    window.addEventListener('foregroundMessage', handleForegroundMessage);
    return () => window.removeEventListener('foregroundMessage', handleForegroundMessage);
  }, [notificationSettings]);

  const loadNotificationSettings = async () => {
    try {
      // In demo mode, use localStorage
      if (isDemoMode()) {
        const saved = localStorage.getItem(`notificationSettings_${currentUser.uid}`);
        if (saved) {
          setNotificationSettings(JSON.parse(saved));
        }
      }
      // In real mode, load from Firestore user document
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (newSettings) => {
    try {
      setNotificationSettings(newSettings);
      
      // In demo mode, save to localStorage
      if (isDemoMode()) {
        localStorage.setItem(`notificationSettings_${currentUser.uid}`, JSON.stringify(newSettings));
      }
      // In real mode, save to Firestore user document
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleClick = (event) => {
    anchorElRef.current = event.currentTarget;
    setMenuOpen(true);
  };

  const handleClose = () => {
    anchorElRef.current = null;
    setMenuOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        if (isDemoMode()) {
          // Mock implementation for demo mode
          const updatedNotifications = notifications.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          );
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        } else if (db) {
          await updateDoc(doc(db, 'notifications', notification.id), {
            read: true
          });
        }
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'message':
          if (notification.conversationId) {
            navigate(`/chat?conversation=${notification.conversationId}`);
          } else {
            navigate('/chat');
          }
          break;
        case 'report':
          navigate('/admin');
          break;
        case 'warning':
          // For warnings, stay on current page or go to dashboard
          // The notification itself contains all relevant information
          break;
        case 'project':
          navigate('/projects');
          break;
        case 'survey':
          navigate('/surveys');
          break;
        case 'finance':
          navigate('/finance');
          break;
        case 'committee':
          navigate('/committees');
          break;
        default:
          navigate('/dashboard');
      }

      handleClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode()) {
        // Mock implementation for demo mode
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
        return;
      }
      
      if (db) {
        const unreadNotifications = notifications.filter(n => !n.read);
        
        for (const notification of unreadNotifications) {
          await updateDoc(doc(db, 'notifications', notification.id), {
            read: true
          });
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      if (isDemoMode()) {
        // Mock implementation for demo mode
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        return;
      }
      
      if (db) {
        await deleteDoc(doc(db, 'notifications', notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    console.log('clearAllNotifications called');
    console.log('Current notifications:', notifications);
    console.log('isDemoMode:', isDemoMode());
    try {
      setLoading(true);
      
      if (isDemoMode()) {
        // Mock implementation for demo mode
        console.log('Clearing notifications in demo mode');
        setNotifications([]);
        setUnreadCount(0);
        console.log('Notifications cleared in demo mode');
        return;
      }
      
      if (db) {
        console.log('Clearing notifications from database');
        for (const notification of notifications) {
          await deleteDoc(doc(db, 'notifications', notification.id));
        }
        console.log('All notifications cleared from database');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const enablePushNotifications = async () => {
    try {
      const token = await notificationService.getRegistrationToken(currentUser.uid);
      if (token) {
        await saveNotificationSettings({
          ...notificationSettings,
          pushEnabled: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return false;
    }
  };

  const disablePushNotifications = async () => {
    try {
      await notificationService.disable(currentUser.uid);
      await saveNotificationSettings({
        ...notificationSettings,
        pushEnabled: false
      });
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore errors if sound can't be played
      });
    } catch (error) {
      // Ignore errors
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageIcon />;
      case 'report':
        return <ReportIcon />;
      case 'warning':
        return <ReportIcon />;
      case 'project':
        return <AssignmentIcon />;
      case 'survey':
        return <PollIcon />;
      case 'finance':
        return <EuroIcon />;
      case 'committee':
        return <GroupIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'critical') return 'error';
    if (priority === 'high') return 'warning';
    
    switch (type) {
      case 'message':
        return 'primary';
      case 'report':
        return 'error';
      case 'warning':
        return 'warning';
      case 'project':
        return 'info';
      case 'survey':
        return 'secondary';
      case 'finance':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Gerade eben';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorElRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 400, maxHeight: 600 }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Benachrichtigungen</Typography>
              <Box>
                <IconButton
                  size="small"
                  onClick={() => setSettingsOpen(true)}
                  sx={{ mr: 1 }}
                >
                  <SettingsIcon />
                </IconButton>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={markAllAsRead}
                    disabled={loading}
                    startIcon={<CheckIcon />}
                  >
                    Alle lesen
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Notifications List */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Keine Benachrichtigungen"
                  secondary="Sie haben keine neuen Benachrichtigungen"
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.type, notification.priority)}.main`,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold',
                            flex: 1
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {formatTime(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {notification.body}
                        </Typography>
                        {notification.priority && notification.priority !== 'normal' && (
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getNotificationColor(notification.type, notification.priority)}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                size="small"
                onClick={clearAllNotifications}
                disabled={loading}
                startIcon={<ClearIcon />}
              >
                Alle löschen
              </Button>
            </Box>
          )}
        </Paper>
      </Popover>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Benachrichtigungseinstellungen</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushEnabled}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      const success = await enablePushNotifications();
                      if (!success) {
                        // Show error message
                        return;
                      }
                    } else {
                      await disablePushNotifications();
                    }
                  }}
                />
              }
              label="Push-Benachrichtigungen"
            />
            <Typography variant="caption" display="block" color="text.secondary" component="div">
              Benachrichtigungen auch wenn die App geschlossen ist
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onChange={(e) => saveNotificationSettings({
                    ...notificationSettings,
                    soundEnabled: e.target.checked
                  })}
                />
              }
              label="Benachrichtigungston"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Benachrichtigungstypen</Typography>
          
          {[
            { key: 'messageNotifications', label: 'Nachrichten' },
            { key: 'reportNotifications', label: 'Meldungen' },
            { key: 'warningNotifications', label: 'Verwarnungen' },
            { key: 'projectNotifications', label: 'Projekte' },
            { key: 'surveyNotifications', label: 'Umfragen' },
            { key: 'financeNotifications', label: 'Finanzen' }
          ].map(({ key, label }) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={notificationSettings[key]}
                  onChange={(e) => saveNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked
                  })}
                />
              }
              label={label}
              sx={{ display: 'block' }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NotificationCenter;
