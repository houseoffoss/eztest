## How To Implement a Change (For Coding Agents)

This file gives step‑by‑step recipes for common change types. Always try to follow these patterns to stay consistent with the existing architecture.

### 1. Add a New Field to an Existing Domain (e.g. Defect, Test Case)

**Goal:** extend a model with a new property that is visible in API and UI.

1. **Update the Prisma schema**
   - Edit `prisma/schema.prisma` and add or adjust the field on the relevant model.
   - Keep naming and nullability consistent with similar fields.
2. **Generate and apply a migration**
   - Use the existing workflow (e.g. `prisma migrate dev` or project‑specific script as documented in operations/dev docs).
3. **Update backend validators**
   - Locate the relevant validator in `backend/validators/**` (e.g. `defect/index.ts`, `testcase.validator.ts`, `project.validator.ts`).
   - Add the field with correct Zod type in `create` and/or `update` schemas.
4. **Update services and controllers**
   - In `backend/controllers/<domain>/controller.ts`, make sure request parsing includes the new field.
   - In `backend/services/<domain>/services.ts`, pass the validated field to Prisma calls (`create`, `update`, filters, etc.).
5. **Update API documentation (optional but recommended)**
   - If the field is externally visible, update the relevant doc in `docs/api/*.md`.
6. **Update frontend types and UI**
   - Adjust any TypeScript types in `frontend/components/<domain>/types.ts`.
   - Update forms and detail views in `frontend/components/<domain>/**` to show/edit the new field.
7. **Respect permissions**
   - If the field should only be viewable/editable under certain roles, ensure checks are enforced using RBAC helpers (backend) and `hooks/usePermissions.ts` (frontend).

### 2. Add a New API Endpoint for an Existing Domain

**Goal:** create a new REST operation while keeping the API → controller → service pattern.

1. **Decide the URL and method**
   - Follow existing resource patterns: collections vs single resources vs side‑effect verbs.
   - For project‑scoped operations, prefer nesting under `app/api/projects/[id]/<domain>/.../route.ts`.
2. **Create the route handler**
   - Add or extend `app/api/.../route.ts` for the appropriate HTTP verb (e.g. `GET`, `POST`, `PATCH`, `DELETE`).
   - Use existing handlers for that domain as the template:
     - Get session: `const session = await getServerSession(authOptions);`
     - Handle `!session` as `401`.
     - Call the appropriate controller method inside `try/catch`.
     - Map domain errors to standardized JSON responses.
3. **Add or extend controller methods**
   - In `backend/controllers/<domain>/controller.ts`:
     - Add a static method (e.g. `static async bulkUpdate(...)`).
     - Parse query params and body.
     - Validate using Zod validators from `backend/validators/**`.
     - Call the corresponding service method with validated data plus user/project context.
4. **Implement service logic**
   - In `backend/services/<domain>/services.ts`:
     - Add a static method that performs the required Prisma queries and business logic.
     - Reuse shared patterns for pagination, filtering, and error handling.
5. **Wire up RBAC**
   - Ensure the controller or service checks permissions via RBAC helpers (e.g. verifying project membership and required permissions).
6. **Document the endpoint**
   - Update the corresponding file in `docs/api/*.md` with path, method, request/response, and permission requirements.

### 3. Add a New UI Feature for an Existing Domain

**Goal:** extend the UI while keeping consistency with the design system and data flow patterns.

1. **Find the right page**
   - Identify the route under `app/**/page.tsx` (e.g. `app/projects/[id]/defects/page.tsx` or a detail page under it).
2. **Locate feature components**
   - Use feature components in `frontend/components/<domain>/**` as the primary place for domain‑specific UI.
3. **Reuse reusable components**
   - Prefer using `frontend/reusable-components/**` (cards, tables, dialogs, forms, layouts) and `frontend/reusable-elements/**` for primitives.
4. **Fetch data appropriately**
   - For server components: call APIs or services on the server and pass data down.
   - For client components: use `fetch` or custom hooks to call the existing `/api/...` endpoints.
5. **Respect permissions**
   - Use `hooks/usePermissions.ts` to conditionally render actions/buttons and hide unauthorized operations.
6. **Keep styling and UX consistent**
   - Follow patterns from existing list/detail views within the same domain.

### 4. Add or Change a Permission / RBAC Rule

**Goal:** introduce a new permission or adjust behavior gated on existing permissions.

1. **Update RBAC definitions**
   - Modify RBAC definitions and seeds in Prisma and seed scripts (e.g. `prisma/seed-rbac.ts`).
2. **Propagate permission to JWT**
   - Ensure `lib/auth.ts` and any RBAC helpers include and expose the new permission as needed.
3. **Enforce on backend**
   - Add checks in controllers/services using `lib/rbac/**`.
4. **Reflect in UI**
   - Update `hooks/usePermissions.ts` and relevant UI components to show/hide actions according to the new permission.
5. **Update docs**
   - If permissions are user‑facing or documented, update RBAC docs in `docs/archive/RBAC_*.md` and feature docs where applicable.

### 5. General Do and Don’t List for Agents

- **Do**
  - **Do** follow the API → controller → service → Prisma layering.
  - **Do** reuse existing validators in `backend/validators/**` or extend them for new inputs.
  - **Do** respect RBAC checks and session handling as shown in existing API routes.
  - **Do** keep naming consistent (`controller.ts`, `services.ts`, `*.validator.ts`, `types.ts`).
  - **Do** add or update docs in `docs/api/**` and `docs/features/**` when you add externally visible behavior.

- **Don’t**
  - **Don’t** bypass validators by using raw request bodies directly in services.
  - **Don’t** add ad‑hoc Prisma calls in `app/api/**` route handlers when a controller/service already exists for that domain.
  - **Don’t** introduce new auth/permission mechanisms that conflict with `lib/auth.ts` or `lib/rbac/**`.
  - **Don’t** duplicate domain logic across multiple services; prefer a single clear home per domain.

Use this file together with [architecture-quickview.md](./architecture-quickview.md) and [domain-cheatsheets.md](./domain-cheatsheets.md) when planning or implementing non‑trivial changes.

