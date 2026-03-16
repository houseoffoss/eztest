## Directory Map (For Coding Agents)

This file is an opinionated, condensed map of where to look first for different kinds of changes.

### Top-Level Layout

- `app/` – Next.js 15 App Router
  - `app/layout.tsx` – root layout.
  - `app/page.tsx` – public landing page.
  - `app/dashboard/page.tsx` – main authenticated dashboard.
  - `app/projects/**/page.tsx` – project‑scoped pages (test cases, test suites, test runs, defects, members, settings, modules).
  - `app/auth/**/page.tsx` – login/register/password flows.
  - `app/admin/**/page.tsx` – admin UIs.
  - `app/api/**/route.ts` – REST API entrypoints for all domains.

- `backend/`
  - `backend/controllers/` – controllers per domain (e.g. `defect/controller.ts`, `testcase/controller.ts`, `project/controller.ts`).
  - `backend/services/` – services per domain (e.g. `defect/services.ts`, `project/services.ts`, `testrun/services.ts`).
  - `backend/validators/` – Zod validators per domain (e.g. `project.validator.ts`, `testcase.validator.ts`, `defect/index.ts`).
  - `backend/utils/` – shared backend utilities (exceptions, interceptors).

- `frontend/`
  - `frontend/components/`
    - Feature‑oriented components grouped by domain:
      - `project/`, `testcase/`, `testsuite/`, `testrun/`, `defect/`, `members/`, `apikeys/`, `settings/`, etc.
  - `frontend/reusable-components/`
    - Higher‑level reusable UI like cards, tables, dialogs, layout, auth widgets, attachments.
  - `frontend/reusable-elements/`
    - Low‑level primitives (buttons, inputs, dropdowns, textareas, alerts, pagination, stats).

- `lib/`
  - `lib/auth.ts` – NextAuth config.
  - `lib/auth-utils.ts`, `lib/auth/getSessionUser.ts`, `lib/auth/apiKeyAuth.ts` – auth helpers.
  - `lib/prisma.ts` – Prisma client singleton.
  - `lib/rbac/**` – RBAC helpers and types.
  - `lib/s3/**` – S3 client and upload utilities.
  - `lib/attachment-config.ts`, `lib/attachment-storage.ts`, `lib/file-parser.ts` – attachment plumbing.
  - `lib/email-service.ts` – email sending abstraction.
  - `lib/utils.ts`, date utilities, sidebar config/context, Firebase config/analytics.

- `prisma/`
  - `schema.prisma` – data model and relations.
  - `migrations/**` – migration history.
  - `seed*.ts` – seed scripts (including RBAC and dropdown options).

- `docs/`
  - Full documentation tree (product, features, API, architecture, operations, integrations, contributing).
  - This folder: `docs/coding-agent/**` – entrypoint for coding agents.

### How to Use This Map

- **Need to add/extend an API endpoint?**
  - Start: `app/api/<domain>/**/route.ts`
  - Then: corresponding `backend/controllers/<domain>/controller.ts`
  - Then: `backend/services/<domain>/services.ts`
  - Then: any relevant validators in `backend/validators/**` and Prisma models in `prisma/schema.prisma`.

- **Need to change UI behavior for a domain?**
  - Start: `app/projects/[id]/<domain>/page.tsx` (or related `app/**/page.tsx`).
  - Then: feature components in `frontend/components/<domain>/**`.
  - Reuse `frontend/reusable-components/**` and `frontend/reusable-elements/**` for shared UI pieces.

- **Need to adjust core infrastructure (auth, RBAC, storage, email)?**
  - Auth & sessions: `lib/auth.ts`, `lib/auth-utils.ts`, `lib/auth/getSessionUser.ts`.
  - Permissions: `lib/rbac/**`, `hooks/usePermissions.ts`.
  - Attachments/S3: `lib/s3/**`, `lib/attachment-storage.ts`, `backend/services/attachment/services.ts`.
  - Email: `lib/email-service.ts`, `backend/services/email/services.ts`, plus domain services that send email (defects, test runs).

For domain‑specific file lists and relationships, see [domain-cheatsheets.md](./domain-cheatsheets.md).

