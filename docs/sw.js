// Service worker Aqyl: сайт открывается и без сети (демо-чат работает в браузере).
// Сначала берём свежую версию из сети, кэш — только запасной вариант, поэтому обновления видны сразу.
const CACHE = 'aqyl-v1';
const SHELL = ['./', 'index.html', 'style.css', 'data.js', 'demo.js', 'site.js', '404.html', 'favicon.svg', 'icon-192.png',
  'team/esenaliev.jpg', 'team/veiberg.jpg', 'team/nazarenko.jpg', 'team/umbetova.jpg', 'team/qr.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // только свои GET-файлы; запросы к серверу заявок и чату (/api/) не трогаем
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
