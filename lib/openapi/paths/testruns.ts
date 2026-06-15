/**
 * OpenAPI paths for Test Runs and Test Results.
 * Mirrors backend/validators (createTestRunSchema, updateTestRunSchema,
 * addTestResultSchema) and routes under app/api/projects/[id]/testruns/*.
 *
 * Reading results: a run's results are embedded in the run-detail response
 * (GET /testruns/{testrunId} → data.results[]). There is no separate results
 * list endpoint; results are write-only via POST .../results.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

const runIdParam: JsonSchema = { name: 'testrunId', in: 'path', required: true, schema: { type: 'string' } };

const createRunBody: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 255 },
    description: { type: 'string' },
    executionType: { type: 'string', enum: ['MANUAL', 'AUTOMATION'] },
    assignedToId: { type: 'string', nullable: true },
    environment: { type: 'string' },
    status: { type: 'string', description: 'DropdownOption value.' },
    testCaseIds: { type: 'array', items: { type: 'string' }, description: 'Seed the run with these test cases.' },
    testSuiteIds: { type: 'array', items: { type: 'string' }, description: 'Seed the run with all cases in these suites.' },
  },
  required: ['name'],
};

const updateRunBody: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 255 },
    description: { type: 'string' },
    executionType: { type: 'string', enum: ['MANUAL', 'AUTOMATION'] },
    status: { type: 'string' },
    assignedToId: { type: 'string', nullable: true },
    environment: { type: 'string' },
  },
};

const addResultBody: JsonSchema = {
  type: 'object',
  properties: {
    testCaseId: { type: 'string' },
    status: { type: 'string', enum: ['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'RETEST'] },
    duration: { type: 'integer', description: 'Seconds.' },
    comment: { type: 'string' },
    errorMessage: { type: 'string' },
    stackTrace: { type: 'string' },
  },
  required: ['testCaseId', 'status'],
};

const runData = { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/TestRun' } } } } } };

export const testRunPaths: Record<string, JsonSchema> = {
  '/api/projects/{id}/testruns': {
    get: {
      tags: ['Test Runs'],
      summary: 'List test runs in a project',
      operationId: 'listTestRuns',
      parameters: [
        { $ref: '#/components/parameters/ProjectId' },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'assignedToId', in: 'query', schema: { type: 'string' } },
        { name: 'environment', in: 'query', schema: { type: 'string' } },
        { $ref: '#/components/parameters/SearchQuery' },
      ],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/TestRun' } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['Test Runs'],
      summary: 'Create a test run',
      operationId: 'createTestRun',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: createRunBody } } },
      responses: {
        '201': { description: 'Created.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/TestRun' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },

  '/api/projects/{id}/testruns/{testrunId}': {
    get: {
      tags: ['Test Runs'],
      summary: 'Get a test run (with results and stats)',
      description: 'Returns the run including its embedded `results[]` array and aggregate `stats`.',
      operationId: 'getTestRun',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, runIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': {
          description: 'OK.',
          content: { 'application/json': { schema: { type: 'object', properties: { data: { allOf: [{ $ref: '#/components/schemas/TestRun' }, { type: 'object', properties: { stats: { type: 'object' } } }] } } } } },
        },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Test Runs'],
      summary: 'Update a test run',
      operationId: 'updateTestRun',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, runIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: updateRunBody } } },
      responses: { '200': runData, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' } },
    },
    delete: {
      tags: ['Test Runs'],
      summary: 'Delete a test run',
      operationId: 'deleteTestRun',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, runIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'Deleted.', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/projects/{id}/testruns/{testrunId}/start': {
    post: {
      tags: ['Test Runs'],
      summary: 'Start a test run',
      description: 'Transitions the run to in-progress and sets `startedAt`.',
      operationId: 'startTestRun',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, runIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: { '200': runData, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' } },
    },
  },

  '/api/projects/{id}/testruns/{testrunId}/complete': {
    post: {
      tags: ['Test Runs'],
      summary: 'Complete a test run',
      description: 'Marks the run complete and sets `completedAt`. Response also reports email availability.',
      operationId: 'completeTestRun',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, runIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': {
          description: 'OK.',
          content: { 'application/json': { schema: { type: 'object', properties: { data: { allOf: [{ $ref: '#/components/schemas/TestRun' }, { type: 'object', properties: { emailAvailable: { type: 'boolean' }, emailStatusMessage: { type: 'string' } } }] } } } } },
        },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/projects/{id}/testruns/{testrunId}/results': {
    post: {
      tags: ['Test Runs'],
      summary: 'Record a test result for a case in the run',
      description: 'Records (upserts) the result for one test case. Read results back via GET on the run.',
      operationId: 'addTestResult',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, runIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: addResultBody } } },
      responses: {
        '201': { description: 'Recorded.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/TestResult' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },
};
