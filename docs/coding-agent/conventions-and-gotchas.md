## Conventions and Gotchas (For Coding Agents)

This file highlights the most important conventions and non‑obvious details you should respect when editing EZTest.

### Key Conventions (Condensed)

For full details see [docs/architecture/patterns.md](../architecture/patterns.md).

- **Layering**
  - API routes: `app/api/**/route.ts`
  - Controllers: `backend/controllers/<domain>/controller.ts`
  - Services: `backend/services/<domain>/services.ts`
  - Validators: `backend/validators/**`
  - Data access: `lib/prisma.ts`

- **File naming**
  - Components: `PascalCase.tsx`
  - Routes: `route.ts`
  - Pages: `page.tsx`
  - Services: `services.ts`
  - Validators: `<domain>.validator.ts` or `index.ts` inside domain folder.
  - Types (frontend): `types.ts` next to components.

- **Responses**
  - APIs return JSON with clear `data` and pagination objects where applicable.
  - Errors follow a consistent shape with fields like `error`, `message`, `statusCode`, and optional `details`.

- **Validation**
  - Always validate incoming data with Zod before calling services.
  - Use `safeParse` and return/throw structured validation errors.

### Auth & RBAC Gotchas

- **Session source**
  - Use `getServerSession(authOptions)` from `lib/auth.ts` in API routes and server components.
  - Don’t manually read cookies or tokens unless following an existing pattern.
- **Permissions**
  - Permissions live in JWTs and are enforced both:
    - In backend: via `lib/rbac/**` and explicit checks in controllers/services.
    - In frontend: via `hooks/usePermissions.ts`.
  - When adding new protected behavior, update both backend checks and UI gating.

### Path & Platform Quirks

- Some internal references may appear with Windows‑style backslashes (e.g. `backend\services\email\services.ts`) in commit history or docs; treat them as the same logical paths as the POSIX `backend/services/email/services.ts`.
- The canonical on‑disk layout in this repo follows forward‑slash paths as reflected in imports.

### Side‑Effect Boundaries

- **Email**
  - Central helper: `lib/email-service.ts`.
  - Domain services (defect, test run, email service) call this helper rather than implementing SMTP logic directly.
  - When adding new notification types, prefer to:
    - Add a method in `backend/services/email/services.ts` or the relevant domain service.
    - Reuse `email-service` and existing config patterns.

- **Attachments / S3**
  - Use S3 helpers from `lib/s3/**` and `lib/attachment-storage.ts`.
  - Avoid embedding raw S3 client logic in controllers; keep it in services/libraries.

### Data & Pagination Patterns

- Services commonly implement paginated list methods returning:
  - `data: T[]`
  - `pagination: { page, limit, total, pages }`
- When extending list endpoints:
  - Keep query parameters (`page`, `limit`, filters) consistent.
  - Maintain the same pagination structure in responses.

### Testing Reality Check

- The `tests/` directory is present but may have limited or no automated coverage for some flows.
- When inferring correct behavior, prioritize:
  1. Existing implementations in the same domain.
  2. API docs in `docs/api/**`.
  3. Feature docs in `docs/features/**`.
  4. Archived implementation notes in `docs/archive/**`.

### Before You Commit Large Changes

- Cross‑check your edits against:
  - [architecture-quickview.md](./architecture-quickview.md) – to ensure you respected the layering.
  - [domain-cheatsheets.md](./domain-cheatsheets.md) – to see if all affected pieces in the domain were updated.
  - [how-to-implement-change.md](./how-to-implement-change.md) – to verify you followed the recommended recipe.

