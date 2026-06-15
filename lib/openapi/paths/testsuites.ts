/**
 * OpenAPI paths for Test Suites and Modules.
 *
 * NOTE: Test-suite endpoints return a `{ data, message }` envelope on success and
 * `{ error }` on failure (they bypass the shared interceptor) — documented here as
 * `SuiteError`. Module endpoints use the standard `{ data }` / `{ message }` envelope.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

const suiteIdParam: JsonSchema = { name: 'suiteId', in: 'path', required: true, schema: { type: 'string' } };
const moduleIdParam: JsonSchema = { name: 'moduleId', in: 'path', required: true, schema: { type: 'string' } };

const suiteError = { description: 'Error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuiteError' } } } };

const suiteBody: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    parentId: { type: 'string', nullable: true, description: 'Parent suite for nesting.' },
    order: { type: 'integer' },
  },
  required: ['name'],
};

const suiteSuccess = (array?: boolean) => ({
  description: 'OK.',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          data: array
            ? { type: 'array', items: { $ref: '#/components/schemas/TestSuite' } }
            : { $ref: '#/components/schemas/TestSuite' },
          message: { type: 'string' },
        },
      },
    },
  },
});

const testCaseIdsBody: JsonSchema = {
  type: 'object',
  properties: { testCaseIds: { type: 'array', items: { type: 'string' }, minItems: 1 } },
  required: ['testCaseIds'],
};

export const testSuitePaths: Record<string, JsonSchema> = {
  '/api/projects/{id}/testsuites': {
    get: {
      tags: ['Test Suites'],
      summary: 'List test suites in a project',
      operationId: 'listTestSuites',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      responses: { '200': suiteSuccess(true), '401': { $ref: '#/components/responses/Unauthorized' }, '500': suiteError },
    },
    post: {
      tags: ['Test Suites'],
      summary: 'Create a test suite',
      operationId: 'createTestSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: suiteBody } } },
      responses: { '200': suiteSuccess(), '400': suiteError, '401': { $ref: '#/components/responses/Unauthorized' }, '500': suiteError },
    },
  },

  '/api/projects/{id}/testsuites/{suiteId}': {
    get: {
      tags: ['Test Suites'],
      summary: 'Get a test suite',
      operationId: 'getTestSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: { '200': suiteSuccess(), '401': { $ref: '#/components/responses/Unauthorized' }, '403': suiteError, '404': suiteError },
    },
    put: {
      tags: ['Test Suites'],
      summary: 'Update a test suite',
      operationId: 'updateTestSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { ...suiteBody, required: [] } } } },
      responses: { '200': suiteSuccess(), '401': { $ref: '#/components/responses/Unauthorized' }, '403': suiteError, '500': suiteError },
    },
    patch: {
      tags: ['Test Suites'],
      summary: 'Update a test suite (alias of PUT)',
      operationId: 'patchTestSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { ...suiteBody, required: [] } } } },
      responses: { '200': suiteSuccess(), '401': { $ref: '#/components/responses/Unauthorized' }, '403': suiteError, '500': suiteError },
    },
    delete: {
      tags: ['Test Suites'],
      summary: 'Delete a test suite',
      operationId: 'deleteTestSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'Deleted.', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': suiteError, '500': suiteError,
      },
    },
  },

  '/api/projects/{id}/testsuites/{suiteId}/testcases': {
    post: {
      tags: ['Test Suites'],
      summary: 'Add test cases to a suite',
      operationId: 'addTestCasesToSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: testCaseIdsBody } } },
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { count: { type: 'integer' } } }, message: { type: 'string' } } } } } },
        '400': suiteError, '401': { $ref: '#/components/responses/Unauthorized' }, '500': suiteError,
      },
    },
    delete: {
      tags: ['Test Suites'],
      summary: 'Remove test cases from a suite',
      operationId: 'removeTestCasesFromSuite',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: testCaseIdsBody } } },
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { count: { type: 'integer' } } }, message: { type: 'string' } } } } } },
        '400': suiteError, '401': { $ref: '#/components/responses/Unauthorized' }, '500': suiteError,
      },
    },
  },

  '/api/projects/{id}/testsuites/{suiteId}/available-testcases': {
    get: {
      tags: ['Test Suites'],
      summary: 'List test cases available to add to a suite',
      description: 'Returns `{ success: true, data }`. `data` contains available modules and test cases.',
      operationId: 'listAvailableTestCases',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, suiteIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: {} } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '500': suiteError,
      },
    },
  },

  // ---- Modules (standard envelope) ----
  '/api/projects/{id}/modules': {
    get: {
      tags: ['Modules'],
      summary: 'List modules in a project',
      operationId: 'listModules',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Module' } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['Modules'],
      summary: 'Create a module',
      operationId: 'createModule',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', maxLength: 255 }, description: { type: 'string', maxLength: 1000 }, order: { type: 'integer' } }, required: ['name'] } } },
      },
      responses: {
        '201': { description: 'Created.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Module' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },

  '/api/projects/{id}/modules/{moduleId}': {
    get: {
      tags: ['Modules'],
      summary: 'Get a module',
      operationId: 'getModule',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, moduleIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Module' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    patch: {
      tags: ['Modules'],
      summary: 'Update a module',
      operationId: 'updateModule',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, moduleIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', maxLength: 255 }, description: { type: 'string', maxLength: 1000 }, order: { type: 'integer' } } } } },
      },
      responses: {
        '200': { description: 'Updated.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Module' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
    delete: {
      tags: ['Modules'],
      summary: 'Delete a module',
      operationId: 'deleteModule',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, moduleIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'Deleted.', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/projects/{id}/modules/{moduleId}/testcases': {
    get: {
      tags: ['Modules'],
      summary: 'List test cases in a module',
      operationId: 'listModuleTestCases',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, moduleIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/TestCase' } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
};
