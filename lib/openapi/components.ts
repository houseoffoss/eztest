/**
 * Shared OpenAPI 3.1 components: security scheme, reusable parameters,
 * standard responses, and domain model schemas.
 *
 * These are hand-authored JSON Schema objects (OpenAPI 3.1 / JSON Schema 2020-12)
 * that mirror the Zod validators in `backend/validators/*` and the Prisma models
 * in `prisma/schema.prisma`. The Zod validators remain the runtime source of
 * truth; this file documents the contract for API consumers.
 *
 * Note on enums: fields like `priority`, `status`, `severity`, and `environment`
 * are backed by the dynamic `DropdownOption` table, so they are typed as `string`
 * (open vocabulary) rather than fixed enums. Where a validator DOES enforce a
 * closed set (e.g. test result `status`, run `executionType`), the enum is listed.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

/** Security scheme: API key passed as a Bearer token in the Authorization header. */
export const securitySchemes = {
  ApiKeyAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'ez_...',
    description:
      'Project or global API key. Send as `Authorization: Bearer ez_xxx` ' +
      '(the `ApiKey ez_xxx` prefix is also accepted). Create keys in ' +
      'Settings → Account. A key inherits the full permissions of the user ' +
      'that owns it; project-scoped keys can only access their project.',
  },
} as const;

/** Reusable path/query parameters. */
export const parameters: Record<string, JsonSchema> = {
  ProjectId: {
    name: 'id',
    in: 'path',
    required: true,
    description: 'Project ID (cuid).',
    schema: { type: 'string' },
  },
  PageQuery: {
    name: 'page',
    in: 'query',
    required: false,
    description: 'Page number (1-based). Triggers paginated response when present.',
    schema: { type: 'integer', minimum: 1, default: 1 },
  },
  LimitQuery: {
    name: 'limit',
    in: 'query',
    required: false,
    description: 'Items per page. Triggers paginated response when present.',
    schema: { type: 'integer', minimum: 1, default: 10 },
  },
  SearchQuery: {
    name: 'search',
    in: 'query',
    required: false,
    description: 'Case-insensitive substring match on title/description.',
    schema: { type: 'string' },
  },
};

/** Standard error envelope used by `baseInterceptor` ({ message, data? }). */
const errorEnvelope: JsonSchema = {
  type: 'object',
  properties: {
    message: { type: 'string', description: 'Human-readable error message.' },
    data: {
      description:
        'Optional error detail. For 422 validation errors this is the array ' +
        'of Zod issues; otherwise null.',
      nullable: true,
    },
  },
  required: ['message'],
};

/** Test-suite endpoints use { error } instead of { message } for failures. */
const suiteErrorEnvelope: JsonSchema = {
  type: 'object',
  properties: {
    error: { type: 'string', description: 'Human-readable error message.' },
  },
  required: ['error'],
};

export const responses: Record<string, JsonSchema> = {
  Unauthorized: {
    description: 'Missing or invalid API key.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  Forbidden: {
    description: 'Authenticated, but the key lacks the required permission or project access.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  NotFound: {
    description: 'Resource not found.',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  ValidationError: {
    description: 'Request body or query failed validation (Zod issues in `data`).',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
};

/** Pagination metadata returned by paginated list endpoints. */
const pagination: JsonSchema = {
  type: 'object',
  properties: {
    currentPage: { type: 'integer' },
    totalPages: { type: 'integer' },
    totalItems: { type: 'integer' },
    itemsPerPage: { type: 'integer' },
    hasNextPage: { type: 'boolean' },
    hasPreviousPage: { type: 'boolean' },
  },
};

const userSummary: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};

const testStep: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    testCaseId: { type: 'string' },
    stepNumber: { type: 'integer', minimum: 1 },
    action: { type: 'string' },
    expectedResult: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const testCase: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tcId: { type: 'string', description: 'Human-readable ID, unique per project (e.g. "TC-12").' },
    projectId: { type: 'string' },
    moduleId: { type: 'string', nullable: true },
    suiteId: { type: 'string', nullable: true },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    expectedResult: { type: 'string', nullable: true },
    testData: { type: 'string', nullable: true },
    priority: { type: 'string', nullable: true, description: 'DropdownOption value.' },
    status: { type: 'string', nullable: true, description: 'DropdownOption value.' },
    estimatedTime: { type: 'integer', nullable: true, description: 'Minutes.' },
    preconditions: { type: 'string', nullable: true },
    postconditions: { type: 'string', nullable: true },
    createdById: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    steps: { type: 'array', items: { $ref: '#/components/schemas/TestStep' } },
  },
};

const testSuite: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    projectId: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    parentId: { type: 'string', nullable: true, description: 'Parent suite ID for nesting.' },
    order: { type: 'integer', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const moduleSchema: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    projectId: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    order: { type: 'integer', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const testResult: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    testRunId: { type: 'string' },
    testCaseId: { type: 'string' },
    status: {
      type: 'string',
      enum: ['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'RETEST'],
    },
    executedById: { type: 'string', nullable: true },
    duration: { type: 'integer', nullable: true, description: 'Seconds.' },
    comment: { type: 'string', nullable: true },
    errorMessage: { type: 'string', nullable: true },
    stackTrace: { type: 'string', nullable: true },
    executedAt: { type: 'string', format: 'date-time' },
  },
};

const testRun: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    projectId: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    executionType: { type: 'string', enum: ['MANUAL', 'AUTOMATION'] },
    status: { type: 'string', description: 'DropdownOption value.' },
    assignedToId: { type: 'string', nullable: true },
    environment: { type: 'string', nullable: true, description: 'DropdownOption value.' },
    startedAt: { type: 'string', format: 'date-time', nullable: true },
    completedAt: { type: 'string', format: 'date-time', nullable: true },
    createdById: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    results: { type: 'array', items: { $ref: '#/components/schemas/TestResult' } },
  },
};

const defect: JsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    defectId: { type: 'string', description: 'Human-readable ID, unique per project (e.g. "DEF-3").' },
    projectId: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    severity: { type: 'string', description: 'DropdownOption value.' },
    priority: { type: 'string', description: 'DropdownOption value.' },
    status: { type: 'string', description: 'DropdownOption value.' },
    assignedToId: { type: 'string', nullable: true },
    testRunId: { type: 'string', nullable: true },
    environment: { type: 'string', nullable: true },
    dueDate: { type: 'string', format: 'date-time', nullable: true },
    progressPercentage: { type: 'integer', minimum: 0, maximum: 100, nullable: true },
    createdById: { type: 'string' },
    resolvedAt: { type: 'string', format: 'date-time', nullable: true },
    closedAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const schemas: Record<string, JsonSchema> = {
  Error: errorEnvelope,
  SuiteError: suiteErrorEnvelope,
  Pagination: pagination,
  UserSummary: userSummary,
  TestStep: testStep,
  TestCase: testCase,
  TestSuite: testSuite,
  Module: moduleSchema,
  TestResult: testResult,
  TestRun: testRun,
  Defect: defect,
};

/**
 * Helper: a `{ data: <ref> }` success body (the dominant success envelope).
 */
export function dataEnvelope(ref: string, opts?: { array?: boolean }): JsonSchema {
  const dataSchema = opts?.array
    ? { type: 'array', items: { $ref: `#/components/schemas/${ref}` } }
    : { $ref: `#/components/schemas/${ref}` };
  return {
    type: 'object',
    properties: { data: dataSchema },
  };
}
