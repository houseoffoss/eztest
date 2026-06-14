/**
 * Assembles the EZTest automation OpenAPI 3.1 document.
 *
 * The spec describes the API-key-authenticated automation surface for the
 * testing domain: test cases, steps, suites, modules, runs, results, and defects.
 * It is hand-authored (mirroring the Zod validators) so it carries no runtime
 * dependency and is robust to validator-library changes.
 *
 * Consumed by:
 *   - GET /api/openapi.json  (the raw document)
 *   - GET /api/docs          (Swagger UI)
 */

import { schemas, parameters, responses, securitySchemes } from './components';
import { testCasePaths } from './paths/testcases';
import { testSuitePaths } from './paths/testsuites';
import { testRunPaths } from './paths/testruns';
import { defectPaths } from './paths/defects';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

const tags = [
  { name: 'Test Cases', description: 'Create and manage test cases and their steps.' },
  { name: 'Test Suites', description: 'Group test cases into (optionally nested) suites.' },
  { name: 'Modules', description: 'Organize test cases into project modules.' },
  { name: 'Test Runs', description: 'Create runs, drive their lifecycle, and record results.' },
  { name: 'Defects', description: 'File and manage defects; link them to test cases and runs.' },
];

/**
 * OpenAPI 3.1 uses JSON Schema 2020-12, which has no `nullable` keyword.
 * The path/component files author nullability as `{ type: 'x', nullable: true }`
 * (the familiar 3.0 form) for readability; this normalizes those into the valid
 * 3.1 form `{ type: ['x', 'null'] }` so the emitted document validates cleanly.
 */
function normalizeNullable<T>(node: T): T {
  if (Array.isArray(node)) {
    return node.map((n) => normalizeNullable(n)) as unknown as T;
  }
  if (node && typeof node === 'object') {
    const obj = node as JsonSchema;
    const out: JsonSchema = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'nullable') continue;
      out[key] = normalizeNullable(value);
    }
    if (obj.nullable === true) {
      if (typeof out.type === 'string') {
        out.type = [out.type, 'null'];
      } else if (Array.isArray(out.type) && !out.type.includes('null')) {
        out.type = [...out.type, 'null'];
      } else if (out.$ref) {
        // Nullable $ref: wrap so the ref still resolves.
        return { anyOf: [{ $ref: out.$ref }, { type: 'null' }] } as unknown as T;
      }
    }
    return out as unknown as T;
  }
  return node;
}

export function buildOpenApiDocument(): JsonSchema {
  return normalizeNullable({
    openapi: '3.1.0',
    info: {
      title: 'EZTest Automation API',
      version: '1.0.0',
      description:
        'Programmatic access to the EZTest testing domain for building automation ' +
        'workflows (e.g. fetch test cases, build and execute runs, record results, ' +
        'file defects).\n\n' +
        '**Authentication.** Every endpoint requires an API key sent as ' +
        '`Authorization: Bearer ez_xxx`. Create a key under Settings → Account. ' +
        'A key inherits the full permissions of its owning user; project-scoped ' +
        'keys are restricted to their project.\n\n' +
        '**Response envelopes.** Success responses return `{ "data": ... }` ' +
        '(list endpoints may add `pagination`; deletes return `{ "message": ... }`). ' +
        'Errors return `{ "message": ... }` with the HTTP status conveying the ' +
        'failure — except Test Suite endpoints, which return `{ "error": ... }`.\n\n' +
        '**Dynamic vocabularies.** `priority`, `status`, `severity`, and ' +
        '`environment` are configurable per project via dropdown options, so they ' +
        'are open strings here. Test result `status` and run `executionType` are ' +
        'fixed enums.',
    },
    servers: [{ url: '/', description: 'Same-origin (this deployment).' }],
    tags,
    security: [{ ApiKeyAuth: [] }],
    paths: {
      ...testCasePaths,
      ...testSuitePaths,
      ...testRunPaths,
      ...defectPaths,
    },
    components: {
      securitySchemes,
      parameters,
      responses,
      schemas,
    },
  });
}
