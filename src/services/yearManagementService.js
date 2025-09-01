/**
 * Year Management Service
 * Handles multi-tenant architecture for different graduation years
 */

class YearManagementService {
  constructor() {
    this.currentYear = this.getCurrentYear();
    this.availableYears = this.getAvailableYears();
  }

  /**
   * Get current graduation year from localStorage or default
   */
  getCurrentYear() {
    const stored = localStorage.getItem('currentGraduationYear');
    return stored ? parseInt(stored) : 27; // Default to 27
  }

  /**
   * Set current graduation year
   */
  setCurrentYear(year) {
    this.currentYear = year;
    localStorage.setItem('currentGraduationYear', year.toString());
    // Trigger year change event
    window.dispatchEvent(new CustomEvent('yearChanged', { detail: { year } }));
  }

  /**
   * Get all available graduation years
   */
  getAvailableYears() {
    const stored = localStorage.getItem('availableGraduationYears');
    return stored ? JSON.parse(stored) : [27]; // Default to year 27
  }

  /**
   * Add a new graduation year
   */
  addYear(year) {
    const years = this.getAvailableYears();
    if (!years.includes(year)) {
      years.push(year);
      years.sort((a, b) => a - b);
      localStorage.setItem('availableGraduationYears', JSON.stringify(years));
      this.availableYears = years;
    }
    return years;
  }

  /**
   * Create a new graduation year with all necessary setup
   */
  async createNewYear(year) {
    try {
      // Validate year
      if (!year || year < 20 || year > 99) {
        throw new Error('Ungültiges Jahr. Bitte geben Sie eine Zahl zwischen 20 und 99 ein.');
      }

      // Check if year already exists
      if (this.availableYears.includes(year)) {
        throw new Error(`Jahrgang ${year} existiert bereits.`);
      }

      // Add year to available years
      this.addYear(year);

      // Create admin account for this year
      const adminAccount = this.createAdminAccount(year);

      // Initialize data structure for this year
      this.initializeYearData(year);

      // Log the creation
      this.logYearCreation(year, adminAccount);

      // Set the new year as current year
      this.setCurrentYear(year);

      return {
        success: true,
        year,
        adminAccount,
        message: `Jahrgang ${year} wurde erfolgreich erstellt.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create admin account for a specific year
   */
  createAdminAccount(year) {
    const email = `admin@rse-abschluss${year}.de`;
    const password = this.generatePassword();
    
    // Store admin credentials
    const adminAccounts = this.getAdminAccounts();
    adminAccounts[year] = {
      email,
      password,
      createdAt: new Date().toISOString(),
      role: 'admin',
      year
    };
    
    localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));
    
    return { email, password };
  }

  /**
   * Get all admin accounts
   */
  getAdminAccounts() {
    const stored = localStorage.getItem('adminAccounts');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Generate secure password
   */
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Initialize data structure for a new year
   */
  initializeYearData(year) {
    const yearData = {
      year,
      createdAt: new Date().toISOString(),
      users: [],
      chats: [],
      finances: [],
      projects: [],
      actions: [],
      files: [],
      archive: [],
      settings: {
        features: {
          chat: true,
          finance: true,
          projects: true,
          actions: true,
          files: true,
          archive: true
        }
      }
    };

    // Store year data
    localStorage.setItem(`yearData_${year}`, JSON.stringify(yearData));
  }

  /**
   * Get data for a specific year
   */
  getYearData(year = null) {
    const targetYear = year || this.currentYear;
    const stored = localStorage.getItem(`yearData_${targetYear}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Update data for a specific year
   */
  updateYearData(year, data) {
    localStorage.setItem(`yearData_${year}`, JSON.stringify(data));
  }

  /**
   * Get data key with year prefix for data isolation
   */
  getDataKey(dataType, year = null) {
    const targetYear = year || this.currentYear;
    return `${dataType}_year_${targetYear}`;
  }

  /**
   * Store data with year isolation
   */
  setYearSpecificData(dataType, data, year = null) {
    const key = this.getDataKey(dataType, year);
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Get data with year isolation
   */
  getYearSpecificData(dataType, year = null) {
    const key = this.getDataKey(dataType, year);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Delete a graduation year and all its data
   */
  deleteYear(year) {
    try {
      // Remove from available years
      const years = this.availableYears.filter(y => y !== year);
      localStorage.setItem('availableGraduationYears', JSON.stringify(years));
      this.availableYears = years;

      // Remove admin account
      const adminAccounts = this.getAdminAccounts();
      delete adminAccounts[year];
      localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));

      // Remove year data
      localStorage.removeItem(`yearData_${year}`);

      // Remove all year-specific data
      const dataTypes = ['chats', 'finances', 'projects', 'actions', 'files', 'archive', 'users'];
      dataTypes.forEach(type => {
        localStorage.removeItem(this.getDataKey(type, year));
      });

      return { success: true, message: `Jahrgang ${year} wurde erfolgreich gelöscht.` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset admin password for a specific year
   */
  resetAdminPassword(year) {
    const adminAccounts = this.getAdminAccounts();
    if (adminAccounts[year]) {
      const newPassword = this.generatePassword();
      adminAccounts[year].password = newPassword;
      adminAccounts[year].passwordResetAt = new Date().toISOString();
      localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));
      return { success: true, password: newPassword };
    }
    return { success: false, error: 'Admin-Account nicht gefunden.' };
  }

  /**
   * Reset all data for a specific year (keep year and admin account, but clear all content)
   */
  resetYearData(year) {
    try {
      // Check if year exists
      if (!this.availableYears.includes(year)) {
        throw new Error(`Jahrgang ${year} existiert nicht.`);
      }

      // Reset mockFirestore data for this year
      console.log('Resetting mockFirestore data for year:', year);
      const mockData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
      console.log('Current mockFirestore data:', mockData);
      
      if (mockData.years && mockData.years[year]) {
        console.log('Found year data in mockFirestore, resetting...');
        console.log('Data before reset:', mockData.years[year]);
        
        // Create completely empty structure for this year
        mockData.years[year] = {
          committees: [],
          projects: [],
          users: [],
          conversations: [],
          reports: [],
          'vorabi-subjects': [],
          transactions: [],
          // Empty chat collections
          'vorabi-chat/1/messages': [],
          'vorabi-chat/2/messages': [],
          'vorabi-chat/3/messages': []
        };
        
        console.log('Data after reset:', mockData.years[year]);
        localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
        console.log('Updated mockFirestore data saved to localStorage');
      } else {
        console.log('No year data found in mockFirestore for year:', year);
      }

      // Reset year-specific data
      const dataTypes = ['chats', 'finances', 'projects', 'actions', 'files', 'archive', 'users'];
      console.log('Resetting data types for year:', year);
      dataTypes.forEach(type => {
        const key = this.getDataKey(type, year);
        console.log(`Removing localStorage key: ${key}`);
        const existsBefore = localStorage.getItem(key) !== null;
        localStorage.removeItem(key);
        const existsAfter = localStorage.getItem(key) !== null;
        console.log(`Key ${key}: existed before: ${existsBefore}, exists after: ${existsAfter}`);
      });

      // Reset additional year-specific localStorage keys
      const additionalKeys = [
        `userCourseSelection_${year}`,
        `adminCourses_${year}`,
        `adminTeachers_${year}`,
        `yearData_${year}`, // Will be recreated below
        `calendar_events_${year}`, // Correct calendar key
        `notificationSettings_${year}`,
        `formData_${year}`,
        `events_${year}`,
        `calendar_${year}`,
        `surveys_${year}`,
        `adminSurveys_${year}`,
        `featureVisibility_${year}`,
        `profileImages_${year}`,
        `chatSettings_${year}`,
        `userPreferences_${year}`,
        `pendingMessages_${year}`,
        `pendingGroupChats_${year}`,
        `pendingPrivateChats_${year}`,
        `conversations_${year}`,
        `messages_${year}`,
        // Global keys that should also be reset
        'testUser',
        'createdUsers', 
        'testUsers',
        'pendingUsers'
      ];
      
      // Also reset any keys that might contain the year in different formats
      const allLocalStorageKeys = Object.keys(localStorage);
      const yearSpecificKeys = allLocalStorageKeys.filter(key => 
        key.includes(`_${year}`) || 
        key.includes(`${year}_`) ||
        (key.includes('year') && key.includes(year.toString())) ||
        key.startsWith('notificationSettings_') || // All notification settings
        key.startsWith('formData_') || // All form data
        key.startsWith('profileImages_') // All profile images
      );
      
      // Combine both arrays and remove duplicates
      const allKeysToReset = [...new Set([...additionalKeys, ...yearSpecificKeys])];
      console.log('All keys to reset:', allKeysToReset);
      
      console.log('Resetting all year-specific keys:', allKeysToReset);
      allKeysToReset.forEach(key => {
        // Skip yearData key as it will be recreated below
        if (key === `yearData_${year}`) {
          console.log(`Skipping ${key} - will be recreated`);
          return;
        }
        
        console.log(`Removing localStorage key: ${key}`);
        const existsBefore = localStorage.getItem(key) !== null;
        localStorage.removeItem(key);
        const existsAfter = localStorage.getItem(key) !== null;
        console.log(`Key ${key}: existed before: ${existsBefore}, exists after: ${existsAfter}`);
      });

      // Reset year data but keep basic structure
      const yearData = {
        year,
        createdAt: new Date().toISOString(),
        resetAt: new Date().toISOString(),
        users: [],
        settings: {}
      };
      localStorage.setItem(`yearData_${year}`, JSON.stringify(yearData));

      // Log the reset action
      this.logYearReset(year);

      return {
        success: true,
        message: `Alle Daten von Jahrgang ${year} wurden erfolgreich zurückgesetzt.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log year creation for audit trail
   */
  logYearCreation(year, adminAccount) {
    const logs = JSON.parse(localStorage.getItem('yearCreationLogs') || '[]');
    logs.push({
      year,
      adminEmail: adminAccount.email,
      createdAt: new Date().toISOString(),
      action: 'YEAR_CREATED'
    });
    localStorage.setItem('yearCreationLogs', JSON.stringify(logs));
  }

  /**
   * Log year data reset for audit trail
   */
  logYearReset(year) {
    const logs = JSON.parse(localStorage.getItem('yearCreationLogs') || '[]');
    const adminAccounts = this.getAdminAccounts();
    logs.push({
      year,
      adminEmail: adminAccounts[year]?.email || 'unknown',
      createdAt: new Date().toISOString(),
      action: 'YEAR_DATA_RESET'
    });
    localStorage.setItem('yearCreationLogs', JSON.stringify(logs));
  }

  /**
   * Get year creation logs
   */
  getYearLogs() {
    return JSON.parse(localStorage.getItem('yearCreationLogs') || '[]');
  }

  /**
   * Check if user has access to a specific year
   */
  hasYearAccess(userEmail, year) {
    const adminAccounts = this.getAdminAccounts();
    return adminAccounts[year] && adminAccounts[year].email === userEmail;
  }

  /**
   * Get year info for display
   */
  getYearInfo(year) {
    const yearData = this.getYearData(year);
    const adminAccount = this.getAdminAccounts()[year];
    
    if (!yearData || !adminAccount) {
      return null;
    }

    return {
      year,
      displayName: `Abi ${year}`,
      fullName: `RSE Abschluss ${year}`,
      adminEmail: adminAccount.email,
      createdAt: yearData.createdAt,
      userCount: yearData.users?.length || 0,
      isActive: year === this.currentYear
    };
  }
}

// Create singleton instance
const yearManagementService = new YearManagementService();

export default yearManagementService;
export { YearManagementService };