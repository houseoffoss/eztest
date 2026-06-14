/**
 * OpenAPI paths for Test Cases and Test Steps.
 * Mirrors backend/validators/testcase.validator.ts and the routes under
 * app/api/projects/[id]/testcases/*.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

const tcIdParam: JsonSchema = {
  name: 'tcId',
  in: 'path',
  required: true,
  description: 'Test case ID (database id or per-project tcId, e.g. "TC-12").',
  schema: { type: 'string' },
};

const stepInput: JsonSchema = {
  type: 'object',
  description: 'A test step. At least one of `action` / `expectedResult` is required.',
  properties: {
    id: { type: 'string', description: 'Omit to create; include to update an existing step.' },
    stepNumber: { type: 'integer', minimum: 1 },
    action: { type: 'string' },
    expectedResult: { type: 'string' },
  },
  required: ['stepNumber'],
};

const createTestCaseBody: JsonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    moduleId: { type: 'string', nullable: true },
    suiteId: { type: 'string', nullable: true },
    description: { type: 'string' },
    expectedResult: { type: 'string' },
    testData: { type: 'string' },
    priority: { type: 'string', description: 'DropdownOption value.' },
    status: { type: 'string', description: 'DropdownOption value.' },
    estimatedTime: { type: 'number', minimum: 0, description: 'Minutes.' },
    preconditions: { type: 'string' },
    postconditions: { type: 'string' },
    steps: { type: 'array', items: stepInput },
  },
  required: ['title'],
};

const updateTestCaseBody: JsonSchema = {
  ...createTestCaseBody,
  required: [],
  description: 'All fields optional; only provided fields are updated.',
};

export const testCasePaths: Record<string, JsonSchema> = {
  '/api/projects/{id}/testcases': {
    get: {
      tags: ['Test Cases'],
      summary: 'List test cases in a project',
      description:
        'Returns all test cases. If `page` or `limit` is provided, the response ' +
        'is paginated and additionally includes `modules` and `pagination`.',
      operationId: 'listTestCases',
      parameters: [
        { $ref: '#/components/parameters/ProjectId' },
        { $ref: '#/components/parameters/PageQuery' },
        { $ref: '#/components/parameters/LimitQuery' },
        { $ref: '#/components/parameters/SearchQuery' },
        { name: 'suiteId', in: 'query', schema: { type: 'string' } },
        { name: 'moduleId', in: 'query', schema: { type: 'string' } },
        { name: 'priority', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
      ],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': {
          description: 'List of test cases (optionally paginated).',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/TestCase' } },
                  modules: { type: 'array', items: { $ref: '#/components/schemas/Module' } },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['Test Cases'],
      summary: 'Create a test case',
      description: 'Creates a test case. Inline `steps` are created atomically with the case.',
      operationId: 'createTestCase',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createTestCaseBody } },
      },
      responses: {
        '201': {
          description: 'Created.',
          content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/TestCase' } } } } },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },

  '/api/projects/{id}/testcases/{tcId}': {
    get: {
      tags: ['Test Cases'],
      summary: 'Get a test case',
      operationId: 'getTestCase',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, tcIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/TestCase' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Test Cases'],
      summary: 'Update a test case',
      operationId: 'updateTestCase',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, tcIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: updateTestCaseBody } } },
      responses: {
        '200': { description: 'Updated.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/TestCase' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
        '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
    delete: {
      tags: ['Test Cases'],
      summary: 'Delete a test case',
      operationId: 'deleteTestCase',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, tcIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'Deleted.', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/projects/{id}/testcases/{tcId}/steps': {
    put: {
      tags: ['Test Cases'],
      summary: 'Replace/update the steps of a test case',
      description:
        'Upserts the full step list for a test case. Steps with an `id` are updated; ' +
        'steps without are created; omitted steps are removed.',
      operationId: 'updateTestSteps',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, tcIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { steps: { type: 'array', items: stepInput } }, required: ['steps'] } } },
      },
      responses: {
        '200': { description: 'Updated step list.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/TestStep' } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
        '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },

  '/api/projects/{id}/testcases/{tcId}/defects': {
    get: {
      tags: ['Test Cases'],
      summary: 'List defects linked to a test case',
      operationId: 'listTestCaseDefects',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, tcIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Defect' } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['Test Cases'],
      summary: 'Link defects to a test case',
      operationId: 'linkDefectsToTestCase',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, tcIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { defectIds: { type: 'array', items: { type: 'string' } } }, required: ['defectIds'] } } },
      },
      responses: {
        '201': { description: 'Linked.', content: { 'application/json': { schema: { type: 'object', properties: { data: {} } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
};
