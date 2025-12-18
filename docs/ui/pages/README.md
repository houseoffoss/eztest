# Page Documentation

Documentation for EzTest application pages and layouts.

## Page Structure

### File Organization

```
app/
├── page.tsx                    # Home page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
│
├── auth/                       # Authentication pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── dashboard/page.tsx          # Main dashboard
│
├── projects/                   # Project pages
│   ├── page.tsx               # Projects list
│   └── [id]/                  # Project detail
│       ├── page.tsx           # Project overview
│       ├── testcases/         # Test cases
│       ├── testsuites/        # Test suites
│       ├── testruns/          # Test runs
│       ├── defects/           # Defects
│       ├── members/           # Team members
│       └── settings/          # Project settings
│
├── settings/                   # User settings
│   ├── profile/page.tsx
│   └── account/page.tsx
│
└── admin/                      # Admin pages
    └── users/page.tsx
```

---

## Page Types

### List Pages

Display collections of items with filtering and pagination.

**Structure:**
```tsx
export default function ProjectsPage() {
  return (
    <div className="container py-6">
      <PageHeader 
        title="Projects" 
        subtitle="Manage your test projects"
      >
        <Button>Create Project</Button>
      </PageHeader>
      
      <FilterBar>
        <SearchInput />
        <FilterDropdown />
      </FilterBar>
      
      <DataTable 
        data={projects} 
        columns={columns} 
        pagination={pagination}
      />
    </div>
  );
}
```

**Examples:**
- `/projects` - Projects list
- `/projects/[id]/testcases` - Test cases list
- `/projects/[id]/testruns` - Test runs list
- `/projects/[id]/defects` - Defects list

### Detail Pages

Display single item with full details.

**Structure:**
```tsx
export default function TestCaseDetailPage({ params }) {
  return (
    <div className="container py-6">
      <PageHeader 
        title={testCase.title}
        breadcrumbs={breadcrumbs}
      >
        <Button variant="outline">Edit</Button>
        <Button variant="destructive">Delete</Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DetailCard title="Description" content={testCase.description} />
          <StepsCard steps={testCase.steps} />
        </div>
        <div>
          <MetadataCard testCase={testCase} />
          <AttachmentsCard attachments={testCase.attachments} />
        </div>
      </div>
    </div>
  );
}
```

### Form Pages

Create or edit items.

**Structure:**
```tsx
export default function CreateTestCasePage() {
  return (
    <div className="container py-6">
      <PageHeader 
        title="Create Test Case"
        breadcrumbs={breadcrumbs}
      />
      
      <GlassPanel className="max-w-2xl p-6">
        <TestCaseForm onSubmit={handleSubmit} />
      </GlassPanel>
    </div>
  );
}
```

### Dashboard Pages

Overview with statistics and summaries.

**Structure:**
```tsx
export default function DashboardPage() {
  return (
    <div className="container py-6">
      <PageHeader title="Dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Projects" value={stats.projects} />
        <StatCard title="Test Cases" value={stats.testCases} />
        <StatCard title="Pass Rate" value={`${stats.passRate}%`} />
        <StatCard title="Open Defects" value={stats.openDefects} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard />
        <ProjectsOverviewCard />
      </div>
    </div>
  );
}
```

---

## Key Pages

### Home Page (`/`)

Public landing page with:
- Hero section
- Features grid
- Statistics
- Call to action

### Dashboard (`/dashboard`)

Main dashboard after login:
- Project overview cards
- Recent activity
- Quick stats
- Quick actions

### Projects (`/projects`)

Project management:
- Project list with cards
- Search and filter
- Create project button
- Project statistics

### Project Detail (`/projects/[id]`)

Single project view with tabs:
- Overview (stats, recent)
- Test Suites (hierarchy)
- Test Cases (list)
- Test Runs (list)
- Defects (list)
- Members (team)
- Settings (config)

### Test Case Detail (`/projects/[id]/testcases/[tcId]`)

Test case view:
- Title and metadata
- Description
- Steps list
- Attachments
- Execution history
- Linked defects

### Test Run Execution (`/projects/[id]/testruns/[runId]`)

Test execution interface:
- Progress overview
- Test case list
- Result recording
- Comment entry
- Attachment upload

### Settings (`/settings`)

User settings:
- Profile information
- Password change
- Account settings
- Preferences

### Admin (`/admin`)

Admin-only pages:
- User management
- Role management
- System settings

---

## Layout Components

### Root Layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### App Layout

```tsx
// Used for authenticated pages
<AppLayout>
  <Sidebar />
  <main>
    <TopBar />
    {children}
  </main>
</AppLayout>
```

### Auth Layout

```tsx
// Used for auth pages (login, register)
<div className="min-h-screen flex">
  <LeftPanel />
  <main className="flex-1 flex items-center justify-center">
    {children}
  </main>
</div>
```

---

## Navigation Patterns

### Sidebar Navigation

```tsx
const sidebarItems = [
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
];
```

### Breadcrumbs

```tsx
const breadcrumbs = [
  { label: 'Projects', href: '/projects' },
  { label: 'ECOM', href: '/projects/123' },
  { label: 'Test Cases', href: '/projects/123/testcases' },
  { label: 'tc1' } // Current page, no href
];
```

### Tab Navigation

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="testcases">Test Cases</TabsTrigger>
    <TabsTrigger value="testruns">Test Runs</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="testcases">...</TabsContent>
  <TabsContent value="testruns">...</TabsContent>
</Tabs>
```

---

## Related Documentation

- [UI Overview](../README.md)
- [Components](../components/README.md)
