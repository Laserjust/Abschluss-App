import { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { useFeatures } from '../../context/FeatureContext.jsx';
import { 
  AppBar, 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Groups as GroupsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  School as SchoolIcon,
  AccountBalance as FinanceIcon,
  Archive as ArchiveIcon,
  Assignment as ActionsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  CalendarToday as CalendarIcon,
  Folder as FilesIcon,
  VisibilityOff as HiddenIcon,
} from '@mui/icons-material';
import NotificationCenter from '../NotificationCenter';
import yearManagementService from '../../services/yearManagementService';

const drawerWidth = 280;
  const mobileDrawerWidth = 260;

function MainLayout() {
  const { currentUser, logout, hasVorabiAccess, hasCommitteeManagementAccess } = useAuth();
  const { isFeatureVisible, isFeatureHiddenForStudents } = useFeatures();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isDark, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const anchorElRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    anchorElRef.current = event.currentTarget;
    setMenuOpen(true);
  };
  
  const handleProfileMenuClose = () => {
    anchorElRef.current = null;
    setMenuOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleProfileMenuClose();
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', feature: 'dashboard' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat', feature: 'chat' },
    { text: 'Mitgliederliste', icon: <PeopleIcon />, path: '/members', feature: 'members' },
    { text: 'Abi/Vorabi', icon: <SchoolIcon />, path: '/abi-vorabi', feature: 'abiVorabi' },
    { text: 'Komitees & Projekte', icon: <GroupsIcon />, path: '/committees-projects', feature: 'committeesProjects' },
    { text: 'Komitee-Management', icon: <AdminIcon />, path: '/committee-management', feature: 'committeeManagement', requiresPermission: 'committee_admin' },
    { text: 'Kalender', icon: <CalendarIcon />, path: '/calendar', feature: 'calendar' },
    { text: 'Dateien & Belege', icon: <FilesIcon />, path: '/files', feature: 'files' },
    { text: 'Finanzen', icon: <FinanceIcon />, path: '/finance', feature: 'finance' },
    { text: 'Aktionen', icon: <ActionsIcon />, path: '/actions', feature: 'actions' },
    { text: 'Archiv', icon: <ArchiveIcon />, path: '/archive', feature: 'archive' },
  ];
  
  // Filter menu items based on user permissions and feature visibility
  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresVorabi && (!currentUser || !hasVorabiAccess())) {
      return false;
    }
    // Check committee management permission
    if (item.requiresPermission === 'committee_admin' && (!currentUser || !hasCommitteeManagementAccess())) {
      return false;
    }
    // Check feature visibility
    if (item.feature && !isFeatureVisible(item.feature)) {
      return false;
    }
    return true;
  });
  
  // Add Admin Panel for admin users
  if (currentUser && currentUser.role === 'admin') {
    filteredMenuItems.push({ text: 'Admin-Panel', icon: <AdminIcon />, path: '/admin-panel' });
  }
  
  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          AbiOrga 20{yearManagementService.getCurrentYear()}
        </Typography>
        <Typography variant="caption" component="div" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Abitur-Organisation
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => {
          const isHiddenForStudents = item.feature && isFeatureHiddenForStudents(item.feature);
          const showHiddenIndicator = isHiddenForStudents && (currentUser?.role === 'teacher' || currentUser?.role === 'admin');
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  opacity: showHiddenIndicator ? 0.7 : 1,
                  borderLeft: showHiddenIndicator ? '3px solid orange' : 'none'
                }}
              >
                <ListItemIcon>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                    {showHiddenIndicator && (
                      <HiddenIcon 
                        sx={{ 
                          position: 'absolute', 
                          top: -4, 
                          right: -4, 
                          fontSize: 12, 
                          color: 'orange',
                          backgroundColor: 'background.paper',
                          borderRadius: '50%'
                        }} 
                      />
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={showHiddenIndicator ? 'Für Schüler versteckt' : null}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'orange'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {filteredMenuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <NotificationCenter />
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {currentUser?.photoURL ? (
                <Avatar src={currentUser.photoURL} alt={currentUser.displayName} />
              ) : (
                <Avatar>{currentUser?.displayName?.charAt(0) || <AccountIcon />}</Avatar>
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: mobileDrawerWidth, sm: drawerWidth },
              maxWidth: '85vw'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}
      >
        <Toolbar />
        <Box sx={{ 
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          <Outlet />
        </Box>
      </Box>
      
      <Menu
        anchorEl={anchorElRef.current}
        open={menuOpen}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200, borderRadius: 2, mt: 1 }
        }}
      >
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/profile');
        }}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profil" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Abmelden" />
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default MainLayout;
