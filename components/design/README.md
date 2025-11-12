# Design components (glassmorphism)

Reusable glass-styled building blocks for the EZTest UI. Each component composes existing primitives in `components/ui/*` and follows the app's glassmorphism theme.

- GlassPanel: Frosted container (wrapper around Card) with optional heading, subheading, action, and footer.
- PageHeader: Page-level heading with optional breadcrumbs and actions.
- StatCard: Metric card with label, value, optional delta and help text.
- StatusBadge: Test run/case statuses (passed, failed, skipped, running, blocked, queued).
- PriorityBadge: Priority levels (low, medium, high, critical).
- Assignee: Avatar + name/email snippet.
- ProgressBar: Gradient progress with glass track.
- EmptyState: Centered placeholder with optional actions.
- FilterBar: Glass toolbar for filters and actions.
- Section: Layout helper for titled sections.
- ConfirmDialog: Reusable confirmation dialog with glass content.

Usage examples are shown in `app/ui/page.tsx`. Prefer composing these before introducing new one-off UI.
