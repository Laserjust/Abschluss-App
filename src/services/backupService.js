/**
 * Backup Service für kritische Daten
 * Implementiert automatische Backups und Wiederherstellungsmechanismen
 */

class BackupService {
  constructor() {
    this.backupInterval = null;
    this.backupFrequency = 5 * 60 * 1000; // 5 Minuten
    this.maxBackups = 10; // Maximale Anzahl von Backups
  }

  /**
   * Startet automatische Backups
   */
  startAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, this.backupFrequency);

    console.log('Automatische Backups gestartet');
  }

  /**
   * Stoppt automatische Backups
   */
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('Automatische Backups gestoppt');
    }
  }

  /**
   * Erstellt ein vollständiges Backup aller kritischen Daten
   */
  createBackup() {
    try {
      const timestamp = new Date().toISOString();
      const backupData = {
        timestamp,
        version: '1.0',
        data: {
          conversations: this.getConversationsBackup(),
          messages: this.getMessagesBackup(),
          userPreferences: this.getUserPreferencesBackup(),
          pendingActions: this.getPendingActionsBackup()
        }
      };

      // Speichere Backup in localStorage
      const backupKey = `backup_${timestamp.replace(/[:.]/g, '-')}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // Bereinige alte Backups
      this.cleanupOldBackups();

      console.log(`Backup erstellt: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('Fehler beim Erstellen des Backups:', error);
      return null;
    }
  }

  /**
   * Backup der Konversationen aus localStorage
   */
  getConversationsBackup() {
    try {
      const conversations = localStorage.getItem('conversations');
      const pendingConversations = localStorage.getItem('pendingConversations');
      return {
        conversations: conversations ? JSON.parse(conversations) : [],
        pendingConversations: pendingConversations ? JSON.parse(pendingConversations) : []
      };
    } catch (error) {
      console.error('Fehler beim Backup der Konversationen:', error);
      return { conversations: [], pendingConversations: [] };
    }
  }

  /**
   * Backup der Nachrichten aus localStorage
   */
  getMessagesBackup() {
    try {
      const pendingMessages = localStorage.getItem('pendingMessages');
      const localMessages = {};
      
      // Sammle alle lokal gespeicherten Nachrichten
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('messages_')) {
          const conversationId = key.replace('messages_', '');
          const messages = localStorage.getItem(key);
          if (messages) {
            localMessages[conversationId] = JSON.parse(messages);
          }
        }
      }

      return {
        pendingMessages: pendingMessages ? JSON.parse(pendingMessages) : [],
        localMessages
      };
    } catch (error) {
      console.error('Fehler beim Backup der Nachrichten:', error);
      return { pendingMessages: [], localMessages: {} };
    }
  }

  /**
   * Backup der Benutzereinstellungen
   */
  getUserPreferencesBackup() {
    try {
      const userPreferences = localStorage.getItem('userPreferences');
      const chatSettings = localStorage.getItem('chatSettings');
      const notificationSettings = localStorage.getItem('notificationSettings');
      
      return {
        userPreferences: userPreferences ? JSON.parse(userPreferences) : {},
        chatSettings: chatSettings ? JSON.parse(chatSettings) : {},
        notificationSettings: notificationSettings ? JSON.parse(notificationSettings) : {}
      };
    } catch (error) {
      console.error('Fehler beim Backup der Benutzereinstellungen:', error);
      return { userPreferences: {}, chatSettings: {}, notificationSettings: {} };
    }
  }

  /**
   * Backup der ausstehenden Aktionen
   */
  getPendingActionsBackup() {
    try {
      const syncQueue = localStorage.getItem('syncQueue');
      const pendingUsers = localStorage.getItem('pendingUsers');
      
      return {
        syncQueue: syncQueue ? JSON.parse(syncQueue) : [],
        pendingUsers: pendingUsers ? JSON.parse(pendingUsers) : []
      };
    } catch (error) {
      console.error('Fehler beim Backup der ausstehenden Aktionen:', error);
      return { syncQueue: [], pendingUsers: [] };
    }
  }

  /**
   * Bereinigt alte Backups und behält nur die neuesten
   */
  cleanupOldBackups() {
    try {
      const backupKeys = [];
      
      // Sammle alle Backup-Keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
          backupKeys.push(key);
        }
      }

      // Sortiere nach Datum (neueste zuerst)
      backupKeys.sort((a, b) => {
        const timestampA = a.replace('backup_', '').replace(/-/g, ':').replace(/T/, 'T').slice(0, -1);
        const timestampB = b.replace('backup_', '').replace(/-/g, ':').replace(/T/, 'T').slice(0, -1);
        return new Date(timestampB) - new Date(timestampA);
      });

      // Lösche überschüssige Backups
      if (backupKeys.length > this.maxBackups) {
        const keysToDelete = backupKeys.slice(this.maxBackups);
        keysToDelete.forEach(key => {
          localStorage.removeItem(key);
          console.log(`Altes Backup gelöscht: ${key}`);
        });
      }
    } catch (error) {
      console.error('Fehler beim Bereinigen alter Backups:', error);
    }
  }

  /**
   * Listet alle verfügbaren Backups auf
   */
  listBackups() {
    const backups = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            const parsed = JSON.parse(backupData);
            backups.push({
              key,
              timestamp: parsed.timestamp,
              version: parsed.version,
              size: backupData.length
            });
          }
        }
      }

      // Sortiere nach Datum (neueste zuerst)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Fehler beim Auflisten der Backups:', error);
    }

    return backups;
  }

  /**
   * Stellt Daten aus einem Backup wieder her
   */
  restoreFromBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error(`Backup nicht gefunden: ${backupKey}`);
      }

      const parsed = JSON.parse(backupData);
      const { data } = parsed;

      // Stelle Konversationen wieder her
      if (data.conversations) {
        if (data.conversations.conversations) {
          localStorage.setItem('conversations', JSON.stringify(data.conversations.conversations));
        }
        if (data.conversations.pendingConversations) {
          localStorage.setItem('pendingConversations', JSON.stringify(data.conversations.pendingConversations));
        }
      }

      // Stelle Nachrichten wieder her
      if (data.messages) {
        if (data.messages.pendingMessages) {
          localStorage.setItem('pendingMessages', JSON.stringify(data.messages.pendingMessages));
        }
        if (data.messages.localMessages) {
          Object.entries(data.messages.localMessages).forEach(([conversationId, messages]) => {
            localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
          });
        }
      }

      // Stelle Benutzereinstellungen wieder her
      if (data.userPreferences) {
        Object.entries(data.userPreferences).forEach(([key, value]) => {
          if (value && Object.keys(value).length > 0) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
      }

      // Stelle ausstehende Aktionen wieder her
      if (data.pendingActions) {
        if (data.pendingActions.syncQueue) {
          localStorage.setItem('syncQueue', JSON.stringify(data.pendingActions.syncQueue));
        }
        if (data.pendingActions.pendingUsers) {
          localStorage.setItem('pendingUsers', JSON.stringify(data.pendingActions.pendingUsers));
        }
      }

      console.log(`Daten erfolgreich aus Backup wiederhergestellt: ${backupKey}`);
      return true;
    } catch (error) {
      console.error('Fehler beim Wiederherstellen des Backups:', error);
      return false;
    }
  }

  /**
   * Exportiert ein Backup als JSON-Datei
   */
  exportBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error(`Backup nicht gefunden: ${backupKey}`);
      }

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${backupKey}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log(`Backup exportiert: ${backupKey}`);
      return true;
    } catch (error) {
      console.error('Fehler beim Exportieren des Backups:', error);
      return false;
    }
  }

  /**
   * Importiert ein Backup aus einer JSON-Datei
   */
  importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const backupData = JSON.parse(event.target.result);
          
          // Validiere Backup-Format
          if (!backupData.timestamp || !backupData.data) {
            throw new Error('Ungültiges Backup-Format');
          }

          // Erstelle neuen Backup-Key
          const backupKey = `backup_imported_${new Date().toISOString().replace(/[:.]/g, '-')}`;
          localStorage.setItem(backupKey, JSON.stringify(backupData));
          
          console.log(`Backup importiert: ${backupKey}`);
          resolve(backupKey);
        } catch (error) {
          console.error('Fehler beim Importieren des Backups:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Überprüft die Integrität eines Backups
   */
  validateBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        return { valid: false, error: 'Backup nicht gefunden' };
      }

      const parsed = JSON.parse(backupData);
      
      // Überprüfe erforderliche Felder
      if (!parsed.timestamp) {
        return { valid: false, error: 'Timestamp fehlt' };
      }
      
      if (!parsed.data) {
        return { valid: false, error: 'Daten fehlen' };
      }

      // Überprüfe Datenstruktur
      const requiredSections = ['conversations', 'messages', 'userPreferences', 'pendingActions'];
      for (const section of requiredSections) {
        if (!parsed.data[section]) {
          return { valid: false, error: `Sektion '${section}' fehlt` };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Berechnet die Größe aller Backups
   */
  getBackupStats() {
    let totalSize = 0;
    let backupCount = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
          const data = localStorage.getItem(key);
          if (data) {
            totalSize += data.length;
            backupCount++;
          }
        }
      }
    } catch (error) {
      console.error('Fehler beim Berechnen der Backup-Statistiken:', error);
    }

    return {
      count: backupCount,
      totalSize,
      averageSize: backupCount > 0 ? Math.round(totalSize / backupCount) : 0,
      formattedSize: this.formatBytes(totalSize)
    };
  }

  /**
   * Formatiert Bytes in lesbare Größe
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Singleton-Instanz
const backupService = new BackupService();

export default backupService;