# Feature Components

This directory contains feature-specific components organized by domain.

## Directory Structure

Each feature folder follows a consistent pattern:

```
feature-name/
├── FeatureList.tsx              # Main list view
├── detail/                      # Detail pages
│   ├── FeatureDetail.tsx       # Main detail view
│   ├── subcomponents/          # Detail-specific components
│   │   ├── FeatureHeader.tsx
│   │   ├── FeatureInfoCard.tsx
│   │   └── ...
│   └── types.ts                # Detail view types
├── subcomponents/               # Feature-wide reusable components
│   ├── CreateFeatureDialog.tsx
│   ├── FeatureCard.tsx
│   ├── FeatureFilters.tsx
│   └── ...
├── types.ts                     # Feature domain types
└── constants/                   # Feature-specific constants
    └── index.ts
```

## Features

### `admin/`
Admin dashboard and user management:
- User CRUD operations
- Role management
- System administration

### `defect/`
Defect/bug tracking and management:
- Defect list and filtering
- Defect detail view with comments
- Create and link defects to test cases
- Defect lifecycle management

### `members/`
Project member management:
- Add/remove project members
- Role assignment
- Member list and details

### `profile/`
User profile management:
- View and edit profile
- Profile settings
- User information display

### `project/`
Project management:
- Project list and overview
- Project creation and settings
- Project dashboard and statistics

### `settings/`
Application and project settings:
- Project settings
- General configuration
- Danger zone (project deletion)

### `testcase/`
Test case management:
- Test case list and filtering
- Test case detail with steps
- Module organization
- Test case history

### `testruns/`
Test run execution and tracking:
- Test run list and creation
- Test run detail and execution
- Result recording
- Test run reports

### `testsuite/`
Test suite organization:
- Test suite list and hierarchy
- Test suite detail view
- Add/remove test cases
- Suite management

### Shared Components

#### `common/dialogs/`
Feature-agnostic dialog components used across multiple features.

#### `dialogs/`
Generic dialog utilities:
- ConfirmDeleteDialog
- CreateDialog

#### `form/`
Form building utilities:
- FormBuilder
- FormField

## Component Naming Conventions

### Suffixes
- **`*List.tsx`** - Main list/table view (e.g., `DefectList.tsx`)
- **`*Detail.tsx`** - Detail page view (e.g., `ProjectDetail.tsx`)
- **`*Card.tsx`** - Card component (e.g., `TestCaseCard.tsx`)
- **`*Dialog.tsx`** - Dialog/modal (e.g., `CreateDefectDialog.tsx`)
- **`*Form.tsx`** - Form component (e.g., `TestCaseForm.tsx`)
- **`*Header.tsx`** - Page header (e.g., `TestRunHeader.tsx`)
- **`*Settings.tsx`** - Settings page (e.g., `ProjectSettings.tsx`)

### Patterns
- Use **PascalCase** for all component files
- Use **descriptive names** that explain the component's purpose
- Prefix dialogs with action: `Create*`, `Edit*`, `Delete*`, `Link*`

## When to Use These Components

Use `frontend/components/` for:
- **Feature-specific logic** that's only used in one domain
- **Business logic components** with API calls
- **Page-level components** for app routes
- **Complex workflows** specific to a feature

## When to Use Root `components/` Instead

For **shared, reusable UI components** that are:
- Part of the design system
- Used across multiple features
- Layout or navigation elements
- Pure UI components without feature-specific logic

See `components/README.md` for shared component guidelines.

## Import Examples

```typescript
// Feature components
import DefectList from '@/frontend/components/defect/DefectList';
import TestCaseDetail from '@/frontend/components/testcase/detail/TestCaseDetail';
import { CreateProjectDialog } from '@/frontend/components/project/subcomponents/CreateProjectDialog';

// Types
import { Project, ProjectMember } from '@/frontend/components/project/types';
```

## Guidelines

1. **Feature Isolation** - Keep feature-specific logic within feature folders
2. **Co-locate Types** - Define types in `types.ts` next to components
3. **Subcomponents** - Use `subcomponents/` for feature-specific reusable parts
4. **Constants** - Keep magic numbers and enums in `constants/`
5. **API Calls** - Make API calls in page-level components, pass data down
6. **Loading States** - Always handle loading and error states
7. **Alerts** - Use FloatingAlert for user feedback

## Testing

Each feature should have its own test strategy:
- Unit tests for utility functions
- Component tests for UI logic
- Integration tests for workflows

## Related Directories

- **`components/`** - Shared UI components and design system
- **`elements/`** - Base UI primitives
- **`hooks/`** - Custom React hooks
- **`lib/`** - Utility functions and helpers
