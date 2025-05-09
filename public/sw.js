// Service Worker for Aman Group Website
// @ts-check

const CACHE_NAME = "aman-group-cache-v1"
const OFFLINE_PAGE = "/offline"
const OFFLINE_IMAGE = "/icons/offline-image.png"

// URLs to cache on install
const STATIC_ASSETS = [
  "/",
  "/enjoy-realty",
  "/aman-engineering",
  "/model-houses",
  "/ready-for-occupancy",
  "/loan-calculator",
  "/contact",
  OFFLINE_PAGE,
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/manifest.json",
  OFFLINE_IMAGE,
]

// Install event handler
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()), // Force activation
  )
})

// Activate event handler
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
        )
      })
      .then(() => self.clients.claim()), // Take control immediately
  )
})

// Fetch event handler with improved offline fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse
      }

      // Otherwise try to fetch from network
      return fetch(event.request.clone())
        .then((response) => {
          // Don't cache if not a valid response or not a GET request
          if (!response || response.status !== 200 || response.type !== "basic" || event.request.method !== "GET") {
            return response
          }

          // Cache valid responses without query strings
          if (event.request.url.indexOf("?") === -1) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // Provide appropriate fallbacks for different request types
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_PAGE)
          }

          if (event.request.destination === "image") {
            return caches.match(OFFLINE_IMAGE)
          }
        })
    }),
  )
})

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-forms") {
    event.waitUntil(syncForms())
  }
})

// Function to handle background sync of forms
async function syncForms() {
  try {
    // Get all the form submissions stored in IndexedDB
    const formData = await getStoredFormSubmissions()

    // Process each form submission
    for (const data of formData) {
      await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      // Remove the form submission from storage after successful submission
      await removeFormSubmission(data.id)
    }

    // Notify the user that their form has been submitted
    self.registration.showNotification("Form Submitted", {
      body: "Your form has been submitted successfully!",
      icon: "/icons/icon-192x192.png",
    })
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

// These functions would be implemented in a real app
// They're placeholders for the background sync functionality
function getStoredFormSubmissions() {
  // In a real implementation, this would retrieve data from IndexedDB
  return Promise.resolve([])
}

function removeFormSubmission(id) {
  // In a real implementation, this would remove data from IndexedDB
  return Promise.resolve()
}
