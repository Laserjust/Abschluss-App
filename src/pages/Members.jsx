import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUserService } from '../services/userService';
import yearManagementService from '../services/yearManagementService';
import dataIsolationService from '../services/dataIsolationService';

function Members() {
  const { currentUser, currentYear } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getAllMembers, searchMembers, getMembersByRole, getLastUpdate } = useUserService();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  const [members, setMembers] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Load users from AdminPanel (localStorage and MockFirestore)
  const loadAdminUsers = async () => {
    try {
      // Load from localStorage (created users)
      const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
      const formattedLocalUsers = localStorageUsers.map(user => ({
        id: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: null,
        phone: null,
        courses: [],
        committees: [],
        joinedAt: new Date(user.createdAt || '2023-09-01'),
        lastActive: new Date(),
        status: 'online'
      }));
      
      return formattedLocalUsers;
    } catch (error) {
      console.error('Error loading admin users:', error);
      return [];
    }
  };

  // Hilfsfunktion zur Überprüfung vorhandener Jahrgangsdaten
  const hasYearData = () => {
    const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
    return mockData.years && mockData.years[currentYear] && Object.keys(mockData.years[currentYear]).length > 0;
  };

  // Überwache Änderungen in den Benutzerdaten
  useEffect(() => {
    const loadAllMembers = async () => {
      // Initialize data isolation service
      if (currentYear) {
        dataIsolationService.setCurrentYear(currentYear);
        dataIsolationService.initializeYearData(currentYear);
      }
      
      // Load members from userService
      const loadedMembers = getAllMembers();
      
      // Load users from AdminPanel
      const adminUsers = await loadAdminUsers();
      
      // Combine and deduplicate members
      const allMembers = [...loadedMembers, ...adminUsers];
      const uniqueMembers = allMembers.filter((member, index, self) => 
        index === self.findIndex(m => m.id === member.id || m.email === member.email)
      );
      
      setMembers(uniqueMembers);
    };
    
    loadAllMembers();
  }, [getLastUpdate(), currentYear]); // Aktualisiere wenn sich Benutzerdaten ändern

  // Timer für Echtzeit-Updates der "zuletzt online" Anzeige
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Aktualisiere jede Minute

    return () => clearInterval(timer);
  }, []);

  // Fallback-Daten für Demo-Zwecke (falls keine echten Daten verfügbar)
  const fallbackMembers = [
    {
      id: 1,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: `max.mustermann@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
      role: 'admin',
      avatar: null,
      phone: '+49 123 456789',
      courses: ['Mathematik LK', 'Physik LK', 'Deutsch', 'Englisch'],
      committees: ['Abschlussfeier', 'Jahrbuch'],
      joinedAt: new Date('2023-09-01'),
      lastActive: new Date('2024-02-15'),
      status: 'online'
    },
    {
      id: 2,
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: `anna.schmidt@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
      role: 'teacher',
      avatar: null,
      phone: '+49 987 654321',
      courses: ['Deutsch LK', 'Geschichte'],
      committees: ['Abschlussfahrt'],
      joinedAt: new Date('2023-09-01'),
      lastActive: new Date('2024-02-14'),
      status: 'away'
    },
    {
      id: 3,
      firstName: 'Lisa',
      lastName: 'Weber',
      email: `lisa.weber@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
      role: 'student',
      avatar: null,
      phone: '+49 555 123456',
      courses: ['Biologie LK', 'Chemie LK', 'Mathematik', 'Deutsch'],
      committees: ['Jahrbuch', 'Mottowoche'],
      joinedAt: new Date('2023-09-01'),
      lastActive: new Date('2024-02-15'),
      status: 'online'
    },
    {
      id: 4,
      firstName: 'Tom',
      lastName: 'Mueller',
      email: `tom.mueller@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
      role: 'student',
      avatar: null,
      phone: '+49 777 888999',
      courses: ['Geschichte LK', 'Englisch LK', 'Mathematik', 'Biologie'],
      committees: ['Abschlussfeier'],
      joinedAt: new Date('2023-09-01'),
      lastActive: new Date('2024-02-13'),
      status: 'offline'
    },
    {
      id: 5,
      firstName: 'Sarah',
      lastName: 'Klein',
      email: `sarah.klein@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
      role: 'student',
      avatar: null,
      phone: '+49 333 444555',
      courses: ['Kunst LK', 'Deutsch LK', 'Englisch', 'Geschichte'],
      committees: ['Jahrbuch', 'Zeitkapsel'],
      joinedAt: new Date('2023-09-01'),
      lastActive: new Date('2024-02-15'),
      status: 'online'
    }
  ];

  // Verwende Fallback-Daten nur wenn keine echten Mitglieder geladen wurden UND bereits Daten für das Jahr existieren
  const displayMembers = members.length > 0 ? members : (hasYearData() ? fallbackMembers : []);
  
  // Aktualisiere members state mit Fallback-Daten wenn leer und Jahr hat bereits Daten
  useEffect(() => {
    if (members.length === 0 && hasYearData()) {
      setMembers(fallbackMembers);
    }
  }, [currentYear]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon sx={{ color: '#f44336' }} />;
      case 'teacher': return <SchoolIcon sx={{ color: '#ff9800' }} />;
      case 'student': return <PersonIcon sx={{ color: '#4caf50' }} />;
      default: return <PersonIcon />;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Lehrer';
      case 'student': return 'Schüler';
      default: return 'Unbekannt';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teacher': return 'warning';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    const isDarkMode = theme.palette.mode === 'dark';
    
    switch (status) {
      case 'online': 
        return isDarkMode ? '#00ff00' : '#4caf50'; // Neon-Grün im Dark Mode
      case 'away': 
        return isDarkMode ? '#ffff00' : '#ff9800'; // Neon-Gelb im Dark Mode
      case 'offline': 
        return isDarkMode ? '#ffffff' : '#9e9e9e'; // Reines Weiß im Dark Mode
      default: 
        return isDarkMode ? '#ffffff' : '#9e9e9e';
    }
  };

  const handleSendMessage = (member) => {
    // Schließe den Dialog
    setDetailDialogOpen(false);
    
    // Navigiere zur Chat-Seite mit Benutzerinformationen
    navigate('/chat', {
      state: {
        startPrivateChat: true,
        targetUser: {
          id: member.id,
          displayName: `${member.firstName} ${member.lastName}`,
          email: member.email,
          photoURL: member.avatar
        }
      }
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Abwesend';
      case 'offline': return 'Offline';
      default: return 'Unbekannt';
    }
  };

  const getLastActiveText = (member) => {
    if (member.status === 'online') {
      return 'Jetzt online';
    }
    
    const lastActive = member.lastActive;
    const now = currentTime; // Verwende currentTime für automatische Updates
    const diffMs = now - lastActive;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return 'Gerade eben online';
    } else if (diffMinutes < 60) {
      return `Vor ${diffMinutes} Min. online`;
    } else if (diffHours < 24) {
      return `Vor ${diffHours} Std. online`;
    } else if (diffDays === 1) {
      return 'Gestern online';
    } else if (diffDays < 7) {
      return `Vor ${diffDays} Tagen online`;
    } else {
      return `Zuletzt online: ${lastActive.toLocaleDateString('de-DE')}`;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const filteredAndSortedMembers = displayMembers
    .filter(member => {
      const matchesSearch = 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'lastActive':
          return new Date(b.lastActive) - new Date(a.lastActive);
        case 'joinedAt':
          return new Date(a.joinedAt) - new Date(b.joinedAt);
        default:
          return 0;
      }
    });

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setSortBy('name');
  };

  const roleStats = {
    total: members.length,
    admin: members.filter(m => m.role === 'admin').length,
    teacher: members.filter(m => m.role === 'teacher').length,
    student: members.filter(m => m.role === 'student').length,
    online: members.filter(m => m.status === 'online').length
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          👥 Mitgliederliste
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
          >
            {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">{roleStats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Gesamt</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error">{roleStats.admin}</Typography>
            <Typography variant="body2" color="text.secondary">Admins</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">{roleStats.teacher}</Typography>
            <Typography variant="body2" color="text.secondary">Lehrer</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">{roleStats.student}</Typography>
            <Typography variant="body2" color="text.secondary">Schüler</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Suche nach Name oder E-Mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Rolle</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Alle Rollen</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="teacher">Lehrer</MenuItem>
                <MenuItem value="student">Schüler</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sortierung</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="role">Rolle</MenuItem>
                <MenuItem value="lastActive">Letzte Aktivität</MenuItem>
                <MenuItem value="joinedAt">Beitrittsdatum</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Zurücksetzen
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Members Display */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredAndSortedMembers.map(member => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => handleMemberClick(member)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(member.status),
                          border: `2px solid ${theme.palette.background.paper}`,
                          opacity: 1,
                          boxShadow: theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.1)' : 'none'
                        }}
                      />
                    }
                  >
                    <Avatar
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {getInitials(member.firstName, member.lastName)}
                    </Avatar>
                  </Badge>
                  
                  <Typography variant="h6" gutterBottom>
                    {member.firstName} {member.lastName}
                  </Typography>
                  
                  <Chip 
                    icon={getRoleIcon(member.role)}
                    label={getRoleText(member.role)}
                    color={getRoleColor(member.role)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {member.email}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {getLastActiveText(member)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <List>
            {filteredAndSortedMembers.map((member, index) => (
              <div key={member.id}>
                <ListItem 
                  button 
                  onClick={() => handleMemberClick(member)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(member.status),
                            border: `2px solid ${theme.palette.background.paper}`,
                            opacity: 1,
                            boxShadow: theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.1)' : 'none'
                          }}
                        />
                      }
                    >
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {getInitials(member.firstName, member.lastName)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography variant="subtitle1" component="span">
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Chip 
                          icon={getRoleIcon(member.role)}
                          label={getRoleText(member.role)}
                          color={getRoleColor(member.role)}
                          size="small"
                        />
                      </span>
                    }
                    secondary={
                      <span>
                        <Typography variant="body2" component="span">
                          {member.email}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {member.courses.length} Kurse • {member.committees.length} Komitees • 
                          {getLastActiveText(member)}
                        </Typography>
                      </span>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={getStatusText(member.status)}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: getStatusColor(member.status)
                        }}
                      />
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredAndSortedMembers.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Paper>
      )}

      {filteredAndSortedMembers.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Mitglieder gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versuche deine Suchkriterien zu ändern.
          </Typography>
        </Paper>
      )}

      {/* Member Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMember && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(selectedMember.status),
                        border: `2px solid ${theme.palette.background.paper}`,
                        opacity: 1,
                        boxShadow: theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.1)' : 'none'
                      }}
                    />
                  }
                >
                  <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                    {getInitials(selectedMember.firstName, selectedMember.lastName)}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h6">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </Typography>
                  <Chip 
                    icon={getRoleIcon(selectedMember.role)}
                    label={getRoleText(selectedMember.role)}
                    color={getRoleColor(selectedMember.role)}
                    size="small"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography>{selectedMember.email}</Typography>
                </Box>
                
                {selectedMember.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography>{selectedMember.phone}</Typography>
                  </Box>
                )}
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Kurse ({selectedMember.courses.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedMember.courses.map(course => (
                      <Chip key={course} label={course} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Komitees ({selectedMember.committees.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedMember.committees.map(committee => (
                      <Chip key={committee} label={committee} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {getStatusText(selectedMember.status)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Beigetreten:</strong> {selectedMember.joinedAt.toLocaleDateString('de-DE')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Zuletzt aktiv:</strong> {selectedMember.lastActive.toLocaleDateString('de-DE')}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Schließen</Button>
              <Button 
                variant="contained" 
                startIcon={<EmailIcon />}
                onClick={() => handleSendMessage(selectedMember)}
              >
                Nachricht senden
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Members;
