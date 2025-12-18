# Design System

EzTest design system documentation: colors, typography, spacing, and visual guidelines.

## Color Palette

### Primary Colors

| Name | Tailwind Class | Usage |
|------|----------------|-------|
| **Primary** | `bg-primary` | Primary actions, links |
| **Primary Foreground** | `text-primary-foreground` | Text on primary |
| **Secondary** | `bg-secondary` | Secondary buttons |
| **Accent** | `bg-accent` | Highlights |

### Semantic Colors

| Name | Color | Usage |
|------|-------|-------|
| **Success** | Green | Passed, active, success |
| **Error** | Red | Failed, critical, destructive |
| **Warning** | Yellow/Orange | Blocked, warnings |
| **Info** | Blue | Information, links |
| **Muted** | Gray | Disabled, inactive |

### Status Colors

```tsx
// Status color mapping
const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  DEPRECATED: 'bg-gray-100 text-gray-800',
  
  PASSED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  BLOCKED: 'bg-orange-100 text-orange-800',
  SKIPPED: 'bg-gray-100 text-gray-800',
  
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  FIXED: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};
```

### Priority Colors

```tsx
const priorityColors = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
};
```

---

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| **h1** | 2.25rem (36px) | Bold | Page titles |
| **h2** | 1.5rem (24px) | Semibold | Section headers |
| **h3** | 1.25rem (20px) | Semibold | Subsections |
| **h4** | 1.125rem (18px) | Medium | Card titles |
| **body** | 1rem (16px) | Normal | Body text |
| **small** | 0.875rem (14px) | Normal | Helper text |
| **xs** | 0.75rem (12px) | Normal | Labels, badges |

### Tailwind Classes

```tsx
// Headlines
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-semibold">Subsection</h3>

// Body text
<p className="text-base">Regular body text</p>
<p className="text-sm text-muted-foreground">Helper text</p>
<span className="text-xs">Label</span>
```

---

## Spacing

### Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| `1` | 0.25rem (4px) | Tight spacing |
| `2` | 0.5rem (8px) | Small gaps |
| `3` | 0.75rem (12px) | - |
| `4` | 1rem (16px) | Default |
| `5` | 1.25rem (20px) | - |
| `6` | 1.5rem (24px) | Section gaps |
| `8` | 2rem (32px) | Large gaps |
| `10` | 2.5rem (40px) | - |
| `12` | 3rem (48px) | Extra large |

### Common Patterns

```tsx
// Card padding
<div className="p-4 md:p-6">

// Section margin
<section className="mb-8">

// Form field spacing
<div className="space-y-4">
  <Input />
  <Input />
</div>

// Grid gap
<div className="grid gap-4 md:gap-6">
```

---

## Border Radius

| Size | Value | Class |
|------|-------|-------|
| Small | 0.25rem | `rounded` |
| Medium | 0.5rem | `rounded-md` |
| Large | 0.75rem | `rounded-lg` |
| XL | 1rem | `rounded-xl` |
| 2XL | 1.5rem | `rounded-2xl` |
| Full | 9999px | `rounded-full` |

### Usage

```tsx
// Cards and panels
<div className="rounded-xl">

// Buttons
<button className="rounded-md">

// Avatars
<div className="rounded-full">
```

---

## Shadows

### Shadow Scale

| Name | Usage |
|------|-------|
| `shadow-sm` | Subtle elevation |
| `shadow` | Cards, dropdowns |
| `shadow-md` | Popovers |
| `shadow-lg` | Modals, dialogs |
| `shadow-xl` | Floating elements |

### Glass Morphism Shadow

```tsx
// Glass panel with shadow
<div className="
  bg-white/80 
  backdrop-blur-md 
  shadow-lg 
  shadow-black/5
  border border-white/20
">
```

---

## Glass Morphism

### Standard Glass Panel

```tsx
<div className="
  bg-white/80 
  dark:bg-gray-900/80
  backdrop-blur-md 
  rounded-xl 
  shadow-lg
  border border-white/20
  dark:border-gray-700/50
">
  {/* Content */}
</div>
```

### Variations

```tsx
// Light glass
<div className="bg-white/60 backdrop-blur-sm">

// Medium glass (default)
<div className="bg-white/80 backdrop-blur-md">

// Heavy glass
<div className="bg-white/90 backdrop-blur-lg">

// Colored glass
<div className="bg-blue-500/10 backdrop-blur-md">
```

---

## Icons

### Icon Library

EzTest uses [Lucide React](https://lucide.dev/):

```tsx
import { 
  Home, 
  Settings, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
```

### Icon Sizes

| Size | Class | Usage |
|------|-------|-------|
| XS | `h-3 w-3` | Inline, badges |
| SM | `h-4 w-4` | Buttons, lists |
| MD | `h-5 w-5` | Navigation |
| LG | `h-6 w-6` | Headers |
| XL | `h-8 w-8` | Feature icons |

### Usage

```tsx
// Button with icon
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Create
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>

// Status icon
<CheckCircle className="h-4 w-4 text-green-500" />
```

---

## Animations

### Transitions

```tsx
// Default transition
<div className="transition-colors duration-200">

// All properties
<div className="transition-all duration-300">

// Specific property
<div className="transition-opacity duration-150">
```

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

### Tailwind Animation Classes

```tsx
<div className="animate-pulse">Loading...</div>
<div className="animate-spin">⟳</div>
<div className="animate-bounce">↓</div>
```

---

## Responsive Design

### Breakpoints

| Prefix | Width | Target |
|--------|-------|--------|
| (none) | < 640px | Mobile |
| `sm:` | ≥ 640px | Large mobile |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Desktop |
| `xl:` | ≥ 1280px | Large desktop |
| `2xl:` | ≥ 1536px | Extra large |

### Patterns

```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Show/hide
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

---

## Accessibility

### Focus States

```tsx
// Focus ring
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2
">

// Focus visible (keyboard only)
<button className="focus-visible:ring-2 focus-visible:ring-primary">
```

### Color Contrast

Minimum contrast ratios:
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

### Screen Reader

```tsx
// Visually hidden but accessible
<span className="sr-only">Close menu</span>

// Aria labels
<button aria-label="Delete item">
  <Trash2 />
</button>
```

---

## Component Patterns

### Card Pattern

```tsx
<div className="
  bg-white/80 
  backdrop-blur-md 
  rounded-xl 
  shadow-lg 
  border border-white/20 
  p-6
">
  <h3 className="text-lg font-semibold mb-4">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Form Pattern

```tsx
<form className="space-y-4">
  <div>
    <Label htmlFor="name">Name</Label>
    <Input id="name" className="mt-1" />
  </div>
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" className="mt-1" />
  </div>
  <Button type="submit" className="w-full">Submit</Button>
</form>
```

### List Pattern

```tsx
<ul className="divide-y divide-border">
  {items.map(item => (
    <li key={item.id} className="py-4 flex items-center justify-between">
      <span>{item.name}</span>
      <Button variant="ghost" size="sm">Edit</Button>
    </li>
  ))}
</ul>
```

---

## Related Documentation

- [UI Overview](../README.md)
- [Components Reference](../components/README.md)
