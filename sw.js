// Omni Blogger - Service Worker
// Version: 1.3

const CACHE_VERSION = 'omni-v4';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/editor.js',
  '/config.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-180.png',
  '/icons/icon-32.png'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Caching app shell and static assets');
      return cache.addAll(CACHE_FILES);
    }).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting(); // Activate immediately
    }).catch((error) => {
      console.error('[SW] Installation failed:', error);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API requests (always go to network)
  if (url.hostname === 'api.sparkler.club' || url.pathname.includes('/api/')) {
    console.log('[SW] Skipping cache for API request:', url.pathname);
    return; // Let it go to network
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache-first strategy for app assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', url.pathname);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      console.log('[SW] Fetching from network:', url.pathname);
      return fetch(request).then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response (can only be consumed once)
        const responseToCache = response.clone();

        // Cache the new response for future use
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(request, responseToCache);
          console.log('[SW] Cached new resource:', url.pathname);
        });

        return response;
      }).catch((error) => {
        console.error('[SW] Fetch failed:', error);

        // Could return an offline fallback page here
        // For now, just propagate the error
        throw error;
      });
    })
  );
});

// Message event - handle commands from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
