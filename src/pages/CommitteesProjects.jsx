import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Tab,
  Tabs,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Stack,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Assignment as ProjectIcon,
  Poll as SurveyIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import committeeRequestService from '../services/committeeRequestService';
import committeeService from '../services/committeeService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`committee-tabpanel-${index}`}
      aria-labelledby={`committee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `committee-tab-${index}`,
    'aria-controls': `committee-tabpanel-${index}`,
  };
}

const CommitteesProjects = () => {
  const { currentUser: user } = useAuth();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedCommitteeToJoin, setSelectedCommitteeToJoin] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCommittee, setNewCommittee] = useState({ name: '', description: '', icon: '' });
  const [committees, setCommittees] = useState([]);

  // Lade Komitees beim Mount der Komponente
  useEffect(() => {
    const loadCommittees = () => {
      setCommittees(committeeService.getAllCommittees());
    };

    loadCommittees();

    // Listener für Änderungen am Committee Service
    committeeService.addListener(loadCommittees);

    return () => {
      committeeService.removeListener(loadCommittees);
    };
  }, []);

  const filteredCommittees = committees.filter(committee =>
    committee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    committee.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinCommittee = (committee) => {
    if (!user) {
      alert('Sie müssen angemeldet sein, um einem Komitee beizutreten.');
      return;
    }
    
    if (committeeRequestService.hasPendingRequest(user.uid, committee.id)) {
      alert('Sie haben bereits eine ausstehende Anfrage für dieses Komitee.');
      return;
    }
    
    setSelectedCommitteeToJoin(committee);
    setJoinDialogOpen(true);
  };

  const handleConfirmJoin = () => {
    if (selectedCommitteeToJoin && user) {
      if (selectedCommitteeToJoin.isOpen) {
        const success = committeeService.addMemberToCommittee(
          selectedCommitteeToJoin.id,
          user.uid,
          user.displayName || user.email
        );
        
        if (success) {
          setCommittees(committeeService.getAllCommittees());
          alert(`Sie sind dem Komitee "${selectedCommitteeToJoin.name}" erfolgreich beigetreten!`);
        } else {
          alert('Sie sind bereits Mitglied dieses Komitees.');
        }
      } else {
        committeeRequestService.createJoinRequest(
          user.uid,
          user.displayName || user.email,
          user.email,
          selectedCommitteeToJoin.id,
          selectedCommitteeToJoin.name,
          'Ich möchte diesem Komitee beitreten.'
        );
        
        alert('Ihre Beitrittsanfrage wurde erfolgreich gesendet!');
      }
    }
    
    setJoinDialogOpen(false);
    setSelectedCommitteeToJoin(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'warning';
      case 'active': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return <ScheduleIcon />;
      case 'active': return <PlayArrowIcon />;
      case 'completed': return <CheckCircleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'In Planung';
      case 'active': return 'Aktiv';
      case 'completed': return 'Abgeschlossen';
      default: return 'Unbekannt';
    }
  };

  const handleCreateCommittee = () => {
    if (!user) {
      alert('Sie müssen angemeldet sein, um ein Komitee zu erstellen.');
      return;
    }

    try {
      const createdCommittee = committeeService.createCommittee(
        newCommittee.name,
        newCommittee.description,
        newCommittee.icon,
        user.uid,
        user.displayName || user.email
      );
      
      setCommittees(committeeService.getAllCommittees());
      
      alert(`Komitee "${createdCommittee.name}" wurde erfolgreich erstellt!`);
      setCreateDialogOpen(false);
      setNewCommittee({ name: '', description: '', icon: '' });
    } catch (error) {
      console.error('Fehler beim Erstellen des Komitees:', error);
      alert('Fehler beim Erstellen des Komitees. Bitte versuchen Sie es erneut.');
    }
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewCommittee({ name: '', description: '', icon: '' });
  };

  if (selectedCommittee) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => setSelectedCommittee(null)}
          >
            ← Zurück zur Übersicht
          </Button>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '2rem' }}>{selectedCommittee.icon}</span>
            {selectedCommittee.name}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Info" icon={<InfoIcon />} {...a11yProps(0)} />
            <Tab label="Projekte" icon={<ProjectIcon />} {...a11yProps(1)} />
            <Tab label="Umfragen" icon={<SurveyIcon />} {...a11yProps(2)} />
            <Tab label="Mitglieder" icon={<GroupIcon />} {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Über dieses Komitee
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedCommittee.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={`${selectedCommittee.memberCount} Mitglieder`} 
                      icon={<GroupIcon />} 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={selectedCommittee.isOpen ? 'Offenes Komitee' : 'Geschlossenes Komitee'} 
                      color={selectedCommittee.isOpen ? 'success' : 'warning'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Komiteeleitung
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar src={selectedCommittee.leader.avatar}>
                      {selectedCommittee.leader.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body1">
                      {selectedCommittee.leader.name}
                    </Typography>
                  </Box>
                  {user && !selectedCommittee.members.some(member => member.id === user.uid) && (
                    <Button 
                      variant="contained" 
                      fullWidth
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleJoinCommittee(selectedCommittee)}
                    >
                      Komitee beitreten
                    </Button>
                  )}
                  {user && selectedCommittee.members.some(member => member.id === user.uid) && (
                    <Chip 
                      label="Sie sind Mitglied"
                      color="success"
                      sx={{ width: '100%', justifyContent: 'center' }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {selectedCommittee.projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {project.title}
                      </Typography>
                      {selectedCommittee.surveys.some(survey => survey.projectId === project.id && survey.isActive) && (
                        <Badge badgeContent="Umfrage" color="primary" sx={{ ml: 1 }}>
                          <SurveyIcon color="action" />
                        </Badge>
                      )}
                    </Box>
                    
                    <Chip 
                      label={getStatusText(project.status)}
                      color={getStatusColor(project.status)}
                      icon={getStatusIcon(project.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Fortschritt: {project.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      {project.memberCount} Mitglieder
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Deadline: {new Date(project.deadline).toLocaleDateString('de-DE')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Details</Button>
                    {user && selectedCommittee.members.some(member => member.id === user.uid) && (
                      <Button size="small" variant="outlined">
                        Projekt beitreten
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {selectedCommittee.surveys.map((survey) => (
              <Grid item xs={12} sm={6} md={4} key={survey.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {survey.title}
                    </Typography>
                    <Chip 
                      label={survey.isActive ? 'Aktiv' : 'Beendet'}
                      color={survey.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small">
                      {survey.isActive ? 'Teilnehmen' : 'Ergebnisse'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {selectedCommittee.surveys.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Keine Umfragen verfügbar
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mitglieder ({selectedCommittee.members.length})
              </Typography>
              <List>
                {selectedCommittee.members.map((member, index) => (
                  <React.Fragment key={member.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={member.avatar}>
                          {member.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={member.name}
                        secondary={member.role}
                      />
                    </ListItem>
                    {index < selectedCommittee.members.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🏛️ Komitees & Projekte
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Komitees durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredCommittees.map((committee) => (
          <Grid item xs={12} sm={6} md={4} key={committee.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(30, 64, 175, 0.1)' 
                    : 'rgba(224, 242, 254, 0.5)'
                }
              }}
              onClick={() => setSelectedCommittee(committee)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h3" component="span">
                    {committee.icon}
                  </Typography>
                  <Typography variant="h6" component="h3">
                    {committee.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {committee.description}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    label={`${committee.memberCount} Mitglieder`}
                    size="small"
                    icon={<GroupIcon />}
                  />
                  {user && committee.members.some(member => member.id === user.uid) && (
                    <Chip 
                      label="Mitglied"
                      size="small"
                      color="success"
                    />
                  )}
                </Stack>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCommittee(committee);
                  }}
                >
                  Details
                </Button>
                {user && !committee.members.some(member => member.id === user.uid) && (
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinCommittee(committee);
                    }}
                  >
                    Beitreten
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>
          Komitee beitreten
        </DialogTitle>
        <DialogContent>
          {selectedCommitteeToJoin && (
            <>
              <Typography>
                Möchten Sie dem Komitee "{selectedCommitteeToJoin.name}" beitreten?
              </Typography>
              {!selectedCommitteeToJoin.isOpen && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  Dies ist ein geschlossenes Komitee. Ihre Anfrage muss von der Leitung genehmigt werden.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirmJoin} variant="contained">
            {selectedCommitteeToJoin?.isOpen ? 'Beitreten' : 'Anfrage senden'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="Neues Komitee erstellen"
        onClick={() => setCreateDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Neues Komitee erstellen
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Komitee-Name"
              value={newCommittee.name}
              onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={3}
              value={newCommittee.description}
              onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Icon/Emoji"
              placeholder="z.B. 🎨, 💰, 🎵"
              value={newCommittee.icon}
              onChange={(e) => setNewCommittee({ ...newCommittee, icon: e.target.value })}
              helperText="Wählen Sie ein Emoji als Icon für das Komitee"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreateCommittee} 
            variant="contained"
            disabled={!newCommittee.name.trim() || !newCommittee.description.trim()}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommitteesProjects;
