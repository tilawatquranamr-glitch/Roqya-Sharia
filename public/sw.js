const CACHE_NAME = 'ruqyah-audio-cache-v1';
const STATIC_CACHE_NAME = 'ruqyah-static-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching static assets failed:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== STATIC_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event - Cache First for Audio / Network First for HTML & APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle Audio Requests (mp3 or audio cache)
  if (url.pathname.endsWith('.mp3') || url.hostname.includes('mp3quran') || url.hostname.includes('quranicaudio')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // If network fails and no cache matched
          console.warn('Offline fetch failed for audio:', request.url);
          return new Response('Offline audio not cached', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // Handle standard Navigation & Static Assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok && request.method === 'GET') {
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
