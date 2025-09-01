import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
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
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Stack
} from '@mui/material'
import {
  Archive as ArchiveIcon,
  Assignment as ActionIcon,
  Folder as ProjectIcon,
  Poll as SurveyIcon,
  AccountBalance as FinanceIcon,
  Announcement as AnnouncementIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  DateRange as DateIcon,
  Group as GroupIcon,
  Visibility as ViewIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { mockFirestore } from '../services/mockFirestore'
import yearManagementService from '../services/yearManagementService'
import dataIsolationService from '../services/dataIsolationService'

function Archive() {
  const { currentUser, currentYear } = useAuth()

  // Initialize data isolation service with current year
  useEffect(() => {
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
    }
  }, [currentYear]);
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState(currentYear?.toString() || yearManagementService.getCurrentYear().toString())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [archiveData, setArchiveData] = useState({
    actions: [],
    projects: [],
    surveys: [],
    finances: [],
    announcements: []
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Hilfsfunktion zur Überprüfung vorhandener Jahrgangsdaten
  const hasYearData = () => {
    const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}')
    return mockData.years && mockData.years[currentYear] && Object.keys(mockData.years[currentYear]).length > 0
  }

  // Mock data für das Archiv
  useEffect(() => {
    // Initialize data isolation service
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear)
      dataIsolationService.initializeYearData(currentYear)
    }

    // Only show mock data if year has existing data
    if (!hasYearData()) {
      setArchiveData({
        actions: [],
        projects: [],
        surveys: [],
        finances: [],
        announcements: []
      })
      return
    }

    const mockArchiveData = {
      actions: [
        {
          id: 1,
          title: `Abi-Pulli Bestellung 20${currentYear || yearManagementService.getCurrentYear()}`,
          description: `Bestellung der Abschluss-Pullover für den Jahrgang 20${currentYear || yearManagementService.getCurrentYear()}`,
          date: '2024-01-15',
          status: 'Abgeschlossen',
          participants: 85,
          committee: 'Merchandise-Komitee',
          financialSummary: { total: 2550, perPerson: 30 },
          documents: ['Bestellliste.pdf', 'Größentabelle.pdf'],
          linkedProjects: ['Merchandise-Design']
        },
        {
          id: 2,
          title: 'Abi-Fahrt Organisation',
          description: 'Planung und Durchführung der Abschlussfahrt nach Prag',
          date: '2024-02-20',
          status: 'Abgeschlossen',
          participants: 78,
          committee: 'Fahrt-Komitee',
          financialSummary: { total: 23400, perPerson: 300 },
          documents: ['Reiseplan.pdf', 'Hotelbuchung.pdf'],
          linkedProjects: ['Fahrt-Planung']
        }
      ],
      projects: [
        {
          id: 1,
          title: 'Abi-Ball Dekoration',
          description: 'Gestaltung der Dekoration für den Abschlussball',
          date: '2024-03-10',
          status: 'Genehmigt',
          committee: 'Deko-Komitee',
          surveys: ['Farbschema-Abstimmung', 'Motto-Wahl'],
          budget: 1500,
          documents: ['Dekoplan.pdf', 'Kostenaufstellung.xlsx'],
          linkedActions: ['Deko-Material Bestellung']
        },
        {
          id: 2,
          title: 'Abizeitung Layout',
          description: 'Design und Layout der Abschlusszeitung',
          date: '2024-01-25',
          status: 'Abgeschlossen',
          committee: 'Zeitung-Komitee',
          surveys: ['Cover-Design Wahl'],
          budget: 800,
          documents: ['Layout_Final.pdf', 'Druckauftrag.pdf'],
          linkedActions: ['Zeitung Druck']
        }
      ],
      surveys: [
        {
          id: 1,
          title: 'Abi-Motto Abstimmung',
          description: `Wahl des offiziellen Abi-Mottos 20${currentYear || yearManagementService.getCurrentYear()}`,
          date: '2023-12-15',
          participants: 92,
          result: `ABI 20${currentYear || yearManagementService.getCurrentYear()} - Endlich Erwachsen (65% der Stimmen)`,
          linkedProject: 'Motto-Entwicklung',
          options: [
            { text: `ABI 20${currentYear || yearManagementService.getCurrentYear()} - Endlich Erwachsen`, votes: 60, percentage: 65 },
            { text: `ABI 20${currentYear || yearManagementService.getCurrentYear()} - Mission Possible`, votes: 20, percentage: 22 },
            { text: `ABI 20${currentYear || yearManagementService.getCurrentYear()} - Level Complete`, votes: 12, percentage: 13 }
          ]
        },
        {
          id: 2,
          title: 'Abi-Ball Location',
          description: 'Auswahl der Location für den Abschlussball',
          date: '2024-01-08',
          participants: 87,
          result: 'Hotel Grandview (58% der Stimmen)',
          linkedProject: 'Ball-Planung',
          options: [
            { text: 'Hotel Grandview', votes: 50, percentage: 58 },
            { text: 'Stadthalle', votes: 25, percentage: 29 },
            { text: 'Eventcenter Plaza', votes: 12, percentage: 13 }
          ]
        },
        {
          id: 3,
          title: 'Catering Auswahl',
          description: 'Welches Catering soll für die Abschlussfeier gebucht werden?',
          date: '2024-01-20',
          participants: 58,
          result: 'Catering Müller (43% der Stimmen)',
          linkedProject: 'Abschlussfeier-Planung',
          committee: 'Abschlussfeier-Komitee',
          options: [
            { text: 'Catering Müller', votes: 25, percentage: 43 },
            { text: 'Gourmet Service', votes: 20, percentage: 34 },
            { text: 'Party Catering Plus', votes: 13, percentage: 23 }
          ]
        }
      ],
      finances: [
        {
          id: 1,
          title: 'Pulli-Bestellung Abrechnung',
          description: 'Endabrechnung der Abi-Pulli Bestellung',
          date: '2024-01-20',
          totalAmount: 2550,
          type: 'Ausgabe',
          linkedAction: `Abi-Pulli Bestellung 20${currentYear || yearManagementService.getCurrentYear()}`,
          committee: 'Merchandise-Komitee',
          status: 'Abgeschlossen',
          participants: 85
        },
        {
          id: 2,
          title: 'Kuchenverkauf Erlös',
          description: 'Einnahmen aus dem Kuchenverkauf beim Schulfest',
          date: '2024-02-14',
          totalAmount: 450,
          type: 'Einnahme',
          linkedAction: 'Schulfest Kuchenverkauf',
          committee: 'Finanz-Komitee',
          status: 'Abgeschlossen',
          participants: 12
        }
      ],
      announcements: [
        {
          id: 1,
          title: 'Pulli-Bestellung erfolgreich abgeschlossen',
          description: 'Alle 85 Abi-Pullis wurden erfolgreich bestellt und werden in 2 Wochen geliefert.',
          date: '2024-01-16',
          author: 'Merchandise-Komitee',
          linkedAction: `Abi-Pulli Bestellung 20${currentYear || yearManagementService.getCurrentYear()}`
        },
        {
          id: 2,
          title: 'Abi-Fahrt Anmeldung geschlossen',
          description: 'Die Anmeldung für die Abi-Fahrt nach Prag ist nun geschlossen. 78 Schüler haben sich angemeldet.',
          date: '2024-02-01',
          author: 'Fahrt-Komitee',
          linkedAction: 'Abi-Fahrt Organisation'
        }
      ]
    }
    setArchiveData(mockArchiveData)
  }, [currentYear])

  const categories = [
    { id: 'all', label: 'Alle Kategorien', icon: <ArchiveIcon />, count: getTotalCount() },
    { id: 'actions', label: 'Aktionen', icon: <ActionIcon />, count: archiveData.actions.length },
    { id: 'projects', label: 'Projekte', icon: <ProjectIcon />, count: archiveData.projects.length },
    { id: 'surveys', label: 'Umfragen', icon: <SurveyIcon />, count: archiveData.surveys.length },
    { id: 'finances', label: 'Finanzberichte', icon: <FinanceIcon />, count: archiveData.finances.length },
    { id: 'announcements', label: 'Ankündigungen', icon: <AnnouncementIcon />, count: archiveData.announcements.length }
  ]

  function getTotalCount() {
    return archiveData.actions.length + archiveData.projects.length + 
           archiveData.surveys.length + archiveData.finances.length + 
           archiveData.announcements.length
  }

  const getFilteredData = () => {
    let data = []
    
    if (selectedCategory === 'all') {
      data = [
        ...archiveData.actions.map(item => ({ ...item, type: 'action' })),
        ...archiveData.projects.map(item => ({ ...item, type: 'project' })),
        ...archiveData.surveys.map(item => ({ ...item, type: 'survey' })),
        ...archiveData.finances.map(item => ({ ...item, type: 'finance' })),
        ...archiveData.announcements.map(item => ({ ...item, type: 'announcement' }))
      ]
    } else {
      data = archiveData[selectedCategory]?.map(item => ({ ...item, type: selectedCategory })) || []
    }

    // Filter by search term
    if (searchTerm) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.committee?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by date (newest first)
    return data.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getItemIcon = (type) => {
    switch (type) {
      case 'action': return <ActionIcon />
      case 'project': return <ProjectIcon />
      case 'survey': return <SurveyIcon />
      case 'finance': return <FinanceIcon />
      case 'announcement': return <AnnouncementIcon />
      default: return <ArchiveIcon />
    }
  }

  const getItemColor = (type) => {
    switch (type) {
      case 'action': return 'primary'
      case 'project': return 'success'
      case 'survey': return 'warning'
      case 'finance': return 'error'
      case 'announcement': return 'default'
      default: return 'default'
    }
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setDetailDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const canViewFinances = () => {
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'committee')
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArchiveIcon fontSize="large" />
          Archiv
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chronik aller abgeschlossenen Aktionen, Projekte und Ereignisse des Jahrgangs {selectedYear}
        </Typography>
      </Box>

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Jahrgang</InputLabel>
                <Select
                  value={selectedYear}
                  label="Jahrgang"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <MenuItem value="2027">Abi 2027</MenuItem>
                  <MenuItem value="2026">Abi 2026</MenuItem>
                  <MenuItem value="2025">Abi 2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Kategorie"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.icon}
                        {category.label}
                        <Badge badgeContent={category.count} color="primary" sx={{ ml: 'auto' }} />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Category Overview */}
      {selectedCategory === 'all' && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {categories.slice(1).map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={category.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: getItemColor(category.id) === 'primary' ? 'primary.main' : 
                                   getItemColor(category.id) === 'success' ? 'success.main' :
                                   getItemColor(category.id) === 'warning' ? 'warning.main' :
                                   getItemColor(category.id) === 'error' ? 'error.main' : 'text.secondary', mb: 1 }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {category.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Archive Items */}
      <Grid container spacing={3}>
        {getFilteredData().map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={`${item.type}-${item.id}`}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleItemClick(item)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: getItemColor(item.type) === 'primary' ? 'primary.main' : 
                                        getItemColor(item.type) === 'success' ? 'success.main' :
                                        getItemColor(item.type) === 'warning' ? 'warning.main' :
                                        getItemColor(item.type) === 'error' ? 'error.main' : 'grey.500' }}>
                    {getItemIcon(item.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatDate(item.date)}
                    </Typography>
                    <Chip 
                      label={categories.find(c => c.id === item.type)?.label || item.type}
                      size="small"
                      color={getItemColor(item.type)}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>

                {item.committee && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {item.committee}
                    </Typography>
                  </Box>
                )}

                {item.participants && (
                  <Typography variant="caption" color="text.secondary">
                    {item.participants} Beteiligte
                  </Typography>
                )}

                {item.type === 'finance' && !canViewFinances() && (
                  <Chip label="Berechtigung erforderlich" size="small" color="warning" />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getFilteredData().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ArchiveIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Einträge gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Versuche einen anderen Suchbegriff' : 'Noch keine archivierten Inhalte vorhanden'}
          </Typography>
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: getItemColor(selectedItem.type) === 'primary' ? 'primary.main' : 
                                    getItemColor(selectedItem.type) === 'success' ? 'success.main' :
                                    getItemColor(selectedItem.type) === 'warning' ? 'warning.main' :
                                    getItemColor(selectedItem.type) === 'error' ? 'error.main' : 'grey.500' }}>
                {getItemIcon(selectedItem.type)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedItem.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(selectedItem.date)} • {categories.find(c => c.id === selectedItem.type)?.label}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedItem.description}
              </Typography>

              {selectedItem.committee && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Zuständiges Komitee</Typography>
                  <Chip label={selectedItem.committee} color="primary" />
                </Box>
              )}

              {selectedItem.participants && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Beteiligte</Typography>
                  <Typography variant="body2">{selectedItem.participants} Personen</Typography>
                </Box>
              )}

              {selectedItem.financialSummary && canViewFinances() && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Finanzübersicht</Typography>
                  <Typography variant="body2">
                    Gesamtbetrag: {selectedItem.financialSummary.total}€ 
                    ({selectedItem.financialSummary.perPerson}€ pro Person)
                  </Typography>
                </Box>
              )}

              {selectedItem.result && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Ergebnis</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedItem.result}</Typography>
                  {selectedItem.options && (
                    <List dense>
                      {selectedItem.options.map((option, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={option.text}
                            secondary={`${option.votes} Stimmen (${option.percentage}%)`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {selectedItem.documents && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Dokumente</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedItem.documents.map((doc, index) => (
                      <Chip key={index} label={doc} size="small" clickable />
                    ))}
                  </Stack>
                </Box>
              )}

              {(selectedItem.linkedProjects || selectedItem.linkedActions) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Verknüpfte Inhalte</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedItem.linkedProjects?.map((project, index) => (
                      <Chip 
                        key={index} 
                        label={project} 
                        size="small" 
                        icon={<LinkIcon />}
                        clickable 
                        color="success"
                      />
                    ))}
                    {selectedItem.linkedActions?.map((action, index) => (
                      <Chip 
                        key={index} 
                        label={action} 
                        size="small" 
                        icon={<LinkIcon />}
                        clickable 
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Schließen</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default Archive
