'use client';

/**
 * Firebase Analytics Initialization Component
 * Initializes Firebase Analytics on the client-side
 */

import { useEffect, useState } from 'react';
import { getFirebaseAnalytics, isFirebaseConfigured, isFirebaseDebugModeEnabled } from '@/lib/firebase/config';
import { usePathname } from 'next/navigation';

/**
 * Debug Mode Configuration
 * 
 * IMPORTANT: Debug mode ONLY controls console logging.
 * Events are ALWAYS tracked to Firebase (if configured), regardless of debug mode.
 * 
 * To disable debug logging, set NEXT_PUBLIC_ANALYTICS_DEBUG=false in .env
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const DEBUG_ANALYTICS = isDevelopment && process.env.NEXT_PUBLIC_ANALYTICS_DEBUG !== 'false';

export function FirebaseAnalytics() {
  const pathname = usePathname();
  const [firebaseConfigured, setFirebaseConfigured] = useState<boolean | null>(null);

  // Check Firebase configuration (async - checks backend API)
  useEffect(() => {
    const checkConfig = async () => {
      // BACKEND-ONLY: Check API endpoint for configuration
      const configured = await isFirebaseConfigured();
      setFirebaseConfigured(configured);
      
      if (!configured && DEBUG_ANALYTICS) {
        console.log('🔍 Firebase Analytics: Not configured - Add FIREBASE_* variables to backend .env');
      }
    };
    
    checkConfig();
  }, []);

  useEffect(() => {
    // Only initialize if Firebase is configured
    if (firebaseConfigured === false) {
      return;
    }
    
    if (firebaseConfigured === null) {
      // Still checking...
      return;
    }

    // Initialize Firebase Analytics
    const initAnalytics = async () => {
      try {
        if (DEBUG_ANALYTICS) {
          console.log('🔍 Firebase Analytics: Initializing...');
        }
        
        const analytics = await getFirebaseAnalytics();
        if (analytics) {
          if (DEBUG_ANALYTICS) {
            console.log('✅ Firebase Analytics: Successfully initialized');
            console.log('📍 Test in Firebase Console: https://console.firebase.google.com/');
            // Check debug mode from config (fetched from API)
            const debugModeEnabled = await isFirebaseDebugModeEnabled();
            if (debugModeEnabled) {
              console.log('🔍 Firebase Debug Mode: ENABLED - Events will appear in DebugView');
              console.log('📍 View DebugView: Firebase Console → Analytics → DebugView');
            }
          }
        } else {
          if (DEBUG_ANALYTICS) {
            console.warn('⚠️ Firebase Analytics: Failed to initialize (analytics not supported or unavailable)');
          }
        }
      } catch (error) {
        console.error('❌ Firebase Analytics: Initialization error:', error);
      }
    };

    initAnalytics();
  }, [firebaseConfigured]);

  // Track page views on route changes
  useEffect(() => {
    if (firebaseConfigured !== true || !pathname) {
      return;
    }

    const trackPageView = async () => {
      try {
        if (DEBUG_ANALYTICS) {
          console.log(`🔍 Firebase Analytics: Tracking page view - ${pathname}`);
        }
        
        const { trackPageView } = await import('@/lib/firebase/analytics');
        await trackPageView(pathname);
        
        if (DEBUG_ANALYTICS) {
          console.log(`✅ Firebase Analytics: Page view tracked - ${pathname}`);
        }
      } catch (error) {
        // Silently fail - analytics should not break the app
        if (DEBUG_ANALYTICS) {
          console.error('❌ Firebase Analytics: Failed to track page view:', error);
        }
      }
    };

    trackPageView();
  }, [pathname, firebaseConfigured]);

  return null;
}

