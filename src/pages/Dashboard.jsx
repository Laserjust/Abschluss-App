import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataIsolationService from '../services/dataIsolationService';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Assignment as ProjectIcon,
  Poll as SurveyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Euro as EuroIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  School as SchoolIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { 
  getFirestore as getFirebaseFirestore, 
  collection as firebaseCollection, 
  query as firebaseQuery, 
  where as firebaseWhere, 
  getDocs as firebaseGetDocs, 
  orderBy as firebaseOrderBy, 
  limit as firebaseLimit, 
  doc as firebaseDoc, 
  getDoc as firebaseGetDoc 
} from 'firebase/firestore';
import { getDashboardFinanceData, financeService } from '../services/financeService';
import { 
  isDemoMode, 
  getFirestore as getMockFirestore, 
  collection as mockCollection, 
  query as mockQuery, 
  where as mockWhere, 
  getDocs as mockGetDocs, 
  orderBy as mockOrderBy, 
  limit as mockLimit, 
  doc as mockDoc, 
  getDoc as mockGetDoc 
} from '../services/mockFirestore';
import yearManagementService from '../services/yearManagementService';


// Use mock or real Firestore based on demo mode
const getFirestore = isDemoMode() ? getMockFirestore : getFirebaseFirestore;
const collection = isDemoMode() ? mockCollection : firebaseCollection;
const query = isDemoMode() ? mockQuery : firebaseQuery;
const where = isDemoMode() ? mockWhere : firebaseWhere;
const getDocs = isDemoMode() ? mockGetDocs : firebaseGetDocs;
const orderBy = isDemoMode() ? mockOrderBy : firebaseOrderBy;
const limit = isDemoMode() ? mockLimit : firebaseLimit;
const doc = isDemoMode() ? mockDoc : firebaseDoc;
const getDoc = isDemoMode() ? mockGetDoc : firebaseGetDoc;

function Dashboard() {
  const { currentUser, currentYear } = useAuth();

  // Initialize data isolation service with current year
  const [announcements, setAnnouncements] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [projectSurveys, setProjectSurveys] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [financeData, setFinanceData] = useState(null);
  const [vorabiCourses, setVorabiCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to check if year has existing data
  const hasYearData = () => {
    if (isDemoMode()) {
      const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      const yearData = mockData.years?.[currentYear];
      if (!yearData) return false;
      
      // Check if any collection has data
      return Object.values(yearData).some(collection => 
        Array.isArray(collection) && collection.length > 0
      );
    }
    return true; // In production, assume data exists or will be loaded from Firestore
  };

  // Initialize data isolation service with current year
  useEffect(() => {
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
      // Initialize year data structure if it doesn't exist
      dataIsolationService.initializeYearData(currentYear);
    }
  }, [currentYear]);

  // Helper function to check if content is within 72 hours
  const isWithin72Hours = (date) => {
    const now = new Date();
    const contentDate = date?.toDate ? date.toDate() : new Date(date);
    const timeDiff = now.getTime() - contentDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 72;
  };

  // Helper function to get remaining time in hours
  const getRemainingHours = (date) => {
    const now = new Date();
    const contentDate = date?.toDate ? date.toDate() : new Date(date);
    const timeDiff = (contentDate.getTime() + (72 * 60 * 60 * 1000)) - now.getTime();
    const hoursLeft = Math.max(0, Math.floor(timeDiff / (1000 * 3600)));
    return hoursLeft;
  };

  useEffect(() => {
    // Echtzeit-Listener für Finanz-Updates
    const unsubscribeFinance = financeService.addListener((financeData) => {
      setFinanceData(financeData);
    });

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get current date and date 72 hours ago
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
        
        // Set current year for finance service
        if (currentYear) {
          financeService.setCurrentYear(currentYear);
        }
        
        // Load real finance data
        const realFinanceData = await getDashboardFinanceData();
        if (realFinanceData) {
          setFinanceData(realFinanceData);
        } else {
          // Fallback to mock data if service fails
          const mockFinanceData = {
            currentBalance: 4250.75,
            weeklyChange: 125.50,
            weeklyChangePercent: 3.04,
            recentIncome: [
              { description: 'Mitgliedsbeiträge', amount: 450.00 },
              { description: 'Kuchenverkauf', amount: 85.50 },
              { description: 'Spende Förderverein', amount: 200.00 }
            ],
            recentExpenses: [
              { description: 'Druckkosten Flyer', amount: -45.20 },
              { description: 'Catering Besprechung', amount: -78.90 },
              { description: 'Büromaterial', amount: -23.40 }
            ]
          };
          setFinanceData(mockFinanceData);
        }
        
        // Load real surveys from localStorage (created by SurveyManagement)
        let realSurveys = [];
        try {
          const savedSurveys = localStorage.getItem('adminSurveys');
          if (savedSurveys) {
            const allSurveys = JSON.parse(savedSurveys);
            // Filter active surveys and convert to dashboard format
            realSurveys = allSurveys
              .filter(survey => survey.isActive)
              .map(survey => {
                const totalResponses = survey.responses ? 
                  survey.responses.reduce((sum, resp) => sum + resp.count, 0) : 0;
                const totalParticipants = Math.max(totalResponses, 100); // Minimum 100 for percentage calculation
                
                return {
                  id: survey.id,
                  title: survey.title,
                  description: survey.description,
                  projectTitle: 'Allgemeine Umfrage', // Default project title
                  projectId: null,
                  status: 'approved',
                  createdAt: new Date(survey.createdAt),
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  totalParticipants: totalParticipants,
                  responses: totalResponses
                };
              });
          }
        } catch (error) {
          console.error('Error loading surveys from localStorage:', error);
        }
        
        // Only show mock surveys if year has existing data
        if (realSurveys.length === 0 && hasYearData()) {
          const mockSurveys = [
            {
              id: 'survey1',
              title: 'Abschlussfeier Planung',
              description: 'Umfrage zur Planung der Abschlussfeier - Location, Datum und Budget',
              projectTitle: `Abschlussfeier 20${yearManagementService.getCurrentYear()}`,
              projectId: 'project1',
              status: 'approved',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
              endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
              totalParticipants: 120,
              responses: 87
            },
            {
              id: 'survey2',
              title: 'Abizeitung Inhalte',
              description: 'Welche Inhalte sollen in die Abizeitung? Steckbriefe, Fotos, Sprüche?',
              projectTitle: `Abizeitung 20${yearManagementService.getCurrentYear()}`,
              projectId: 'project2',
              status: 'approved',
              createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
              expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
              endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              totalParticipants: 120,
              responses: 45
            },
            {
              id: 'survey3',
              title: 'Kursfahrt Ziel',
              description: 'Abstimmung über das Ziel für die Kursfahrt im nächsten Semester',
              projectTitle: 'Kursfahrt Organisation',
              projectId: 'project3',
              status: 'approved',
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              totalParticipants: 85,
              responses: 62
            }
          ];
          realSurveys = mockSurveys;
        }
        
        setProjectSurveys(realSurveys);
        setSurveys(realSurveys);
        
        // Vorabi courses mock data is now set in try block
         setAnnouncements([]);
         setApprovedProjects([]);
         setNotifications([]);
        
        const db = getFirestore();
        
        // Fetch approved project surveys created within the last 72 hours
        const surveysQuery = query(
          collection(db, dataIsolationService.getSurveysCollection()),
          where('status', '==', 'approved'),
          where('projectId', '!=', null),
          where('createdAt', '>=', threeDaysAgo),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const surveysSnapshot = await getDocs(surveysQuery);
        const surveysData = [];
        
        for (const surveyDoc of surveysSnapshot.docs) {
          const surveyData = surveyDoc.data();
          let projectTitle = 'Unbekanntes Projekt';
          
          // Get project title
          if (surveyData.projectId) {
            try {
              const projectDoc = await getDoc(doc(db, 'projects', surveyData.projectId));
              if (projectDoc.exists()) {
                projectTitle = projectDoc.data().title;
              }
            } catch (error) {
              console.error('Error fetching project:', error);
            }
          }
          
          // Calculate survey statistics
          const endDate = surveyData.expiresAt?.toDate ? surveyData.expiresAt.toDate() : new Date(surveyData.expiresAt);
          
          // Count actual responses from database
          let responses = 0;
          try {
            const responsesQuery = query(
              collection(getFirestore(), dataIsolationService.getSurveyResponsesCollection()),
              where('surveyId', '==', surveyDoc.id)
            );
            const responsesSnapshot = await getDocs(responsesQuery);
            responses = responsesSnapshot.docs.length;
          } catch (error) {
            console.error('Error counting survey responses:', error);
          }
          
          // Get total participants from survey data or use default
          const totalParticipants = surveyData.totalParticipants || 100;
          
          surveysData.push({
            id: surveyDoc.id,
            ...surveyData,
            projectTitle,
            endDate,
            totalParticipants,
            responses,
            createdAt: surveyData.createdAt?.toDate ? surveyData.createdAt.toDate() : new Date(surveyData.createdAt)
          });
        }
        
        setProjectSurveys(surveysData);
        setSurveys(surveysData);
        
        // Load real notifications from Firestore
        try {
          const notificationsQuery = query(
            collection(getFirestore(), dataIsolationService.getNotificationsCollection()),
            where('userId', '==', currentUser?.uid || 'demo-user'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          const notificationsData = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
          }));
          setNotifications(notificationsData);
        } catch (notificationError) {
          console.error('Error loading notifications:', notificationError);
          // Fallback to mock notifications will be set in main catch block
         }
         
         // Load real Vorabi Courses from localStorage
         try {
           const savedCourseSelection = localStorage.getItem(`userCourseSelection_${currentYear}`);
           if (savedCourseSelection) {
             const courseSelection = JSON.parse(savedCourseSelection);
             const dashboardCourses = [];
             
             // Lade echte Kursdaten aus der Admin-Kursverwaltung
            const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
            
            // Hilfsfunktion zum Finden des Admin-Kurses
            const findAdminCourse = (subject, type) => {
              const subjectId = subject?.subject || subject?.id;
              return adminCourses.find(course => 
                course.subject === subjectId && course.type === type
              );
            };
            
            // Convert course selection to dashboard format
            if (courseSelection.lk1) {
              const adminCourse = findAdminCourse(courseSelection.lk1, 'LK1');
              dashboardCourses.push({
                id: 'lk1',
                name: courseSelection.lk1.subjectName || courseSelection.lk1.name,
                type: 'LK',
                teacher: adminCourse?.teacherName || 'Herr Schmidt',
                room: adminCourse?.room || 'A201',
                schedule: adminCourse?.schedule || 'Mo 1-2, Mi 3-4',
                nextExam: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 4),
                unreadMessages: Math.floor(Math.random() * 3),
                color: '#1976d2'
              });
            }
            
            if (courseSelection.lk2) {
              const adminCourse = findAdminCourse(courseSelection.lk2, 'LK2');
              dashboardCourses.push({
                id: 'lk2',
                name: courseSelection.lk2.subjectName || courseSelection.lk2.name,
                type: 'LK',
                teacher: adminCourse?.teacherName || 'Frau Weber',
                room: adminCourse?.room || 'B105',
                schedule: adminCourse?.schedule || 'Di 3-4, Do 1-2',
                nextExam: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 4),
                unreadMessages: Math.floor(Math.random() * 3),
                color: '#388e3c'
              });
            }
            
            // Add Abifächer 3 und 4 for dashboard overview
            if (courseSelection.abifach1) {
              const adminCourse = findAdminCourse(courseSelection.abifach1, 'Abifach 3');
              dashboardCourses.push({
                id: 'abifach1',
                name: courseSelection.abifach1.subjectName || courseSelection.abifach1.name,
                type: 'Abifach',
                teacher: adminCourse?.teacherName || 'Frau Müller',
                room: adminCourse?.room || 'C302',
                schedule: adminCourse?.schedule || 'Mi 5-6, Fr 2-3',
                nextExam: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 3),
                unreadMessages: Math.floor(Math.random() * 4),
                color: '#f57c00'
              });
            }
            
            if (courseSelection.abifach2) {
              const adminCourse = findAdminCourse(courseSelection.abifach2, 'Abifach 4');
              dashboardCourses.push({
                id: 'abifach2',
                name: courseSelection.abifach2.subjectName || courseSelection.abifach2.name,
                type: 'Abifach',
                teacher: adminCourse?.teacherName || 'Herr Klein',
                room: adminCourse?.room || 'D201',
                schedule: adminCourse?.schedule || 'Mo 5-6, Do 3-4',
                nextExam: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 3),
                unreadMessages: Math.floor(Math.random() * 4),
                color: '#7b1fa2'
              });
            }
             
             setVorabiCourses(dashboardCourses);
           }
         } catch (courseError) {
           console.error('Error loading course data:', courseError);
           // Fallback will be set in main catch block
         }
         
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Mock data is now set in try block
        
        // Finance data is already set in try block
        
        // Load real announcements from Firestore
        try {
          const announcementsQuery = query(
            collection(getFirestore(), dataIsolationService.getAnnouncementsCollection()),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const announcementsSnapshot = await getDocs(announcementsQuery);
          const announcementsData = announcementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
          }));
          setAnnouncements(announcementsData);
        } catch (announcementError) {
          console.error('Error loading announcements:', announcementError);
          // Only show mock announcements if year has existing data
          if (hasYearData()) {
            const mockAnnouncements = [
              {
                id: 'ann1',
                title: 'Wichtige Terminänderung',
                content: `Die Abschlussfeier wurde vom 15.06. auf den 22.06.20${yearManagementService.getCurrentYear()} verschoben. Bitte merkt euch das neue Datum vor!`,
                priority: 'high',
                createdBy: 'Max Mustermann',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
              },
              {
                id: 'ann2',
                title: 'Jahrbuch-Fotos gesucht',
                content: `Wir sammeln noch Fotos für das Jahrbuch. Sendet eure besten Klassenfotos bis zum 28.02. an jahrbuch@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
                priority: 'medium',
                createdBy: 'Lisa Weber',
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
              },
              {
                id: 'ann3',
                title: 'Mottowoche Abstimmung',
                content: 'Die Abstimmung für die Mottowoche-Themen läuft noch bis Freitag. Jeder kann bis zu 3 Themen wählen.',
                priority: 'low',
                createdBy: 'Tom Mueller',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
              }
            ];
            setAnnouncements(mockAnnouncements);
          }
        }
        
        // Load real approved projects from Firestore
        try {
          const projectsQuery = query(
            collection(getFirestore(), dataIsolationService.getProjectsCollection()),
            where('status', '==', 'approved'),
            orderBy('approvedAt', 'desc'),
            limit(10)
          );
          const projectsSnapshot = await getDocs(projectsQuery);
          const projectsData = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            approvedAt: doc.data().approvedAt?.toDate ? doc.data().approvedAt.toDate() : new Date(doc.data().approvedAt)
          }));
          setApprovedProjects(projectsData);
        } catch (projectError) {
          console.error('Error loading approved projects:', projectError);
          // Only show mock approved projects if year has existing data
          if (hasYearData()) {
            const mockApprovedProjects = [
              {
                id: 'proj1',
                title: 'Digitales Jahrbuch',
                description: 'Erstellung einer interaktiven Online-Version des Jahrbuchs mit Videos und Animationen',
                committee: 'Jahrbuch-Komitee',
                approvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
              },
              {
                id: 'proj2',
                title: 'Abschlussfilm Produktion',
                description: 'Professionelle Videoproduktion für einen 20-minütigen Abschlussfilm',
                committee: 'Medien-Komitee',
                approvedAt: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
              }
            ];
            setApprovedProjects(mockApprovedProjects);
          }
        }
        
        // Load real notifications from Firestore
        try {
          const notificationsQuery = query(
            collection(getFirestore(), dataIsolationService.getNotificationsCollection()),
            where('userId', '==', currentUser?.uid || 'demo-user'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          const notificationsData = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
          }));
          setNotifications(notificationsData);
        } catch (notificationError) {
          console.error('Error loading notifications:', notificationError);
          // Only show mock notifications if year has existing data
          if (hasYearData()) {
            const mockNotifications = [
              {
                id: 'notif1',
                title: 'Neue Nachricht im Mathe-LK Chat',
                message: 'Herr Schmidt hat Übungsaufgaben für die nächste Klausur hochgeladen.',
                read: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
              },
              {
                id: 'notif2',
                title: 'Umfrage beendet',
                message: 'Die Abstimmung über das Abschlussfeier-Catering ist abgeschlossen.',
                read: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
              },
              {
                id: 'notif3',
                title: 'Neues Projekt genehmigt',
                message: 'Das Zeitkapsel-Projekt wurde vom Admin-Team genehmigt.',
                read: true,
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
              }
            ];
            setNotifications(mockNotifications);
          }
        }

        // Load real Vorabi Courses from localStorage
        try {
          const savedCourseSelection = localStorage.getItem(`userCourseSelection_${currentYear}`);
          if (savedCourseSelection) {
            const courseSelection = JSON.parse(savedCourseSelection);
            const dashboardCourses = [];
            
            // Convert course selection to dashboard format
            if (courseSelection.lk1) {
              dashboardCourses.push({
                id: 'lk1',
                name: courseSelection.lk1.subjectName || courseSelection.lk1.name,
                type: 'LK',
                teacher: 'Herr Schmidt', // Could be randomized or stored
                nextExam: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 4),
                unreadMessages: Math.floor(Math.random() * 3),
                color: '#1976d2'
              });
            }
            
            if (courseSelection.lk2) {
              const adminCourse = findAdminCourse(courseSelection.lk2, 'LK2');
              dashboardCourses.push({
                id: 'lk2',
                name: courseSelection.lk2.subjectName || courseSelection.lk2.name,
                type: 'LK',
                teacher: adminCourse?.teacherName || 'Frau Weber',
                room: adminCourse?.room || 'B105',
                schedule: adminCourse?.schedule || 'Di 3-4, Do 1-2',
                nextExam: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 4),
                unreadMessages: Math.floor(Math.random() * 3),
                color: '#388e3c'
              });
            }
            
            // Add Abifächer 3 und 4 for dashboard overview
            if (courseSelection.abifach1) {
              const adminCourse = findAdminCourse(courseSelection.abifach1, 'Abifach 3');
              dashboardCourses.push({
                id: 'abifach1',
                name: courseSelection.abifach1.subjectName || courseSelection.abifach1.name,
                type: 'Abifach',
                teacher: adminCourse?.teacherName || 'Frau Müller',
                room: adminCourse?.room || 'C302',
                schedule: adminCourse?.schedule || 'Mi 5-6, Fr 2-3',
                nextExam: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 3),
                unreadMessages: Math.floor(Math.random() * 4),
                color: '#f57c00'
              });
            }
            
            if (courseSelection.abifach2) {
              const adminCourse = findAdminCourse(courseSelection.abifach2, 'Abifach 4');
              dashboardCourses.push({
                id: 'abifach2',
                name: courseSelection.abifach2.subjectName || courseSelection.abifach2.name,
                type: 'Abifach',
                teacher: adminCourse?.teacherName || 'Herr Klein',
                room: adminCourse?.room || 'D201',
                schedule: adminCourse?.schedule || 'Mo 5-6, Do 3-4',
                nextExam: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                upcomingTasks: Math.floor(Math.random() * 3),
                unreadMessages: Math.floor(Math.random() * 4),
                color: '#7b1fa2'
              });
            }
            
            setVorabiCourses(dashboardCourses);
          } else if (hasYearData()) {
            // Only show mock data if year has existing data and no course selection found
            const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
            const lk1Course = adminCourses.find(course => course.type === 'LK1');
            const lk2Course = adminCourses.find(course => course.type === 'LK2');
            
            const mockVorabiCourses = [
              {
                id: 'lk1',
                name: lk1Course?.subjectName || 'Mathematik',
                type: 'LK',
                teacher: lk1Course?.teacherName || 'Herr Schmidt',
                room: lk1Course?.room || 'A201',
                schedule: lk1Course?.schedule || 'Mo 1-2, Mi 3-4',
                nextExam: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                upcomingTasks: 3,
                unreadMessages: 2,
                color: '#1976d2'
              },
              {
                id: 'lk2',
                name: lk2Course?.subjectName || 'Biologie',
                type: 'LK',
                teacher: lk2Course?.teacherName || 'Frau Weber',
                room: lk2Course?.room || 'B105',
                schedule: lk2Course?.schedule || 'Di 3-4, Do 1-2',
                nextExam: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                upcomingTasks: 1,
                unreadMessages: 0,
                color: '#388e3c'
              }
            ];
            setVorabiCourses(mockVorabiCourses);
          }
        } catch (courseError) {
          console.error('Error loading course data:', courseError);
          // Only show mock data on error if year has existing data
          if (hasYearData()) {
            const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
            const lk1Course = adminCourses.find(course => course.type === 'LK1');
            
            const mockVorabiCourses = [
              {
                id: 'lk1',
                name: lk1Course?.subjectName || 'Mathematik',
                type: 'LK',
                teacher: lk1Course?.teacherName || 'Herr Schmidt',
                room: lk1Course?.room || 'A201',
                schedule: lk1Course?.schedule || 'Mo 1-2, Mi 3-4',
                nextExam: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                upcomingTasks: 3,
                unreadMessages: 2,
                color: '#1976d2'
              }
            ];
            setVorabiCourses(mockVorabiCourses);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Cleanup-Funktion
    return () => {
      unsubscribeFinance();
    };
  }, [currentYear]); // Re-run when currentYear changes

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Zentrale Übersicht • Alle Inhalte sind maximal 72 Stunden sichtbar
      </Typography>
      
      <Grid container spacing={3}>
        {/* Announcements - Only show if there are any within 72 hours */}
        {announcements.filter(a => isWithin72Hours(a.createdAt)).length > 0 && (
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                boxShadow: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AnnouncementIcon />
                </Avatar>
                <Typography variant="h6">Ankündigungen</Typography>
                <Chip 
                  label="72h sichtbar" 
                  size="small" 
                  color="warning" 
                  sx={{ ml: 'auto', fontSize: '0.7rem' }}
                />
              </Box>
              
              <List sx={{ p: 0 }}>
                {announcements.filter(a => isWithin72Hours(a.createdAt)).map((announcement, index) => {
                  const remainingHours = getRemainingHours(announcement.createdAt);
                  
                  return (
                    <Box key={announcement.id}>
                      {index > 0 && <Divider sx={{ my: 1 }} />}
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                                {announcement.title}
                              </Typography>
                              {announcement.priority === 'high' && (
                                <Chip 
                                  label="Wichtig" 
                                  size="small" 
                                  color="error" 
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                              <Chip 
                                icon={<TimeIcon />}
                                label={`${remainingHours}h`} 
                                size="small" 
                                color="default" 
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>
                                {announcement.content}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: '#666' }}>
                                {new Date(announcement.createdAt).toLocaleDateString('de-DE')} • {announcement.createdBy}
                              </span>
                            </>
                          }
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Finance Overview - Full width */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <AccountBalanceIcon />
              </Avatar>
              <Typography variant="h6">Abikasse / Finanzübersicht</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => window.location.href = '/finance'}
                sx={{ ml: 'auto', borderRadius: 2 }}
              >
                Details anzeigen
              </Button>
            </Box>
            
            {financeData && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                      {financeData.currentBalance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Aktueller Kontostand
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      {financeData.weeklyChange > 0 ? (
                        <ArrowUpwardIcon sx={{ color: 'success.main', mr: 0.5 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ color: 'error.main', mr: 0.5 }} />
                      )}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: financeData.weeklyChange > 0 ? 'success.main' : 'error.main',
                          fontWeight: 600 
                        }}
                      >
                        {financeData.weeklyChange > 0 ? '+' : ''}{financeData.weeklyChange.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} diese Woche
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Letzte Einnahmen
                  </Typography>
                  {financeData.recentIncome.map((income, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{income.description}</Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        +{income.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                    Letzte Ausgaben
                  </Typography>
                  {financeData.recentExpenses.map((expense, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{expense.description}</Typography>
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        {expense.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Vorabi Courses - LKs and Abifächer */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <SchoolIcon />
              </Avatar>
              <Typography variant="h6">Meine Abifächer (LK1, LK2, Abifach 3 & 4)</Typography>
            </Box>
            
            <Grid container spacing={2}>
              {vorabiCourses.map((course) => (
                <Grid item xs={12} sm={6} md={3} key={course.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border: course.type === 'LK' ? '2px solid' : '1px solid',
                      borderColor: course.type === 'LK' ? 'primary.main' : 'divider',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => window.location.href = '/abi-vorabi'}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: course.color, 
                            width: 32, 
                            height: 32, 
                            mr: 1.5,
                            fontSize: '0.875rem'
                          }}
                        >
                          {course.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {course.name}
                            </Typography>
                            {course.type === 'LK' && (
                              <StarIcon sx={{ color: 'primary.main', ml: 0.5, fontSize: 16 }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {course.teacher}
                          </Typography>
                        </Box>
                        <Chip 
                          label={course.type} 
                          size="small" 
                          color={course.type === 'LK' ? 'primary' : 'default'}
                          variant={course.type === 'LK' ? 'filled' : 'outlined'}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Nächste Klausur
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {course.nextExam.toLocaleDateString('de-DE')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {course.upcomingTasks > 0 && (
                            <Chip 
                              label={`${course.upcomingTasks} Aufgaben`} 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                            />
                          )}
                          {course.unreadMessages > 0 && (
                            <Badge badgeContent={course.unreadMessages} color="error">
                              <Chip 
                                label="Nachrichten" 
                                size="small" 
                                color="info" 
                                variant="outlined"
                              />
                            </Badge>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => window.location.href = '/abi-vorabi'}
                sx={{ borderRadius: 2 }}
              >
                Alle Kurse anzeigen
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Umfragen */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <SurveyIcon />
              </Avatar>
              <Typography variant="h6">Aktive Umfragen</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => window.location.href = '/committees-projects'}
                sx={{ ml: 'auto', borderRadius: 2 }}
              >
                Alle Umfragen
              </Button>
            </Box>
            
            {surveys.length > 0 ? (
              <Grid container spacing={3}>
                {surveys.slice(0, 3).map((survey) => (
                  <Grid item xs={12} md={4} key={survey.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                            {survey.title}
                          </Typography>
                          <Chip 
                            label={survey.status === 'active' ? 'Aktiv' : 'Beendet'} 
                            size="small" 
                            color={survey.status === 'active' ? 'success' : 'default'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {survey.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {survey.responses} Antworten
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Bis: {new Date(survey.endDate).toLocaleDateString('de-DE')}
                          </Typography>
                        </Box>
                        {survey.status === 'active' && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            fullWidth
                            sx={{ borderRadius: 2 }}
                          >
                            Teilnehmen
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine aktiven Umfragen verfügbar.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Abgeschlossene Projekte */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h6">Abgeschlossene Projekte</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => window.location.href = '/committees-projects'}
                sx={{ ml: 'auto', borderRadius: 2 }}
              >
                Alle Projekte
              </Button>
            </Box>
            
            {approvedProjects.filter(p => isWithin72Hours(p.approvedAt)).length > 0 ? (
              <Grid container spacing={3}>
                {approvedProjects.filter(p => isWithin72Hours(p.approvedAt)).map((project) => {
                  const remainingHours = getRemainingHours(project.approvedAt);
                  
                  return (
                    <Grid item xs={12} md={4} key={project.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                              {project.title}
                            </Typography>
                            <Chip 
                              label="Abgeschlossen" 
                              size="small" 
                              color="success" 
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Chip 
                              label={project.committee} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(project.approvedAt).toLocaleDateString('de-DE')}
                            </Typography>
                          </Box>
                          
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            onClick={() => window.location.href = '/committees-projects'}
                            sx={{ borderRadius: 2 }}
                          >
                            Details anzeigen
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine kürzlich abgeschlossenen Projekte.
               </Typography>
             )}
           </Paper>
         </Grid>
         

      </Grid>
    </Box>
  );
}

export default Dashboard;
