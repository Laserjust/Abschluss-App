import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import committeeRequestService from '../services/committeeRequestService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`committee-management-tabpanel-${index}`}
      aria-labelledby={`committee-management-tab-${index}`}
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
    id: `committee-management-tab-${index}`,
    'aria-controls': `committee-management-tabpanel-${index}`,
  };
}

const CommitteeManagement = () => {
  const { currentUser, hasCommitteeRole, isCommitteeLeader, canManageCommitteeRequests, getCommitteesByRole } = useAuth();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const [joinRequests, setJoinRequests] = useState([]);

  // Lade Beitrittsanfragen beim Komponenten-Mount
  useEffect(() => {
    const loadRequests = () => {
      const requests = committeeRequestService.getPendingRequests();
      setJoinRequests(requests);
    };

    loadRequests();

    // Listener für Änderungen
    committeeRequestService.addListener(loadRequests);

    return () => {
      committeeRequestService.removeListener(loadRequests);
    };
  }, []);

  // Mock-Daten für verwaltete Komitees (später aus echten Daten)
  const [managedCommittees] = useState([
    {
      id: 'comm1',
      name: 'Deko-Komitee',
      description: 'Verantwortlich für die gesamte Dekoration des Abiballs',
      memberCount: 12,
      pendingRequests: committeeRequestService.getPendingRequestsForCommittee('comm1').length,
      userRole: 'leader'
    },
    {
      id: 'comm2',
      name: 'Finanz-Komitee',
      description: 'Budgetplanung und Kostenüberwachung',
      memberCount: 8,
      pendingRequests: committeeRequestService.getPendingRequestsForCommittee('comm2').length,
      userRole: 'advisor'
    }
  ]);

  // Filtere Anfragen basierend auf Berechtigungen
  const getFilteredRequests = () => {
    if (!currentUser) return [];
    
    return joinRequests.filter(request => {
      // Admins sehen alle Anfragen
      if (currentUser.role === 'admin') return true;
      
      // Benutzer sehen nur Anfragen für Komitees, die sie verwalten können
      return canManageCommitteeRequests(request.committeeId);
    });
  };

  const handleApproveRequest = (requestId) => {
    const approvedRequest = committeeRequestService.approveRequest(
      requestId, 
      currentUser.displayName || currentUser.email
    );
    
    if (approvedRequest) {
      // Aktualisiere lokalen State
      setJoinRequests(prev => 
        prev.map(request => 
          request.id === requestId ? approvedRequest : request
        )
      );
    }
    setRequestDialogOpen(false);
    setSelectedRequest(null);
    setResponseMessage('');
  };

  const handleRejectRequest = (requestId) => {
    const rejectedRequest = committeeRequestService.rejectRequest(
      requestId, 
      currentUser.displayName || currentUser.email,
      responseMessage || 'Anfrage wurde abgelehnt'
    );
    
    if (rejectedRequest) {
      // Aktualisiere lokalen State
      setJoinRequests(prev => 
        prev.map(request => 
          request.id === requestId ? rejectedRequest : request
        )
      );
    }
    setRequestDialogOpen(false);
    setSelectedRequest(null);
    setResponseMessage('');
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return 'Unbekannt';
    }
  };

  const filteredRequests = getFilteredRequests();
  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');

  if (!currentUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">
          Sie müssen angemeldet sein, um auf das Komitee-Management zuzugreifen.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon sx={{ fontSize: '2rem' }} />
        Komitee-Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Verwalten Sie Beitrittsanfragen und Komitee-Einstellungen
      </Typography>

      {/* Übersichtskarten */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <NotificationsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{pendingRequests.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ausstehende Anfragen
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{managedCommittees.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verwaltete Komitees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {managedCommittees.reduce((sum, committee) => sum + committee.memberCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamte Mitglieder
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Beitrittsanfragen" icon={<NotificationsIcon />} {...a11yProps(0)} />
          <Tab label="Meine Komitees" icon={<GroupIcon />} {...a11yProps(1)} />
        </Tabs>
      </Box>

      {/* Beitrittsanfragen Tab */}
      <TabPanel value={tabValue} index={0}>
        {pendingRequests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Keine ausstehenden Anfragen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alle Beitrittsanfragen wurden bearbeitet.
            </Typography>
          </Paper>
        ) : (
          <List>
            {pendingRequests.map((request, index) => (
              <React.Fragment key={request.id}>
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleRequestClick(request)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{request.userName}</Typography>
                        <Chip 
                          label={request.committeeName} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {request.userEmail}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Angefragt am: {request.createdAt ? new Date(request.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {request.message}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveRequest(request.id);
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestClick(request);
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < pendingRequests.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Meine Komitees Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {managedCommittees.map((committee) => (
            <Grid item xs={12} sm={6} md={4} key={committee.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {committee.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {committee.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={committee.userRole === 'leader' ? 'Leitung' : 'Berater'} 
                      color={committee.userRole === 'leader' ? 'primary' : 'secondary'}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {committee.memberCount} Mitglieder
                    </Typography>
                  </Box>
                  
                  {committee.pendingRequests > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {committee.pendingRequests} ausstehende Anfrage{committee.pendingRequests > 1 ? 'n' : ''}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Request Detail Dialog */}
      <Dialog 
        open={requestDialogOpen} 
        onClose={() => setRequestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Beitrittsanfrage bearbeiten
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRequest.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedRequest.userEmail}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Komitee: {selectedRequest.committeeName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Angefragt am: {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Nachricht:
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedRequest.message}
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Antwort (optional)"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Geben Sie eine Nachricht ein, falls Sie die Anfrage ablehnen..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={() => handleRejectRequest(selectedRequest?.id)}
            color="error"
            variant="outlined"
          >
            Ablehnen
          </Button>
          <Button 
            onClick={() => handleApproveRequest(selectedRequest?.id)}
            color="success"
            variant="contained"
          >
            Genehmigen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommitteeManagement;