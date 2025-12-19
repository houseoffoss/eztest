# Component Structure Documentation

## Overview
This document describes the new component organization pattern for the EZTest application. Components are now organized by section with a clear separation between page files and component logic.

## Pattern Structure

### 1. Page Files (`app/[section]/page.tsx`)
Page files are kept minimal and only handle:
- Metadata configuration using CONFIG_SEO
- Component rendering

Example:
```typescript
import Component from '@/app/frontend/components/section/MainComponent';
import CONFIG_SEO from '@/config/configSEO';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: CONFIG_SEO.Section.title,
  description: CONFIG_SEO.Section.description,
};

const Page = () => {
  return <Component />;
};

export default Page;
```

### 2. Component Organization
Components are organized in `app/frontend/components/[section]/`:
```
app/frontend/components/
└── project/
    ├── types.ts                    # Shared TypeScript interfaces
    ├── ProjectList.tsx             # Main component for projects list
    ├── ProjectDetail.tsx           # Main component for project detail
    └── subcomponents/              # Section-specific subcomponents
        ├── ProjectCard.tsx
        ├── CreateProjectDialog.tsx
        ├── DeleteProjectDialog.tsx
        ├── EmptyProjectsState.tsx
        ├── StatCard.tsx
        ├── ProjectHeader.tsx
        └── ProjectOverviewCard.tsx
```

## Implemented Structure

### Projects Section

#### Files Created:
1. **config/configSEO.ts** - Centralized SEO metadata
2. **app/frontend/components/project/types.ts** - Shared TypeScript types
3. **app/frontend/components/project/ProjectList.tsx** - Main list component
4. **app/frontend/components/project/ProjectDetail.tsx** - Main detail component

#### Subcomponents:
**For ProjectList:**
- `ProjectCard.tsx` - Individual project card with stats
- `CreateProjectDialog.tsx` - Dialog for creating new projects
- `DeleteProjectDialog.tsx` - Confirmation dialog for project deletion
- `EmptyProjectsState.tsx` - Empty state when no projects exist

**For ProjectDetail:**
- `StatCard.tsx` - Reusable stats card component
- `ProjectHeader.tsx` - Project title and metadata header
- `ProjectOverviewCard.tsx` - Detailed project information card

#### Updated Page Files:
1. `app/projects/page.tsx` - Now minimal, imports ProjectList
2. `app/projects/[id]/page.tsx` - Now minimal, imports ProjectDetail

## Benefits of This Structure

### 1. Separation of Concerns
- Page files handle routing and metadata
- Components handle UI logic and state
- Subcomponents are reusable and testable

### 2. Better Organization
- All related components grouped together
- Clear hierarchy: Main Component → Subcomponents
- Easy to locate and maintain code

### 3. Type Safety
- Shared types in `types.ts` prevent duplication
- Consistent interfaces across all components
- Better IDE autocomplete and error detection

### 4. Reusability
- Subcomponents can be used in multiple contexts
- Main components can be imported anywhere
- Easy to create variations of existing components

### 5. Maintainability
- Changes to UI logic don't affect routing
- Metadata managed centrally in CONFIG_SEO
- Each file has a single, clear responsibility

## Usage Examples

### Creating a New Section

1. **Create types file:**
```typescript
// app/frontend/components/newsection/types.ts
export interface Item {
  id: string;
  name: string;
}
```

2. **Create main component:**
```typescript
// app/frontend/components/newsection/MainComponent.tsx
'use client';
import { SubComponent } from './subcomponents/SubComponent';

export default function MainComponent() {
  return <SubComponent />;
}
```

3. **Create subcomponents:**
```typescript
// app/frontend/components/newsection/subcomponents/SubComponent.tsx
'use client';
export const SubComponent = () => {
  return <div>Content</div>;
};
```

4. **Update CONFIG_SEO:**
```typescript
// config/configSEO.ts
export const CONFIG_SEO = {
  // ...existing
  NewSection: {
    title: 'New Section | EZTest',
    description: 'Description for new section',
  },
};
```

5. **Create page file:**
```typescript
// app/newsection/page.tsx
import MainComponent from '@/app/frontend/components/newsection/MainComponent';
import CONFIG_SEO from '@/config/configSEO';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: CONFIG_SEO.NewSection.title,
  description: CONFIG_SEO.NewSection.description,
};

const Page = () => {
  return <MainComponent />;
};

export default Page;
```

## Next Steps

This pattern should be applied to other sections:
- Test Cases section
- Settings section
- Members section
- Dashboard section

Each section should follow the same structure:
1. Create `app/frontend/components/[section]` folder
2. Add `types.ts` for shared interfaces
3. Create main component(s)
4. Create `subcomponents/` folder with reusable pieces
5. Update page files to import main components
6. Add SEO config to `config/configSEO.ts`

## Guidelines

### When to Create a Subcomponent
- Component is used in multiple places
- Component is complex and deserves its own file
- Component has distinct functionality (dialog, card, form, etc.)
- Component exceeds ~100 lines of code

### When to Keep Code in Main Component
- Simple, one-off UI elements
- Tightly coupled to parent state
- Less than ~30 lines of code
- No reuse potential

### Naming Conventions
- Main components: PascalCase, descriptive (e.g., `ProjectList`, `ProjectDetail`)
- Subcomponents: PascalCase, specific to function (e.g., `ProjectCard`, `CreateProjectDialog`)
- Types file: Always named `types.ts`
- Subcomponents folder: Always named `subcomponents/`

## TypeScript Best Practices

1. **Define interfaces in `types.ts`:**
   - Export all interfaces used across multiple files
   - Use descriptive names
   - Include JSDoc comments for complex types

2. **Import types consistently:**
   ```typescript
   import { Project, ProjectMember } from './types';
   ```

3. **Avoid `any` type:**
   - Always define proper interfaces
   - Use union types for flexibility
   - Use generics when appropriate

4. **Optional properties:**
   - Use `?` for properties that may not exist
   - Provide defaults in component logic
   - Handle undefined cases explicitly

## Conclusion

This component structure provides a scalable, maintainable, and developer-friendly approach to organizing frontend code. By following this pattern consistently across the application, we ensure code quality, type safety, and ease of maintenance.
