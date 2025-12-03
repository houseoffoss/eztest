# Form Persistence Feature

## Overview

EZTest now automatically persists form data across tab navigation and page refreshes using sessionStorage. This ensures users never lose their work when accidentally navigating away from a form.

## How It Works

The `useFormPersistence` hook automatically saves form data to sessionStorage as users type. When users return to a form (even after closing the tab), their data is restored exactly as they left it.

### Key Features

- **Automatic Saving**: Form data is saved in real-time as users type
- **Smart Expiry**: Persisted data expires after a configurable time (default varies by form)
- **Security First**: Sensitive fields like passwords are excluded from persistence
- **Seamless UX**: Works transparently - users don't need to do anything
- **Clean Cleanup**: Data is automatically cleared after successful form submission

## Usage

### Basic Example

```typescript
import { useFormPersistence } from '@/hooks/useFormPersistence';

function MyForm() {
  const [formData, setFormData, clearFormData] = useFormPersistence(
    'my-form-key', // Unique identifier for this form
    {
      name: '',
      email: '',
      message: ''
    }
  );

  const handleSubmit = async () => {
    // ... submit logic
    clearFormData(); // Clear after successful submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {/* ... */}
    </form>
  );
}
```

### Advanced Options

```typescript
const [formData, setFormData, clearFormData] = useFormPersistence(
  'my-form',
  initialData,
  {
    // Auto-clear after 30 minutes of inactivity
    expiryMs: 30 * 60 * 1000,
    
    // Don't persist sensitive fields
    excludeFields: ['password', 'creditCard'],
    
    // Disable persistence (useful for testing)
    enabled: true
  }
);
```

## Where It's Implemented

### BaseDialog Component
All dialogs using `BaseDialog` automatically have form persistence enabled. Each dialog generates a unique key based on its title.

**Forms include:**
- Create Project Dialog
- Create Test Case Dialog
- Create Test Suite Dialog
- Create Module Dialog
- And all other BaseDialog instances

### Standalone Forms

#### Authentication Forms
- **Login Form**: Persists email only (passwords excluded) for 24 hours
- **Register Form**: Persists name and email (passwords excluded) for 24 hours
- **Forgot Password**: Persists email for 1 hour

#### Test Management Forms
- **Create Test Case (inline)**: Project-specific persistence for 1 hour
- **Record Test Result**: Test run-specific persistence for 30 minutes

## Configuration by Form

| Form | Persistence Key | Expiry | Excluded Fields |
|------|----------------|--------|-----------------|
| Login | `login-form` | 24 hours | `password` |
| Register | `register-form` | 24 hours | `password`, `confirmPassword` |
| Forgot Password | `forgot-password-form` | 1 hour | None |
| Create Test Case | `create-testcase-{projectId}` | 1 hour | None |
| Test Result | `testrun-result-{testRunId}` | 30 minutes | None |
| BaseDialog Forms | `dialog-{title}` | 1 hour | None |

## Technical Details

### Storage Mechanism
- Uses `sessionStorage` (data cleared when browser/tab closes)
- Falls back gracefully if storage is unavailable
- Handles quota errors and corrupted data

### Data Format
```typescript
// Stored in sessionStorage
{
  "form_my-form": '{"name":"John","email":"john@example.com"}',
  "form_my-form_timestamp": "1701619200000"
}
```

### Type Safety
The hook is fully typed using TypeScript generics:

```typescript
interface MyFormData {
  name: string;
  email: string;
}

const [formData, setFormData, clearFormData] = useFormPersistence<MyFormData>(...);
// formData is properly typed as MyFormData
```

### Security Considerations

1. **Password Exclusion**: All password fields are excluded by default in auth forms
2. **Session Only**: Uses sessionStorage (not localStorage) for privacy
3. **Auto-Expiry**: All data expires after configured time
4. **Clear on Success**: Data is cleared after successful submission
5. **Clear on Sign-Out**: All persisted form data is automatically cleared when user signs out

## Best Practices

### ✅ Do's
- Use descriptive, unique keys for each form
- Always clear form data after successful submission
- Exclude sensitive fields from persistence
- Set appropriate expiry times based on form usage

### ❌ Don'ts
- Don't persist credit card numbers or passwords
- Don't use the same key for different forms
- Don't forget to clear data on success
- Don't set extremely long expiry times unnecessarily

## Troubleshooting

### Form data not persisting
1. Check browser console for storage errors
2. Verify `enabled: true` in options
3. Ensure unique `formKey` is provided
4. Check if sessionStorage is available

### Form data not clearing
1. Verify `clearFormData()` is called after success
2. Check for multiple submit handlers
3. Ensure success callback is executed

### Old data showing up
1. Data may be from previous session if within expiry
2. Manually clear with: `clearPersistedForm('form-key')`
3. Reduce `expiryMs` if needed

## Sign-Out Cleanup

All persisted form data is automatically cleared when a user signs out for security and privacy. This is handled by the `clearAllPersistedForms()` utility which:

- Clears all sessionStorage keys starting with `form_`
- Runs before the sign-out redirect
- Ensures no data persists after user logs out

**Implemented in:**
- `TopBar` component (dropdown sign-out)
- `ProjectList` component (sign-out button)
- `ProfileHeader` component (form-based sign-out)
- `UserDetailsContent` component (admin view sign-out)
- `SessionManagement` component (sign-out all sessions)

## Future Enhancements

Potential improvements for future versions:
- Optional encryption for sensitive data
- Cross-tab synchronization
- Conflict resolution for concurrent edits
- Automatic draft saving with timestamps
- User notification of restored data
