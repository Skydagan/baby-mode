const CACHE_NAME = 'baby-mode-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/security.js',
  '/js/gestures.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return a fallback response for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for when the app comes back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Could sync usage data or preferences here
  }
});

// Push notifications (for future features like parent notifications)
self.addEventListener('push', (event) => {
  const options = {
    body: 'Baby Mode notification',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    tag: 'baby-mode-notification',
    requireInteraction: false,
    silent: true
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Baby Mode';
  }

  event.waitUntil(
    self.registration.showNotification('Baby Mode', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If Baby Mode is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('baby-mode') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic background sync (for future features)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  // Could update colors, check for app updates, etc.
  console.log('Periodic sync executed');
}

// Handle app updates
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('App install prompt available');
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Baby Mode Service Worker loaded');