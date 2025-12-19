# Shared Components

This directory contains reusable UI components used across the application.

## Directory Structure

### `common/`
Reusable business logic components that handle specific functionality:
- **AttachmentField** - File upload and attachment management
- **OtpVerification** - OTP verification UI
- **SendEmailDialog** - Email sending dialog
- **dialogs/** - Shared dialog components
- **tables/** - Shared table components

### `design/`
Design system components - the building blocks of the UI:
- **Alerts & Notifications** - FloatingAlert, InlineError
- **Dialogs** - BaseDialog, BaseConfirmDialog, ConfirmDialog
- **Navigation** - Navbar, Sidebar, TopBar, Breadcrumbs
- **Cards** - DataCard, DetailCard, ItemCard, StatCard, FeatureCard
- **Form Elements** - SearchableUserSelect, SearchInput, FilterBar
- **Badges & Status** - StatusBadge, PriorityBadge
- **Layout** - GlassPanel, GlassFooter, Section
- **User Components** - UserCard, Assignee
- **Data Display** - DataTable, EmptyState, ProgressBar

### `layout/`
Page layout wrappers and providers:
- **AppLayout** - Main application layout wrapper
- **ClientLayout** - Client-side layout with session handling
- **Providers** - React context providers
- **SettingsSidebar** - Settings page sidebar navigation

### `pages/`
Public and landing page components:
- **HomePage** - Landing page
- **LoginPageComponent** - Login page
- **RegisterPageComponent** - Registration page
- **PrivacyPolicyPage** - Privacy policy
- **subcomponents/** - Page-specific sub-components

## When to Use These Components

Use components from this directory when:
- The component is used across **multiple features**
- It's part of the **design system** (consistent UI patterns)
- It's a **layout or navigation** element
- It's a **public-facing page** component

## When to Use `frontend/components/` Instead

For feature-specific components that are only used within a single feature domain (e.g., defects, test cases, projects), use `frontend/components/[feature-name]/` instead.

## Import Examples

```typescript
// Design system components
import { FloatingAlert } from '@/components/design/FloatingAlert';
import { BaseDialog } from '@/components/design/BaseDialog';
import { TopBar } from '@/components/design';

// Common components
import { AttachmentField } from '@/components/common/AttachmentField';
import { OtpVerification } from '@/components/common/OtpVerification';

// Layout components
import { AppLayout } from '@/components/layout/AppLayout';
```

## Component Guidelines

1. **Reusability** - Components here should be reusable across features
2. **No Business Logic** - Keep complex business logic in feature components
3. **Props Over State** - Prefer controlled components with props
4. **TypeScript** - All components should be fully typed
5. **Documentation** - Add JSDoc comments for complex components

## Related Directories

- **`elements/`** - Base UI primitives (buttons, inputs, cards) based on Radix UI
- **`frontend/components/`** - Feature-specific components
- **`hooks/`** - Custom React hooks
