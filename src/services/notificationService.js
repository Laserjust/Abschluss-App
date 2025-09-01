import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, db, messaging } from './firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// VAPID Key for Firebase Cloud Messaging
const VAPID_KEY = 'BKxvxhk5dLxgKFKnONWoXBuHixareVapk8rXKJ6VOP3EGgDGMwGqcoSuJiONqhL6AkbyfA8KkTTyHpTnyGJjBQs';

// FCM Configuration
const FCM_CONFIG = {
  defaultOptions: {
    icon: '/logo192.png',
    badge: '/logo192.png',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Öffnen'
      },
      {
        action: 'dismiss',
        title: 'Schließen'
      }
    ]
  }
};

// Notification types configuration
const NOTIFICATION_TYPES = {
  message: { color: '#2196F3', priority: 'high' },
  report: { color: '#FF5722', priority: 'high' },
  project: { color: '#4CAF50', priority: 'normal' },
  survey: { color: '#9C27B0', priority: 'normal' },
  finance: { color: '#FF9800', priority: 'normal' },
  committee: { color: '#607D8B', priority: 'normal' },
  general: { color: '#757575', priority: 'normal' }
};

class NotificationService {
  constructor() {
    this.messaging = messaging;
    this.db = db;
    this.currentToken = null;
    this.isSupported = false;
    this.listeners = new Set();
    this.init();
  }

  async init() {
    try {
      // Check if we're in development mode
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        console.log('NotificationService: Running in development mode with mocks');
        this.isSupported = true;
        return;
      }
      
      // Check if notifications are supported
      this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      
      if (!this.isSupported) {
        console.warn('Push notifications are not supported in this browser');
        return;
      }

      // Initialize Firebase Messaging
      if (app) {
        this.messaging = getMessaging(app);
      }
      
      // Register service worker
      await this.registerServiceWorker();
      
      // Set up message listener for foreground messages
      this.setupForegroundMessageListener();
      
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getRegistrationToken(userId) {
    if (!this.messaging || !this.isSupported) {
      console.warn('Messaging not initialized or not supported');
      return null;
    }

    try {
      // Request permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      // Get registration token
      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        console.log('Registration token obtained:', token);
        this.currentToken = token;
        
        // Save token to Firestore
        if (userId) {
          await this.saveTokenToDatabase(userId, token);
        }
        
        return token;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (error) {
      console.error('Error getting registration token:', error);
      return null;
    }
  }

  async saveTokenToDatabase(userId, token) {
    try {
      await updateDoc(doc(this.db, 'users', userId), {
        fcmToken: token,
        tokenUpdatedAt: serverTimestamp()
      });
      console.log('FCM token saved to database');
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  }

  async saveTokenToFirestore(token) {
    try {
      if (!this.db) {
        console.log('Firestore not available in development mode');
        return;
      }

      const user = auth?.currentUser;
      if (user) {
        await updateDoc(doc(this.db, 'users', user.uid), {
          fcmToken: token,
          lastTokenUpdate: serverTimestamp(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date().toISOString()
          }
        });
        console.log('FCM token saved to Firestore with device info');
      }
    } catch (error) {
      console.error('Error saving token to Firestore:', error);
    }
  }

  // Send push notification (server-side functionality)
  async sendPushNotification(targetToken, notification) {
    try {
      if (!this.messaging) {
        console.log('Push notification simulation:', notification);
        return { success: true, messageId: 'demo-' + Date.now() };
      }

      // This would typically be done on the server side
      // Here we're just logging the notification that would be sent
      const payload = {
        token: targetToken,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || FCM_CONFIG.defaultOptions.icon
        },
        data: notification.data || {},
        webpush: {
          notification: {
            ...FCM_CONFIG.defaultOptions,
            ...notification,
            tag: notification.tag || 'default',
            renotify: true
          }
        }
      };

      console.log('Push notification payload:', payload);
      return { success: true, messageId: 'demo-' + Date.now() };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notification configuration by type
  getNotificationConfig(type) {
    return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.general;
  }

  setupForegroundMessageListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      const { title, body, icon, data } = payload.notification || {};
      
      // Create notification object for listeners
      const notification = {
        title: title || 'Neue Benachrichtigung',
        body: body || '',
        type: data?.type || 'general',
        icon: icon || '/logo192.png',
        data: data || payload.data,
        timestamp: new Date(),
        ...payload.data
      };
      
      // Emit to registered listeners (for in-app notifications)
      this.emitNotification(notification);
      
      // Show browser notification if page is not in focus
      if (document.hidden) {
        this.showNotification(title, {
          body,
          icon: icon || '/logo192.png',
          badge: '/logo192.png',
          data: data || payload.data,
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Öffnen'
            },
            {
              action: 'dismiss',
              title: 'Schließen'
            }
          ]
        });
      }
      
      // Trigger custom event for backward compatibility
      window.dispatchEvent(new CustomEvent('foregroundMessage', {
        detail: payload
      }));
    });
  }

  async showNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async sendNotification(userId, notification) {
    try {
      // Save notification to database
      await addDoc(collection(this.db, 'notifications'), {
        userId,
        title: notification.title,
        body: notification.body,
        type: notification.type || 'general',
        data: notification.data || {},
        priority: notification.priority || 'normal',
        createdAt: serverTimestamp(),
        read: false
      });

      console.log('Notification saved to database');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Method to handle notification clicks
  handleNotificationClick(event) {
    event.notification.close();
    
    const data = event.notification.data || {};
    
    // Handle different notification types
    switch (data.type) {
      case 'message':
        // Navigate to chat
        if (data.conversationId) {
          window.open(`/chat?conversation=${data.conversationId}`, '_blank');
        }
        break;
      case 'report':
        // Navigate to admin panel
        window.open('/admin', '_blank');
        break;
      default:
        // Navigate to dashboard
        window.open('/', '_blank');
    }
  }

  // Method to get notification permission status
  getPermissionStatus() {
    if (!this.isSupported) {
      return 'not-supported';
    }
    return Notification.permission;
  }

  // Method to check if notifications are enabled
  isEnabled() {
    return this.isSupported && Notification.permission === 'granted';
  }

  // Method to add notification listener
  onNotification(callback) {
    this.listeners.add(callback);
  }

  // Method to remove notification listener
  offNotification(callback) {
    this.listeners.delete(callback);
  }

  // Method to emit notification to all listeners
  emitNotification(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Method to disable notifications
  async disable(userId) {
    try {
      if (userId && this.currentToken) {
        await updateDoc(doc(this.db, 'users', userId), {
          fcmToken: null,
          notificationsEnabled: false,
          tokenUpdatedAt: serverTimestamp()
        });
      }
      this.currentToken = null;
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Export individual methods for convenience
export const {
  requestPermission,
  getRegistrationToken,
  showNotification,
  sendNotification,
  sendPushNotification,
  getNotificationConfig,
  getPermissionStatus,
  isEnabled,
  disable,
  onNotification,
  offNotification,
  emitNotification
} = notificationService;