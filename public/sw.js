self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('gotchi-lore-v1').then((c) => c.addAll(['/', '/index.html', '/ghost.svg'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request)),
  );
});
