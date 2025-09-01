import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc as firebaseDoc, getDoc as firebaseGetDoc, setDoc as firebaseSetDoc } from 'firebase/firestore';
import { isDemoMode, doc as mockDoc, getMockData, setDoc as mockSetDoc } from '../services/mockFirestore';
import { app, auth, db } from '../services/firebase';
import { financeService } from '../services/financeService';
import dataIsolationService from '../services/dataIsolationService';
import yearManagementService from '../services/yearManagementService';

// Use mock or real Firestore functions based on demo mode
const doc = isDemoMode() ? mockDoc : firebaseDoc;
const getDoc = isDemoMode() ? 
  async (docRef) => {
    // Mock getDoc for demo mode
    const mockData = getMockData();
    const [collectionName, docId] = docRef.path ? docRef.path.split('/') : ['users', docRef.id || 'unknown'];
    const collection = mockData[collectionName] || [];
    const docData = collection.find(item => item.id === docId);
    return {
      exists: () => !!docData,
      data: () => docData || {},
      id: docId
    };
  } : firebaseGetDoc;
const setDoc = isDemoMode() ? mockSetDoc : firebaseSetDoc;

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [loading, setLoading] = useState(true);
  // auth and db are imported from firebase.js

  // Helper function to update services when year changes
  const updateServicesWithYear = (year, skipYearManagement = false) => {
    if (year) {
      financeService.setCurrentYear(year);
      dataIsolationService.setCurrentYear(year);
      if (!skipYearManagement) {
        yearManagementService.setCurrentYear(year);
      }
    }
  };

  // Login function
  async function login(email, password) {
    try {
      // Clear any existing test user from localStorage first
      localStorage.removeItem('testUser');
      
      // Check if using test credentials
      const currentYear = yearManagementService.getCurrentYear();
      if ((email === `admin@rse-abschluss${currentYear}.de` && password === 'admin123') ||
          (email === `lehrer@rse-abschluss${currentYear}.de` && password === 'lehrer123') ||
          (email === `schueler@rse-abschluss${currentYear}.de` && password === 'schueler123')) {
        
        // Mock user for test purposes
        let mockUser;
        
        if (email === `admin@rse-abschluss${currentYear}.de`) {
          mockUser = {
            uid: 'admin-test-uid',
            email: email,
            displayName: 'Administrator',
            role: 'admin',
            firstName: 'Max',
            lastName: 'Mustermann',
            committees: ['Abi-Komitee', 'Finanz-Komitee'],
            committeeRoles: { 'Abi-Komitee': 'leader', 'Finanz-Komitee': 'member' },
            yearGroup: currentYear.toString()
          };
        } else if (email === `lehrer@rse-abschluss${currentYear}.de`) {
          mockUser = {
            uid: 'teacher-test-uid',
            email: email,
            displayName: 'Herr Schmidt',
            role: 'committee',
            firstName: 'Thomas',
            lastName: 'Schmidt',
            committees: ['Abi-Komitee'],
            committeeRoles: { 'Abi-Komitee': 'advisor' },
            yearGroup: currentYear.toString()
          };
        } else {
          mockUser = {
            uid: 'student-test-uid',
            email: email,
            displayName: 'Anna Müller',
            role: 'student',
            firstName: 'Anna',
            lastName: 'Müller',
            committees: [],
            committeeRoles: {},
            yearGroup: currentYear.toString()
          };
        }
        
        // Store test user in localStorage for persistence
        localStorage.setItem('testUser', JSON.stringify(mockUser));
        
        // Update current user state and set year group
        setCurrentUser(mockUser);
        setCurrentYear(mockUser.yearGroup);
        updateServicesWithYear(mockUser.yearGroup);
        return mockUser;
      }
      
      // Check if we're in demo mode and try to authenticate against mock users
      if (isDemoMode()) {
        const mockData = getMockData();
        console.log('🔍 Login: MockData structure:', mockData);
        
        // MockFirestore returns current year data directly, not nested under years
        const users = mockData.users || [];
        console.log('🔍 Login: Available users:', users.map(u => ({ email: u.email, id: u.id || u.uid })));
        
        // Also check localStorage backup
        const localStorageUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        console.log('🔍 Login: LocalStorage users:', localStorageUsers.map(u => ({ email: u.email, uid: u.uid })));
        
        // Combine both sources
        const allUsers = [...users, ...localStorageUsers];
        
        // Find user by email
        const user = allUsers.find(u => u.email === email);
        console.log('🔍 Login: Found user for email', email, ':', user);
        
        if (user) {
          // Check multiple password sources in priority order
          let userPassword = null;
          
          // 1. Check if user has stored password in createdUsers localStorage
          const localStorageUser = localStorageUsers.find(u => u.uid === (user.uid || user.id));
          if (localStorageUser && localStorageUser.password) {
            userPassword = localStorageUser.password;
            console.log('🔍 Login: Using password from localStorage createdUsers');
          }
          
          // 2. Check demoPasswords localStorage
          if (!userPassword) {
            const demoPasswords = JSON.parse(localStorage.getItem('demoPasswords') || '{}');
            if (demoPasswords[user.email]) {
              userPassword = demoPasswords[user.email];
              console.log('🔍 Login: Using password from localStorage demoPasswords');
            }
          }
          
          // 3. Check if user has a demoPassword field
          if (!userPassword && user.demoPassword) {
            userPassword = user.demoPassword;
            console.log('🔍 Login: Using demoPassword field from user data');
          }
          
          // 4. Use default password as fallback
          if (!userPassword) {
            userPassword = 'password123';
            console.log('🔍 Login: Using default password as fallback');
          }
          
          console.log('🔍 Login: Checking password for user:', user.email);
          
          if (password === userPassword) {
            // Successful authentication
            const authenticatedUser = {
              uid: user.uid || user.id,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              committees: user.committees || [],
              committeeRoles: user.committeeRoles || {},
              yearGroup: user.yearGroup || currentYear.toString()
            };
            
            console.log('✅ Login: Authentication successful for user:', authenticatedUser.email);
            setCurrentUser(authenticatedUser);
            setCurrentYear(authenticatedUser.yearGroup);
            updateServicesWithYear(authenticatedUser.yearGroup);
            return authenticatedUser;
          } else {
            console.log('❌ Login: Wrong password for user:', user.email);
            throw new Error('Falsches Passwort');
          }
        } else {
          console.log('❌ Login: User not found for email:', email);
          console.log('Available emails:', allUsers.map(u => u.email));
          throw new Error('Benutzer nicht gefunden');
        }
      }
      
      // Regular Firebase authentication for production mode
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = { ...userCredential.user, ...userDoc.data() };
        setCurrentYear(userData.yearGroup);
        updateServicesWithYear(userData.yearGroup);
        return userData;
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      // Remove test user from localStorage if exists
      localStorage.removeItem('testUser');
      
      // Clear current user state and year immediately
      setCurrentUser(null);
      setCurrentYear(null);
      
      // Sign out from Firebase auth
      await signOut(auth);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Create user function (for admin)
  async function createUser(userData) {
    console.log('🚀 createUser function called with:', userData);
    try {
      const { firstName, lastName, role, password, email: providedEmail } = userData;
      
      // Use provided email or generate email based on first and last name
      const currentYear = yearManagementService.getCurrentYear();
      const email = providedEmail || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@rse-abschluss${currentYear}.de`;
      console.log('📧 Generated email:', email);
      
      if (isDemoMode()) {
        // Test mode: create mock user without Firebase auth
        const mockUser = {
          uid: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          displayName: `${firstName} ${lastName}`,
          role
        };
        
        const userDocData = {
          firstName,
          lastName,
          email,
          role,
          displayName: `${firstName} ${lastName}`,
          createdAt: new Date().toISOString(),
          committees: [],
          committeeRoles: {},
          yearGroup: currentYear.toString(), // Use current year
          notificationSettings: {
            pushNotifications: true,
            soundEnabled: true,
            emailNotifications: true
          },
          // Store password in demo mode for admin access
          demoPassword: password
        };
        
        // Store in mock Firestore with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            await setDoc(doc(db, 'users', mockUser.uid), userDocData);
            
            // Also store in localStorage as backup
            const existingUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
            existingUsers.push({ ...mockUser, ...userDocData });
            localStorage.setItem('createdUsers', JSON.stringify(existingUsers));
            
            console.log('Benutzer erfolgreich erstellt und gespeichert:', mockUser.uid);
            break;
          } catch (error) {
            retryCount++;
            console.warn(`Speicherversuch ${retryCount} fehlgeschlagen:`, error);
            if (retryCount >= maxRetries) {
              throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        return mockUser;
      } else {
        // Production mode: use real Firebase auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`
        });
        
        const userDocData = {
          firstName,
          lastName,
          email,
          role,
          displayName: `${firstName} ${lastName}`,
          createdAt: new Date().toISOString(),
          committees: [],
          committeeRoles: {},
          notificationSettings: {
            pushNotifications: true,
            soundEnabled: true,
            emailNotifications: true
          }
        };
        
        // Store additional user data in Firestore with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);
            
            // Also store in localStorage as backup for critical data
            const existingUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
            existingUsers.push({ uid: userCredential.user.uid, ...userDocData });
            localStorage.setItem('createdUsers', JSON.stringify(existingUsers));
            
            console.log('Benutzer erfolgreich erstellt und gespeichert:', userCredential.user.uid);
            break;
          } catch (error) {
            retryCount++;
            console.warn(`Speicherversuch ${retryCount} fehlgeschlagen:`, error);
            if (retryCount >= maxRetries) {
              // Even if Firestore fails, we have the user in Firebase Auth
              console.error('Firestore-Speicherung fehlgeschlagen, aber Benutzer in Auth erstellt');
              throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        return { ...userCredential.user, role };
      }
    } catch (error) {
      throw error;
    }
  }

  // Change password function
  async function changePassword(currentPassword, newPassword) {
    try {
      if (!currentUser) {
        throw new Error('Kein Benutzer angemeldet');
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      if (isDemoMode()) {
        // Demo mode: simulate password change
        // In demo mode, we just validate the current password against stored demo passwords
        const currentYear = yearManagementService.getCurrentYear();
        const demoPasswords = {
          [`admin@rse-abschluss${currentYear}.de`]: 'admin123',
          [`lehrer@rse-abschluss${currentYear}.de`]: 'lehrer123',
          [`schueler@rse-abschluss${currentYear}.de`]: 'schueler123'
        };
        
        if (demoPasswords[currentUser.email] !== currentPassword) {
          throw new Error('Aktuelles Passwort ist falsch');
        }
        
        // Update demo password in localStorage
        demoPasswords[currentUser.email] = newPassword;
        localStorage.setItem('demoPasswords', JSON.stringify(demoPasswords));
        
        return true;
      } else {
        // Production mode: use Firebase Auth
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        return true;
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Aktuelles Passwort ist falsch');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Das neue Passwort ist zu schwach');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Bitte melden Sie sich erneut an, um das Passwort zu ändern');
      }
      throw error;
    }
  }

  // Password validation function
  function validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Passwort ist erforderlich');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Update user profile
  async function updateUserProfile(profileData) {
    try {
      if (!currentUser) {
        throw new Error('Kein Benutzer angemeldet');
      }

      const updatedData = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      // Update in Firestore/MockFirestore
      await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });
      
      // Update current user state
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      
      // Update localStorage for demo users
      if (isDemoMode()) {
        localStorage.setItem('testUser', JSON.stringify(updatedUser));
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update user role
  async function updateUserRole(userId, newRole) {
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      if (currentUser && currentUser.uid === userId) {
        setCurrentUser({ ...currentUser, role: newRole });
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add user to committee
  async function addUserToCommittee(userId, committeeId, committeeRole) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const committees = userData.committees || [];
        const committeeRoles = userData.committeeRoles || {};
        
        // Add committee if not already in the list
        if (!committees.includes(committeeId)) {
          committees.push(committeeId);
        }
        
        // Set committee role
        committeeRoles[committeeId] = committeeRole;
        
        await setDoc(userRef, { 
          committees, 
          committeeRoles 
        }, { merge: true });
        
        // Update current user if it's the same user
        if (currentUser && currentUser.uid === userId) {
          setCurrentUser({
            ...currentUser,
            committees,
            committeeRoles
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Remove user from committee
  async function removeUserFromCommittee(userId, committeeId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const committees = userData.committees || [];
        const committeeRoles = { ...userData.committeeRoles } || {};
        
        // Remove committee from list
        const updatedCommittees = committees.filter(id => id !== committeeId);
        
        // Remove committee role
        delete committeeRoles[committeeId];
        
        await setDoc(userRef, { 
          committees: updatedCommittees, 
          committeeRoles 
        }, { merge: true });
        
        // Update current user if it's the same user
        if (currentUser && currentUser.uid === userId) {
          setCurrentUser({
            ...currentUser,
            committees: updatedCommittees,
            committeeRoles
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Reset user password (for admin)
  async function resetUserPassword(userId, newPassword) {
    try {
      if (isDemoMode()) {
        // In demo mode, update the demoPassword field
        await setDoc(doc(db, 'users', userId), {
          demoPassword: newPassword,
          passwordResetAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`Demo mode: Password reset for user ${userId}`);
        return { success: true, message: 'Passwort erfolgreich zurückgesetzt' };
      } else {
        // In production mode, you would use Firebase Admin SDK
        // For now, we'll simulate this functionality
        console.log('Production mode: Password reset would require Firebase Admin SDK');
        return { success: false, message: 'Passwort-Reset im Produktionsmodus erfordert Firebase Admin SDK' };
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  useEffect(() => {
    // Initialize current year from localStorage
    const storedYear = localStorage.getItem('currentYear');
    if (storedYear) {
      setCurrentYear(storedYear);
      updateServicesWithYear(storedYear);
    }
    
    // Check for test user in localStorage
    const storedTestUser = localStorage.getItem('testUser');
    if (storedTestUser) {
      try {
        const testUser = JSON.parse(storedTestUser);
        setCurrentUser(testUser);
        const yearGroup = testUser.yearGroup || storedYear || yearManagementService.getCurrentYear().toString();
        setCurrentYear(yearGroup);
        updateServicesWithYear(yearGroup);
        setLoading(false);
        return () => {}; // No cleanup needed for localStorage
      } catch (error) {
        console.error('Error parsing stored test user:', error);
        localStorage.removeItem('testUser');
      }
    }

    // Regular Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = { ...user, ...userDoc.data() };
        setCurrentUser(userData);
        const yearGroup = userData.yearGroup || yearManagementService.getCurrentYear().toString();
        setCurrentYear(yearGroup);
        updateServicesWithYear(yearGroup);
      } else {
        setCurrentUser(user);
        const defaultYear = yearManagementService.getCurrentYear().toString();
        setCurrentYear(defaultYear); // Default year
        updateServicesWithYear(defaultYear);
      }
    } else {
      setCurrentUser(null);
      setCurrentYear(null);
    }
      setLoading(false);
    });
    
    // Listen for year change events from yearManagementService
    const handleYearChange = (event) => {
      const { year } = event.detail;
      setCurrentYear(year);
      updateServicesWithYear(year, true); // Skip yearManagementService to prevent infinite loop
    };
    
    window.addEventListener('yearChanged', handleYearChange);
    
    return () => {
      unsubscribe();
      window.removeEventListener('yearChanged', handleYearChange);
    };
  }, [auth, db]);

  // Permission check for Vorabi access
  const hasVorabiAccess = (user = currentUser) => {
    if (!user) return false;
    
    // Admin and teachers have full access
    if (user.role === 'admin' || user.role === 'teacher') {
      return true;
    }
    
    // Students have access only if they are in grade 12 or 13 (Oberstufe)
    if (user.role === 'student') {
      // Check if user has grade information (this would need to be added to user profile)
      // For now, we'll allow all students but this can be refined
      return true;
    }
    
    return false;
  };

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Switch demo role function
  const switchDemoRole = (newRole) => {
    if (!isDemoMode() || !currentUser) return;
    
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    
    // Update in localStorage for demo mode
    const testUsers = JSON.parse(localStorage.getItem('testUsers') || '[]');
    const userIndex = testUsers.findIndex(user => user.email === currentUser.email);
    if (userIndex !== -1) {
      testUsers[userIndex] = { ...testUsers[userIndex], role: newRole };
      localStorage.setItem('testUsers', JSON.stringify(testUsers));
    }
  };

  // Switch year group function (for admins)
  const switchYear = async (yearGroup) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Nur Administratoren können zwischen Jahrgängen wechseln');
    }
    
    try {
      setCurrentYear(yearGroup);
      updateServicesWithYear(yearGroup);
      
      // Update yearManagementService with new year
      yearManagementService.setCurrentYear(yearGroup);
      
      // Store current year in localStorage for persistence
      localStorage.setItem('currentYear', yearGroup);
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Get available years function
  const getAvailableYears = () => {
    // In demo mode, return predefined years
    if (isDemoMode()) {
      return ['27', '28', '29'];
    }
    
    // In production, this would query the database for existing year groups
    // For now, return the same demo years
    return ['27', '28', '29'];
  };

  // Update user's year group
  const updateYearGroup = async (userId, yearGroup) => {
    try {
      await setDoc(doc(db, 'users', userId), { yearGroup }, { merge: true });
      
      if (currentUser && currentUser.uid === userId) {
        setCurrentUser({ ...currentUser, yearGroup });
        setCurrentYear(yearGroup);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Get year-specific document path
  const getYearDoc = (collection, docId) => {
    const year = currentYear || '27';
    return doc(db, `years/${year}/${collection}`, docId);
  };

  // Get year-specific collection path
  const getYearCollection = (collection) => {
    const year = currentYear || '27';
    return `years/${year}/${collection}`;
  };

  // Committee role management functions
  const hasCommitteeRole = (committeeId, role) => {
    if (!currentUser || !currentUser.committeeRoles) return false;
    return currentUser.committeeRoles[committeeId] === role;
  };

  const isCommitteeLeader = (committeeId = null) => {
    if (!currentUser || !currentUser.committeeRoles) return false;
    if (committeeId) {
      return currentUser.committeeRoles[committeeId] === 'leader';
    }
    // Check if user is leader of any committee
    return Object.values(currentUser.committeeRoles).includes('leader');
  };

  const hasCommitteeManagementAccess = () => {
    if (!currentUser) return false;
    // Admins, teachers, and committee leaders have access
    return currentUser.role === 'admin' || 
           currentUser.role === 'teacher' || 
           isCommitteeLeader();
  };

  const getCommitteesByRole = (role) => {
    if (!currentUser || !currentUser.committeeRoles) return [];
    return Object.entries(currentUser.committeeRoles)
      .filter(([_, userRole]) => userRole === role)
      .map(([committeeId, _]) => committeeId);
  };

  const canManageCommitteeRequests = (committeeId) => {
    if (!currentUser) return false;
    // Admins can manage all requests
    if (currentUser.role === 'admin') return true;
    // Teachers can manage requests for committees they advise
    if (currentUser.role === 'teacher' && hasCommitteeRole(committeeId, 'advisor')) return true;
    // Committee leaders can manage their own committee requests
    return hasCommitteeRole(committeeId, 'leader');
  };

  const value = {
    currentUser,
    currentYear,
    login,
    logout,
    createUser,
    changePassword,
    updateUserProfile,
    updateUserRole,
    addUserToCommittee,
    removeUserFromCommittee,
    resetUserPassword,
    hasVorabiAccess,
    isAdmin,
    switchDemoRole,
    switchYear,
    getAvailableYears,
    updateYearGroup,
    getYearDoc,
    getYearCollection,
    loading,
    // Committee role functions
    hasCommitteeRole,
    isCommitteeLeader,
    hasCommitteeManagementAccess,
    getCommitteesByRole,
    canManageCommitteeRequests
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}