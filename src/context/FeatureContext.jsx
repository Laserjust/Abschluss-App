import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FeatureContext = createContext();

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};

export const FeatureProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [featureVisibility, setFeatureVisibility] = useState({
    dashboard: true,
    members: true,
    chat: true,
    calendar: true,
    files: true,
    abiVorabi: true,
    committeesProjects: true,
    finance: true,
    archive: true,
    actions: true,
    profile: true
  });

  // Funktion um zu prüfen, ob eine Funktion für den aktuellen Benutzer sichtbar ist
  const isFeatureVisible = (featureName) => {
    // Für Administratoren und Lehrer sind alle Funktionen sichtbar
    if (currentUser?.role === 'admin' || currentUser?.role === 'teacher') {
      return true;
    }
    
    // Für Schüler wird die Sichtbarkeitseinstellung geprüft
    if (currentUser?.role === 'student') {
      return featureVisibility[featureName] !== false;
    }
    
    // Standardmäßig sichtbar
    return true;
  };

  // Funktion um zu prüfen, ob eine Funktion für Schüler versteckt ist (für Markierungen)
  const isFeatureHiddenForStudents = (featureName) => {
    return featureVisibility[featureName] === false;
  };

  // Funktion um die Sichtbarkeit einer Funktion zu ändern (für alle Benutzer)
  const toggleFeatureVisibility = (featureName) => {
    console.log('toggleFeatureVisibility called for', featureName, 'user role:', currentUser?.role);
    // Entferne die Rollenprüfung vorübergehend für Debugging
    setFeatureVisibility(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
  };

  // Funktion um alle Sichtbarkeitseinstellungen zu setzen (für alle Benutzer)
  const setAllFeatureVisibility = (newVisibility) => {
    console.log('setAllFeatureVisibility called with', newVisibility, 'user role:', currentUser?.role);
    // Entferne die Rollenprüfung vorübergehend für Debugging
    setFeatureVisibility(newVisibility);
  };

  // Lade gespeicherte Einstellungen beim Start
  useEffect(() => {
    const savedSettings = localStorage.getItem('featureVisibility');
    if (savedSettings) {
      try {
        setFeatureVisibility(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Fehler beim Laden der Funktionseinstellungen:', error);
      }
    }
  }, []);

  // Speichere Einstellungen bei Änderungen
  useEffect(() => {
    localStorage.setItem('featureVisibility', JSON.stringify(featureVisibility));
  }, [featureVisibility]);

  const value = {
    featureVisibility,
    isFeatureVisible,
    isFeatureHiddenForStudents,
    toggleFeatureVisibility,
    setAllFeatureVisibility
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};

export default FeatureContext;