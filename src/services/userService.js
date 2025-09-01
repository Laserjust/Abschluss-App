import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMockData, isDemoMode } from '../services/mockFirestore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import dataIsolationService from './dataIsolationService';

// Service-Funktion zum Laden und Konvertieren von Benutzerdaten
export const useUserService = () => {
  const { currentUser, currentYear } = useAuth();
  const [membersData, setMembersData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Initialize data isolation service with current year
  useEffect(() => {
    if (currentYear) {
      dataIsolationService.setCurrentYear(currentYear);
    }
  }, [currentYear]);

  // Lade Benutzerdaten aus Firestore oder MockFirestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        let users = [];
        
        if (isDemoMode()) {
          // Lade jahrgangsspezifische Daten aus MockFirestore
          const mockData = getMockData();
          const yearData = mockData.years?.[currentYear] || {};
          users = yearData.users || [];
        } else {
          // Lade jahrgangsspezifische Daten aus echtem Firestore
          const usersCollection = collection(db, dataIsolationService.getUsersCollection());
          const usersSnapshot = await getDocs(usersCollection);
          users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        const convertedMembers = users.map(convertUserToMember);
        setMembersData(convertedMembers);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
      }
    };
    
    loadUsers();
  }, [currentUser]); // Aktualisiere wenn sich der aktuelle Benutzer ändert

  // Konvertiert Benutzerdaten aus AuthContext in Members-Format
  const convertUserToMember = (user) => {
    // Bestimme Online-Status basierend auf verschiedenen Feldern
    let status = 'offline';
    if (user.status) {
      status = user.status;
    } else if (user.isOnline) {
      status = 'online';
    } else if (user.lastSeen) {
      const lastSeenDate = user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen);
      const minutesAgo = (Date.now() - lastSeenDate.getTime()) / (1000 * 60);
      if (minutesAgo < 5) {
        status = 'online';
      } else if (minutesAgo < 30) {
        status = 'away';
      } else {
        status = 'offline';
      }
    }

    return {
      id: user.id || user.uid,
      firstName: user.firstName || user.displayName?.split(' ')[0] || 'Unbekannt',
      lastName: user.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      role: user.role || 'student',
      avatar: user.photoURL || user.avatar || null,
      phone: user.phone || null,
      courses: user.courses || [],
      committees: user.committees || [],
      joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastActive: user.lastSeen ? (user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen)) : (user.lastLoginAt ? new Date(user.lastLoginAt) : new Date()),
      status: status,
      isOnline: status === 'online'
    };
  };

  // Lädt alle Benutzer und konvertiert sie in Members-Format
  const getAllMembers = () => {
    return membersData;
  };

  // Filtert Mitglieder nach Rolle
  const getMembersByRole = (role) => {
    return membersData.filter(member => member.role === role);
  };

  // Sucht Mitglieder nach Name oder E-Mail
  const searchMembers = (searchTerm) => {
    if (!searchTerm) return membersData;
    
    const term = searchTerm.toLowerCase();
    return membersData.filter(member => 
      member.firstName.toLowerCase().includes(term) ||
      member.lastName.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term)
    );
  };

  // Findet ein Mitglied nach ID
  const getMemberById = (id) => {
    return membersData.find(member => member.id === id);
  };

  // Gibt Zeitstempel der letzten Aktualisierung zurück
  const getLastUpdate = () => {
    return lastUpdate;
  };

  return {
    getAllMembers,
    getMembersByRole,
    searchMembers,
    getMemberById,
    getLastUpdate,
    isDemoMode
  };
};

export default useUserService;
