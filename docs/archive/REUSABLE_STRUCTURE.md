# Reusable Elements & Components Organization

This document outlines the new organized structure for reusable UI elements and components.

## 📁 Directory Structure

### `frontend/reusable-elements/`
Atomic, small, and fundamental UI elements that are building blocks for larger components.

```
reusable-elements/
├── alerts/
│   └── Alert.tsx                 # Alert, AlertTitle, AlertDescription
├── avatars/
│   └── Avatar.tsx                # Avatar, AvatarImage, AvatarFallback
├── badges/
│   └── Badge.tsx                 # Badge component with variants
├── buttons/
│   └── Button.tsx                # Base Button with multiple variants (default, glass, destructive, etc.)
├── cards/
│   └── Card.tsx                  # Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction
├── checkboxes/
│   └── Checkbox.tsx              # Checkbox with default and glass variants
├── dialogs/
│   └── Dialog.tsx                # Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription
├── dropdowns/
│   └── DropdownMenu.tsx          # DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, etc.
├── hover-cards/
│   └── HoverCard.tsx             # HoverCard, HoverCardTrigger, HoverCardContent
├── inputs/
│   └── Input.tsx                 # Input with default and glass variants
├── labels/
│   └── Label.tsx                 # Label component
├── loaders/
│   └── Loader.tsx                # Loader with sm, md, lg sizes
├── pagination/
│   └── Pagination.tsx            # Pagination component with page navigation
├── radios/
│   └── RadioGroup.tsx            # RadioGroup, RadioGroupItem
├── selects/
│   └── Select.tsx                # Select, SelectTrigger, SelectContent, SelectItem, SelectValue
├── separators/
│   └── Separator.tsx             # Separator (horizontal/vertical)
├── switches/
│   └── Switch.tsx                # Switch toggle with variants
├── tables/
│   └── BaseTable.tsx             # Table, TableHeader, TableBody, TableRow, TableCell, etc.
├── tabs/
│   └── Tabs.tsx                  # Tabs, TabsList, TabsTrigger, TabsContent
├── textareas/
│   └── Textarea.tsx              # Textarea with character count support
├── tooltips/
│   └── Tooltip.tsx               # Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
```

### `frontend/reusable-components/`
Composite components that combine multiple elements to create meaningful UI patterns.

```
reusable-components/
├── empty-states/
│   └── EmptyState.tsx            # EmptyState component (with icon, title, description, action)
```

## 🎯 Usage Examples

### Using Reusable Elements

```typescript
// Import atomic elements
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/frontend/reusable-elements/cards/Card';
import { Alert, AlertTitle, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';

// Use in your components
export function MyForm() {
  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" variant="glass" />
        <Button variant="glass-primary">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Using Reusable Components

```typescript
// Import composite components
import { EmptyState } from '@/frontend/reusable-components/empty-states/EmptyState';
import { SearchIcon } from 'lucide-react';

export function SearchResults() {
  return (
    <EmptyState
      icon={SearchIcon}
      title="No Results Found"
      description="Try adjusting your search criteria"
      actionLabel="Clear Filters"
      onAction={() => {}}
      variant="glass"
    />
  );
}
```

## 📋 Organization Principles

### Reusable Elements Characteristics
- ✅ Atomic and single-purpose
- ✅ No business logic
- ✅ Styled with Tailwind CSS and CVA variants
- ✅ Built on Radix UI primitives
- ✅ Support glass, default, and destructive variants
- ✅ Fully accessible (WCAG compliant)

### Reusable Components Characteristics
- ✅ Composite (made of multiple elements)
- ✅ May contain simple state management
- ✅ More domain-specific use cases
- ✅ Combine multiple elements and utilities
- ✅ Can be directly used in pages

## 🔄 Migration Notes

All UI elements have been organized from the following sources:
- **Previously in**: `elements/` → **Moved to**: `frontend/reusable-elements/`
- **Previously in**: `components/common/` → **Moved to**: `frontend/reusable-components/`
- **Previously in**: `components/design/` → **Available for**: `frontend/reusable-components/`

## 📦 Folder Naming Conventions

- **Folder names**: `plural-kebab-case` (e.g., `buttons/`, `inputs/`, `alert-dialogs/`)
- **File names**: `PascalCase` (e.g., `Button.tsx`, `Input.tsx`, `AlertDialog.tsx`)
- **Export names**: `PascalCase` (e.g., `export { Button }`)

## 🚀 Best Practices

1. **Keep elements simple**: One element = one clear purpose
2. **Use variants**: Instead of creating new components, use variants for styling differences
3. **Export all exports**: Make sure to export all sub-components (e.g., Button, ButtonVariants, etc.)
4. **Document props**: Add TypeScript types and JSDoc comments
5. **Test accessibility**: Ensure components pass accessibility tests
6. **Avoid business logic**: Keep elements presentational

## 🔗 Creating New Elements/Components

### Adding a New Element
1. Create a new folder in `frontend/reusable-elements/` with plural kebab-case name
2. Create a `[PascalCase].tsx` file (e.g., `Slider.tsx` in `sliders/` folder)
3. Export all components and types
4. Add to this documentation

### Adding a New Component
1. Create a new folder in `frontend/reusable-components/` with plural kebab-case name
2. Create a `[PascalCase].tsx` file
3. Combine multiple elements as needed
4. Export and document
5. Add to this documentation

