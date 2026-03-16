## EZTest Coding Agent Guide

**Audience:** automated coding agents working on the EZTest codebase.  
**Goal:** give you a fast, safe mental model so you can implement or modify features without re-reading all docs.

### What EZTest Is

EZTest is a self‑hostable test management platform for projects, test suites, test cases, test runs, defects, modules, attachments, and RBAC‑secured collaboration.  
High‑level product context and workflows are described in:
- [docs/PROJECT_EXPLANATION.md](../PROJECT_EXPLANATION.md)
- [docs/README.md](../README.md)

### Stack & Architecture (Very Short)

- **Framework:** Next.js 15 App Router, React 19, TypeScript.
- **Backend:** Next.js API routes under `app/api/**`, layered through `backend/controllers/**` → `backend/services/**` → `lib/prisma.ts` (Prisma → PostgreSQL).
- **Auth & RBAC:** NextAuth (`lib/auth.ts`), JWT with permissions, helpers in `lib/rbac/**`, UI permission helpers in `hooks/usePermissions.ts`.
- **Storage & Integrations:** AWS S3 for attachments (`lib/s3/**`), Nodemailer for email (`lib/email-service.ts`), Firebase analytics (`lib/firebase/**`).

For a visual and deeper explanation, see:
- [docs/architecture/README.md](../architecture/README.md)
- [docs/architecture/patterns.md](../architecture/patterns.md)

### First-Minute Checklist for Agents

1. **Understand the layering pattern**
   - Read this folder’s [architecture-quickview.md](./architecture-quickview.md).
   - Skim [docs/architecture/patterns.md](../architecture/patterns.md) for real code templates.
2. **Locate the domain you need**
   - Use [directory-map.md](./directory-map.md) to jump to `app/api/**`, `backend/**`, `frontend/**`, `lib/**`, `prisma/**`.
   - Use [domain-cheatsheets.md](./domain-cheatsheets.md) to find controllers, services, validators, API routes, and UI components for key domains (projects, test cases, test suites, test runs, defects, modules, members, attachments, auth, email, migration).
3. **Follow the standard change recipe**
   - When adding fields/endpoints/features, follow [how-to-implement-change.md](./how-to-implement-change.md) so schema, validators, services, UI, and permissions stay in sync.
4. **Respect conventions and constraints**
   - Keep to the patterns and naming in [conventions-and-gotchas.md](./conventions-and-gotchas.md) and [docs/architecture/patterns.md](../architecture/patterns.md).

### When You Need More Detail

From this folder, dive deeper into existing docs as needed:

- **Concepts & workflows:** [docs/PROJECT_EXPLANATION.md](../PROJECT_EXPLANATION.md)
- **Features:** [docs/features/README.md](../features/README.md) and per‑feature docs (projects, test cases, test suites, test runs, defects, attachments, authentication, email, data‑migration).
- **API:** [docs/api/README.md](../api/README.md) and per‑resource docs.
- **UI:** [docs/ui/README.md](../ui/README.md)
- **Operations:** [docs/operations/README.md](../operations/README.md)

Use this folder as your primary entrypoint; only drop to the full docs tree when you need exhaustive background.

