/**
 * Firebase Configuration
 * Initialize Firebase app and Analytics
 * 
 * BACKEND-ONLY APPROACH: All config comes from backend API endpoint
 * - Config is fetched from /api/config/firebase at runtime
 * - Updates without rebuilding the app
 * - Cached in localStorage for 24 hours
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Firebase config type
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  debugMode?: boolean; // Debug mode flag from backend
}

// Runtime config fetch promise (cached in memory)
let configFetchPromise: Promise<FirebaseConfig | null> | null = null;

// LocalStorage key for persisting config across browser sessions
const FIREBASE_CONFIG_STORAGE_KEY = 'firebase_config_cache';
const FIREBASE_CONFIG_TIMESTAMP_KEY = 'firebase_config_timestamp';
const CONFIG_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached config from localStorage (persists across browser sessions)
 * 
 * SECURITY NOTE: Firebase API keys are PUBLIC by design, not secrets.
 * - They identify your project, not authenticate users
 * - Real security comes from Firebase Security Rules and App Check
 * - Storing in localStorage is safe because config is already public
 * - No sensitive credentials (Admin SDK keys, passwords) are stored
 */
function getCachedConfigFromStorage(): FirebaseConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cachedConfig = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    const cachedTimestamp = localStorage.getItem(FIREBASE_CONFIG_TIMESTAMP_KEY);

    if (cachedConfig && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();

      // Check if cache is still valid (within 24 hours)
      if (now - timestamp < CONFIG_CACHE_DURATION) {
        return JSON.parse(cachedConfig) as FirebaseConfig;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
        localStorage.removeItem(FIREBASE_CONFIG_TIMESTAMP_KEY);
      }
    }
  } catch (error) {
    console.error('Error reading cached Firebase config:', error);
    // Clear potentially corrupted data
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    localStorage.removeItem(FIREBASE_CONFIG_TIMESTAMP_KEY);
  }

  return null;
}

/**
 * Save config to localStorage (persists across browser sessions)
 * 
 * SECURITY NOTE: This stores public Firebase identifiers only.
 * These values are safe to expose and are already visible in:
 * - Network requests (browser DevTools)
 * - JavaScript source code
 * - Client-side bundles
 */
function saveConfigToStorage(config: FirebaseConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem(FIREBASE_CONFIG_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving Firebase config to storage:', error);
  }
}

/**
 * Fetch Firebase config from backend API
 * This allows updating config without rebuilding the app
 */
async function fetchFirebaseConfigFromAPI(): Promise<FirebaseConfig | null> {
  try {
    const response = await fetch('/api/config/firebase');
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.configured && data.data) {
      // Save to localStorage for persistence across browser sessions
      saveConfigToStorage(data.data);
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch Firebase config from API:', error);
    return null;
  }
}

/**
 * Get Firebase configuration
 * BACKEND-ONLY: All config comes from backend API endpoint
 * 
 * Flow:
 * 1. Check localStorage cache (persists across browser sessions, 24h expiry)
 * 2. If no cache, fetch from /api/config/firebase
 * 3. Save to localStorage for future use
 */
async function getFirebaseConfig(): Promise<FirebaseConfig> {
  // Only works on client-side (API endpoint is client-side only)
  if (typeof window === 'undefined') {
    return {};
  }

  // First, check localStorage cache (persists across browser sessions)
  const cachedConfig = getCachedConfigFromStorage();
  if (cachedConfig && cachedConfig.apiKey?.trim() && cachedConfig.projectId?.trim()) {
    // Use cached config (no API call needed)
    return cachedConfig;
  }

  // If no valid cache, fetch from API (only once per page load)
  if (!configFetchPromise) {
    configFetchPromise = fetchFirebaseConfigFromAPI();
  }
  
  const apiConfig = await configFetchPromise;
  if (apiConfig && apiConfig.apiKey?.trim() && apiConfig.projectId?.trim()) {
    // API config is available and valid - use it
    // Note: Already saved to localStorage in fetchFirebaseConfigFromAPI
    return apiConfig;
  }
  
  // No config available - return empty config
  return {};
}

// Initialize Firebase
let app: FirebaseApp | undefined;
let analytics: Analytics | null = null;

export async function getFirebaseApp(): Promise<FirebaseApp | undefined> {
  // Get config (from API or env)
  const config = await getFirebaseConfig();
  
  // Check if Firebase config is available
  // Handles: undefined, null, empty string, whitespace-only strings
  if (!config.apiKey?.trim() || !config.projectId?.trim()) {
    return undefined;
  }

  // Return existing app if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Initialize new app
  try {
    app = initializeApp(config);
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return undefined;
  }
}

/**
 * Check if Firebase Debug Mode is enabled
 * Debug mode sends events to Firebase Console DebugView for real-time monitoring
 * 
 * On server-side: reads from env var directly
 * On client-side: gets from Firebase config (fetched from API)
 */
export async function isFirebaseDebugModeEnabled(): Promise<boolean> {
  // On server-side, check env var directly
  if (typeof window === 'undefined') {
    return process.env.FIREBASE_DEBUG_MODE === 'true';
  }

  // On client-side, get from Firebase config (fetched from API)
  try {
    const config = await getFirebaseConfig();
    return config.debugMode === true;
  } catch {
    // If config fetch fails, default to false
    return false;
  }
}

/**
 * Get Firebase Analytics instance
 * Only works on client-side
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing analytics if already initialized
  if (analytics) {
    return analytics;
  }

  // Check if Analytics is supported
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Analytics is not supported in this environment');
    return null;
  }

  // Get or initialize Firebase app
  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  // Get current config for measurementId
  const config = await getFirebaseConfig();

  try {
    analytics = getAnalytics(firebaseApp);
    
    // Enable Firebase Debug Mode if configured
    // This sends events to Firebase Console DebugView for real-time monitoring
    // Check debug mode from config (fetched from API)
    if (config.debugMode === true && config.measurementId) {
      // Use gtag to enable debug mode for all events
      // gtag is initialized by Firebase Analytics SDK
      const enableDebugMode = () => {
        if (typeof window !== 'undefined' && config.measurementId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gtag = (window as any).gtag;
          if (gtag && typeof gtag === 'function') {
            gtag('config', config.measurementId, {
              debug_mode: true,
            });
            return true;
          }
        }
        return false;
      };
      
      // Try immediately, or wait a bit for gtag to be available
      if (!enableDebugMode()) {
        // Retry after a short delay if gtag isn't ready yet
        setTimeout(() => {
          enableDebugMode();
        }, 100);
      }
    }
    
    return analytics;
  } catch (error) {
    console.error('Firebase Analytics initialization error:', error);
    return null;
  }
}

/**
 * Check if Firebase is configured
 * BACKEND-ONLY: Checks API endpoint for configuration
 * This is async because config comes from API endpoint
 */
export async function isFirebaseConfigured(): Promise<boolean> {
  const config = await getFirebaseConfig();
  return !!(config.apiKey && config.projectId && config.appId);
}

