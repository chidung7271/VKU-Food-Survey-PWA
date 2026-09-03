const CACHE_NAME = 'vku-food-survey-v1';

// Danh sách tài nguyên cốt lõi App Shell cần pre-cache
const STATIC_ASSETS = [
  '/',
  '/survey',
  '/history',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// 1. Lifecycle: Install -> Pre-cache App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker Installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching App Shell assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Cache addAll warning (some assets may be fetched later):', err);
        return self.skipWaiting();
      }),
  );
});

// 2. Lifecycle: Activate -> Xóa cache cũ
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[SW] Clearing old cache:', cache);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. Lifecycle: Fetch -> Chiến lược Caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Không xử lý non-HTTP requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // POST request: Network Only (Tuyệt đối không cache request POST bằng Cache API)
  if (request.method !== 'GET') {
    return;
  }

  // Ping / Health Check: Network Only (Kiểm tra kết nối thực tế, không dùng cache)
  if (url.pathname.includes('/api/ping')) {
    event.respondWith(fetch(request));
    return;
  }

  // API GET requests -> Network First (cố gắng lấy mới, nếu offline fallback vào cache)
  if (url.pathname.includes('/surveys')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        }),
    );
    return;
  }

  // Navigation requests (HTML pages: /, /survey, /history) -> Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Khi offline, mở từ cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Nếu không có chính xác trang này trong cache, trả về trang chủ /
          return caches.match('/');
        }),
    );
    return;
  }

  // Static Assets (Next.js bundles, CSS, JS, Images, Icons) -> Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Chỉ cache response hợp lệ
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    }),
  );
});

// 4. Background Sync API
self.addEventListener('sync', (event) => {
  if (event.tag === 'vku-food-sync') {
    console.log('[SW] Background Sync event triggered: vku-food-sync');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_NOW' });
        });
      }),
    );
  }
});

