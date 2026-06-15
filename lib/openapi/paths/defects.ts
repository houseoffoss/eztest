/**
 * OpenAPI paths for Defects.
 * Mirrors backend/validators/defect (createDefectSchema, updateDefectSchema)
 * and routes under app/api/projects/[id]/defects/*.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

const defectIdParam: JsonSchema = { name: 'defectId', in: 'path', required: true, schema: { type: 'string' } };

const createDefectBody: JsonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 500 },
    severity: { type: 'string', description: 'DropdownOption value.' },
    priority: { type: 'string', description: 'DropdownOption value.' },
    status: { type: 'string', description: 'DropdownOption value.' },
    description: { type: 'string', nullable: true },
    defectId: { type: 'string', nullable: true, description: 'Optional custom ID; auto-generated (DEF-N) if omitted.' },
    testRunId: { type: 'string', nullable: true, description: 'Link the defect to a test run.' },
    assignedToId: { type: 'string', nullable: true },
    environment: { type: 'string', nullable: true },
    dueDate: { type: 'string', format: 'date-time', nullable: true },
    progressPercentage: { type: 'integer', minimum: 0, maximum: 100, nullable: true },
    testCaseIds: { type: 'array', items: { type: 'string' }, description: 'Link the defect to these test cases.' },
  },
  required: ['title', 'severity', 'priority'],
};

const updateDefectBody: JsonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', maxLength: 500 },
    description: { type: 'string', nullable: true },
    severity: { type: 'string' },
    priority: { type: 'string' },
    status: { type: 'string' },
    assignedToId: { type: 'string', nullable: true },
    environment: { type: 'string', nullable: true },
    testRunId: { type: 'string', nullable: true },
    dueDate: { type: 'string', format: 'date-time', nullable: true },
    progressPercentage: { type: 'integer', minimum: 0, maximum: 100, nullable: true },
  },
};

const defectData = { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Defect' } } } } } };

export const defectPaths: Record<string, JsonSchema> = {
  '/api/projects/{id}/defects': {
    get: {
      tags: ['Defects'],
      summary: 'List defects in a project',
      description: 'Multi-value filters accept comma-separated values (e.g. `severity=CRITICAL,HIGH`).',
      operationId: 'listDefects',
      parameters: [
        { $ref: '#/components/parameters/ProjectId' },
        { name: 'severity', in: 'query', schema: { type: 'string' }, description: 'Comma-separated.' },
        { name: 'priority', in: 'query', schema: { type: 'string' }, description: 'Comma-separated.' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Comma-separated.' },
        { name: 'assignedToId', in: 'query', schema: { type: 'string' }, description: 'Comma-separated.' },
        { $ref: '#/components/parameters/SearchQuery' },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
      ],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'OK.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Defect' } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
    post: {
      tags: ['Defects'],
      summary: 'Create a defect',
      operationId: 'createDefect',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: createDefectBody } } },
      responses: {
        '201': { description: 'Created.', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Defect' } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },

  '/api/projects/{id}/defects/{defectId}': {
    get: {
      tags: ['Defects'],
      summary: 'Get a defect',
      operationId: 'getDefect',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, defectIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: { '200': defectData, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' } },
    },
    put: {
      tags: ['Defects'],
      summary: 'Update a defect',
      operationId: 'updateDefect',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, defectIdParam],
      security: [{ ApiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: updateDefectBody } } },
      responses: { '200': defectData, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' }, '422': { $ref: '#/components/responses/ValidationError' } },
    },
    delete: {
      tags: ['Defects'],
      summary: 'Delete a defect',
      operationId: 'deleteDefect',
      parameters: [{ $ref: '#/components/parameters/ProjectId' }, defectIdParam],
      security: [{ ApiKeyAuth: [] }],
      responses: {
        '200': { description: 'Deleted.', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { message: { type: 'string' } } } } } } } },
        '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
