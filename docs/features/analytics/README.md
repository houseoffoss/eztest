# Firebase Analytics

Complete guide to Firebase Analytics integration in EZTest.

---

## Overview

EZTest uses Firebase Analytics to track user interactions and application usage patterns. Analytics helps understand how users interact with the application, which features are most used, and identify areas for improvement.

### Key Features

- ✅ **Page View Tracking** - Automatic tracking of page navigation
- ✅ **Button Click Tracking** - Track user interactions with buttons
- ✅ **User Identification** - Track user sessions and properties
- ✅ **Privacy Compliant** - No PII (Personally Identifiable Information) tracked
- ✅ **Debug Mode** - Development debugging support
- ❌ **Dialog Tracking** - Removed for privacy and performance
- ❌ **Form Tracking** - Removed for privacy and performance

---

## What Is Tracked

### Automatic Tracking

#### Page Views
- Automatically tracked on every page navigation
- Includes page path and title
- Event: `page_view`

#### User Identification
- User ID set when user logs in
- User role tracked as property
- Cleared on logout
- **Note:** Email addresses are NOT tracked (privacy compliant)

### Manual Tracking

#### Button Clicks
- Tracked via `trackButton()` method
- Includes button name and page context
- Event: `button_click`

**Example:**
```typescript
const { trackButton } = useAnalytics();

<Button onClick={() => {
  trackButton('Create Project', { projectId: '123' });
  // ... handle click
}}>
  Create Project
</Button>
```

#### Custom Events
- Project creation, updates, deletion
- Test case creation, updates, deletion
- Test run creation, start, completion
- Defect creation, updates, resolution
- Search queries
- Export operations

**Available Events:**
- `project_created`, `project_viewed`, `project_deleted`
- `test_case_created`, `test_case_updated`, `test_case_deleted`
- `test_run_created`, `test_run_started`, `test_run_completed`
- `defect_created`, `defect_updated`, `defect_resolved`
- `search`, `export`
- `login`, `logout`, `sign_up`

---

## What Is NOT Tracked

### Dialogs
- ❌ Dialog open/close events have been **removed**
- ❌ No tracking for:
  - Create/Edit dialogs
  - Delete confirmation dialogs
  - Import/Export dialogs
  - File upload dialogs
  - Any other dialog interactions

**Reason:** Privacy concerns and performance optimization.

### Forms
- ❌ Form submission tracking has been **removed**
- ❌ No tracking for:
  - Login form submissions
  - Registration form submissions
  - Test case creation forms
  - Defect creation forms
  - Any other form submissions

**Reason:** Privacy concerns and reduced tracking overhead.

---

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Firebase Configuration (Backend)
FIREBASE_API_KEY="your-api-key"
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="123456789"
FIREBASE_APP_ID="1:123456789:web:abc123"
FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Optional: Enable debug logging in development
NEXT_PUBLIC_ANALYTICS_DEBUG="true"
```

### Firebase Console Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing
   - Enable Google Analytics

2. **Get Configuration**
   - Project Settings → General
   - Scroll to "Your apps"
   - Add web app or select existing
   - Copy configuration values

3. **Enable Analytics**
   - Project Settings → Integrations
   - Enable Google Analytics
   - Select or create Analytics account

---

## How It Works

### Initialization Flow

```
1. Application starts
   ↓
2. Firebase config fetched from /api/config/firebase
   ↓
3. Firebase Analytics initialized (client-side only)
   ↓
4. User session detected → Set user ID and properties
   ↓
5. Page views and events tracked automatically
```

### Event Tracking Flow

```
1. User action (e.g., button click)
   ↓
2. trackButton() or trackEvent() called
   ↓
3. Check if Firebase Analytics is configured
   ↓
4. If configured → Send event to Firebase
   ↓
5. If not configured → Silently skip (no errors)
```

### Privacy Protection

- **No PII Tracked**: Email addresses are never sent to Firebase
- **User ID Only**: Only internal user ID is tracked
- **Role Information**: User role (ADMIN, TESTER, etc.) tracked as property
- **Hashed Email Option**: Optional hashed email tracking (disabled by default)

---

## Usage

### In React Components

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackButton, track, events } = useAnalytics();

  const handleClick = async () => {
    // Track button click
    await trackButton('My Button', { context: 'page-name' });
    
    // Or track custom event
    await events.projectCreated(projectId);
    
    // Or use generic track
    await track('custom_event', { param1: 'value1' });
  };

  return <Button onClick={handleClick}>Click Me</Button>;
}
```

### Available Methods

#### `trackButton(buttonName, context?)`
Track button clicks with optional context.

```typescript
await trackButton('Create Project', { projectId: '123' });
```

#### `track(eventName, params?)`
Track custom events with parameters.

```typescript
await track('custom_action', { 
  action_type: 'export',
  format: 'csv' 
});
```

#### `trackPage(path, title?)`
Manually track page views (usually automatic).

```typescript
await trackPage('/projects', 'Projects Page');
```

#### `events.*`
Predefined event functions.

```typescript
// Project events
await events.projectCreated(projectId);
await events.projectViewed(projectId);

// Test case events
await events.testCaseCreated(testCaseId, projectId);
await events.testCaseUpdated(testCaseId);

// Test run events
await events.testRunStarted(testRunId);
await events.testRunCompleted(testRunId);

// Defect events
await events.defectCreated(defectId, projectId);
await events.defectResolved(defectId);

// Search
await events.searchPerformed('test query', 10);

// Export
await events.exportPerformed('testcases', 'csv');
```

---

## Debug Mode

### Development Debug Logging

Enable console logging in development:

```env
NEXT_PUBLIC_ANALYTICS_DEBUG="true"
```

**What it does:**
- Logs all tracked events to console
- Shows when events are skipped (Firebase not configured)
- Helps verify analytics is working

**Example Console Output:**
```
✅ Analytics: Event "button_click" tracked { button_name: "Create Project" }
🔍 Firebase Debug Mode: Event will appear in DebugView
```

### Firebase DebugView

1. **Enable Debug Mode in Firebase**
   - Firebase Console → Analytics → DebugView
   - Follow instructions to enable debug mode

2. **View Events in Real-Time**
   - Events appear in DebugView within seconds
   - See all event parameters
   - Test event tracking during development

---

## Disabling Analytics

### Option 1: Remove Firebase Configuration

Simply don't set Firebase environment variables:

```env
# Comment out or remove all FIREBASE_* variables
# FIREBASE_API_KEY="..."
# FIREBASE_AUTH_DOMAIN="..."
# etc.
```

**Result:**
- Analytics initialization skipped
- No events tracked
- No errors shown
- Application works normally

### Option 2: Disable in Code

If you want to completely remove analytics:

1. Remove `FirebaseAnalytics` component from layout
2. Remove `useAnalytics` hook calls
3. Remove Firebase dependencies

**Note:** This requires code changes and is not recommended unless you're sure you don't want analytics.

---

## Privacy & Compliance

### Data Collected

✅ **Tracked:**
- User ID (internal database ID)
- User role (ADMIN, TESTER, etc.)
- Page paths
- Button names
- Event names and parameters
- Timestamps

❌ **NOT Tracked:**
- Email addresses
- Names
- Passwords
- Form data
- Dialog interactions
- Any PII (Personally Identifiable Information)

### GDPR Compliance

- **No PII**: Email addresses and names are never sent to Firebase
- **User Control**: Analytics can be disabled by not configuring Firebase
- **Transparency**: This documentation explains what is tracked
- **Minimal Data**: Only essential usage data is collected

### Privacy Best Practices

1. **Review Events**: Regularly review what events are tracked
2. **User Consent**: Consider adding user consent for analytics (future feature)
3. **Data Retention**: Configure retention in Firebase Console
4. **IP Anonymization**: Enable in Firebase Console (Settings → Data Settings)

---

## Troubleshooting

### Analytics Not Working

**Check 1: Configuration**
```bash
# Verify Firebase config is available
curl http://localhost:3000/api/config/firebase
```

**Check 2: Environment Variables**
```bash
# Verify all FIREBASE_* variables are set
echo $FIREBASE_API_KEY
echo $FIREBASE_MEASUREMENT_ID
```

**Check 3: Browser Console**
- Enable `NEXT_PUBLIC_ANALYTICS_DEBUG="true"`
- Check for analytics logs
- Look for errors

**Check 4: Firebase Console**
- Verify project is active
- Check Analytics is enabled
- View DebugView for real-time events

### Events Not Appearing

**Possible Causes:**
1. Firebase not configured → Events silently skipped
2. Network issues → Events queued and sent later
3. Ad blockers → May block Firebase Analytics
4. Incognito mode → Some browsers block analytics

**Solutions:**
1. Verify Firebase configuration
2. Check browser console for errors
3. Disable ad blockers for testing
4. Use DebugView to verify events

---

## API Reference

### Hook: `useAnalytics()`

Returns analytics tracking functions.

```typescript
const {
  track,           // Generic event tracking
  trackPage,       // Page view tracking
  trackButton,     // Button click tracking
  trackDialog,     // Dialog tracking (deprecated - not used)
  trackForm,       // Form tracking (deprecated - not used)
  events,          // Predefined event functions
} = useAnalytics();
```

### Function: `trackEvent(eventName, params?)`

Track a custom event.

```typescript
await trackEvent('custom_event', {
  param1: 'value1',
  param2: 123,
});
```

### Function: `setAnalyticsUserId(userId)`

Set user ID for analytics (automatic on login).

```typescript
await setAnalyticsUserId('user-123');
```

### Function: `setAnalyticsUserProperties(properties)`

Set user properties (automatic on login).

```typescript
await setAnalyticsUserProperties({
  role: 'ADMIN',
  plan: 'premium',
});
```

---

## Best Practices

### Event Naming

- Use snake_case for event names
- Be descriptive: `test_case_created` not `create`
- Include context: `project_deleted` not `delete`

### Parameters

- Keep parameters minimal
- Use consistent parameter names
- Avoid sensitive data
- Use IDs, not names (for privacy)

### Performance

- Analytics calls are async and non-blocking
- Events are queued and sent in batches
- Failed events don't break the application
- Analytics errors are logged but don't affect UX

---

## Related Documentation

- [Firebase Security](./../../firebase-security.md) - Security considerations
- [Configuration Guide](../../getting-started/configuration.md) - Environment setup
- [Authentication](../authentication/README.md) - User session management

---

## Migration Notes

### Removed Features (2025)

The following analytics features have been **removed** for privacy and performance:

1. **Dialog Tracking** - `trackDialog()` is no longer used
   - Previously tracked: Dialog open/close events
   - Removed from: All dialog components
   - Reason: Privacy concerns

2. **Form Tracking** - `trackForm()` is no longer used
   - Previously tracked: Form submission success/failure
   - Removed from: Login, Register, and all form dialogs
   - Reason: Privacy concerns and performance

**Impact:**
- No breaking changes for users
- Analytics still works for other events
- Button clicks and page views still tracked
- Custom events still available

---

## Examples

### Example: Track Project Creation

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function CreateProjectButton() {
  const { events } = useAnalytics();

  const handleCreate = async () => {
    const project = await createProject(data);
    
    // Track project creation
    await events.projectCreated(project.id);
  };

  return <Button onClick={handleCreate}>Create Project</Button>;
}
```

### Example: Track Search

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function SearchBar() {
  const { events } = useAnalytics();

  const handleSearch = async (query: string) => {
    const results = await search(query);
    
    // Track search
    await events.searchPerformed(query, results.length);
  };

  return <SearchInput onSearch={handleSearch} />;
}
```

### Example: Track Button Click

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function ActionButton() {
  const { trackButton } = useAnalytics();

  const handleClick = async () => {
    // Track button click
    await trackButton('Export Test Cases', {
      format: 'csv',
      projectId: projectId,
    });
    
    // Perform action
    await exportTestCases();
  };

  return <Button onClick={handleClick}>Export</Button>;
}
```

---

## Future Enhancements

- 🔔 **User Consent** - Opt-in/opt-out for analytics
- 📊 **Custom Dashboards** - Analytics dashboard in app
- 🎯 **Goal Tracking** - Track conversion goals
- 📈 **Funnel Analysis** - User journey tracking
- 🔍 **Advanced Filters** - Filter events by user, role, etc.

---

**Last Updated:** December 2025

