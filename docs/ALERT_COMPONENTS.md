# Reusable Alert Components

This document describes the reusable alert components for consistent error/success messaging across the application.

## Components

### FloatingAlert (Only Component Used)

**Location**: `components/utils/FloatingAlert.tsx`

Displays floating notifications at the bottom-right of the screen. Used for ALL success and error messages across the application. This is the single, unified alert component.

**Props**:
```typescript
interface FloatingAlertProps {
  alert: FloatingAlertMessage | null;
  onClose: () => void;
}

interface FloatingAlertMessage {
  type: 'success' | 'error';
  title: string;
  message: string;
}
```

**Usage Pattern - Page Level Operations**:
```tsx
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';

export default function MyPage() {
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  const handleSuccess = () => {
    setAlert({
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully'
    });
    setTimeout(() => setAlert(null), 5000); // Auto-dismiss
  };

  return (
    <>
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
      {/* Rest of page */}
    </>
  );
}
```

**Usage Pattern - Dialog Error Handling**:
```tsx
interface DialogProps {
  onError?: (alert: FloatingAlertMessage) => void;
}

export const MyDialog = ({ onError }: DialogProps) => {
  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/endpoint');
      if (!response.ok) {
        const data = await response.json();
        if (onError) {
          onError({
            type: 'error',
            title: 'Error Title',
            message: data.message || 'Failed to perform action'
          });
        }
      }
    } catch (err) {
      if (onError) {
        onError({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
  };

  return <Dialog>{/* form */}</Dialog>;
};
```

**Styling**:
- Success: Green background (green-500/20) with green-500/30 border
- Error: Red background (red-500/10) with red-500/30 border
- Position: Bottom-right corner, fixed positioning
- Animation: Slides in from bottom

---

## Implementation Pattern

### Single Alert State at Page Level

1. Import FloatingAlert component
2. Create alert state at page/layout level
3. Pass `setAlert` callback to all dialogs via `onError` prop
4. Render FloatingAlert once at top level

**Example**:
```tsx
export default function ProjectList() {
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  return (
    <>
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
      
      <CreateProjectDialog onError={setAlert} />
      <DeleteProjectDialog onError={setAlert} />
    </>
  );
}
```

### Triggering Alerts from Dialogs

Dialogs accept `onError` callback and call it with FloatingAlertMessage:

```tsx
const handleDelete = async () => {
  try {
    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json();
      onError?.({
        type: 'error',
        title: 'Failed to Delete',
        message: data.message || 'Operation failed'
      });
    }
  } catch (err) {
    onError?.({
      type: 'error',
      title: 'Error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
```

---

## Error Message Handling

Errors from backend follow this format:

```json
{
  "message": "User already exists",
  "data": null
}
```

**Error Priority**:
1. `data.message` (preferred, from backend handler)
2. `data.error` (fallback)
3. Generic message (fallback)

---

## Applied Components

The following pages now use FloatingAlert:

- ✅ `ProjectList.tsx` - Page-level alerts with FloatingAlert
- ✅ `CreateProjectDialog.tsx` - Error callback to parent alert
- ✅ `DeleteProjectDialog.tsx` - Error callback to parent alert

---

## Migration Path from InlineError

Previously used `InlineError` component (now removed):
- ❌ InlineError - **REMOVED, not used anywhere**

New approach:
- ✅ FloatingAlert - **Single unified alert component**
- All error handling now funnels through parent page's FloatingAlert
- Cleaner dialogs, no duplicate error state
- Consistent UX across entire application

---

## Benefits

- **DRY**: Single alert component everywhere
- **Consistency**: Same styling and behavior app-wide
- **Maintainability**: Update styling in one place
- **Type-safe**: Full TypeScript support
- **Scalable**: Easy to extend to all pages (TestCases, TestRuns, etc.)
- **Clean Dialogs**: No inline error states cluttering component logic
