/**
 * Firebase Analytics Utilities
 * Helper functions for tracking events and user properties
 */

import { getFirebaseAnalytics, isFirebaseDebugModeEnabled } from './config';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';

/**
 * Type for Firebase Analytics event parameters
 */
export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Track a custom event
 * 
 * IMPORTANT: Events are ALWAYS tracked to Firebase (if configured).
 * Debug mode ONLY controls console logging, NOT event tracking.
 */
export async function trackEvent(
  eventName: string,
  eventParams?: AnalyticsEventParams
): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) {
      // Only log if debug mode is enabled (event not tracked because Firebase not configured)
      const isDebugMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ANALYTICS_DEBUG !== 'false';
      if (isDebugMode) {
        console.log(`🔍 Analytics: Event "${eventName}" skipped (Firebase not configured)`);
      }
      return;
    }

    // ALWAYS track event to Firebase (regardless of debug mode)
    // If Firebase debug_mode is enabled in config, all events will appear in DebugView
    logEvent(analytics, eventName, eventParams);
    
    // Console debug mode ONLY controls console logging (not event tracking)
    const isConsoleDebugMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ANALYTICS_DEBUG !== 'false';
    if (isConsoleDebugMode) {
      console.log(`✅ Analytics: Event "${eventName}" tracked`, eventParams || '');
      // Check debug mode from config (fetched from API)
      const debugModeEnabled = await isFirebaseDebugModeEnabled();
      if (debugModeEnabled) {
        console.log('🔍 Firebase Debug Mode: Event will appear in DebugView');
      }
    }
  } catch (error) {
    console.error('❌ Analytics: Error tracking event:', error);
  }
}

/**
 * Set user ID for analytics
 */
export async function setAnalyticsUserId(userId: string | null): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) {
      return;
    }

    if (userId) {
      setUserId(analytics, userId);
    }
  } catch (error) {
    console.error('Error setting user ID:', error);
  }
}

/**
 * Set user properties
 */
export async function setAnalyticsUserProperties(
  properties: AnalyticsEventParams
): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) {
      return;
    }

    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
  await trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Common event tracking functions
 */
export const analyticsEvents = {
  // Authentication events
  login: (method?: string) => trackEvent('login', { method }),
  logout: () => trackEvent('logout'),
  signup: (method?: string) => trackEvent('sign_up', { method }),

  // Project events
  projectCreated: (projectId: string) => trackEvent('project_created', { project_id: projectId }),
  projectViewed: (projectId: string) => trackEvent('project_viewed', { project_id: projectId }),
  projectDeleted: (projectId: string) => trackEvent('project_deleted', { project_id: projectId }),

  // Test case events
  testCaseCreated: (testCaseId: string, projectId: string) =>
    trackEvent('test_case_created', { test_case_id: testCaseId, project_id: projectId }),
  testCaseUpdated: (testCaseId: string) =>
    trackEvent('test_case_updated', { test_case_id: testCaseId }),
  testCaseDeleted: (testCaseId: string) =>
    trackEvent('test_case_deleted', { test_case_id: testCaseId }),

  // Test run events
  testRunCreated: (testRunId: string, projectId: string) =>
    trackEvent('test_run_created', { test_run_id: testRunId, project_id: projectId }),
  testRunStarted: (testRunId: string) =>
    trackEvent('test_run_started', { test_run_id: testRunId }),
  testRunCompleted: (testRunId: string) =>
    trackEvent('test_run_completed', { test_run_id: testRunId }),

  // Defect events
  defectCreated: (defectId: string, projectId: string) =>
    trackEvent('defect_created', { defect_id: defectId, project_id: projectId }),
  defectUpdated: (defectId: string) =>
    trackEvent('defect_updated', { defect_id: defectId }),
  defectResolved: (defectId: string) =>
    trackEvent('defect_resolved', { defect_id: defectId }),

  // Search events
  searchPerformed: (query: string, resultsCount?: number) =>
    trackEvent('search', { search_term: query, results_count: resultsCount }),

  // Export events
  exportPerformed: (exportType: string, format: string) =>
    trackEvent('export', { export_type: exportType, format }),

  // Dialog events
  dialogOpened: (dialogName: string, context?: string) =>
    trackEvent('dialog_opened', { dialog_name: dialogName, context }),
  dialogClosed: (dialogName: string, context?: string) =>
    trackEvent('dialog_closed', { dialog_name: dialogName, context }),

  // Form events
  formSubmitted: (formName: string, success: boolean, context?: string) =>
    trackEvent('form_submitted', { form_name: formName, success, context }),
  formAbandoned: (formName: string, context?: string) =>
    trackEvent('form_abandoned', { form_name: formName, context }),

  // Button click events
  buttonClicked: (buttonName: string, page?: string, context?: string) =>
    trackEvent('button_click', { button_name: buttonName, page, context }),
};

