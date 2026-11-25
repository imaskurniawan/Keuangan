// Service worker: menyimpan aplikasi di HP supaya bisa dibuka tanpa internet.
// Jika kamu mengubah file aplikasi, naikkan angka VERSI di bawah (misal v2).
const VERSI = 'keuangan-v4';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(hit => {
      const net = fetch(r).then(res => {
        if (res && res.ok) { const cp = res.clone(); caches.open(VERSI).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => hit || (r.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return hit || net;
    })
  );
});
