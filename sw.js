/* LAYNOOR – fonctionnement hors connexion */
const V = 'laynoor-v1';
const FILES = ['index.html', 'patch.js', 'manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  const key = r.mode === 'navigate' ? 'index.html' : u.origin + u.pathname;
  const network = new Promise((resolve, reject) => {
    const t = setTimeout(reject, 4000);
    fetch(r, { cache: 'no-cache' }).then(res => { clearTimeout(t); resolve(res); }, err => { clearTimeout(t); reject(err); });
  });
  e.respondWith(
    network.then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(V).then(c => c.put(key, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(key).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))
    )
  );
});
