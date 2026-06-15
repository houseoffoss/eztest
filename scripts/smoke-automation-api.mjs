#!/usr/bin/env node
/**
 * Smoke test for the EZTest Automation API.
 *
 * Drives the full automation loop with an API key against a running server:
 *   create test case (+steps) -> suite -> add case to suite -> run -> start
 *   -> record result -> complete -> read back -> file defect linked to the case.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 API_KEY=ez_xxx PROJECT_ID=<cuid> \
 *     node scripts/smoke-automation-api.mjs
 *
 * Exits 0 if every step passes, non-zero on the first failure.
 * Zero dependencies — uses the built-in global fetch (Node 18+).
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = process.env.API_KEY;
const PROJECT_ID = process.env.PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.error('Missing env: API_KEY and PROJECT_ID are required (BASE_URL optional).');
  process.exit(2);
}

const base = `${BASE_URL}/api/projects/${PROJECT_ID}`;
const headers = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

let step = 0;
async function call(label, method, path, body, expected = [200, 201]) {
  step += 1;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  const ok = expected.includes(res.status);
  console.log(`${ok ? '✓' : '✗'} [${step}] ${label} → ${res.status}`);
  if (!ok) {
    console.error(`  Expected ${expected.join('/')}, got ${res.status}`);
    console.error(`  Body: ${text.slice(0, 500)}`);
    process.exit(1);
  }
  return json.data ?? json;
}

(async () => {
  console.log(`Smoke test against ${base}\n`);

  const tc = await call('Create test case (+step)', 'POST', '/testcases', {
    title: `Smoke TC ${Date.now()}`,
    description: 'Created by smoke-automation-api.mjs',
    steps: [{ stepNumber: 1, action: 'Do the thing', expectedResult: 'Thing happens' }],
  }, [201]);
  const testCaseId = tc.id;

  const suite = await call('Create test suite', 'POST', '/testsuites', {
    name: `Smoke Suite ${Date.now()}`,
  });
  const suiteId = suite.id;

  await call('Add test case to suite', 'POST', `/testsuites/${suiteId}/testcases`, {
    testCaseIds: [testCaseId],
  });

  const run = await call('Create test run', 'POST', '/testruns', {
    name: `Smoke Run ${Date.now()}`,
    executionType: 'AUTOMATION',
    testCaseIds: [testCaseId],
  }, [201]);
  const testrunId = run.id;

  await call('Start test run', 'POST', `/testruns/${testrunId}/start`, undefined);

  await call('Record result (PASSED)', 'POST', `/testruns/${testrunId}/results`, {
    testCaseId,
    status: 'PASSED',
    duration: 1,
    comment: 'Smoke pass',
  }, [201]);

  await call('Complete test run', 'POST', `/testruns/${testrunId}/complete`, undefined);

  const fetched = await call('Read run back (results embedded)', 'GET', `/testruns/${testrunId}`, undefined);
  const resultCount = Array.isArray(fetched.results) ? fetched.results.length : 0;
  console.log(`  run has ${resultCount} embedded result(s)`);

  const defect = await call('File defect linked to case', 'POST', '/defects', {
    title: `Smoke Defect ${Date.now()}`,
    severity: 'LOW',
    priority: 'LOW',
    testRunId: testrunId,
    testCaseIds: [testCaseId],
  }, [201]);

  console.log(`\nAll steps passed. Created TC ${tc.tcId || testCaseId}, run ${testrunId}, defect ${defect.defectId || defect.id}.`);
})().catch((err) => {
  console.error('\nSmoke test crashed:', err);
  process.exit(1);
});
