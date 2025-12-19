# UI Components & Design System

Documentation for EzTest's user interface components and design system.

## Overview

EzTest uses a modern UI stack:

- **React 19** - Component framework
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible primitives
- **Lucide Icons** - Icon library
- **Glass Morphism** - Visual design aesthetic

---

## Design Philosophy

### Principles

1. **Accessibility First** - WCAG 2.1 AA compliant
2. **Consistency** - Unified visual language
3. **Performance** - Optimized rendering
4. **Responsiveness** - Mobile to desktop

### Visual Style

EzTest features a modern glass morphism design:

- Semi-transparent backgrounds
- Blur effects
- Subtle shadows
- Clean typography

---

## Documentation Sections

| Section | Description |
|---------|-------------|
| [**Components**](./components/README.md) | Reusable UI components |
| [**Design System**](./design-system/README.md) | Colors, typography, spacing |
| [**Pages**](./pages/README.md) | Page layouts and structure |

---

## Component Library

### Layout Components

| Component | Location | Description |
|-----------|----------|-------------|
| `AppLayout` | `components/layout/` | Main app layout with sidebar |
| `Navbar` | `components/design/` | Top navigation bar |
| `Sidebar` | `components/design/` | Side navigation |
| `PageHeader` | `components/design/` | Page title and actions |

### Data Display

| Component | Location | Description |
|-----------|----------|-------------|
| `DataTable` | `components/design/` | Sortable, filterable tables |
| `DataCard` | `components/design/` | Card with data summary |
| `StatCard` | `components/design/` | Statistics card |
| `DetailCard` | `components/design/` | Detailed information card |
| `ItemCard` | `components/design/` | List item card |

### Form Components

| Component | Location | Description |
|-----------|----------|-------------|
| `BaseDialog` | `components/design/` | Modal dialog wrapper |
| `ConfirmDialog` | `components/design/` | Confirmation modal |
| `SearchInput` | `components/design/` | Search with debounce |
| `FilterBar` | `components/design/` | Filter controls |
| `FilterDropdown` | `components/design/` | Dropdown filter |

### Feedback Components

| Component | Location | Description |
|-----------|----------|-------------|
| `FloatingAlert` | `components/design/` | Toast notifications |
| `InlineError` | `components/design/` | Form error display |
| `EmptyState` | `components/design/` | Empty state placeholder |
| `ProgressBar` | `components/design/` | Progress indicator |

### Navigation

| Component | Location | Description |
|-----------|----------|-------------|
| `Breadcrumbs` | `components/design/` | Navigation breadcrumbs |
| `TopBar` | `components/design/` | Top navigation bar |

### Status & Badges

| Component | Location | Description |
|-----------|----------|-------------|
| `StatusBadge` | `components/design/` | Status indicator |
| `PriorityBadge` | `components/design/` | Priority indicator |

---

## Quick Start

### Using Components

```tsx
import { PageHeader, DataTable, StatCard } from '@/components/design';
import { Button } from '@/elements/button';

export default function MyPage() {
  return (
    <div>
      <PageHeader 
        title="Test Cases" 
        subtitle="Manage your test cases"
      >
        <Button>Create Test Case</Button>
      </PageHeader>
      
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total" value={125} />
        <StatCard title="Passed" value={98} color="success" />
        <StatCard title="Failed" value={12} color="error" />
      </div>
      
      <DataTable data={testCases} columns={columns} />
    </div>
  );
}
```

### Styling with Tailwind

```tsx
// Glass morphism panel
<div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
  {/* Content */}
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

---

## File Structure

```
components/
├── common/              # Feature-specific components
│   ├── AttachmentDisplay.tsx
│   ├── FileUploadModal.tsx
│   └── tables/
│       ├── DefectTable.tsx
│       └── TestCaseTable.tsx
│
├── design/              # Reusable design components
│   ├── index.ts        # Export barrel
│   ├── Breadcrumbs.tsx
│   ├── DataTable.tsx
│   ├── PageHeader.tsx
│   ├── StatCard.tsx
│   └── ... more
│
├── layout/              # Layout components
│   ├── AppLayout.tsx
│   ├── ClientLayout.tsx
│   └── Providers.tsx
│
├── pages/               # Page-specific components
│   ├── HomePage.tsx
│   └── subcomponents/
│
└── utils/               # Utility components
    └── FloatingAlert.tsx

elements/                # Base UI elements
├── button.tsx
├── input.tsx
├── select.tsx
└── ... Radix UI wrappers
```

---

## Theming

### CSS Variables

Define in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode values */
}
```

### Using Theme Colors

```tsx
// Tailwind classes using CSS variables
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Click me
  </button>
</div>
```

---

## Responsive Design

### Breakpoints

| Prefix | Min Width | Description |
|--------|-----------|-------------|
| `sm` | 640px | Small devices |
| `md` | 768px | Medium devices |
| `lg` | 1024px | Large devices |
| `xl` | 1280px | Extra large |
| `2xl` | 1536px | 2X Extra large |

### Usage

```tsx
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4
  gap-4
">
  {/* Responsive grid items */}
</div>
```

---

## Accessibility

### Guidelines

1. **Semantic HTML** - Use appropriate elements
2. **ARIA Labels** - Add labels for screen readers
3. **Keyboard Navigation** - All interactive elements focusable
4. **Color Contrast** - Minimum 4.5:1 ratio
5. **Focus Indicators** - Visible focus states

### Example

```tsx
<button
  aria-label="Delete test case"
  className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
>
  <Trash2 className="h-4 w-4" />
</button>
```

---

## Related Documentation

- [Components Reference](./components/README.md)
- [Design System](./design-system/README.md)
- [Pages Documentation](./pages/README.md)
