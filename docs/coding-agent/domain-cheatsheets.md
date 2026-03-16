## Domain Cheatsheets (For Coding Agents)

This file maps each core domain to its key backend, API, and frontend pieces so you can jump straight to the hot path.

> For conceptual/background explanations of each domain, use [docs/PROJECT_EXPLANATION.md](../PROJECT_EXPLANATION.md) and the feature docs under [docs/features/](../features/README.md).

### Projects

- **Backend**
  - Controller: `backend/controllers/project/controller.ts`
  - Service: `backend/services/project/services.ts`
  - Validators: `backend/validators/project.validator.ts`
- **API**
  - `app/api/projects/route.ts`
  - `app/api/projects/[id]/route.ts`
  - Nested: `app/api/projects/[id]/testcases/route.ts`, `.../testsuites/route.ts`, `.../testruns/route.ts`, `.../defects/route.ts`, `.../members/route.ts`, `.../modules/route.ts`
- **Frontend**
  - Pages: `app/projects/page.tsx`, `app/projects/[id]/page.tsx`
  - Components: `frontend/components/project/**`
- **Docs**
  - [docs/features/projects/README.md](../features/projects/README.md)
  - [docs/api/projects.md](../api/projects.md)

### Test Cases

- **Backend**
  - Controller: `backend/controllers/testcase/controller.ts`
  - Service: `backend/services/testcase/services.ts`
  - Validators: `backend/validators/testcase.validator.ts`, `backend/validators/testcase/defects.ts`
- **API**
  - Project‑scoped: `app/api/projects/[id]/testcases/route.ts`, `.../[testcaseId]/route.ts`, and related history/steps/attachments/defects routes under that folder.
  - Global: `app/api/testcases/[id]/route.ts`, `.../steps/route.ts`, `.../attachments/route.ts`, `.../history/route.ts`
- **Frontend**
  - Pages: `app/projects/[id]/testcases/page.tsx`
  - Components: `frontend/components/testcase/**` (list, detail, module views, dialogs)
- **Docs**
  - [docs/features/test-cases/README.md](../features/test-cases/README.md)
  - [docs/api/test-cases.md](../api/test-cases.md)

### Test Suites

- **Backend**
  - Controller: `backend/controllers/testsuite/controller.ts`
  - Service: `backend/services/testsuite/services.ts`
- **API**
  - Project‑scoped: `app/api/projects/[id]/testsuites/route.ts`, `.../[suiteId]/route.ts`, and routes under that folder for test cases and modules.
  - Global helpers: `app/api/testsuites/[id]/route.ts`, `app/api/testsuites/move/route.ts`, etc.
- **Frontend**
  - Pages: `app/projects/[id]/testsuites/page.tsx`
  - Components: `frontend/components/testsuite/**`
- **Docs**
  - [docs/features/test-suites/README.md](../features/test-suites/README.md)
  - [docs/api/test-suites.md](../api/test-suites.md)

### Test Runs

- **Backend**
  - Controller: `backend/controllers/testrun/controller.ts`
  - Service: `backend/services/testrun/services.ts`
  - Validator: `backend/validators/testrun.validator.ts`
- **API**
  - Project‑scoped runs: `app/api/projects/[id]/testruns/route.ts`, `.../[testrunId]/route.ts`, and sibling routes for `start`, `complete`, `send-report`, `export`, `upload-xml`, `import-xml`, `check-xml`.
  - Global helpers: `app/api/testruns/[id]/results/route.ts`, `.../send-report-email/route.ts`, `.../upload-xml-content/route.ts`
- **Frontend**
  - Pages: `app/projects/[id]/testruns/page.tsx`
  - Components: `frontend/components/testrun/**`
- **Docs**
  - [docs/features/test-runs/README.md](../features/test-runs/README.md)
  - [docs/api/test-runs.md](../api/test-runs.md)

### Defects

- **Backend**
  - Controller: `backend/controllers/defect/controller.ts`
  - Service: `backend/services/defect/services.ts`
  - Test case link service: `backend/services/defect/testcasedefect/service.ts`
  - Validator: `backend/validators/defect/index.ts`
- **API**
  - Project‑scoped: `app/api/projects/[id]/defects/route.ts` and nested routes (`statistics`, `export`, `bulk-assign`, `bulk-status`, `bulk-delete`, `import`, `import/template`).
  - Per‑defect: `app/api/projects/[id]/defects/[defectId]/route.ts`, `.../comments/route.ts`, `.../attachments/route.ts`, `.../send-assignment-email/route.ts`, `.../watchers/[userId]/route.ts`
  - Global helpers: `app/api/defects/[id]/route.ts`, `.../attachments/route.ts`, `.../send-assignment-email/route.ts`
- **Frontend**
  - Pages: `app/projects/[id]/defects/page.tsx`, `app/projects/[id]/defects/[defectId]/page.tsx`
  - Components: `frontend/components/defect/**`
- **Docs**
  - [docs/features/defects/README.md](../features/defects/README.md)
  - [docs/api/defects.md](../api/defects.md)
  - Background: `docs/archive/DEFECT_LIFECYCLE_UPDATE.md`, `docs/archive/DEFECT_FEATURE_COMPLETE.md`

### Modules

- **Backend**
  - Controller: `backend/controllers/module/controller.ts`
  - Service: `backend/services/module/services.ts`
  - Validator: `backend/validators/module.validator.ts`
- **API**
  - Project‑scoped: `app/api/projects/[id]/modules/route.ts`, `.../[moduleId]/route.ts`, `.../[moduleId]/testcases/route.ts`, `.../reorder/route.ts`
- **Frontend**
  - Module views for test cases: `frontend/components/testcase/module/**`
- **Docs**
  - [docs/features/modules/README.md](../features/modules/README.md)

### Members, Users, Roles, RBAC

- **Backend**
  - Controllers: `backend/controllers/user/controller.ts`, `backend/controllers/admin-user/controller.ts`, `backend/controllers/role/controller.ts`
  - Services: `backend/services/user/services.ts`, `backend/services/admin-user/services.ts`, `backend/services/role/services.ts`
  - Validators: `backend/validators/admin-user.validator.ts`
- **API**
  - Users: `app/api/users/route.ts`, `app/api/users/[id]/route.ts`, `app/api/users/account/route.ts`, `app/api/users/profile/route.ts`
  - Roles: `app/api/roles/route.ts`
  - Project members: `app/api/projects/[id]/members/route.ts`, `.../[memberId]/route.ts`
- **Frontend**
  - Project members: `app/projects/[id]/members/page.tsx`, `frontend/components/members/ProjectMembers.tsx` and subcomponents.
  - Admin users: `frontend/components/admin/users/**`
  - Permission helpers: `hooks/usePermissions.ts`
- **RBAC Core**
  - `lib/rbac/**`, Prisma seeds for roles/permissions in `prisma/seed-rbac.ts`
- **Docs**
  - `docs/archive/RBAC_PERMISSIONS.md`, `docs/archive/RBAC_IMPLEMENTATION_SUMMARY.md`, `docs/archive/RBAC_UPDATE_SUMMARY.md`
  - [docs/features/authentication/README.md](../features/authentication/README.md)

### Authentication & OTP

- **Backend**
  - Auth controller/service: `backend/controllers/auth/controller.ts`, `backend/services/auth/services.ts`
  - OTP controller/service: `backend/controllers/otp/controller.ts`, `backend/services/otp/services.ts`
  - Validators: `backend/validators/auth.validator.ts`
- **API**
  - NextAuth: `app/api/auth/[...nextauth]/route.ts`
  - Flows: `app/api/auth/register/route.ts`, `change-password/route.ts`, `reset-password/route.ts`, `forgot-password/route.ts`
  - OTP: `app/api/auth/otp/send/route.ts`, `.../resend/route.ts`, `.../verify/route.ts`
- **Frontend**
  - Pages: `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`
  - Components: reusable auth components in `frontend/reusable-components/auth/**`
- **Docs**
  - [docs/features/authentication/README.md](../features/authentication/README.md)
  - [docs/api/authentication.md](../api/authentication.md)

### Attachments & S3

- **Backend**
  - Controller: `backend/controllers/attachment/controller.ts`
  - Service: `backend/services/attachment/services.ts`
  - Validator: `backend/validators/attachment.validator.ts`
- **API**
  - Core: `app/api/attachments/upload/route.ts`, `.../part/route.ts`, `.../complete/route.ts`, `.../abort/route.ts`, `app/api/attachments/[id]/route.ts`
  - Domain links: `app/api/testcases/[id]/attachments/route.ts`, `app/api/defects/[id]/attachments/route.ts`, `app/api/comment-attachments/[id]/route.ts`, `app/api/teststeps/[stepId]/attachments/route.ts`
- **Lib**
  - `lib/s3-client.ts`, `lib/s3/**`, `lib/attachment-config.ts`, `lib/attachment-storage.ts`, `lib/file-parser.ts`
- **Frontend**
  - `frontend/reusable-components/attachments/**`, plus attachment UI embedded in defect and test case detail components.
- **Docs**
  - [docs/features/attachments/README.md](../features/attachments/README.md)
  - `docs/archive/ATTACHMENTS.md`

### Email

- **Backend**
  - Controller: `backend/controllers/email/controller.ts`
  - Service: `backend/services/email/services.ts`
- **Lib**
  - `lib/email-service.ts` – central email helper.
- **API**
  - Health/status: `app/api/email/status/route.ts`
  - Domain‑specific send routes under defects and test runs (e.g. `.../send-assignment-email`, `.../send-report-email`).
- **Docs**
  - [docs/features/email/README.md](../features/email/README.md)
  - `docs/archive/EMAIL_NOTIFICATIONS.md`, `docs/archive/ENABLE_SMTP_FEATURE.md`, `docs/archive/SMTP_DOCUMENTATION.md`

### Data Migration & Import/Export

- **Backend**
  - Controller: `backend/controllers/migration/controller.ts`
  - Services: `backend/services/migration/import/services.ts`, `backend/services/migration/export/services.ts`
  - Validator: `backend/validators/migration.validator.ts`
- **API**
  - Various import/export routes under `app/api/projects/[id]/defects/**`, `.../testruns/**`, and similar.
- **Docs**
  - [docs/features/data-migration/README.md](../features/data-migration/README.md)
  - `docs/MIGRATION_FEATURE.md`, `docs/archive/MIGRATION_GUIDE.md`

Use this file together with [directory-map.md](./directory-map.md) and [how-to-implement-change.md](./how-to-implement-change.md) when making cross‑cutting changes across a domain.

