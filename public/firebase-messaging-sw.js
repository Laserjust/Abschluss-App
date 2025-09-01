// Firebase Messaging Service Worker
// This file handles background push notifications

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration for service worker
const firebaseConfig = {
  apiKey: "AIzaSyBdVl-cTICSwYKrfork-TjVKPjyCHzPtBY",
  authDomain: "fir-demo-project.firebaseapp.com",
  projectId: "fir-demo-project",
  storageBucket: "fir-demo-project.appspot.com",
  messagingSenderId: "618104808700",
  appId: "1:618104808700:web:8f3c8c4b5b4f4c4c",
  measurementId: "G-XXXXXXXXXX"
};

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

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title || 'Neue Benachrichtigung';
  const notificationType = payload.data?.type || 'general';
  const typeConfig = NOTIFICATION_TYPES[notificationType] || NOTIFICATION_TYPES.general;
  
  const notificationOptions = {
    body: payload.notification.body || 'Sie haben eine neue Nachricht erhalten.',
    icon: payload.notification.icon || FCM_CONFIG.defaultOptions.icon,
    badge: FCM_CONFIG.defaultOptions.badge,
    data: {
      ...payload.data,
      timestamp: Date.now(),
      type: notificationType
    },
    requireInteraction: typeConfig.priority === 'high',
    vibrate: FCM_CONFIG.defaultOptions.vibrate,
    actions: FCM_CONFIG.defaultOptions.actions,
    tag: notificationType,
    renotify: true,
    silent: false
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
    // Just close the notification
    return;
  }
  
  // Handle notification click (open action or clicking the notification itself)
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus existing window and navigate if needed
            return client.focus().then(() => {
              return navigateToNotification(client, data);
            });
          }
        }
        
        // Open new window if no existing window found
        const url = getNotificationUrl(data);
        return clients.openWindow(url);
      })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Send analytics or update read status
    fetch('/api/notifications/dismiss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        dismissedAt: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Error tracking notification dismissal:', error);
    });
  }
});

// Helper function to get the appropriate URL for notification type
function getNotificationUrl(data) {
  const baseUrl = self.location.origin;
  
  switch (data.type) {
    case 'message':
      return data.conversationId 
        ? `${baseUrl}/chat?conversation=${data.conversationId}`
        : `${baseUrl}/chat`;
    
    case 'report':
      return `${baseUrl}/admin`;
    
    case 'project':
      return data.projectId 
        ? `${baseUrl}/projects?project=${data.projectId}`
        : `${baseUrl}/projects`;
    
    case 'survey':
      return data.surveyId 
        ? `${baseUrl}/surveys?survey=${data.surveyId}`
        : `${baseUrl}/surveys`;
    
    case 'finance':
      return `${baseUrl}/finance`;
    
    case 'committee':
      return data.committeeId 
        ? `${baseUrl}/committees?committee=${data.committeeId}`
        : `${baseUrl}/committees`;
    
    default:
      return `${baseUrl}/dashboard`;
  }
}

// Helper function to navigate existing client to notification content
function navigateToNotification(client, data) {
  const url = getNotificationUrl(data);
  
  // Use postMessage to communicate with the client
  return client.postMessage({
    type: 'NAVIGATE_TO_NOTIFICATION',
    url: url,
    data: data
  });
}

// Handle push events (for custom push notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const notificationTitle = data.title || 'Neue Benachrichtigung';
    const notificationOptions = {
      body: data.body || 'Sie haben eine neue Nachricht erhalten',
      icon: data.icon || '/logo192.png',
      badge: '/logo192.png',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
      tag: data.tag || 'general'
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('Error parsing push event data:', error);
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});