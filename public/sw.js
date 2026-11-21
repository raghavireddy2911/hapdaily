// HAP Progressive Web App Service Worker
// Cache Name with versioning
const CACHE_NAME = 'hap-pwa-v1';

// Static Shell Assets for offline support & instant loading
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
];

// Install Event: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('PWA install cache warning:', err))
  );
});

// Activate Event: clean up obsolete caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event:
// - API routes & Supabase requests: Network-Only (no stale billing, orders or auth data)
// - Navigation requests: Network-First with offline.html fallback
// - Static assets (images, styles, scripts): Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Non-GET requests (POST, PATCH, DELETE) -> Always Network
  if (request.method !== 'GET') {
    return;
  }

  // 2. Ignore browser extension schemes or non-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. API requests, Auth routes, or Supabase -> Pure Network (NEVER stale cached)
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.searchParams.has('nocache')
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ success: false, error: 'Offline. Please check internet connection.' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
          }
        );
      })
    );
    return;
  }

  // 4. HTML Navigation requests (Page visits)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, clone and cache for next time
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // If network failed, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to offline.html
          const offlinePage = await caches.match('/offline.html');
          return (
            offlinePage ||
            new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            )
          );
        })
    );
    return;
  }

  // 5. Static Assets (Images, Icons, CSS, JS bundles) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
