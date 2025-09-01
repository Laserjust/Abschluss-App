import { isDemoMode } from './mockFirestore';
import { useAuth } from '../context/AuthContext';

/**
 * Data Isolation Service für Multi-Tenant-Architektur
 * Verwaltet die Trennung von Daten zwischen verschiedenen Jahrgängen
 */

class DataIsolationService {
  constructor() {
    this.currentYear = null;
  }

  // Set current year for data isolation
  setCurrentYear(year) {
    this.currentYear = year;
  }

  // Get year-specific collection path
  getYearCollection(collection) {
    const year = this.currentYear || '27';
    return `years/${year}/${collection}`;
  }

  // Get year-specific document path
  getYearDocPath(collection, docId) {
    const year = this.currentYear || '27';
    return `years/${year}/${collection}/${docId}`;
  }

  // Get year-specific subcollection path
  getYearSubcollection(collection, docId, subcollection) {
    const year = this.currentYear || '27';
    return `years/${year}/${collection}/${docId}/${subcollection}`;
  }

  // Finance-specific paths
  getFinanceCollection() {
    return this.getYearCollection('finances');
  }

  getFinanceDocPath(docId) {
    return this.getYearDocPath('finances', docId);
  }

  getTransactionsCollection(financeId) {
    return this.getYearSubcollection('finances', financeId, 'transactions');
  }

  // Direct transactions collection for finance service
  getFinanceTransactionsCollection(year = null) {
    const targetYear = year || this.currentYear;
    if (!targetYear) {
      console.warn('No year specified for finance transactions, using default');
      return 'transactions';
    }
    return `years/${targetYear}/transactions`;
  }

  // Project-specific paths
  getProjectsCollection() {
    return this.getYearCollection('projects');
  }

  getProjectDocPath(projectId) {
    return this.getYearDocPath('projects', projectId);
  }

  getProjectTasksCollection(projectId) {
    return this.getYearSubcollection('projects', projectId, 'tasks');
  }

  // Chat-specific paths
  getChatsCollection() {
    return this.getYearCollection('chats');
  }

  getChatDocPath(chatId) {
    return this.getYearDocPath('chats', chatId);
  }

  getMessagesCollection(chatId) {
    return this.getYearSubcollection('chats', chatId, 'messages');
  }

  // Document-specific paths
  getDocumentsCollection() {
    return this.getYearCollection('documents');
  }

  getDocumentDocPath(docId) {
    return this.getYearDocPath('documents', docId);
  }

  // Survey-specific paths
  getSurveysCollection() {
    return this.getYearCollection('surveys');
  }

  getSurveyDocPath(surveyId) {
    return this.getYearDocPath('surveys', surveyId);
  }

  getSurveyResponsesCollection(surveyId) {
    return this.getYearSubcollection('surveys', surveyId, 'responses');
  }

  // Archive-specific paths
  getArchiveCollection() {
    return this.getYearCollection('archive');
  }

  getArchiveDocPath(docId) {
    return this.getYearDocPath('archive', docId);
  }

  // Committee-specific paths
  getCommitteesCollection() {
    return this.getYearCollection('committees');
  }

  getCommitteeDocPath(committeeId) {
    return this.getYearDocPath('committees', committeeId);
  }

  getCommitteeMembersCollection(committeeId) {
    return this.getYearSubcollection('committees', committeeId, 'members');
  }

  // Event-specific paths
  getEventsCollection() {
    return this.getYearCollection('events');
  }

  getEventDocPath(eventId) {
    return this.getYearDocPath('events', eventId);
  }

  getEventParticipantsCollection(eventId) {
    return this.getYearSubcollection('events', eventId, 'participants');
  }

  // News-specific paths
  getNewsCollection() {
    return this.getYearCollection('news');
  }

  getNewsDocPath(newsId) {
    return this.getYearDocPath('news', newsId);
  }

  // Notification-specific paths
  getNotificationsCollection() {
    return this.getYearCollection('notifications');
  }

  getNotificationDocPath(notificationId) {
    return this.getYearDocPath('notifications', notificationId);
  }

  // Settings-specific paths (year-specific settings)
  getSettingsCollection() {
    return this.getYearCollection('settings');
  }

  getSettingsDocPath(settingId) {
    return this.getYearDocPath('settings', settingId);
  }

  // Users-specific paths (year-specific members)
  getUsersCollection() {
    return this.getYearCollection('users');
  }

  getUserDocPath(userId) {
    return this.getYearDocPath('users', userId);
  }

  // Reports-specific paths
  getReportsCollection() {
    return this.getYearCollection('reports');
  }

  getReportDocPath(reportId) {
    return this.getYearDocPath('reports', reportId);
  }

  // Warnings-specific paths
  getWarningsCollection() {
    return this.getYearCollection('warnings');
  }

  getWarningDocPath(warningId) {
    return this.getYearDocPath('warnings', warningId);
  }

  // Announcements-specific paths
  getAnnouncementsCollection() {
    return this.getYearCollection('announcements');
  }

  getAnnouncementDocPath(announcementId) {
    return this.getYearDocPath('announcements', announcementId);
  }

  // Actions-specific paths
  getActionsCollection() {
    return this.getYearCollection('actions');
  }

  getActionDocPath(actionId) {
    return this.getYearDocPath('actions', actionId);
  }

  // Blocked Users-specific paths
  getBlockedUsersCollection() {
    return this.getYearCollection('blockedUsers');
  }

  getBlockedUserDocPath(blockedUserId) {
    return this.getYearDocPath('blockedUsers', blockedUserId);
  }

  // Messages-specific paths (for standalone messages)
  getMessagesStandaloneCollection() {
    return this.getYearCollection('messages');
  }

  getMessageDocPath(messageId) {
    return this.getYearDocPath('messages', messageId);
  }

  // Survey Responses-specific paths (for standalone responses)
  getSurveyResponsesStandaloneCollection() {
    return this.getYearCollection('survey_responses');
  }

  getSurveyResponseDocPath(responseId) {
    return this.getYearDocPath('survey_responses', responseId);
  }

  // Utility method to check if user has access to current year
  hasYearAccess(user, targetYear = null) {
    if (!user) return false;
    
    const year = targetYear || this.currentYear;
    
    // Admins have access to all years
    if (user.role === 'admin') {
      return true;
    }
    
    // Other users only have access to their own year group
    return user.yearGroup === year;
  }

  // Validate year access before operations
  validateYearAccess(user, targetYear = null) {
    if (!this.hasYearAccess(user, targetYear)) {
      throw new Error('Zugriff auf diesen Jahrgang nicht berechtigt');
    }
  }

  // Get all available years (for admin)
  getAvailableYears() {
    if (isDemoMode()) {
      return ['27', '28', '29'];
    }
    
    // In production, this would query the database
    return ['27', '28', '29'];
  }

  // Initialize year-specific data structure
  async initializeYearData(year) {
    const collections = [
      'finances',
      'projects', 
      'chats',
      'documents',
      'surveys',
      'archive',
      'committees',
      'events',
      'news',
      'notifications',
      'settings',
      'users',
      'reports',
      'warnings',
      'announcements',
      'actions',
      'blockedUsers',
      'messages',
      'survey_responses'
    ];

    // In demo mode, initialize mock data structure
    if (isDemoMode()) {
      const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      
      if (!mockData.years) {
        mockData.years = {};
      }
      
      if (!mockData.years[year]) {
        mockData.years[year] = {};
        
        collections.forEach(collection => {
          mockData.years[year][collection] = [];
        });
        
        localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
      }
    }
    
    return true;
  }

  // Migrate data from one year to another (for admin)
  async migrateYearData(fromYear, toYear, collections = []) {
    if (isDemoMode()) {
      const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      
      if (!mockData.years) {
        mockData.years = {};
      }
      
      if (!mockData.years[fromYear]) {
        throw new Error(`Quelljahrgang ${fromYear} nicht gefunden`);
      }
      
      if (!mockData.years[toYear]) {
        await this.initializeYearData(toYear);
      }
      
      // Copy specified collections or all if none specified
      const collectionsToMigrate = collections.length > 0 ? collections : Object.keys(mockData.years[fromYear]);
      
      collectionsToMigrate.forEach(collection => {
        if (mockData.years[fromYear][collection]) {
          mockData.years[toYear][collection] = [...mockData.years[fromYear][collection]];
        }
      });
      
      localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
    }
    
    return true;
  }
}

// Create singleton instance
const dataIsolationService = new DataIsolationService();

// Hook to use data isolation service with current year from AuthContext
export const useDataIsolation = () => {
  const authContext = useAuth();
  const currentYear = authContext?.currentYear;
  
  // Update service with current year
  if (currentYear) {
    dataIsolationService.setCurrentYear(currentYear);
  }
  
  return dataIsolationService;
};

export default dataIsolationService;