// Ensure this file is served as JavaScript
// Add proper MIME type hint at the top
// @ts-check

const CACHE_NAME = "aman-group-cache-v1"
const urlsToCache = [
  "/",
  "/enjoy-realty",
  "/aman-engineering",
  "/model-houses",
  "/ready-for-occupancy",
  "/loan-calculator",
  "/contact",
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/manifest.json",
]

// Install a service worker
self.addEventListener("install", (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Cache and return requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            // Don't cache responses with query strings or POST requests
            if (event.request.url.indexOf("?") === -1 && event.request.method === "GET") {
              cache.put(event.request, responseToCache)
            }
          })

          return response
        })
        .catch(() => {
          // If the request is for a page, return the offline page
          if (event.request.mode === "navigate") {
            return caches.match("/offline")
          }

          // For image requests, you could return a default offline image
          if (event.request.destination === "image") {
            return caches.match("/icons/offline-image.png")
          }
        })
    }),
  )
})

// Update a service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              // Delete old caches
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        // Claim clients so the service worker is in control immediately
        return self.clients.claim()
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
