const CACHE_NAME = 'bot-chat-v1';
const urlsToCache = [
  './',
  './chat.html',
  './manifest.json'
];

// Cài đặt service worker và lưu cache tĩnh
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Chặn request để trả về nội dung từ cache nếu mất mạng
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Trả về từ Cache
        }
        return fetch(event.request); // Lấy từ mạng
      })
  );
});
