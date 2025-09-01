// Mock Firestore implementation for demo mode
// This provides a local storage-based implementation that mimics Firestore's API
import yearManagementService from './yearManagementService';

// Mock Timestamp implementation
const mockTimestamp = {
  now: () => ({
    toDate: () => new Date(),
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0
  }),
  fromDate: (date) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
  }),
  toDate: () => new Date()
};

// Function to load data from localStorage
const loadMockDataFromStorage = () => {
  try {
    const stored = localStorage.getItem('mockFirestoreData');
    if (stored) {
      const parsedData = JSON.parse(stored);
      console.log('📥 Loaded mock data from localStorage:', Object.keys(parsedData));
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading mock data from localStorage:', error);
  }
  return null;
};

// Function to load year-specific data from localStorage
const loadYearSpecificData = (year) => {
  try {
    const stored = localStorage.getItem('mockFirestoreData');
    if (stored) {
      const parsedData = JSON.parse(stored);
      
      // Check if we have year-specific data structure
      if (parsedData.years && parsedData.years[year]) {
        console.log(`📥 Loaded year-specific data for ${year}:`, Object.keys(parsedData.years[year]));
        return parsedData.years[year];
      }
      
      // If no year-specific data exists, return empty structure
      console.log(`📥 No year-specific data found for ${year}, returning empty structure`);
      return {
        users: [],
        committees: [],
        projects: [],
        conversations: [],
        reports: [],
        transactions: [],
        'vorabi-subjects': [],
        settings: {}
      };
    }
  } catch (error) {
    console.error('Error loading year-specific data from localStorage:', error);
  }
  return {
    users: [],
    committees: [],
    projects: [],
    conversations: [],
    reports: [],
    transactions: [],
    'vorabi-subjects': [],
    settings: {}
  };
};

// Function to save data to localStorage
const saveMockDataToStorage = (data) => {
  try {
    localStorage.setItem('mockFirestoreData', JSON.stringify(data));
    console.log('💾 Saved mock data to localStorage');
  } catch (error) {
    console.error('Error saving mock data to localStorage:', error);
  }
};

// Function to get current year-specific mock data
const getCurrentYearMockData = () => {
  const currentYear = yearManagementService.getCurrentYear();
  return loadYearSpecificData(currentYear);
};

// Initialize mock data - load from localStorage or use defaults
const getInitialMockData = () => {
  const storedData = loadMockDataFromStorage();
  if (storedData) {
    return storedData;
  }
  
  // Create year-specific structure if nothing in localStorage
  const currentYear = yearManagementService.getCurrentYear();
  return {
    years: {
      [currentYear]: {
        committees: [],
        projects: [],
        users: [],
        conversations: [],
        reports: [],
        'vorabi-subjects': [],
        transactions: [],
        settings: {}
      }
    }
  };
};

// Fallback function for demo data (only used when explicitly needed)
const getDemoMockData = () => {
  const currentYear = yearManagementService.getCurrentYear();
  return {
    years: {
      [currentYear]: {
        committees: [],
        projects: [],
        users: [
      {
        id: 'admin-test-uid',
        uid: 'admin-test-uid',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: `admin@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
        displayName: 'Administrator',
        role: 'admin',
        committees: ['Abi-Komitee', 'Finanz-Komitee'],
        committeeRoles: { 'Abi-Komitee': 'leader', 'Finanz-Komitee': 'member' },
        demoPassword: 'admin123',
        notificationSettings: {
          pushNotifications: true,
          soundEnabled: true,
          emailNotifications: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        isBlocked: false,
        status: 'online',
        lastSeen: new Date(),
        isOnline: true
      },
      {
        id: 'teacher-test-uid',
        uid: 'teacher-test-uid',
        firstName: 'Thomas',
        lastName: 'Schmidt',
        email: `lehrer@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
        displayName: 'Herr Schmidt',
        role: 'committee',
        committees: ['Abi-Komitee'],
        committeeRoles: { 'Abi-Komitee': 'advisor' },
        demoPassword: 'lehrer123',
        notificationSettings: {
          pushNotifications: true,
          soundEnabled: true,
          emailNotifications: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        isBlocked: false,
        status: 'away',
        lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 Minuten her
        isOnline: false
      },
      {
        id: 'student-test-uid',
        uid: 'student-test-uid',
        firstName: 'Anna',
        lastName: 'Müller',
        email: `schueler@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
        displayName: 'Anna Müller',
        role: 'student',
        committees: [],
        committeeRoles: {},
        demoPassword: 'schueler123',
        notificationSettings: {
          pushNotifications: true,
          soundEnabled: true,
          emailNotifications: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        isBlocked: false,
        status: 'offline',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 Stunden her
        isOnline: false
      },
      {
        id: 'student-2-uid',
        uid: 'student-2-uid',
        firstName: 'Lisa',
        lastName: 'Weber',
        email: `lisa.weber@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
        displayName: 'Lisa Weber',
        role: 'student',
        committees: ['Jahrbuch-Komitee'],
        committeeRoles: { 'Jahrbuch-Komitee': 'member' },
        demoPassword: 'lisa123',
        notificationSettings: {
          pushNotifications: true,
          soundEnabled: true,
          emailNotifications: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        isBlocked: false,
        status: 'online',
        lastSeen: new Date(),
        isOnline: true
      },
      {
        id: 'student-3-uid',
        uid: 'student-3-uid',
        firstName: 'Tom',
        lastName: 'Mueller',
        email: `tom.mueller@rse-abschluss${yearManagementService.getCurrentYear()}.de`,
        displayName: 'Tom Mueller',
        role: 'student',
        committees: ['Event-Komitee'],
        committeeRoles: { 'Event-Komitee': 'leader' },
        demoPassword: 'tom123',
        notificationSettings: {
          pushNotifications: true,
          soundEnabled: true,
          emailNotifications: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        isBlocked: false,
        status: 'offline',
        lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 Tag her
        isOnline: false
      }
    ],
    conversations: [
      {
        id: 'test-conv-1',
        type: 'group',
        name: 'Klassen-Chat 12a',
        participants: ['admin-test-uid', 'student-test-uid', 'student-2-uid', 'student-3-uid'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 Woche her
        lastMessage: 'Das ist eine Testnachricht die gemeldet wurde',
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastMessageSender: 'student-2-uid'
      },
      {
        id: 'test-conv-2',
        type: 'private',
        participants: ['student-test-uid', 'student-2-uid'],
        displayName: 'Lisa Weber',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 Tage her
        lastMessage: 'Hallo, wie geht es dir?',
        lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        lastMessageSender: 'student-2-uid'
      }
    ],

    // Mock messages for conversations
    'conversations/test-conv-1/messages': [
      {
        id: 'msg-1-1',
        text: 'Hallo zusammen! Wie läuft die Vorbereitung für das Abitur?',
        senderId: 'admin-test-uid',
        senderName: 'Max Mustermann',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 Tage her
        conversationId: 'test-conv-1',
        type: 'text'
      },
      {
        id: 'msg-1-2',
        text: 'Bei mir läuft es ganz gut! Mathe ist noch etwas schwierig.',
        senderId: 'student-test-uid',
        senderName: 'Anna Müller',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 Tage her
        conversationId: 'test-conv-1',
        type: 'text'
      },
      {
        id: 'msg-1-3',
        text: 'Das ist eine Testnachricht die gemeldet wurde',
        senderId: 'student-2-uid',
        senderName: 'Lisa Weber',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 Stunden her
        conversationId: 'test-conv-1',
        type: 'text'
      },
      {
        id: 'msg-1-4',
        text: 'Wann ist nochmal unser nächstes Treffen?',
        senderId: 'student-3-uid',
        senderName: 'Tom Mueller',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 Stunde her
        conversationId: 'test-conv-1',
        type: 'text'
      }
    ],

    'conversations/test-conv-2/messages': [
      {
        id: 'msg-2-1',
        text: 'Hallo Anna! Wie geht es dir denn so?',
        senderId: 'student-2-uid',
        senderName: 'Lisa Weber',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 Tage her
        conversationId: 'test-conv-2',
        type: 'text'
      },
      {
        id: 'msg-2-2',
        text: 'Hi Lisa! Mir geht es gut, danke! Bist du schon mit der Deutsch-Hausaufgabe fertig?',
        senderId: 'student-test-uid',
        senderName: 'Anna Müller',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 Tage her + 30 Min
        conversationId: 'test-conv-2',
        type: 'text'
      },
      {
        id: 'msg-2-3',
        text: 'Ja, habe ich gestern Abend gemacht. War gar nicht so schwer!',
        senderId: 'student-2-uid',
        senderName: 'Lisa Weber',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 Tag her
        conversationId: 'test-conv-2',
        type: 'text'
      },
      {
        id: 'msg-2-4',
        text: 'Hallo, wie geht es dir?',
        senderId: 'student-2-uid',
        senderName: 'Lisa Weber',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 Stunde her
        conversationId: 'test-conv-2',
        type: 'text'
      }
    ],

    reports: [
      {
        id: 'test-report-1',
        messageId: 'test-msg-1',
        conversationId: 'test-conv-1',
        reportedBy: 'student-test-uid',
        reportedByName: 'Anna Müller',
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 Stunden her
        reason: 'Beleidigung / Mobbing',
        additionalInfo: 'Unangemessene Sprache verwendet',
        messageText: 'Das ist eine Testnachricht die gemeldet wurde',
        messageSender: 'student-2-uid',
        messageSenderName: 'Lisa Weber',
        status: 'pending',
        priority: 'high',
        conversationType: 'group',
        conversationName: 'Klassen-Chat 12a',
        reportType: 'message',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'test-report-2',
        conversationId: 'test-conv-2',
        reportedBy: 'student-3-uid',
        reportedByName: 'Tom Mueller',
        reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 Stunde her
        reason: 'Spam / Werbung',
        additionalInfo: 'Ständige Werbung für externe Dienste',
        status: 'pending',
        priority: 'medium',
        conversationType: 'private',
        conversationName: 'Lisa Weber',
        reportType: 'conversation',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ],

    notifications: [
      {
        id: 'notif-1',
        title: 'Neue Nachricht',
        message: 'Du hast eine neue Nachricht von Lisa Weber erhalten',
        type: 'message',
        userId: 'student-test-uid',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 Minuten her
        data: {
          conversationId: 'test-conv-2',
          senderId: 'student-2-uid'
        }
      },
      {
        id: 'notif-2',
        title: 'Komitee-Update',
        message: 'Es gibt Updates im Abi-Komitee',
        type: 'committee',
        userId: 'admin-test-uid',
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 Stunden her
        data: {
          committeeId: 'abi-komitee'
        }
      }
    ],

    courses: [
      {
        id: '1',
        name: 'Mathematik',
        type: 'LK',
        category: 'core',
        teacher: 'Herr Müller',
        credits: 5,
        examDate: '2024-04-15',
        examTime: '08:00',
        examRoom: 'Raum 101',
        examContent: 'Abitur-Themen: Analysis, Analytische Geometrie, Stochastik',
        materials: [],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Deutsch',
        type: 'LK',
        category: 'core',
        teacher: 'Frau Schmidt',
        credits: 5,
        examDate: '2024-04-18',
        examTime: '08:00',
        examRoom: 'Raum 201',
        examContent: 'Abitur-Themen: Lyrik, Drama, Epik, Sprache',
        materials: [],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Geschichte',
        type: 'GK',
        category: 'core',
        teacher: 'Herr Weber',
        credits: 3,
        examDate: '2024-04-22',
        examTime: '08:00',
        examRoom: 'Raum 301',
        examContent: 'Abitur-Themen: 19./20. Jahrhundert, Deutsche Geschichte, Europäische Integration',
        materials: [],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Englisch',
        type: 'GK',
        category: 'additional',
        teacher: 'Mrs. Johnson',
        credits: 3,
        examDate: '2024-04-25',
        examTime: '08:00',
        examRoom: 'Raum 102',
        examContent: 'Abitur-Themen: Shakespeare, Modern Literature, Globalization, Mediation',
        materials: [],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Biologie',
        type: 'GK',
        category: 'additional',
        teacher: 'Frau Klein',
        credits: 3,
        examDate: '2024-04-28',
        examTime: '08:00',
        examRoom: 'Raum 205',
        examContent: 'Abitur-Themen: Genetik, Ökologie, Evolution, Neurobiologie',
        materials: [],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    transactions: [
      {
        id: 'trans-1',
        type: 'income',
        amount: 250.50,
        description: 'Kuchenverkauf Schulfest',
        category: 'Kuchenverkauf',
        date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], // 1 Woche her
        participants: 'Klasse 12a',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'trans-2',
        type: 'expense',
        amount: 120.00,
        description: 'Dekoration für Abschlussfeier',
        category: 'Materialien',
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 Tage her
        participants: 'Deko-Team',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'trans-3',
        type: 'income',
        amount: 180.25,
        description: 'Sponsoring lokales Unternehmen',
        category: 'Sponsoring',
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 Tage her
        participants: 'Finanz-Team',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'trans-4',
        type: 'expense',
        amount: 95.50,
        description: 'Catering Planungsmeeting',
        category: 'Verpflegung',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 Tage her
        participants: 'Planungs-Komitee',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'trans-5',
        type: 'income',
        amount: 320.00,
        description: 'Ticketverkauf Abschlussball',
        category: 'Ticketverkauf',
        date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // 1 Tag her
        participants: 'Event-Team',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'trans-6',
        type: 'expense',
        amount: 200.00,
        description: 'DJ für Abschlussfeier',
        category: 'Entertainment',
        date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // 1 Tag her
        participants: 'Event-Team',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'trans-7',
        type: 'income',
        amount: 75.00,
        description: 'Verkauf alter Schulbücher',
        category: 'Verkauf',
        date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0], // 2 Wochen her
        participants: 'Bibliothek-Team',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
      },
      {
        id: 'trans-8',
        type: 'expense',
        amount: 45.50,
        description: 'Transport für Exkursion',
        category: 'Transport',
        date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0], // 12 Tage her
        participants: 'Geschichts-LK',
        actionId: null,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
      }
    ],
    settings: {}
      }
    }
  };
};

// End of getDemoMockData function

// Mock data storage - use year-specific data
let mockData = getCurrentYearMockData();

// Migration function to ensure 'settings' exists in all year data
const migrateLocalStorageData = () => {
  try {
    const stored = localStorage.getItem('mockFirestoreData');
    if (stored) {
      const parsedData = JSON.parse(stored);
      let needsUpdate = false;
      
      if (parsedData.years) {
        // Check each year's data for missing 'settings'
        Object.keys(parsedData.years).forEach(year => {
          if (!parsedData.years[year].settings) {
            parsedData.years[year].settings = {};
            needsUpdate = true;
            console.log(`📦 Added missing 'settings' to year ${year}`);
          }
        });
      }
      
      if (needsUpdate) {
        saveMockDataToStorage(parsedData);
        console.log('✅ localStorage data migrated successfully');
      }
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
};

// Save initial data to localStorage if not already there
if (!localStorage.getItem('mockFirestoreData')) {
  const initialData = getInitialMockData();
  saveMockDataToStorage(initialData);
} else {
  // Migrate existing data to ensure 'settings' exists
  migrateLocalStorageData();
}

// Ensure demo data is available in current year
const ensureDemoDataAvailable = () => {
  const currentYear = yearManagementService.getCurrentYear();
  const currentYearData = getCurrentYearMockData();
  
  // Check if we have demo conversations but no messages
  if (currentYearData.conversations && currentYearData.conversations.length > 0) {
    const demoData = getDemoMockData();
    
    // Add demo message collections if they don't exist
    if (!currentYearData['conversations/test-conv-1/messages'] && demoData['conversations/test-conv-1/messages']) {
      currentYearData['conversations/test-conv-1/messages'] = demoData['conversations/test-conv-1/messages'];
    }
    if (!currentYearData['conversations/test-conv-2/messages'] && demoData['conversations/test-conv-2/messages']) {
      currentYearData['conversations/test-conv-2/messages'] = demoData['conversations/test-conv-2/messages'];
    }
    
    // Save updated data
    try {
      const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      if (!storedData.years) storedData.years = {};
      storedData.years[currentYear] = currentYearData;
      localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
      console.log('✅ Demo message data ensured for current year');
    } catch (error) {
      console.error('Error ensuring demo data:', error);
    }
  }
};

// Ensure demo data is available
ensureDemoDataAvailable();

// originalMockData removed - no longer needed as we use year-specific data structure

// Helper function to get nested collection path
const getNestedCollectionPath = (path) => {
  const parts = path.split('/');
  if (parts.length === 1) {
    return parts[0]; // Simple collection
  }
  return path; // Nested collection path
};

// Mock Firestore functions
export const mockFirestore = {
  // Collection reference
  collection: (collectionPath) => ({
    // Add document
    add: async (data) => {
      try {
        console.log('🔥 Mock addDoc called with:', { collectionPath, data });
        
        const id = `${collectionPath.replace(/\//g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newDoc = {
          id,
          ...data,
          createdAt: new Date()
        };
        
        console.log('📝 Generated document:', newDoc);
        
        // Get current year-specific data
        let currentYear;
        try {
          currentYear = yearManagementService.getCurrentYear();
          console.log('📅 Current year:', currentYear);
        } catch (yearError) {
          console.error('❌ Error getting current year:', yearError);
          currentYear = new Date().getFullYear(); // Fallback to current year
        }
        
        try {
          mockData = getCurrentYearMockData();
          console.log('📊 Current mockData keys:', Object.keys(mockData));
        } catch (dataError) {
          console.error('❌ Error getting current year mock data:', dataError);
          mockData = {}; // Fallback to empty object
        }
        
        // Handle nested collection paths for messages
        let actualCollectionKey;
        if ((collectionPath.includes('conversations/') && collectionPath.includes('/messages')) || 
            (collectionPath.includes('chats/') && collectionPath.includes('/messages'))) {
          // For message collections, use the full path
          actualCollectionKey = collectionPath;
        } else {
          // For other collections, use the last part of the path
          actualCollectionKey = collectionPath.includes('/') ? collectionPath.split('/').pop() : collectionPath;
        }
        
        console.log('🗂️ Collection key:', actualCollectionKey);
        
        if (!mockData[actualCollectionKey]) {
          mockData[actualCollectionKey] = [];
          console.log('📁 Created new collection array for:', actualCollectionKey);
        }
        
        mockData[actualCollectionKey].push(newDoc);
        console.log('✅ Document added to collection. Total documents:', mockData[actualCollectionKey].length);
        
        // Save year-specific data back to localStorage
        try {
          const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
          if (!storedData.years) storedData.years = {};
          if (!storedData.years[currentYear]) storedData.years[currentYear] = {};
          storedData.years[currentYear] = mockData;
          localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
          console.log(`💾 Saved updated year-specific mockData for ${currentYear} to localStorage after addDoc`);
        } catch (error) {
          console.error('❌ Error saving year-specific mockData to localStorage:', error);
          throw error; // Re-throw to indicate failure
        }
        
        console.log(`✅ Mock addDoc: Successfully added document to ${actualCollectionKey} for year ${currentYear}`, newDoc);
        console.log(`📊 Current mockData[${actualCollectionKey}]:`, mockData[actualCollectionKey]);
        return { id };
        
      } catch (error) {
        console.error('❌ CRITICAL ERROR in mock addDoc:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          collectionPath,
          data
        });
        throw error; // Re-throw the error so the calling code knows it failed
      }
    },
    
    // Get documents
    get: async () => {
      // Always get current year-specific data
      const currentYearData = getCurrentYearMockData();
      
      // Handle nested collection paths for messages
      let actualCollectionKey;
      if ((collectionPath.includes('conversations/') && collectionPath.includes('/messages')) || 
          (collectionPath.includes('chats/') && collectionPath.includes('/messages'))) {
        // For message collections, use the full path
        actualCollectionKey = collectionPath;
      } else {
        // For other collections, use the last part of the path
        actualCollectionKey = collectionPath.includes('/') ? collectionPath.split('/').pop() : collectionPath;
      }
      
      console.log(`Mock collection.get: Looking for collection '${actualCollectionKey}' in:`, Object.keys(currentYearData));
      
      return {
        docs: (currentYearData[actualCollectionKey] || []).map(doc => ({
          id: doc.id,
          data: () => doc,
          exists: () => true
        }))
      };
    },
    
    // Where query
    where: (field, operator, value) => ({
      get: async () => {
        // Always get current year-specific data
        const currentYearData = getCurrentYearMockData();
        // Handle nested collection paths for messages
        let actualCollectionKey;
        if ((collectionPath.includes('conversations/') && collectionPath.includes('/messages')) || 
            (collectionPath.includes('chats/') && collectionPath.includes('/messages'))) {
          // For message collections, use the full path
          actualCollectionKey = collectionPath;
        } else {
          // For other collections, use the last part of the path
          actualCollectionKey = collectionPath.includes('/') ? collectionPath.split('/').pop() : collectionPath;
        }
        const filtered = (currentYearData[actualCollectionKey] || []).filter(doc => {
          switch (operator) {
            case '==':
              return doc[field] === value;
            case 'array-contains':
              return Array.isArray(doc[field]) && doc[field].includes(value);
            case '!=':
              return doc[field] !== value;
            default:
              return true;
          }
        });
        
        return {
          docs: filtered.map(doc => ({
            id: doc.id,
            data: () => doc,
            exists: () => true
          }))
        };
      }
    })
  }),
  
  // Document reference
  doc: (collectionPath, docId) => ({
    // Store path for setDoc compatibility
    path: `${collectionPath}/${docId}`,
    collectionPath,
    docId,
    
    // Update document
    update: async (data) => {
      // Get current year-specific data
      const currentYear = yearManagementService.getCurrentYear();
      const currentYearData = getCurrentYearMockData();
      // Handle nested collection paths for messages
      let actualCollectionKey;
      if ((collectionPath.includes('conversations/') && collectionPath.includes('/messages')) || 
          (collectionPath.includes('chats/') && collectionPath.includes('/messages'))) {
        // For message collections, use the full path
        actualCollectionKey = collectionPath;
      } else {
        // For other collections, use the last part of the path
        actualCollectionKey = collectionPath.includes('/') ? collectionPath.split('/').pop() : collectionPath;
      }
      const collection = currentYearData[actualCollectionKey] || [];
      const index = collection.findIndex(doc => doc.id === docId);
      
      if (index !== -1) {
        currentYearData[actualCollectionKey][index] = {
          ...currentYearData[actualCollectionKey][index],
          ...data,
          updatedAt: new Date()
        };
        console.log(`Mock updateDoc: Updated document ${docId} in ${actualCollectionKey} for year ${currentYear}`, currentYearData[actualCollectionKey][index]);
        
        // Save year-specific data back to localStorage
        try {
          const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
          if (!storedData.years) storedData.years = {};
          if (!storedData.years[currentYear]) storedData.years[currentYear] = {};
          storedData.years[currentYear] = currentYearData;
          localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
        } catch (error) {
          console.error('Error saving year-specific mockData to localStorage:', error);
        }
      } else {
        console.log(`Mock updateDoc: Document ${docId} not found in ${actualCollectionKey} for year ${currentYear}`);
      }
    },
    
    // Delete document
    delete: async () => {
      console.log('🚨🚨🚨 MOCK DELETE DOC AUFGERUFEN! 🚨🚨🚨');
      console.log(`🗑️ Mock deleteDoc: Attempting to delete document ${docId} from ${collectionPath}`);
      
      // Get current year-specific data
      const currentYear = yearManagementService.getCurrentYear();
      const currentYearData = getCurrentYearMockData();
      
      // Handle nested collection paths for messages
      let actualCollectionKey;
      if ((collectionPath.includes('conversations/') && collectionPath.includes('/messages')) || 
          (collectionPath.includes('chats/') && collectionPath.includes('/messages'))) {
        // For message collections, use the full path
        actualCollectionKey = collectionPath;
      } else {
        // For other collections, use the last part of the path
        actualCollectionKey = collectionPath.includes('/') ? collectionPath.split('/').pop() : collectionPath;
      }
      
      // For users collection, also check global mockData structure
      let collection = currentYearData[actualCollectionKey] || [];
      let index = collection.findIndex(doc => doc.id === docId);
      let dataSource = 'yearSpecific';
      
      // If not found in year-specific data and it's users collection, check global mockData
      if (index === -1 && actualCollectionKey === 'users') {
        // Load full mockData to check global users
        const fullMockData = loadMockDataFromStorage() || {};
        if (fullMockData.users && Array.isArray(fullMockData.users)) {
          collection = fullMockData.users;
          index = collection.findIndex(doc => doc.id === docId);
          dataSource = 'global';
          console.log(`🔍 Checking global users collection, found index: ${index}`);
        }
      }
      
      if (index !== -1) {
        collection.splice(index, 1);
        console.log(`🗑️ Mock deleteDoc: Deleted document ${docId} from ${actualCollectionKey} (${dataSource}) for year ${currentYear}`);
        console.log(`📊 Remaining documents in ${actualCollectionKey}:`, collection.length);
        
        // Save the updated data back to localStorage
        try {
          const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
          
          if (dataSource === 'global') {
            // Update global users
            storedData.users = collection;
          } else {
            // Update year-specific data
            if (!storedData.years) storedData.years = {};
            if (!storedData.years[currentYear]) storedData.years[currentYear] = {};
            storedData.years[currentYear][actualCollectionKey] = collection;
          }
          
          localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
          console.log(`💾 Saved updated mockData (${dataSource}) for ${currentYear} to localStorage after deleteDoc`);
          
          // Update global mockData reference
          if (dataSource === 'yearSpecific') {
            currentYearData[actualCollectionKey] = collection;
            mockData = currentYearData;
          }
          
        } catch (error) {
          console.error('Error saving mockData to localStorage:', error);
        }
      } else {
        console.log(`❌ Mock deleteDoc: Document ${docId} not found in ${actualCollectionKey} for year ${currentYear}`);
        console.log(`📊 Available documents in ${actualCollectionKey}:`, collection.map(doc => ({ id: doc.id, email: doc.email })));
      }
    },
    
    // Get document
    get: async () => {
      // Always get current year-specific data
      const currentYearData = getCurrentYearMockData();
      const collection = currentYearData[collectionPath] || [];
      const doc = collection.find(doc => doc.id === docId);
      
      return {
        id: docId,
        data: () => doc || {},
        exists: () => !!doc
      };
    }
  })
};

// Mock query functions
export const mockQuery = (collectionRef, ...constraints) => ({
  get: async () => {
    let result = await collectionRef.get();
    let docs = result.docs;
    
    // Apply constraints
    for (const constraint of constraints) {
      if (constraint.field && constraint.operator && constraint.value !== undefined) {
        // Apply where constraint
        docs = docs.filter(doc => {
          const data = doc.data();
          switch (constraint.operator) {
            case '==':
              return data[constraint.field] === constraint.value;
            case '!=':
              return data[constraint.field] !== constraint.value;
            case 'array-contains':
              return Array.isArray(data[constraint.field]) && data[constraint.field].includes(constraint.value);
            case '>':
              return data[constraint.field] > constraint.value;
            case '<':
              return data[constraint.field] < constraint.value;
            case '>=':
              return data[constraint.field] >= constraint.value;
            case '<=':
              return data[constraint.field] <= constraint.value;
            default:
              return true;
          }
        });
      } else if (constraint.field && constraint.direction) {
        // Apply orderBy constraint
        docs = docs.sort((a, b) => {
          const aVal = a.data()[constraint.field];
          const bVal = b.data()[constraint.field];
          
          if (constraint.direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
          } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          }
        });
      } else if (constraint.count) {
        // Apply limit constraint
        docs = docs.slice(0, constraint.count);
      }
    }
    
    return { docs };
  }
});

// Mock where function
export const mockWhere = (field, operator, value) => ({ field, operator, value });

// Mock orderBy function
export const mockOrderBy = (field, direction = 'asc') => ({ field, direction });

// Mock limit function
export const mockLimit = (count) => ({ count });

// Mock onSnapshot function
export const mockOnSnapshot = (queryRef, callback) => {
  // Simulate real-time updates by calling callback immediately
  queryRef.get().then(callback);
  
  // Set up a periodic check for changes (simulating real-time updates)
  const interval = setInterval(() => {
    queryRef.get().then(callback);
  }, 1000); // Check every second
  
  // Return unsubscribe function
  return () => {
    clearInterval(interval);
  };
};

// Use the mockTimestamp defined at the top of the file

// Mock serverTimestamp
export const mockServerTimestamp = () => new Date();

// Export mock functions to replace Firebase imports
export const getFirestore = () => mockFirestore;
export const collection = (db, ...pathSegments) => {
  const collectionPath = pathSegments.join('/');
  return mockFirestore.collection(collectionPath);
};
export const doc = (db, ...pathSegments) => {
  if (pathSegments.length < 2) {
    throw new Error('doc() requires at least collection and document ID');
  }
  
  const docId = pathSegments.pop();
  const collectionPath = pathSegments.join('/');
  return mockFirestore.doc(collectionPath, docId);
};
export const query = mockQuery;
export const where = mockWhere;
export const orderBy = mockOrderBy;
export const limit = mockLimit;
export const onSnapshot = mockOnSnapshot;
export const Timestamp = mockTimestamp;
export const getDocs = async (queryRef) => queryRef.get();
export const getDoc = async (docRef) => docRef.get();
export const updateDoc = async (docRef, data) => docRef.update(data);
export const deleteDoc = async (docRef) => docRef.delete();
export const addDoc = async (collectionRef, data) => collectionRef.add(data);
export const setDoc = async (docRef, data) => {
  console.log('🔥 setDoc called with:', { docRef, data });
  
  // Extract collection path and document ID from docRef
  const collectionPath = docRef.collectionPath;
  const docId = docRef.docId;
  
  console.log('📍 Extracted paths:', { collectionPath, docId });
  
  if (!collectionPath || !docId) {
    console.error('❌ Invalid document reference for setDoc', docRef);
    return;
  }
  
  // Initialize collection if it doesn't exist
  if (!mockData[collectionPath]) {
    console.log(`📁 Creating new collection: ${collectionPath}`);
    mockData[collectionPath] = [];
  }
  
  // Find existing document or create new one
  const existingIndex = mockData[collectionPath].findIndex(doc => doc.id === docId);
  const docData = {
    id: docId,
    ...data,
    updatedAt: new Date()
  };
  
  if (existingIndex !== -1) {
    // Update existing document
    console.log(`🔄 Updating existing document at index ${existingIndex}`);
    mockData[collectionPath][existingIndex] = {
      ...mockData[collectionPath][existingIndex],
      ...docData
    };
  } else {
    // Create new document
    console.log(`✨ Creating new document`);
    docData.createdAt = new Date();
    mockData[collectionPath].push(docData);
  }
  
  console.log(`✅ Mock setDoc: Saved document ${docId} to ${collectionPath}`, docData);
  console.log(`📊 Current ${collectionPath} collection:`, mockData[collectionPath]);
  saveMockDataToStorage(mockData);
  return Promise.resolve();
};
export const writeBatch = (db) => ({
  update: (docRef, data) => {
    // Store update operations for batch execution
    if (!this._operations) this._operations = [];
    this._operations.push({ type: 'update', docRef, data });
  },
  commit: async () => {
    // Execute all batch operations
    if (this._operations) {
      for (const operation of this._operations) {
        if (operation.type === 'update') {
          await operation.docRef.update(operation.data);
        }
      }
      this._operations = [];
    }
    return Promise.resolve();
  }
});
export const serverTimestamp = mockServerTimestamp;

// Function to check if we're in demo mode
export const isDemoMode = () => {
  // Check if we have test user in localStorage or if we're using demo Firebase config
  const testUser = localStorage.getItem('testUser');
  const isDemoConfig = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return !!testUser || isDemoConfig;
};

// Function to get mock data for debugging
export const getMockData = () => {
  // Always return current year-specific data
  const currentYearData = getCurrentYearMockData();
  console.log('📊 Current year-specific mockData:', currentYearData);
  return currentYearData;
};

// Function to reset mock data for current year
export const resetMockData = () => {
  const currentYear = yearManagementService.getCurrentYear();
  const emptyYearData = {
    users: [],
    committees: [],
    projects: [],
    conversations: [],
    reports: [],
    transactions: [],
    'vorabi-subjects': []
  };
  
  // Save empty year-specific data to localStorage
  try {
    const storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
    if (!storedData.years) storedData.years = {};
    storedData.years[currentYear] = emptyYearData;
    localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
    console.log(`Mock-Daten für Jahr ${currentYear} wurden zurückgesetzt`);
  } catch (error) {
    console.error('Error resetting year-specific mockData:', error);
  }
  
  // Update local mockData
  mockData = emptyYearData;
};

export const forceReloadDemoData = () => {
  // Clear localStorage completely
  localStorage.clear();
  console.log('localStorage cleared');
  
  // Create fresh demo data
  const initialData = getInitialMockData();
  saveMockDataToStorage(initialData);
  
  // Ensure demo data is available
  ensureDemoDataAvailable();
  
  // Update local mockData
  mockData = getCurrentYearMockData();
  
  console.log('Demo data force reloaded with proper message isolation');
};