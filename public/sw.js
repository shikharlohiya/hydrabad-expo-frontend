const CACHE_NAME = "traders-help-desk-v1";

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/manifest.json"]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Background sync for auto-sync
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-completed-visits") {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    // This would trigger auto-sync when app comes back online
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Fetch event - SKIP ALL VITE DEV FILES
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip all Vite development files
  if (
    url.pathname.includes("@vite") ||
    url.pathname.includes("@react-refresh") ||
    url.pathname.includes("virtual:") ||
    url.pathname.includes("?t=") ||
    request.method !== "GET"
  ) {
    return; // Let browser handle these normally
  }

  // Handle app files only
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch(() => {
          if (request.destination === "document") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        })
      );
    })
  );
});
