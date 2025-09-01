import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useFeatures } from './context/FeatureContext'
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import createAppTheme from './styles/theme'
import { useResponsive } from './hooks/useResponsive'
import './styles/apple-design.css'
import './styles/mobile.css'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Components
// NotificationToast component inline
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  Avatar,
  Slide,
  Chip
} from '@mui/material'
import {
  Close as CloseIcon,
  Message as MessageIcon,
  Report as ReportIcon,
  AccountBalance as FinanceIcon,
  Notifications as GeneralIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import notificationService from './services/notificationService'

function SlideTransition(props) {
  return <Slide {...props} direction="down" />
}

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  const getNotificationIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } }
    switch (type) {
      case 'message': return <MessageIcon {...iconProps} />
      case 'report': return <ReportIcon {...iconProps} />
      case 'project': return <ProjectIcon {...iconProps} />
      case 'survey': return <SurveyIcon {...iconProps} />
      case 'finance': return <FinanceIcon {...iconProps} />
      case 'committee': return <CommitteeIcon {...iconProps} />
      default: return <GeneralIcon {...iconProps} />
    }
  }

  const getSeverity = (type) => {
    switch (type) {
      case 'report': return 'error'
      case 'message': return 'info'
      case 'finance': return 'warning'
      default: return 'success'
    }
  }

  const getTypeColor = (type) => {
    const config = notificationService.getNotificationConfig(type)
    return config.color || '#757575'
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Gerade eben'
    if (diffInMinutes < 60) return `vor ${diffInMinutes}m`
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)}h`
    return notificationTime.toLocaleDateString('de-DE')
  }

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'message':
        if (notification.chatId) {
          navigate(`/chat/${notification.chatId}`)
        } else {
          navigate('/chat')
        }
        break
      case 'report':
        navigate('/admin/reports')
        break
      case 'project':
        if (notification.projectId) {
          navigate(`/projects/${notification.projectId}`)
        } else {
          navigate('/projects')
        }
        break
      case 'survey':
        if (notification.surveyId) {
          navigate(`/surveys/${notification.surveyId}`)
        } else {
          navigate('/surveys')
        }
        break
      case 'finance':
        navigate('/finance')
        break
      case 'committee':
        navigate('/committee')
        break
      default:
        navigate('/dashboard')
    }
    
    removeNotification(notification.id)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    const handleNewNotification = (notification) => {
      const toastNotification = {
        id: Date.now() + Math.random(),
        ...notification,
        timestamp: notification.timestamp || new Date()
      }
      
      setNotifications(prev => [toastNotification, ...prev.slice(0, 4)])
      
      const config = notificationService.getNotificationConfig(notification.type)
      const duration = config.priority === 'high' ? 8000 : 5000
      
      setTimeout(() => {
        removeNotification(toastNotification.id)
      }, duration)
    }

    notificationService.onNotification(handleNewNotification)

    return () => {
      notificationService.offNotification(handleNewNotification)
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open
          TransitionComponent={SlideTransition}
          sx={{
            position: 'relative',
            marginBottom: index > 0 ? 1 : 0,
            pointerEvents: 'auto',
            '& .MuiSnackbar-root': {
              position: 'relative',
              transform: 'none !important'
            }
          }}
        >
          <Alert
            severity={getSeverity(notification.type)}
            icon={getNotificationIcon(notification.type)}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            onClick={() => handleNotificationClick(notification)}
            sx={{
              cursor: 'pointer',
              width: '100%',
              '&:hover': {
                backgroundColor: 'action.hover'
              },
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <AlertTitle sx={{ fontWeight: 600, mb: 0 }}>
                {notification.title}
              </AlertTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={notification.type}
                  size="small"
                  sx={{
                    backgroundColor: getTypeColor(notification.type),
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 12 }} />
                  {formatTimestamp(notification.timestamp)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" component="div" sx={{ mb: notification.sender ? 1 : 0 }}>
              {notification.body}
            </Typography>
            {notification.sender && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 20, height: 20, mr: 1, fontSize: 12 }}
                  src={notification.sender.avatar}
                >
                  {notification.sender.name?.charAt(0)}
                </Avatar>
                <Typography variant="caption" component="span">
                  {notification.sender.name}
                </Typography>
              </Box>
            )}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  )
}

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Chat from './pages/Chat'
import Finance from './pages/Finance'
import Profile from './pages/Profile'
import Calendar from './pages/Calendar'
import Files from './pages/Files'
import AbiVorabi from './pages/AbiVorabi'
import CommitteesProjects from './pages/CommitteesProjects'
import CommitteeManagement from './pages/CommitteeManagement'
import AdminPanel from './pages/AdminPanel'
import Archive from './pages/Archive'
import Actions from './pages/Actions'
import NotFound from './pages/NotFound'

// Protected Route Component for feature-based access control
function ProtectedRoute({ children, feature, requiresAuth = true }) {
  const { currentUser } = useAuth()
  const { isFeatureVisible } = useFeatures()
  
  if (requiresAuth && !currentUser) {
    return <Navigate to="/login" />
  }
  
  if (feature && !isFeatureVisible(feature)) {
    return <Navigate to="/" />
  }
  
  return children
}

function AppContent() {
  const { currentUser, loading } = useAuth()
  const { theme } = useTheme()
  const muiTheme = createAppTheme(theme)
  const navigate = useNavigate()
  const { viewport, isResizing } = useResponsive()
  
  // Dynamische CSS-Klassen basierend auf Viewport
  useEffect(() => {
    const body = document.body
    
    // Entferne alle responsive Klassen
    body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop', 'viewport-resizing')
    
    // Füge aktuelle Klassen hinzu
    if (viewport.isMobile) body.classList.add('viewport-mobile')
    if (viewport.isTablet) body.classList.add('viewport-tablet')
    if (viewport.isDesktop) body.classList.add('viewport-desktop')
    if (isResizing) body.classList.add('viewport-resizing')
    
    // CSS Custom Properties für dynamische Werte
    document.documentElement.style.setProperty('--viewport-width', `${viewport.width}px`)
    document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`)
  }, [viewport, isResizing])
  
  // Listen for service worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE_TO_NOTIFICATION') {
        const url = new URL(event.data.url)
        const path = url.pathname + url.search
        navigate(path)
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [navigate])
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <NotificationToast />
      <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProtectedRoute feature="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute feature="members"><Members /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute feature="chat"><Chat /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute feature="calendar"><Calendar /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute feature="files"><Files /></ProtectedRoute>} />
        <Route path="/abi-vorabi" element={<ProtectedRoute feature="abiVorabi"><AbiVorabi /></ProtectedRoute>} />
        <Route path="/committees-projects" element={<ProtectedRoute feature="committeesProjects"><CommitteesProjects /></ProtectedRoute>} />
        <Route path="/committee-management" element={<ProtectedRoute feature="committeesProjects"><CommitteeManagement /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute feature="finance"><Finance /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute feature="archive"><Archive /></ProtectedRoute>} />
        <Route path="/actions" element={<ProtectedRoute feature="actions"><Actions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute feature="profile"><Profile /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          currentUser && currentUser.role === 'admin' 
            ? <AdminPanel /> 
            : <Navigate to="/" />
        } 
      />
      <Route 
        path="/admin-panel" 
        element={
          currentUser && currentUser.role === 'admin' 
            ? <AdminPanel /> 
            : <Navigate to="/" />
        } 
      />
    </Route>
    
    {/* 404 Route */}
    <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  )
}

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  )
}

export default App