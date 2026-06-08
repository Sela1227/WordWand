/* WordWand 作文魔法屋 Service Worker
   快取名稱帶版本：每次發版本請同步改 CACHE，舊快取會在 activate 時清掉。
   原則：後端 API（/magic、/read-image，跨網域）一律走網路、絕不快取。 */
const CACHE = "wordwand-v0.13.0";

// 預先快取的「殼層」：能離線打開畫面（功能仍需連線）
const SHELL = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./site.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
];

// 允許快取的 CDN 來源（殼層要用到）
const CDN_HOSTS = ["unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // 個別加入，單一資源失敗不影響其它（CDN 偶爾擋）
      Promise.allSettled(SHELL.map((u) => c.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 只處理 GET；POST（含後端 /magic、/read-image）一律走網路
  if (req.method !== "GET") return;

  const sameOrigin = url.origin === self.location.origin;
  const isCDN = CDN_HOSTS.some((h) => url.hostname.endsWith(h));

  // 後端 API 或其它跨網域（非白名單 CDN）→ 不攔截，直接走網路
  if (!sameOrigin && !isCDN) return;

  // 導覽請求（開頁面）：network-first，離線退回快取的殼層
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // 靜態資源 / CDN：cache-first，背景補快取
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && (sameOrigin || isCDN)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
