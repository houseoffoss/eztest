import { NextResponse } from 'next/server';

/**
 * GET /api/config/firebase
 * Get Firebase configuration from server-side environment variables
 * 
 * BACKEND-ONLY APPROACH: Only uses FIREBASE_* variables (no NEXT_PUBLIC_ prefix)
 * This allows updating config without rebuilding the app.
 * 
 * Required environment variables:
 * - FIREBASE_API_KEY
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_APP_ID
 * 
 * Optional:
 * - FIREBASE_AUTH_DOMAIN
 * - FIREBASE_STORAGE_BUCKET
 * - FIREBASE_MESSAGING_SENDER_ID
 * - FIREBASE_MEASUREMENT_ID
 * 
 * SECURITY:
 * - Firebase API keys are PUBLIC by design (not secrets)
 * - They identify your project, not authenticate users
 * - Real security comes from Firebase Security Rules and App Check
 * - No sensitive credentials (Admin SDK keys, passwords) are exposed
 * - Configure domain restrictions in Firebase Console for additional protection
 */
export async function GET() {
  // BACKEND-ONLY: Only use server-side env vars (FIREBASE_*)
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    debugMode: process.env.FIREBASE_DEBUG_MODE === 'true', // Include debug mode flag
  };

  // Check if Firebase is configured
  // Handles: undefined, null, empty string, whitespace-only strings
  const isConfigured = !!(
    firebaseConfig.apiKey?.trim() &&
    firebaseConfig.projectId?.trim() &&
    firebaseConfig.appId?.trim()
  );

  if (!isConfigured) {
    return NextResponse.json(
      {
        data: null,
        configured: false,
        message: 'Firebase is not configured',
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    data: firebaseConfig,
    configured: true,
  });
}

