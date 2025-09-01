import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import dataIsolationService from '../services/dataIsolationService';

function Calendar() {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    type: 'event',
    category: 'Sonstiges',
    description: ''
  });

  const eventTypes = [
    { value: 'exam', label: 'Klausur', color: '#f44336', icon: <SchoolIcon /> },
    { value: 'deadline', label: 'Deadline', color: '#ff9800', icon: <AssignmentIcon /> },
    { value: 'meeting', label: 'Meeting', color: '#2196f3', icon: <GroupIcon /> },
    { value: 'event', label: 'Veranstaltung', color: '#4caf50', icon: <EventIcon /> }
  ];

  const categories = ['Abi/Vorabi', 'Komitee', 'Projekt', 'Schule', 'Sonstiges'];

  // Load events from localStorage on component mount
  useEffect(() => {
    const loadEvents = () => {
      try {
        const year = dataIsolationService.currentYear || '27';
        const storageKey = `calendar_events_${year}`;
        const savedEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
        // Convert date strings back to Date objects
        const eventsWithDates = savedEvents.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error('Error loading calendar events:', error);
        // Set default events if loading fails
        const defaultEvents = [
          {
            id: 1,
            title: 'Mathematik LK Klausur',
            date: new Date(2024, 2, 15),
            type: 'exam',
            category: 'Abi/Vorabi',
            description: 'Analysis und Stochastik'
          },
          {
            id: 2,
            title: 'Komitee Meeting - Abschlussfeier',
            date: new Date(2024, 2, 18),
            type: 'meeting',
            category: 'Komitee',
            description: 'Planung der Abschlussfeier'
          },
          {
            id: 3,
            title: 'Projekt Deadline - Jahrbuch',
            date: new Date(2024, 2, 22),
            type: 'deadline',
            category: 'Projekt',
            description: 'Finale Abgabe aller Inhalte'
          }
        ];
        setEvents(defaultEvents);
        saveEvents(defaultEvents);
      }
    };

    loadEvents();
  }, []);

  // Save events to localStorage with year-specific key
  const saveEvents = (eventsToSave) => {
    try {
      const year = dataIsolationService.currentYear || '27';
      const storageKey = `calendar_events_${year}`;
      localStorage.setItem(storageKey, JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Error saving calendar events:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    const event = {
      ...newEvent,
      id: Date.now()
    };
    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setDialogOpen(false);
    setNewEvent({
      title: '',
      date: new Date(),
      type: 'event',
      category: 'Sonstiges',
      description: ''
    });
  };

  const handleDeleteEvent = (eventId) => {
    console.log('handleDeleteEvent called with eventId:', eventId);
    console.log('Current events:', events);
    const updatedEvents = events.filter(event => event.id !== eventId);
    console.log('Updated events after deletion:', updatedEvents);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    console.log('Event deleted successfully');
  };

  const getEventTypeConfig = (type) => {
    return eventTypes.find(t => t.value === type) || eventTypes[3];
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const days = getDaysInMonth(currentDate);
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          📅 Kalender
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Termin hinzufügen
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={8} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={() => navigateMonth(-1)}>
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={goToToday} title="Heute">
                  <TodayIcon />
                </IconButton>
                <IconButton onClick={() => navigateMonth(1)}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Day Headers */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 1, 
              mb: 1 
            }}>
              {dayNames.map(day => (
                <Box key={day}>
                  <Typography 
                    variant="subtitle2" 
                    align="center" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'text.secondary',
                      py: 1
                    }}
                  >
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar Days */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 1 
            }}>
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday = day && day.toDateString() === new Date().toDateString();
                
                return (
                  <Box key={index}>
                    <Card 
                      sx={{ 
                        minHeight: 100,
                        cursor: day ? 'pointer' : 'default',
                        bgcolor: day ? (isToday ? 'primary.50' : 'background.paper') : 'transparent',
                        border: isToday ? 2 : 1,
                        borderColor: isToday ? 'primary.main' : 'divider',
                        '&:hover': day ? {
                          bgcolor: 'action.hover'
                        } : {}
                      }}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        {day && (
                          <>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: isToday ? 600 : 400,
                                color: isToday ? 'primary.main' : 'text.primary',
                                mb: 0.5
                              }}
                            >
                              {day.getDate()}
                            </Typography>
                            {dayEvents.map(event => {
                              const config = getEventTypeConfig(event.type);
                              return (
                                <Chip
                                  key={event.id}
                                  label={event.title}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    mb: 0.5,
                                    bgcolor: config.color,
                                    color: 'white',
                                    display: 'block',
                                    '& .MuiChip-label': {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }
                                  }}
                                />
                              );
                            })}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Anstehende Termine
            </Typography>
            
            <List>
              {upcomingEvents.map((event, index) => {
                const config = getEventTypeConfig(event.type);
                return (
                  <div key={event.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ color: config.color }}>
                        {config.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={`${event.date.toLocaleDateString('de-DE')} • ${event.category}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEvent(event.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < upcomingEvents.length - 1 && <Divider />}
                  </div>
                );
              })}
            </List>
            
            {upcomingEvents.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Keine anstehenden Termine
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Termin hinzufügen</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Titel"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Datum"
              type="date"
              value={newEvent.date.toISOString().split('T')[0]}
              onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Typ</InputLabel>
              <Select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              >
                {eventTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Beschreibung"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleAddEvent} 
            variant="contained"
            disabled={!newEvent.title}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Calendar;
