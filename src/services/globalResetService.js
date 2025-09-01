/**
 * Global Reset Service
 * 
 * Dieser Service stellt Funktionen zum Zurücksetzen aller Anwendungsdaten bereit.
 * Unterstützt sowohl vollständiges Zurücksetzen als auch selektives Zurücksetzen einzelner Funktionen.
 */

import yearManagementService from './yearManagementService';

class GlobalResetService {
  constructor() {
    this.currentYear = yearManagementService.getCurrentYear();
  }

  /**
   * Setzt alle Funktionen zurück
   */
  resetAllFunctions() {
    console.log('🔄 Starting global reset of all functions...');
    
    try {
      // Dashboard zurücksetzen
      this.resetDashboard();
      
      // Chat zurücksetzen
      this.resetChat();
      
      // Mitgliederliste zurücksetzen
      this.resetMembers();
      
      // Abi/Vorabi zurücksetzen
      this.resetAbiVorabi();
      
      // Komitees & Projekte zurücksetzen
      this.resetCommitteesProjects();
      
      // Kalender zurücksetzen
      this.resetCalendar();
      
      // Dateien & Belege zurücksetzen
      this.resetFiles();
      
      // Finanzen zurücksetzen
      this.resetFinance();
      
      // Aktionen zurücksetzen
      this.resetActions();
      
      // Archiv zurücksetzen
      this.resetArchive();
      
      // Benachrichtigungen zurücksetzen
      this.resetNotifications();
      
      // Jahr-spezifische Daten zurücksetzen
      this.resetYearSpecificData();
      
      console.log('✅ Global reset completed successfully');
      return { success: true, message: 'Alle Funktionen wurden erfolgreich zurückgesetzt.' };
    } catch (error) {
      console.error('❌ Error during global reset:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Dashboard zurücksetzen
   */
  resetDashboard() {
    console.log('🔄 Resetting Dashboard...');
    
    // Dashboard-spezifische localStorage-Schlüssel
    const dashboardKeys = [
      'dashboardSettings',
      'dashboardLayout',
      'dashboardWidgets',
      'recentActivities',
      'dashboardNotifications'
    ];
    
    dashboardKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Dashboard reset completed');
  }

  /**
   * Chat zurücksetzen
   */
  resetChat() {
    console.log('🔄 Resetting Chat...');
    
    // Chat-spezifische localStorage-Schlüssel
    const chatKeys = [
      'chat_conversations',
      'chat_messages',
      'chat_participants',
      'conversations',
      'pendingConversations',
      'pendingMessages',
      'chatSettings',
      'chatPreferences'
    ];
    
    chatKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Entferne alle Nachrichten-spezifischen Schlüssel
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('messages_')) {
        localStorage.removeItem(key);
      }
    }
    
    console.log('✅ Chat reset completed');
  }

  /**
   * Mitgliederliste zurücksetzen
   */
  resetMembers() {
    console.log('🔄 Resetting Members...');
    
    const memberKeys = [
      'members',
      'memberProfiles',
      'memberSettings',
      'memberContacts',
      'memberGroups'
    ];
    
    memberKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Members reset completed');
  }

  /**
   * Abi/Vorabi zurücksetzen
   */
  resetAbiVorabi() {
    console.log('🔄 Resetting Abi/Vorabi...');
    
    const abiVorabiKeys = [
      `userCourseSelection_${this.currentYear}`,
      `courses_${this.currentYear}`,
      `oldCourseData_${this.currentYear}`,
      'adminCourses',
      'vorabiSettings',
      'courseSchedules',
      'examDates'
    ];
    
    abiVorabiKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Abi/Vorabi reset completed');
  }

  /**
   * Komitees & Projekte zurücksetzen
   */
  resetCommitteesProjects() {
    console.log('🔄 Resetting Committees & Projects...');
    
    const committeesProjectsKeys = [
      'committees',
      'projects',
      'projectTasks',
      'committeeMeetings',
      'projectProgress',
      'adminSurveys',
      'surveyResponses'
    ];
    
    committeesProjectsKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Committees & Projects reset completed');
  }

  /**
   * Kalender zurücksetzen
   */
  resetCalendar() {
    console.log('🔄 Resetting Calendar...');
    
    const calendarKeys = [
      'calendarEvents',
      'calendarSettings',
      'eventReminders',
      'calendarView',
      'personalEvents'
    ];
    
    calendarKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Calendar reset completed');
  }

  /**
   * Dateien & Belege zurücksetzen
   */
  resetFiles() {
    console.log('🔄 Resetting Files...');
    
    const filesKeys = [
      'uploadedFiles',
      'fileCategories',
      'filePermissions',
      'fileSettings',
      'documentTemplates'
    ];
    
    filesKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Files reset completed');
  }

  /**
   * Finanzen zurücksetzen
   */
  resetFinance() {
    console.log('🔄 Resetting Finance...');
    
    const financeKeys = [
      'financeData',
      'transactions',
      'budgets',
      'financeReports',
      'financeSettings',
      'paymentMethods'
    ];
    
    financeKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Finance reset completed');
  }

  /**
   * Aktionen zurücksetzen
   */
  resetActions() {
    console.log('🔄 Resetting Actions...');
    
    const actionsKeys = [
      'actions',
      'actionPlans',
      'actionProgress',
      'actionSettings',
      'actionTemplates'
    ];
    
    actionsKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Actions reset completed');
  }

  /**
   * Archiv zurücksetzen
   */
  resetArchive() {
    console.log('🔄 Resetting Archive...');
    
    const archiveKeys = [
      'archivedData',
      'archiveCategories',
      'archiveSettings',
      'archivedFiles',
      'archiveIndex'
    ];
    
    archiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Archive reset completed');
  }

  /**
   * Benachrichtigungen zurücksetzen
   */
  resetNotifications() {
    console.log('🔄 Resetting Notifications...');
    
    const notificationKeys = [
      'notifications',
      'notificationSettings',
      'notificationPreferences',
      'readNotifications'
    ];
    
    notificationKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Notifications reset completed');
  }

  /**
   * Jahr-spezifische Daten zurücksetzen
   */
  resetYearSpecificData() {
    console.log('🔄 Resetting Year-specific data...');
    
    // Verwende yearManagementService für Jahr-spezifisches Reset
    const result = yearManagementService.resetYearData(this.currentYear);
    
    if (!result.success) {
      throw new Error(`Fehler beim Zurücksetzen der Jahr-spezifischen Daten: ${result.error}`);
    }
    
    console.log('✅ Year-specific data reset completed');
  }

  /**
   * Selektives Zurücksetzen einzelner Funktionen
   */
  resetFunction(functionName) {
    console.log(`🔄 Resetting function: ${functionName}`);
    
    const resetMethods = {
      dashboard: () => this.resetDashboard(),
      chat: () => this.resetChat(),
      members: () => this.resetMembers(),
      abiVorabi: () => this.resetAbiVorabi(),
      committeesProjects: () => this.resetCommitteesProjects(),
      calendar: () => this.resetCalendar(),
      files: () => this.resetFiles(),
      finance: () => this.resetFinance(),
      actions: () => this.resetActions(),
      archive: () => this.resetArchive(),
      notifications: () => this.resetNotifications()
    };
    
    if (resetMethods[functionName]) {
      try {
        resetMethods[functionName]();
        return { success: true, message: `${functionName} wurde erfolgreich zurückgesetzt.` };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: `Unbekannte Funktion: ${functionName}` };
    }
  }

  /**
   * Überprüft, ob Daten vorhanden sind
   */
  hasData() {
    const keysToCheck = [
      'chat_conversations',
      'members',
      `userCourseSelection_${this.currentYear}`,
      'committees',
      'calendarEvents',
      'financeData',
      'actions',
      'archivedData'
    ];
    
    return keysToCheck.some(key => {
      const data = localStorage.getItem(key);
      return data && data !== '[]' && data !== '{}';
    });
  }

  /**
   * Erstellt ein Backup vor dem Reset
   */
  createBackupBeforeReset() {
    console.log('💾 Creating backup before reset...');
    
    const backup = {};
    
    // Sammle alle relevanten localStorage-Daten
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        backup[key] = localStorage.getItem(key);
      }
    }
    
    const backupKey = `backup_before_reset_${Date.now()}`;
    const backupData = {
      timestamp: new Date().toISOString(),
      year: this.currentYear,
      data: backup
    };
    
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    console.log(`💾 Backup created with key: ${backupKey}`);
    
    return backupKey;
  }
}

// Create singleton instance
const globalResetService = new GlobalResetService();

export default globalResetService;
export { GlobalResetService };