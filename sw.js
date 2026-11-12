/* DKM Digital service worker: cache-first untuk kerangka aplikasi, network-first untuk API */
const CACHE = 'dkm-digital-v1.0.0';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('script.google.com') || u.hostname.endsWith('googleusercontent.com')) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => { if (res.ok && (u.origin === location.origin || u.hostname.includes('fonts.g'))) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return res; }).catch(() => caches.match('./index.html'))));
});
self.addEventListener('push', e => { let d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'DKM Digital', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'DKM Digital', { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: d.url || './' })); });
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.openWindow(e.notification.data || './')); });
