/**
 * Utility functions for storing form data offline and syncing when online
 */

// Database configuration
const DB_NAME = "AmanGroupOfflineDB"
const DB_VERSION = 1
const STORES = {
  contactForms: "contactForms",
  viewingRequests: "viewingRequests",
}

/**
 * Check if IndexedDB is available in the current browser
 */
const isIndexedDBAvailable = (): boolean => {
  return typeof window !== "undefined" && "indexedDB" in window
}

/**
 * Open the IndexedDB database
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB not available"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("Error opening database"))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create object stores for different types of forms if they don't exist
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })
        }
      })
    }
  })
}

/**
 * Store form data for offline use
 */
export const storeFormData = async (storeName: string, data: any): Promise<number> => {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)

      // Add timestamp to the data
      const dataWithTimestamp = {
        ...data,
        timestamp: new Date().toISOString(),
      }

      const request = store.add(dataWithTimestamp)

      request.onsuccess = () => {
        resolve(request.result as number)
      }

      request.onerror = () => {
        reject(new Error("Error storing form data"))
      }
    })
  } catch (error) {
    console.error("Failed to store form data:", error)
    throw error
  }
}

/**
 * Get all stored form data
 */
export const getStoredFormData = async (storeName: string): Promise<any[]> => {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error("Error retrieving form data"))
      }
    })
  } catch (error) {
    console.error("Failed to get stored form data:", error)
    return []
  }
}

/**
 * Delete form data after successful submission
 */
export const deleteFormData = async (storeName: string, id: number): Promise<void> => {
  try {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error("Error deleting form data"))
      }
    })
  } catch (error) {
    console.error("Failed to delete form data:", error)
    throw error
  }
}

/**
 * Register for background sync if available
 */
export const registerBackgroundSync = async (syncTag: string): Promise<boolean> => {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(syncTag)
      return true
    } catch (error) {
      console.error("Background sync registration failed:", error)
      return false
    }
  }
  return false
}

/**
 * Submit form data with offline support
 */
export const submitFormWithOfflineSupport = async (
  endpoint: string,
  data: any,
  storeName: string,
): Promise<{ success: boolean; message: string; offline?: boolean }> => {
  // Check if online
  if (navigator.onLine) {
    try {
      // Try to submit the form directly
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        return {
          success: true,
          message: "Form submitted successfully!",
        }
      } else {
        throw new Error("Server error")
      }
    } catch (error) {
      // If fetch fails, store the data for later
      const id = await storeFormData(storeName, data)
      await registerBackgroundSync("sync-forms")

      return {
        success: true,
        message: "You appear to be offline. Your form will be submitted when you reconnect.",
        offline: true,
      }
    }
  } else {
    // If offline, store the data for later
    const id = await storeFormData(storeName, data)
    await registerBackgroundSync("sync-forms")

    return {
      success: true,
      message: "You are offline. Your form will be submitted when you reconnect.",
      offline: true,
    }
  }
}
