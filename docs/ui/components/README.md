# Component Reference

Detailed documentation for EzTest UI components.

## Component Categories

1. [Layout Components](#layout-components)
2. [Data Display](#data-display)
3. [Forms & Input](#forms--input)
4. [Feedback](#feedback)
5. [Navigation](#navigation)

---

## <a id="layout-components"></a>Layout Components

### AppLayout

Main application layout with sidebar navigation.

```tsx
import { AppLayout } from '@/components/layout/AppLayout';

<AppLayout>
  <YourPageContent />
</AppLayout>
```

**Features:**
- Responsive sidebar
- Collapsible navigation
- User menu
- Mobile drawer

### PageHeader

Page title section with actions.

```tsx
import { PageHeader } from '@/components/design';

<PageHeader 
  title="Test Cases"
  subtitle="Manage your test cases"
  breadcrumbs={[
    { label: 'Projects', href: '/projects' },
    { label: 'ECOM', href: '/projects/123' },
    { label: 'Test Cases' }
  ]}
>
  <Button>Create Test Case</Button>
</PageHeader>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Page title |
| `subtitle` | string | Optional subtitle |
| `breadcrumbs` | array | Breadcrumb items |
| `children` | ReactNode | Action buttons |

### GlassPanel

Glass morphism container panel.

```tsx
import { GlassPanel } from '@/components/design';

<GlassPanel className="p-6">
  <h2>Panel Content</h2>
</GlassPanel>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `className` | string | Additional classes |
| `children` | ReactNode | Panel content |

---

## <a id="data-display"></a>Data Display

### DataTable

Feature-rich data table.

```tsx
import { DataTable } from '@/components/design';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

<DataTable
  data={testCases}
  columns={columns}
  onRowClick={(row) => navigate(`/testcases/${row.id}`)}
  selectable
  onSelectionChange={(selected) => console.log(selected)}
  pagination={{
    page: 1,
    limit: 10,
    total: 100
  }}
  onPageChange={(page) => setPage(page)}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `data` | array | Table data |
| `columns` | array | Column definitions |
| `onRowClick` | function | Row click handler |
| `selectable` | boolean | Enable selection |
| `onSelectionChange` | function | Selection handler |
| `pagination` | object | Pagination config |
| `loading` | boolean | Loading state |

### StatCard

Statistics card with value and label.

```tsx
import { StatCard } from '@/components/design';

<StatCard
  title="Total Test Cases"
  value={125}
  icon={<FileText />}
  trend={{ value: 12, direction: 'up' }}
  color="primary"
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Card title |
| `value` | number/string | Main value |
| `icon` | ReactNode | Optional icon |
| `trend` | object | Trend indicator |
| `color` | string | Color theme |

### StatusBadge

Status indicator badge.

```tsx
import { StatusBadge } from '@/components/design';

<StatusBadge status="ACTIVE" />
<StatusBadge status="PASSED" />
<StatusBadge status="FAILED" />
```

**Status Colors:**

| Status | Color |
|--------|-------|
| ACTIVE, PASSED | Green |
| DRAFT, PENDING | Yellow |
| FAILED, CRITICAL | Red |
| BLOCKED | Orange |
| DEPRECATED | Gray |

### PriorityBadge

Priority indicator badge.

```tsx
import { PriorityBadge } from '@/components/design';

<PriorityBadge priority="CRITICAL" />
<PriorityBadge priority="HIGH" />
```

### DetailCard

Card for detailed information.

```tsx
import { DetailCard } from '@/components/design';

<DetailCard
  title="Test Case Details"
  items={[
    { label: 'Status', value: <StatusBadge status="ACTIVE" /> },
    { label: 'Priority', value: <PriorityBadge priority="HIGH" /> },
    { label: 'Created', value: '2024-01-15' },
  ]}
/>
```

### EmptyState

Placeholder for empty content.

```tsx
import { EmptyState } from '@/components/design';

<EmptyState
  icon={<FileQuestion />}
  title="No test cases found"
  description="Create your first test case to get started"
  action={
    <Button onClick={onCreate}>Create Test Case</Button>
  }
/>
```

---

## <a id="forms--input"></a>Forms & Input

### BaseDialog

Modal dialog wrapper.

```tsx
import { BaseDialog } from '@/components/design';

<BaseDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Create Test Case"
  description="Fill in the details below"
>
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">Create</Button>
    </div>
  </form>
</BaseDialog>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `open` | boolean | Dialog open state |
| `onOpenChange` | function | State change handler |
| `title` | string | Dialog title |
| `description` | string | Optional description |
| `children` | ReactNode | Dialog content |

### ConfirmDialog

Confirmation dialog.

```tsx
import { ConfirmDialog } from '@/components/design';

<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Test Case"
  description="Are you sure? This action cannot be undone."
  confirmLabel="Delete"
  confirmVariant="destructive"
  onConfirm={handleDelete}
/>
```

### SearchInput

Search input with debounce.

```tsx
import { SearchInput } from '@/components/design';

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search test cases..."
  debounceMs={300}
/>
```

### FilterBar

Filter controls container.

```tsx
import { FilterBar, FilterDropdown } from '@/components/design';

<FilterBar>
  <FilterDropdown
    label="Status"
    options={statusOptions}
    value={statusFilter}
    onChange={setStatusFilter}
  />
  <FilterDropdown
    label="Priority"
    options={priorityOptions}
    value={priorityFilter}
    onChange={setPriorityFilter}
  />
  <Button variant="outline" onClick={clearFilters}>
    Clear Filters
  </Button>
</FilterBar>
```

---

## <a id="feedback"></a>Feedback

### FloatingAlert

Toast notification.

```tsx
import { FloatingAlert, useAlert } from '@/components/design';

function MyComponent() {
  const { showAlert } = useAlert();
  
  const handleSave = async () => {
    try {
      await save();
      showAlert({
        type: 'success',
        message: 'Test case saved successfully'
      });
    } catch (error) {
      showAlert({
        type: 'error',
        message: 'Failed to save test case'
      });
    }
  };
}
```

**Types:**
- `success` - Green success message
- `error` - Red error message
- `warning` - Yellow warning message
- `info` - Blue info message

### InlineError

Form field error display.

```tsx
import { InlineError } from '@/components/design';

<div>
  <Input {...register('email')} />
  {errors.email && (
    <InlineError message={errors.email.message} />
  )}
</div>
```

### ProgressBar

Progress indicator.

```tsx
import { ProgressBar } from '@/components/design';

<ProgressBar
  value={75}
  max={100}
  label="Test Progress"
  showValue
/>
```

---

## <a id="navigation"></a>Navigation

### Breadcrumbs

Navigation breadcrumbs.

```tsx
import { Breadcrumbs } from '@/components/design';

<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'ECOM', href: '/projects/123' },
    { label: 'Test Cases' }
  ]}
/>
```

### Sidebar

Navigation sidebar.

```tsx
import { Sidebar } from '@/components/design';

<Sidebar
  items={[
    { label: 'Dashboard', icon: <Home />, href: '/dashboard' },
    { label: 'Projects', icon: <Folder />, href: '/projects' },
    { 
      label: 'Settings', 
      icon: <Settings />, 
      children: [
        { label: 'Profile', href: '/settings/profile' },
        { label: 'Account', href: '/settings/account' }
      ]
    }
  ]}
/>
```

---

## Base Elements

Located in `elements/` directory, these are styled wrappers around Radix UI primitives:

| Element | Description |
|---------|-------------|
| `Button` | Primary button component |
| `Input` | Text input field |
| `Select` | Dropdown select |
| `Checkbox` | Checkbox input |
| `Switch` | Toggle switch |
| `Tabs` | Tab navigation |
| `Dialog` | Modal dialog |
| `DropdownMenu` | Dropdown menu |

### Button Variants

```tsx
import { Button } from '@/elements/button';

<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>
```

---

## Related Documentation

- [UI Overview](../README.md)
- [Design System](../design-system/README.md)
