import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tabs,
  Tab,
  useTheme,
  Tooltip,
  Fab,
  Badge,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  AccountBalance as FinanceIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Euro as EuroIcon,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Receipt as ReceiptIcon,
  Cake as CakeIcon,
  Event as EventIcon,
  Group as GroupIcon,
  TrackChanges as TargetIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  DonutLarge as DonutIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Chart.js registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);
import { getFirestore as getFirebaseFirestore, collection as firebaseCollection, query as firebaseQuery, where as firebaseWhere, getDocs as firebaseGetDocs, addDoc as firebaseAddDoc, updateDoc as firebaseUpdateDoc, doc as firebaseDoc, orderBy as firebaseOrderBy, Timestamp as firebaseTimestamp } from 'firebase/firestore';
import { isDemoMode, getFirestore as getMockFirestore, collection as mockCollection, query as mockQuery, where as mockWhere, getDocs as mockGetDocs, addDoc as mockAddDoc, updateDoc as mockUpdateDoc, doc as mockDoc, orderBy as mockOrderBy, Timestamp as mockTimestamp } from '../services/mockFirestore';
import { GermanDateInput } from '../components/GermanDateTimeInputs';
import { usePersistentState, useBeforeUnload } from '../utils/formPersistence';
import { financeService } from '../services/financeService';
import yearManagementService from '../services/yearManagementService';

const Finance = () => {
  const { currentUser, currentYear } = useAuth();
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [targetAmount, setTargetAmount] = usePersistentState('finance_targetAmount', 5000);
  const [editingTarget, setEditingTarget] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // Statistik-Filter States
  const [statisticsTimeRange, setStatisticsTimeRange] = useState('all'); // 'all', '30days', '90days', 'year'
  const [statisticsCommittee, setStatisticsCommittee] = useState('all');
  const [statisticsAction, setStatisticsAction] = useState('all');
  const [chartType, setChartType] = useState('overview'); // 'overview', 'timeline', 'actions', 'committees', 'budget'
  const [loading, setLoading] = useState(true);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editTargetOpen, setEditTargetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Alle, 1: Einnahmen, 2: Ausgaben, 3: Statistiken
  const [receiptUploadOpen, setReceiptUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [userRole, setUserRole] = useState('student');
  const [newTransaction, setNewTransaction] = usePersistentState('finance_newTransaction', {
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    participants: '',
    actionId: null,
    receipts: []
  });
  const [newTargetAmount, setNewTargetAmount] = usePersistentState('finance_newTargetAmount', 5000);
  const menuAnchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const exportMenuAnchorRef = useRef(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Firebase/Mock setup
  const db = isDemoMode() ? getMockFirestore() : getFirebaseFirestore();
  const collection = isDemoMode() ? mockCollection : firebaseCollection;
  const query = isDemoMode() ? mockQuery : firebaseQuery;
  const where = isDemoMode() ? mockWhere : firebaseWhere;
  const getDocs = isDemoMode() ? mockGetDocs : firebaseGetDocs;
  const addDoc = isDemoMode() ? mockAddDoc : firebaseAddDoc;
  const updateDoc = isDemoMode() ? mockUpdateDoc : firebaseUpdateDoc;
  const doc = isDemoMode() ? mockDoc : firebaseDoc;
  const orderBy = isDemoMode() ? mockOrderBy : firebaseOrderBy;
  const Timestamp = isDemoMode() ? mockTimestamp : firebaseTimestamp;



  const categories = {
    income: ['Kuchenverkauf', 'Getränkeverkauf', 'Sponsoring', 'Spenden', 'Mitgliedsbeiträge', 'Aktionen', 'Sonstiges'],
    expense: ['Abi-Shirts', 'Raum-Miete', 'Getränke', 'Materialkosten', 'Dekoration', 'Catering', 'Transport', 'Sonstiges']
  };

  // Berechtigungen prüfen
  const canEditFinances = () => {
    return userRole === 'admin' || userRole === 'committee_finance' || userRole === 'teacher';
  };

  const canViewReceipts = () => {
    return userRole === 'admin' || userRole === 'committee_finance' || userRole === 'teacher';
  };

  useEffect(() => {
    fetchData();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      if (isDemoMode()) {
        // Mock-Daten für Demo
        const currentYear = yearManagementService.getCurrentYear();
        setUserRole(currentUser?.email === `admin@rse-abschluss${currentYear}.de` ? 'admin' : 'student');
      } else {
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('uid', '==', currentUser.uid)
        ));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUserRole(userData.role || 'student');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('student');
    }
  };

  // Speichere wichtige Formulardaten beim Verlassen der Seite
  useBeforeUnload('finance_formData', {
    targetAmount,
    newTransaction,
    newTargetAmount
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use FinanceService for year-isolated data
      if (currentYear) {
        financeService.setCurrentYear(currentYear);
      }
      
      const transactionsData = await financeService.getTransactions();
      setTransactions(transactionsData);
      calculateTotals(transactionsData);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (transactionsData) => {
    const income = transactionsData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactionsData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setCurrentBalance(income - expenses);
  };

  // Hilfsfunktionen für Statistiken
  const getFilteredTransactionsForStats = () => {
    let filtered = [...transactions];
    
    // Zeitraum-Filter
    if (statisticsTimeRange !== 'all') {
      const now = new Date();
      const days = statisticsTimeRange === '30days' ? 30 : statisticsTimeRange === '90days' ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }
    
    // Komitee-Filter
    if (statisticsCommittee !== 'all') {
      filtered = filtered.filter(t => t.category === statisticsCommittee);
    }
    
    return filtered;
  };

  const getIncomeExpenseData = () => {
    const filtered = getFilteredTransactionsForStats();
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      labels: ['Einnahmen', 'Ausgaben'],
      datasets: [{
        data: [income, expenses],
        backgroundColor: [theme.palette.success.main, theme.palette.error.main],
        borderColor: [theme.palette.success.dark, theme.palette.error.dark],
        borderWidth: 2
      }]
    };
  };

  const getTimelineData = () => {
    const filtered = getFilteredTransactionsForStats();
    const sortedTransactions = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let runningBalance = 0;
    const balanceData = [];
    const labels = [];
    
    sortedTransactions.forEach(transaction => {
      runningBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      balanceData.push(runningBalance);
      labels.push(new Date(transaction.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }));
    });
    
    return {
      labels,
      datasets: [{
        label: 'Kontostand',
        data: balanceData,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.1,
        fill: true
      }]
    };
  };

  const getActionData = () => {
    const filtered = getFilteredTransactionsForStats();
    const actionMap = new Map();
    
    filtered.forEach(transaction => {
      const action = transaction.description || 'Unbekannt';
      if (!actionMap.has(action)) {
        actionMap.set(action, { income: 0, expenses: 0 });
      }
      
      if (transaction.type === 'income') {
        actionMap.get(action).income += transaction.amount;
      } else {
        actionMap.get(action).expenses += transaction.amount;
      }
    });
    
    const labels = Array.from(actionMap.keys()).slice(0, 10); // Top 10 Aktionen
    const incomeData = labels.map(label => actionMap.get(label).income);
    const expenseData = labels.map(label => actionMap.get(label).expenses);
    
    return {
      labels,
      datasets: [
        {
          label: 'Einnahmen',
          data: incomeData,
          backgroundColor: theme.palette.success.main,
          borderColor: theme.palette.success.dark,
          borderWidth: 1
        },
        {
          label: 'Ausgaben',
          data: expenseData,
          backgroundColor: theme.palette.error.main,
          borderColor: theme.palette.error.dark,
          borderWidth: 1
        }
      ]
    };
  };

  const getCommitteeData = () => {
    const filtered = getFilteredTransactionsForStats();
    const committeeMap = new Map();
    
    filtered.forEach(transaction => {
      const committee = transaction.category || 'Allgemein';
      if (!committeeMap.has(committee)) {
        committeeMap.set(committee, { income: 0, expenses: 0 });
      }
      
      if (transaction.type === 'income') {
        committeeMap.get(committee).income += transaction.amount;
      } else {
        committeeMap.get(committee).expenses += transaction.amount;
      }
    });
    
    const labels = Array.from(committeeMap.keys());
    const data = labels.map(label => {
      const committee = committeeMap.get(label);
      return committee.income - committee.expenses; // Netto-Betrag
    });
    
    return {
      labels,
      datasets: [{
        data: data.map(Math.abs),
        backgroundColor: data.map(value => value >= 0 ? theme.palette.success.main : theme.palette.error.main),
        borderColor: data.map(value => value >= 0 ? theme.palette.success.dark : theme.palette.error.dark),
        borderWidth: 2
      }]
    };
  };

  // Export-Funktionen
  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredTransactions = getFilteredTransactionsForStats();
    
    // Header
    doc.setFontSize(20);
    doc.text('Finanzstatistik - Abschlusskasse', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Zeitraum: ${statisticsTimeRange === 'all' ? 'Alle' : statisticsTimeRange}`, 20, 35);
    doc.text(`Komitee: ${statisticsCommittee === 'all' ? 'Alle' : statisticsCommittee}`, 20, 45);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 55);
    
    // Übersicht
    const incomeExpenseData = getIncomeExpenseData();
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    doc.setFontSize(14);
    doc.text('Finanzübersicht', 20, 75);
    doc.setFontSize(10);
    doc.text(`Gesamteinnahmen: ${totalIncome.toFixed(2)} €`, 20, 85);
    doc.text(`Gesamtausgaben: ${totalExpense.toFixed(2)} €`, 20, 95);
    doc.text(`Aktueller Saldo: ${balance.toFixed(2)} €`, 20, 105);
    
    // Transaktionen Tabelle
    const tableData = filteredTransactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString('de-DE'),
      transaction.description,
      transaction.type === 'income' ? 'Einnahme' : 'Ausgabe',
      transaction.category,
      `${transaction.amount.toFixed(2)} €`
    ]);
    
    doc.autoTable({
      head: [['Datum', 'Beschreibung', 'Typ', 'Kategorie', 'Betrag']],
      body: tableData,
      startY: 120,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [63, 81, 181] }
    });
    
    doc.save(`Finanzstatistik_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  const exportToExcel = () => {
    const filteredTransactions = getFilteredTransactionsForStats();
    
    // Übersicht Sheet
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    const overviewData = [
      ['Finanzübersicht', ''],
      ['Zeitraum', statisticsTimeRange === 'all' ? 'Alle' : statisticsTimeRange],
      ['Komitee', statisticsCommittee === 'all' ? 'Alle' : statisticsCommittee],
      ['', ''],
      ['Gesamteinnahmen', `${totalIncome.toFixed(2)} €`],
      ['Gesamtausgaben', `${totalExpense.toFixed(2)} €`],
      ['Aktueller Saldo', `${balance.toFixed(2)} €`]
    ];
    
    // Transaktionen Sheet
    const transactionData = [
      ['Datum', 'Beschreibung', 'Typ', 'Kategorie', 'Betrag'],
      ...filteredTransactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('de-DE'),
        transaction.description,
        transaction.type === 'income' ? 'Einnahme' : 'Ausgabe',
        transaction.category,
        transaction.amount
      ])
    ];
    
    // Kategorien Analyse
    const categories = {};
    filteredTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categories[category]) {
        categories[category] = { income: 0, expense: 0, count: 0 };
      }
      categories[category].count++;
      if (transaction.type === 'income') {
        categories[category].income += transaction.amount;
      } else {
        categories[category].expense += transaction.amount;
      }
    });
    
    const categoryData = [
      ['Kategorie', 'Einnahmen', 'Ausgaben', 'Saldo', 'Anzahl Transaktionen'],
      ...Object.entries(categories).map(([category, data]) => [
        category,
        data.income,
        data.expense,
        data.income - data.expense,
        data.count
      ])
    ];
    
    // Workbook erstellen
    const wb = XLSX.utils.book_new();
    
    const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
    const transactionWS = XLSX.utils.aoa_to_sheet(transactionData);
    const categoryWS = XLSX.utils.aoa_to_sheet(categoryData);
    
    XLSX.utils.book_append_sheet(wb, overviewWS, 'Übersicht');
    XLSX.utils.book_append_sheet(wb, transactionWS, 'Transaktionen');
    XLSX.utils.book_append_sheet(wb, categoryWS, 'Kategorien');
    
    XLSX.writeFile(wb, `Finanzstatistik_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAddTransaction = async () => {
    if (!canEditFinances()) {
      alert('Sie haben keine Berechtigung, Transaktionen hinzuzufügen.');
      return;
    }

    try {
      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date),
        createdBy: currentUser.uid,
        createdAt: new Date()
      };

      // Use year-specific collection path
      const collectionPath = financeService.getTransactionsCollectionPath();
      
      if (isDemoMode()) {
        // In demo mode, use mockFirestore addDoc which will save to localStorage
        await addDoc(collection(db, collectionPath), {
          ...transactionData,
          date: transactionData.date,
          createdAt: transactionData.createdAt
        });
      } else {
        // In production mode, use Firebase Firestore
        await addDoc(collection(db, collectionPath), {
          ...transactionData,
          date: Timestamp.fromDate(transactionData.date),
          createdAt: Timestamp.fromDate(transactionData.createdAt)
        });
      }
      
      // Refresh data after adding transaction
      fetchData();

      // Benachrichtige Dashboard über Finanz-Updates
      financeService.refreshData();

      setNewTransaction({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        participants: '',
        actionId: null,
        receipts: []
      });
      setSelectedFiles([]);
      setAddTransactionOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 1: return transactions.filter(t => t.type === 'income');
      case 2: return transactions.filter(t => t.type === 'expense');
      default: return transactions;
    }
  };

  const getStatisticsData = () => {
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
      } else {
        expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + transaction.amount;
      }
    });
    
    return { incomeByCategory, expenseByCategory };
  };

  const handleUpdateTarget = () => {
    setTargetAmount(newTargetAmount);
    setEditTargetOpen(false);
  };

  const handleTargetSave = () => {
    setEditingTarget(false);
  };

  const progressPercentage = targetAmount > 0 ? Math.min((currentBalance / targetAmount) * 100, 100) : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Finanzen
        </Typography>
        {canEditFinances() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddTransactionOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Transaktion hinzufügen
          </Button>
        )}
        {!canEditFinances() && (
          <Tooltip title="Nur Admins und Finanz-Komitee können Transaktionen hinzufügen">
            <Box>
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                disabled
                sx={{ borderRadius: 2 }}
              >
                Nur Lesezugriff
              </Button>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Financial Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, boxShadow: 3, borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(currentBalance)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktueller Kontostand
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <EuroIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, boxShadow: 3, borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(totalIncome)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamte Einnahmen
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <IncomeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, boxShadow: 3, borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {formatCurrency(totalExpenses)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamte Ausgaben
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <ExpenseIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, boxShadow: 3, borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {formatCurrency(targetAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Zielbetrag
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <TargetIcon />
                </Avatar>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => {
                  setNewTargetAmount(targetAmount);
                  setEditTargetOpen(true);
                }}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Zielbetrag-Verwaltung */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TargetIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Zielbetrag</Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              {editingTarget ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton onClick={handleTargetSave} color="primary" size="small">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={() => setEditingTarget(false)} size="small">
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" color="primary.main">
                    {formatCurrency(targetAmount)}
                  </Typography>
                  <IconButton onClick={() => setEditingTarget(true)} size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fortschritt: {formatCurrency(currentBalance)} / {formatCurrency(targetAmount)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressPercentage >= 100 ? 'success.main' : 'primary.main'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {progressPercentage.toFixed(1)}% erreicht
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>



      {/* Tabs für Transaktionen */}
      <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Alle Transaktionen" />
          <Tab 
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IncomeIcon sx={{ color: 'success.main' }} />
              Einnahmen
            </Box>} 
          />
          <Tab 
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExpenseIcon sx={{ color: 'error.main' }} />
              Ausgaben
            </Box>} 
          />
          <Tab 
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartIcon sx={{ color: 'primary.main' }} />
              Statistiken
            </Box>} 
          />
        </Tabs>
        
        {activeTab < 3 && (
          <>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {activeTab === 0 ? 'Alle Transaktionen' : 
                 activeTab === 1 ? 'Einnahmen' : 'Ausgaben'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getFilteredTransactions().length} Einträge
              </Typography>
            </Box>
            <List>
              {getFilteredTransactions().slice(0, 10).map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: transaction.type === 'income' 
                              ? (theme.palette.mode === 'dark' ? '#00ff88' : 'success.main')
                              : (theme.palette.mode === 'dark' ? '#ff6b6b' : 'error.main'),
                            fontWeight: 600
                          }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Typography>
                        {transaction.receipts && transaction.receipts.length > 0 && (
                          <Badge badgeContent={transaction.receipts.length} color="primary">
                            <ReceiptIcon sx={{ color: 'text.secondary' }} />
                          </Badge>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            menuAnchorRef.current = e.currentTarget;
                            setMenuOpen(true);
                            setSelectedTransaction(transaction);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          bgcolor: transaction.type === 'income' 
                            ? (theme.palette.mode === 'dark' ? 'rgba(0, 255, 136, 0.2)' : 'success.light')
                            : (theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.2)' : 'error.light'),
                          width: 40,
                          height: 40
                        }}
                      >
                        {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography component="span" variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                            {transaction.description}
                          </Typography>
                          <Chip 
                            label={transaction.category} 
                            size="small" 
                            color={transaction.type === 'income' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </React.Fragment>
                      }
                      secondary={`${transaction.date.toLocaleDateString('de-DE')} • ${transaction.participants}`}
                    />
                  </ListItem>
                  {index < getFilteredTransactions().slice(0, 10).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {getFilteredTransactions().length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {activeTab === 0 ? 'Noch keine Transaktionen vorhanden.' :
                   activeTab === 1 ? 'Noch keine Einnahmen vorhanden.' :
                   'Noch keine Ausgaben vorhanden.'}
                </Typography>
              </Box>
            )}
          </>
        )}
        
        {/* Statistiken Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            {/* Filter-Leiste */}
            <Card sx={{ 
              mb: 3, 
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              borderRadius: 2,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
            }}>
              <CardContent sx={{ pb: '16px !important' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Zeitraum</InputLabel>
                      <Select
                        value={statisticsTimeRange}
                        label="Zeitraum"
                        onChange={(e) => setStatisticsTimeRange(e.target.value)}
                        startAdornment={<InputAdornment position="start"><DateRangeIcon /></InputAdornment>}
                      >
                        <MenuItem value="all">Alle Daten</MenuItem>
                        <MenuItem value="30days">Letzte 30 Tage</MenuItem>
                        <MenuItem value="90days">Letzte 90 Tage</MenuItem>
                        <MenuItem value="year">Letztes Jahr</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Komitee</InputLabel>
                      <Select
                        value={statisticsCommittee}
                        label="Komitee"
                        onChange={(e) => setStatisticsCommittee(e.target.value)}
                        startAdornment={<InputAdornment position="start"><GroupIcon /></InputAdornment>}
                      >
                        <MenuItem value="all">Alle Komitees</MenuItem>
                        <MenuItem value="Deko">Deko-Team</MenuItem>
                        <MenuItem value="Party">Party-Team</MenuItem>
                        <MenuItem value="Technik">Technik-Team</MenuItem>
                        <MenuItem value="Catering">Catering</MenuItem>
                        <MenuItem value="Sonstiges">Sonstiges</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ToggleButtonGroup
                      value={chartType}
                      exclusive
                      onChange={(e, newType) => newType && setChartType(newType)}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="overview"><DonutIcon /></ToggleButton>
                       <ToggleButton value="timeline"><TimelineIcon /></ToggleButton>
                       <ToggleButton value="actions"><BarChartIcon /></ToggleButton>
                       <ToggleButton value="committees"><PieChartIcon /></ToggleButton>
                       <ToggleButton value="budget"><TargetIcon /></ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      fullWidth
                      size="small"
                      onClick={(e) => {
                        exportMenuAnchorRef.current = e.currentTarget;
                        setExportMenuOpen(true);
                      }}
                    >
                      Export
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Hauptstatistiken */}
            <Grid container spacing={3}>
              {/* Übersicht: Einnahmen vs. Ausgaben */}
              {chartType === 'overview' && (
                <>
                  <Grid item xs={12} md={8}>
                  <Card sx={{
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.12)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 12px 40px rgba(0, 0, 0, 0.5)'
                        : '0 12px 40px rgba(0, 0, 0, 0.15)'
                    }
                  }}>
                    <CardHeader
                      avatar={<Avatar sx={{ 
                        bgcolor: theme.palette.primary.main,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                      }}><DonutIcon /></Avatar>}
                      title={<Typography variant="h6" fontWeight={600}>Einnahmen vs. Ausgaben</Typography>}
                      subheader="Übersicht der Finanzverteilung"
                    />
                      <CardContent>
                        <Box sx={{ height: 400, position: 'relative' }}>
                          <Doughnut
                          data={getIncomeExpenseData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value.toFixed(2)} €`;
                                  }
                                }
                              }
                            },
                            cutout: '60%',
                            onClick: (event, elements) => {
                              if (elements.length > 0) {
                                const index = elements[0].index;
                                const label = getIncomeExpenseData().labels[index];
                                // Navigation zu Transaktionsliste mit Filter
                                setActiveTab(0); // Wechsel zu Transaktions-Tab
                                // Hier könnte ein Filter gesetzt werden basierend auf dem angeklickten Segment
                              }
                            }
                          }}
                          />
                          {/* Kontostand in der Mitte */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              textAlign: 'center'
                            }}
                          >
                            <Typography variant="h6" color="text.secondary">
                              Saldo
                            </Typography>
                            <Typography 
                              variant="h4" 
                              color={totalIncome - totalExpenses >= 0 ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {(totalIncome - totalExpenses).toFixed(0)} €
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      mb: 2,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 6px 24px rgba(76, 175, 80, 0.2)' 
                        : '0 6px 24px rgba(76, 175, 80, 0.15)',
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(129, 199, 132, 0.02) 100%)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(76, 175, 80, 0.3)'
                          : '0 8px 32px rgba(76, 175, 80, 0.2)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <IncomeIcon sx={{ color: 'success.main', mr: 1, fontSize: 28 }} />
                          <Typography variant="h6" fontWeight={600}>Einnahmen</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main" fontWeight={700}>
                          +{totalIncome.toFixed(2)} €
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ 
                      mb: 2,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 6px 24px rgba(244, 67, 54, 0.2)' 
                        : '0 6px 24px rgba(244, 67, 54, 0.15)',
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(239, 154, 154, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(239, 154, 154, 0.02) 100%)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(244, 67, 54, 0.3)'
                          : '0 8px 32px rgba(244, 67, 54, 0.2)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ExpenseIcon sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
                          <Typography variant="h6" fontWeight={600}>Ausgaben</Typography>
                        </Box>
                        <Typography variant="h4" color="error.main" fontWeight={700}>
                          -{totalExpenses.toFixed(2)} €
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 6px 24px rgba(25, 118, 210, 0.2)' 
                        : '0 6px 24px rgba(25, 118, 210, 0.15)',
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(100, 181, 246, 0.02) 100%)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(25, 118, 210, 0.3)'
                          : '0 8px 32px rgba(25, 118, 210, 0.2)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TargetIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                          <Typography variant="h6" fontWeight={600}>Zielerreichung</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((totalIncome / targetAmount) * 100, 100)}
                          sx={{ 
                            height: 12, 
                            borderRadius: 6, 
                            mb: 1,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {((totalIncome / targetAmount) * 100).toFixed(1)}% von {targetAmount} € Ziel
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Zeitverlauf */}
              {chartType === 'timeline' && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      avatar={<Avatar sx={{ bgcolor: theme.palette.info.main }}><TimelineIcon /></Avatar>}
                      title="Kontostand-Entwicklung"
                      subheader="Verlauf des Kontostands über die Zeit"
                    />
                    <CardContent>
                      <Box sx={{ height: 400 }}>
                        <Line
                          data={getTimelineData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top'
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    return `Kontostand: ${context.parsed.y.toFixed(2)} €`;
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: false,
                                ticks: {
                                  callback: (value) => `${value} €`
                                }
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Aktionen */}
              {chartType === 'actions' && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      avatar={<Avatar sx={{ bgcolor: theme.palette.warning.main }}><BarChartIcon /></Avatar>}
                      title="Einnahmen/Ausgaben pro Aktion"
                      subheader="Vergleich der verschiedenen Aktionen"
                    />
                    <CardContent>
                      <Box sx={{ height: 400 }}>
                        <Bar
                          data={getActionData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top'
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} €`;
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  callback: (value) => `${value} €`
                                }
                              }
                            },
                            onClick: (event, elements) => {
                              if (elements.length > 0) {
                                const index = elements[0].index;
                                const actionName = getActionData().labels[index];
                                // Navigation zu Transaktionsliste mit Aktions-Filter
                                setActiveTab(0); // Wechsel zu Transaktions-Tab
                                // Hier könnte ein Filter für die spezifische Aktion gesetzt werden
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Komitees */}
               {chartType === 'committees' && (
                 <Grid item xs={12} md={8}>
                   <Card>
                     <CardHeader
                       avatar={<Avatar sx={{ bgcolor: theme.palette.secondary.main }}><GroupIcon /></Avatar>}
                       title="Komitee-Übersicht"
                       subheader="Finanzverteilung nach Komitees"
                     />
                     <CardContent>
                       <Box sx={{ height: 400 }}>
                         <Doughnut
                           data={getCommitteeData()}
                           options={{
                             responsive: true,
                             maintainAspectRatio: false,
                             plugins: {
                               legend: {
                                 position: 'right'
                               },
                               tooltip: {
                                 callbacks: {
                                   label: (context) => {
                                     const label = context.label || '';
                                     const value = context.parsed || 0;
                                     return `${label}: ${value.toFixed(2)} €`;
                                   }
                                 }
                               }
                             },
                             onClick: (event, elements) => {
                               if (elements.length > 0) {
                                 const index = elements[0].index;
                                 const committeeName = getCommitteeData().labels[index];
                                 // Navigation zu Transaktionsliste mit Komitee-Filter
                                 setActiveTab(0); // Wechsel zu Transaktions-Tab
                                 // Hier könnte ein Filter für das spezifische Komitee gesetzt werden
                               }
                             }
                           }}
                         />
                       </Box>
                     </CardContent>
                   </Card>
                 </Grid>
               )}

               {/* Budget vs. Realität */}
               {chartType === 'budget' && (
                 <>
                   <Grid item xs={12}>
                     <Card>
                       <CardHeader
                         avatar={<Avatar sx={{ bgcolor: theme.palette.warning.main }}><TargetIcon /></Avatar>}
                         title="Budget vs. Realität"
                         subheader="Vergleich geplanter und tatsächlicher Ausgaben"
                       />
                       <CardContent>
                         <Grid container spacing={3}>
                           {/* Gesamtbudget */}
                           <Grid item xs={12} md={6}>
                             <Card variant="outlined">
                               <CardContent>
                                 <Typography variant="h6" gutterBottom>
                                   Gesamtbudget
                                 </Typography>
                                 <Box sx={{ mb: 2 }}>
                                   <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                     <Typography variant="body2">Geplant: {targetAmount} €</Typography>
                                     <Typography variant="body2">Ausgegeben: {totalExpenses.toFixed(2)} €</Typography>
                                   </Box>
                                   <LinearProgress
                                     variant="determinate"
                                     value={Math.min((totalExpenses / targetAmount) * 100, 100)}
                                     sx={{
                                       height: 12,
                                       borderRadius: 6,
                                       backgroundColor: 'grey.200',
                                       '& .MuiLinearProgress-bar': {
                                         backgroundColor: totalExpenses > targetAmount ? 'error.main' : 'success.main'
                                       }
                                     }}
                                   />
                                   <Typography 
                                     variant="body2" 
                                     color={totalExpenses > targetAmount ? 'error.main' : 'success.main'}
                                     sx={{ mt: 1, textAlign: 'center' }}
                                   >
                                     {((totalExpenses / targetAmount) * 100).toFixed(1)}% des Budgets verwendet
                                   </Typography>
                                 </Box>
                                 <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                   <Typography variant="h5" color={targetAmount - totalExpenses >= 0 ? 'success.main' : 'error.main'}>
                                     {targetAmount - totalExpenses >= 0 ? '+' : ''}{(targetAmount - totalExpenses).toFixed(2)} €
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary">
                                     {targetAmount - totalExpenses >= 0 ? 'Verbleibendes Budget' : 'Budget überschritten'}
                                   </Typography>
                                 </Box>
                               </CardContent>
                             </Card>
                           </Grid>

                           {/* Budget nach Kategorien */}
                           <Grid item xs={12} md={6}>
                             <Card variant="outlined">
                               <CardContent>
                                 <Typography variant="h6" gutterBottom>
                                   Budget nach Kategorien
                                 </Typography>
                                 {[
                                   { name: 'Deko', budget: 800, spent: transactions.filter(t => t.type === 'expense' && t.category === 'Deko').reduce((sum, t) => sum + t.amount, 0) },
                                   { name: 'Party', budget: 1500, spent: transactions.filter(t => t.type === 'expense' && t.category === 'Party').reduce((sum, t) => sum + t.amount, 0) },
                                   { name: 'Technik', budget: 1000, spent: transactions.filter(t => t.type === 'expense' && t.category === 'Technik').reduce((sum, t) => sum + t.amount, 0) },
                                   { name: 'Catering', budget: 1200, spent: transactions.filter(t => t.type === 'expense' && t.category === 'Catering').reduce((sum, t) => sum + t.amount, 0) }
                                 ].map((category) => (
                                   <Box key={category.name} sx={{ mb: 3 }}>
                                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                       <Typography variant="body2" fontWeight="medium">
                                         {category.name}
                                       </Typography>
                                       <Typography variant="body2">
                                         {category.spent.toFixed(2)} € / {category.budget} €
                                       </Typography>
                                     </Box>
                                     <LinearProgress
                                       variant="determinate"
                                       value={Math.min((category.spent / category.budget) * 100, 100)}
                                       sx={{
                                         height: 8,
                                         borderRadius: 4,
                                         backgroundColor: 'grey.200',
                                         '& .MuiLinearProgress-bar': {
                                           backgroundColor: category.spent > category.budget ? 'error.main' : 
                                                           category.spent > category.budget * 0.8 ? 'warning.main' : 'success.main'
                                         }
                                       }}
                                     />
                                     <Typography 
                                       variant="caption" 
                                       color={category.spent > category.budget ? 'error.main' : 
                                              category.spent > category.budget * 0.8 ? 'warning.main' : 'success.main'}
                                     >
                                       {((category.spent / category.budget) * 100).toFixed(1)}%
                                       {category.spent > category.budget && ' (Überschritten)'}
                                     </Typography>
                                   </Box>
                                 ))}
                               </CardContent>
                             </Card>
                           </Grid>
                         </Grid>
                       </CardContent>
                     </Card>
                   </Grid>
                 </>
               )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionOpen} onClose={() => setAddTransactionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Transaktion hinzufügen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={newTransaction.type}
                  label="Typ"
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })}
                >
                  <MenuItem value="income">Einnahme</MenuItem>
                  <MenuItem value="expense">Ausgabe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Betrag"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <GermanDateInput
                label="Datum"
                value={newTransaction.date}
                onChange={(date) => setNewTransaction({ ...newTransaction, date: date })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={newTransaction.category}
                  label="Kategorie"
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                >
                  {categories[newTransaction.type].map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beteiligte Personen"
                value={newTransaction.participants}
                onChange={(e) => setNewTransaction({ ...newTransaction, participants: e.target.value })}
                placeholder="z.B. Anna M., Tom K., Lisa S."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Belege hochladen (optional)</Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 1 }}
                  >
                    Dateien auswählen
                  </Button>
                </label>
                {selectedFiles.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => removeFile(index)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTransactionOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleAddTransaction} 
            variant="contained"
            disabled={!newTransaction.amount || !newTransaction.description || !newTransaction.category}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Target Dialog */}
      <Dialog open={editTargetOpen} onClose={() => setEditTargetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Zielbetrag anpassen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Neuer Zielbetrag"
            type="number"
            value={newTargetAmount}
            onChange={(e) => setNewTargetAmount(parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTargetOpen(false)}>Abbrechen</Button>
          <Button onClick={handleUpdateTarget} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Menu */}
      <Menu
        anchorEl={menuAnchorRef.current}
        open={menuOpen}
        onClose={() => {
          menuAnchorRef.current = null;
          setMenuOpen(false);
        }}
      >
        {canViewReceipts() && selectedTransaction?.receipts?.length > 0 && (
          <MenuItem onClick={() => {
            menuAnchorRef.current = null;
            setMenuOpen(false);
          }}>
            <ReceiptIcon sx={{ mr: 1 }} />
            Belege anzeigen ({selectedTransaction.receipts.length})
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          menuAnchorRef.current = null;
          setMenuOpen(false);
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Details anzeigen
        </MenuItem>
        {canEditFinances() && (
          <>
            <MenuItem onClick={() => {
              menuAnchorRef.current = null;
              setMenuOpen(false);
            }}>
              <EditIcon sx={{ mr: 1 }} />
              Bearbeiten
            </MenuItem>
            <MenuItem onClick={() => {
              menuAnchorRef.current = null;
              setMenuOpen(false);
            }} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Löschen
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchorRef.current}
        open={exportMenuOpen}
        onClose={() => {
          exportMenuAnchorRef.current = null;
          setExportMenuOpen(false);
        }}
      >
        <MenuItem onClick={() => {
          exportToPDF();
          exportMenuAnchorRef.current = null;
          setExportMenuOpen(false);
        }}>
          <PictureAsPdfIcon sx={{ mr: 1, color: 'error.main' }} />
          Als PDF exportieren
        </MenuItem>
        <MenuItem onClick={() => {
          exportToExcel();
          exportMenuAnchorRef.current = null;
          setExportMenuOpen(false);
        }}>
          <TableChartIcon sx={{ mr: 1, color: 'success.main' }} />
          Als Excel exportieren
        </MenuItem>
      </Menu>
      
      {/* Floating Action Button für mobile Geräte */}
      {canEditFinances() && (
        <Fab
          color="primary"
          aria-label="add transaction"
          onClick={() => setAddTransactionOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default Finance;
