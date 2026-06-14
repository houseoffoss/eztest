# EZTest Automation API

Programmatic access to the testing domain — test cases, steps, suites, modules,
runs, results, and defects — for building automation workflows.

- **Interactive reference (Swagger UI):** `/api/docs`
- **Machine-readable spec (OpenAPI 3.1):** `/api/openapi.json`

The spec is the source of truth for request/response shapes. This page covers
the cross-cutting conventions.

## Authentication

Every endpoint requires an API key. Create one under **Settings → Account**, then
send it on every request:

```
Authorization: Bearer ez_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The header value `ApiKey ez_xxx` is also accepted.

- A key **inherits the full permissions of the user who created it.** There are
  no per-key permission subsets.
- A **project-scoped** key can only access endpoints under its own project; a
  **global** key can access every project its owner is a member of (admins: all
  projects).
- `401` = missing/invalid/expired key. `403` = valid key without the required
  permission or project access.

## Response conventions

| Case | Shape |
| --- | --- |
| Success (read/create/update) | `{ "data": ... }` |
| Success (paginated list) | `{ "data": [...], "pagination": {...} }` (and `modules` for test cases) |
| Success (delete) | `{ "message": "..." }` |
| Error | `{ "message": "..." }` — HTTP status conveys the failure |
| Error (Test Suite endpoints only) | `{ "error": "..." }` |
| Validation error (`422`) | `{ "message": "Validation failed", "data": [ ...zod issues... ] }` |

Always branch on the **HTTP status code**, and read `message` (or, for test-suite
calls, `error`) for the human-readable reason.

## Dynamic vocabularies

`priority`, `status`, `severity`, and `environment` are configured per project via
dropdown options, so valid values vary by project — treat them as open strings and
fetch allowed values from your project's configuration. Fixed enums:

- Test **result** `status`: `PASSED | FAILED | BLOCKED | SKIPPED | RETEST`
- Test **run** `executionType`: `MANUAL | AUTOMATION`

## The automation loop

A typical end-to-end workflow (all under `/api/projects/{id}`):

1. `POST /testcases` — create a test case (optionally with inline `steps`).
2. `POST /testsuites` then `POST /testsuites/{suiteId}/testcases` — group cases.
3. `POST /testruns` — create a run (seed it with `testCaseIds` or `testSuiteIds`).
4. `POST /testruns/{testrunId}/start` — start it.
5. `POST /testruns/{testrunId}/results` — record a result per test case.
6. `POST /testruns/{testrunId}/complete` — complete it.
7. `GET /testruns/{testrunId}` — read the run back; results are embedded in
   `data.results[]` along with aggregate `data.stats`.
8. `POST /defects` (optionally with `testCaseIds` / `testRunId`) — file a defect.

## Smoke test

`scripts/smoke-automation-api.mjs` drives the whole loop against a running server:

```bash
BASE_URL=http://localhost:3000 \
API_KEY=ez_xxx \
PROJECT_ID=<project-cuid> \
node scripts/smoke-automation-api.mjs
```

It exits non-zero on the first failed step and prints each step's status.
