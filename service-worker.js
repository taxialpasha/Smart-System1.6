const CACHE_NAME = 'investment-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app-fixed.js',
  '/sidebar.js',
  '/currency-formatter.js',
  '/currency-formatter-loader.js',
  '/notifications-system.js',
  '/notifications-fix-v2.js',
  '/Installation Script for System Fixes.js',
  '/exchangerate.host.JS',
  '/assets/icon.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
];

self.addEventListener('install', event => {
  console.log('تثبيت Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تخزين الملفات مؤقتاً');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('تنشيط Service Worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // تقديم النسخة المخزنة مؤقتاً إذا كانت موجودة
        if (response) {
          return response;
        }
        
        // نسخ الطلب لاستخدامه مرة واحدة فقط
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // التأكد من أن الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // نسخ الاستجابة لاستخدامها مرتين
            const responseToCache = response.clone();
            
            // تخزين الاستجابة في التخزين المؤقت
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // في حالة الفشل وكان الطلب لصفحة HTML، قدم صفحة الوضع دون اتصال
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});