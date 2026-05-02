const CACHE = "ikspro-v1";
const ARCHIVOS = ["./","./index.html"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch", e=>{
  const url=e.request.url;
  if(url.includes("firestore")||url.includes("firebase")||url.includes("googleapis")){
    e.respondWith(fetch(e.request).catch(()=>new Response("{}")));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached) return cached;
    return fetch(e.request).then(r=>{
      if(r&&r.status===200){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c))}
      return r;
    }).catch(()=>caches.match("./index.html"));
  }));
});
