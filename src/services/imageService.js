// Image Service für Profilbild-Management
// Unterstützt sowohl Demo-Modus (localStorage) als auch Produktionsmodus (Firebase Storage)

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { useAuth } from '../context/AuthContext';

class ImageService {
  constructor() {
    this.isDemo = localStorage.getItem('demoMode') === 'true';
  }

  // Profilbild hochladen
  async uploadProfileImage(file, userId) {
    try {
      if (this.isDemo) {
        return await this.uploadImageDemo(file, userId);
      } else {
        return await this.uploadImageProduction(file, userId);
      }
    } catch (error) {
      console.error('Fehler beim Hochladen des Profilbildes:', error);
      throw new Error('Profilbild konnte nicht hochgeladen werden');
    }
  }

  // Demo-Modus: Bild als Base64 in localStorage speichern
  async uploadImageDemo(file, userId) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Keine Datei ausgewählt'));
        return;
      }

      // Dateigröße prüfen (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Datei ist zu groß. Maximum: 5MB'));
        return;
      }

      // Dateityp prüfen
      if (!file.type.startsWith('image/')) {
        reject(new Error('Nur Bilddateien sind erlaubt'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64Image = e.target.result;
          const profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
          profileImages[userId] = {
            url: base64Image,
            uploadedAt: new Date().toISOString(),
            fileName: file.name,
            fileSize: file.size
          };
          localStorage.setItem('profileImages', JSON.stringify(profileImages));
          resolve(base64Image);
        } catch (error) {
          reject(new Error('Fehler beim Verarbeiten des Bildes'));
        }
      };
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
      reader.readAsDataURL(file);
    });
  }

  // Produktionsmodus: Bild in Firebase Storage hochladen
  async uploadImageProduction(file, userId) {
    if (!file) {
      throw new Error('Keine Datei ausgewählt');
    }

    // Dateigröße prüfen (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Datei ist zu groß. Maximum: 5MB');
    }

    // Dateityp prüfen
    if (!file.type.startsWith('image/')) {
      throw new Error('Nur Bilddateien sind erlaubt');
    }

    // Altes Profilbild löschen falls vorhanden
    await this.deleteProfileImage(userId);

    // Neues Bild hochladen
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-images/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }

  // Profilbild abrufen
  async getProfileImage(userId) {
    try {
      if (this.isDemo) {
        const profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
        return profileImages[userId]?.url || null;
      } else {
        // In Produktionsmodus wird die URL aus dem Benutzerprofil geladen
        return null; // Wird über AuthContext verwaltet
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Profilbildes:', error);
      return null;
    }
  }

  // Profilbild löschen
  async deleteProfileImage(userId) {
    try {
      if (this.isDemo) {
        const profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
        delete profileImages[userId];
        localStorage.setItem('profileImages', JSON.stringify(profileImages));
      } else {
        // In Firebase Storage nach vorhandenem Bild suchen und löschen
        // Dies ist eine vereinfachte Implementierung
        // In der Praxis würde man die URL aus dem Benutzerprofil nehmen
        try {
          const oldImageRef = ref(storage, `profile-images/profile_${userId}`);
          await deleteObject(oldImageRef);
        } catch (error) {
          // Ignorieren wenn kein Bild vorhanden
        }
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Profilbildes:', error);
    }
  }

  // Bild für Vorschau vorbereiten
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Keine Datei ausgewählt'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Fehler beim Erstellen der Vorschau'));
      reader.readAsDataURL(file);
    });
  }

  // Initialen aus Namen generieren
  generateInitials(name) {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // Validierung für Bilddateien
  validateImageFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('Keine Datei ausgewählt');
      return errors;
    }
    
    if (!file.type.startsWith('image/')) {
      errors.push('Nur Bilddateien sind erlaubt');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      errors.push('Datei ist zu groß. Maximum: 5MB');
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Unterstützte Formate: JPEG, PNG, GIF, WebP');
    }
    
    return errors;
  }
}

export default new ImageService();