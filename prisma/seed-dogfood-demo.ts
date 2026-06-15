/**
 * Dogfooding demo seed: "EZTest Platform QA".
 *
 * A realistic, senior-QA-grade demo project in which EZTest is used to test
 * EZTest itself. It exercises every part of the product the way a real QA team
 * would: feature modules, a smoke suite, a nested regression suite, an API
 * automation suite, a security/RBAC suite, detailed test cases with steps,
 * three test runs (smoke sign-off, in-flight regression, nightly automation)
 * with realistic pass/fail/blocked results, and defects traced back to the
 * failing results.
 *
 * Idempotent: keyed on project key "EZQA". If that project already exists the
 * seed is skipped, so it is safe to re-run `npm run seed`.
 *
 * Dropdown values used here match prisma/seed-dropdown-options.ts exactly:
 *   priority/severity: CRITICAL | HIGH | MEDIUM | LOW
 *   test case status:  ACTIVE | DEPRECATED | DRAFT
 *   run status:        PLANNED | IN_PROGRESS | COMPLETED | CANCELLED
 *   result status:     PASSED | FAILED | BLOCKED | SKIPPED | RETEST
 *   defect status:     NEW | IN_PROGRESS | FIXED | TESTED | CLOSED
 *   environment:       Production | Staging | QA | Development
 */

const PROJECT_KEY = 'EZQA';

const DEMO_USER_EMAILS = {
  admin: 'admin@eztest.local',
  pm: 'pm@eztest.local',
  tester1: 'tester1@eztest.local',
  tester2: 'tester2@eztest.local',
  tester3: 'tester3@eztest.local',
  viewer: 'viewer@eztest.local',
};

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

type StepDef = { action: string; expectedResult: string };
type CaseDef = {
  title: string;
  module: keyof typeof MODULE_KEYS;
  suites: string[]; // suite handles
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime: number; // minutes
  description: string;
  preconditions?: string;
  expectedResult: string;
  steps: StepDef[];
};

const MODULE_KEYS = {
  auth: 'Authentication & Accounts',
  projects: 'Projects & Membership',
  cases: 'Test Case Management',
  suites: 'Suites & Modules',
  runs: 'Test Runs & Execution',
  defects: 'Defect Management',
  api: 'API & Access Control',
  reporting: 'Reporting & Attachments',
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedDogfoodDemo(prisma: any) {
  console.log('\n🧪 Seeding dogfooding demo project (EZTest Platform QA)...');

  const existing = await prisma.project.findFirst({ where: { key: PROJECT_KEY } });
  if (existing) {
    console.log(`   ✅ Project "${PROJECT_KEY}" already exists — skipping.`);
    return;
  }

  // Resolve demo users (created earlier in main()).
  const usersByEmail: Record<string, { id: string } | null> = {};
  for (const [handle, email] of Object.entries(DEMO_USER_EMAILS)) {
    usersByEmail[handle] = await prisma.user.findUnique({ where: { email } });
  }
  const u = usersByEmail as Record<string, { id: string }>;
  if (!u.admin || !u.pm || !u.tester1 || !u.tester2 || !u.tester3 || !u.viewer) {
    console.log('   ⚠️  Demo users not found — run the main user seed first. Skipping dogfood demo.');
    return;
  }

  // ---- Project + members ----
  const project = await prisma.project.create({
    data: {
      name: 'EZTest Platform QA',
      key: PROJECT_KEY,
      description:
        'Dogfooding project: the EZTest QA team uses EZTest to test EZTest. ' +
        'Covers authentication, project & member management, test case / suite / ' +
        'module organization, the run execution loop, defect lifecycle, the ' +
        'API-key automation surface, and RBAC. Use this project to explore the ' +
        'UI and to try the Automation API documented at /api/docs.',
      createdById: u.admin.id,
      members: {
        create: [u.admin, u.pm, u.tester1, u.tester2, u.tester3, u.viewer].map((m) => ({
          userId: m.id,
        })),
      },
    },
  });

  // ---- Modules ----
  const modules: Record<string, { id: string }> = {};
  let moduleOrder = 1;
  for (const [handle, name] of Object.entries(MODULE_KEYS)) {
    modules[handle] = await prisma.module.create({
      data: {
        name,
        projectId: project.id,
        order: moduleOrder++,
        description: `Test coverage for the "${name}" area of EZTest.`,
      },
    });
  }

  // ---- Suites (with a nested Regression suite) ----
  const smoke = await prisma.testSuite.create({
    data: { name: 'Smoke', projectId: project.id, order: 1, description: 'Critical-path checks run on every build before deeper testing.' },
  });
  const regression = await prisma.testSuite.create({
    data: { name: 'Regression', projectId: project.id, order: 2, description: 'Full regression pack, organized into feature sub-suites.' },
  });
  const regAuth = await prisma.testSuite.create({
    data: { name: 'Regression · Authentication', projectId: project.id, parentId: regression.id, order: 1, description: 'Login, registration, password reset, session.' },
  });
  const regMgmt = await prisma.testSuite.create({
    data: { name: 'Regression · Test Management', projectId: project.id, parentId: regression.id, order: 2, description: 'Projects, cases, suites, modules, runs.' },
  });
  const regDefect = await prisma.testSuite.create({
    data: { name: 'Regression · Defect Workflow', projectId: project.id, parentId: regression.id, order: 3, description: 'Defect creation, linking and lifecycle.' },
  });
  const apiSuite = await prisma.testSuite.create({
    data: { name: 'API Automation', projectId: project.id, order: 3, description: 'Endpoints driven via API key for the nightly automation run.' },
  });
  const security = await prisma.testSuite.create({
    data: { name: 'Security & RBAC', projectId: project.id, order: 4, description: 'Permission boundaries and negative auth cases.' },
  });

  const suiteHandles: Record<string, { id: string }> = {
    smoke, regression, regAuth, regMgmt, regDefect, api: apiSuite, security,
  };

  // ---- Test cases ----
  const cases: CaseDef[] = [
    // Authentication & Accounts
    {
      title: 'Log in with valid credentials', module: 'auth', suites: ['smoke', 'regAuth'], priority: 'CRITICAL', estimatedTime: 3,
      description: 'A registered user can sign in and reach the dashboard.',
      preconditions: 'A user account exists (e.g. tester1@eztest.local).',
      expectedResult: 'User is authenticated and redirected to the dashboard; their name appears in the header.',
      steps: [
        { action: 'Navigate to /auth/login.', expectedResult: 'The login form is displayed.' },
        { action: 'Enter a valid email and password.', expectedResult: 'Fields accept the input; no validation errors.' },
        { action: 'Click "Sign in".', expectedResult: 'A session is created and the browser redirects to /dashboard.' },
        { action: 'Observe the top navigation.', expectedResult: 'The logged-in user’s name/avatar is shown.' },
      ],
    },
    {
      title: 'Reject login with an invalid password', module: 'auth', suites: ['regAuth', 'security'], priority: 'HIGH', estimatedTime: 2,
      description: 'Authentication fails cleanly for a wrong password without leaking which field was wrong.',
      preconditions: 'A user account exists.',
      expectedResult: 'Login is rejected with a generic error; no session is created.',
      steps: [
        { action: 'Navigate to /auth/login.', expectedResult: 'The login form is displayed.' },
        { action: 'Enter a valid email with an incorrect password and submit.', expectedResult: 'A generic "Invalid email or password" error is shown.' },
        { action: 'Inspect the session/cookies.', expectedResult: 'No authenticated session cookie is set.' },
      ],
    },
    {
      title: 'Register a new user account', module: 'auth', suites: ['regAuth'], priority: 'HIGH', estimatedTime: 4,
      description: 'A new user can self-register and is assigned the default role.',
      expectedResult: 'Account is created and the user can subsequently log in.',
      steps: [
        { action: 'Navigate to /auth/register.', expectedResult: 'The registration form is displayed.' },
        { action: 'Submit a unique email, name and a strong password.', expectedResult: 'The account is created without error.' },
        { action: 'Log in with the new credentials.', expectedResult: 'Login succeeds.' },
      ],
    },
    {
      title: 'Request a password reset email', module: 'auth', suites: ['regAuth'], priority: 'MEDIUM', estimatedTime: 3,
      description: 'Forgot-password flow sends a reset link to the registered address.',
      preconditions: 'SMTP is configured; a user account exists.',
      expectedResult: 'A password reset email is delivered containing a valid, single-use link.',
      steps: [
        { action: 'Navigate to /auth/forgot-password.', expectedResult: 'The reset request form is displayed.' },
        { action: 'Enter a registered email and submit.', expectedResult: 'A confirmation message is shown.' },
        { action: 'Check the inbox for the reset email.', expectedResult: 'The email arrives within a minute with a working reset link.' },
      ],
    },
    {
      title: 'Log out and verify the session ends', module: 'auth', suites: ['regAuth'], priority: 'MEDIUM', estimatedTime: 2,
      description: 'Logging out destroys the session so protected pages are no longer reachable.',
      preconditions: 'User is logged in.',
      expectedResult: 'Session is cleared; visiting a protected route redirects to login.',
      steps: [
        { action: 'Click "Log out" from the user menu.', expectedResult: 'The user is returned to the login page.' },
        { action: 'Attempt to open /dashboard directly.', expectedResult: 'The app redirects to /auth/login.' },
      ],
    },

    // Projects & Membership
    {
      title: 'Create a new project', module: 'projects', suites: ['smoke', 'regMgmt'], priority: 'CRITICAL', estimatedTime: 3,
      description: 'An authorized user can create a project with a unique key.',
      preconditions: 'Logged in as a user with projects:create (Admin).',
      expectedResult: 'The project is created and appears in the project list.',
      steps: [
        { action: 'Open the Projects page and click "New project".', expectedResult: 'The create-project dialog opens.' },
        { action: 'Enter a name and a unique key, then save.', expectedResult: 'The project is created and opened.' },
        { action: 'Return to the project list.', expectedResult: 'The new project is listed.' },
      ],
    },
    {
      title: 'Add a member to a project', module: 'projects', suites: ['regMgmt'], priority: 'HIGH', estimatedTime: 3,
      description: 'A project manager can add an existing user as a project member.',
      preconditions: 'Logged in with projects:manage_members; target user exists.',
      expectedResult: 'The user is added and can access the project.',
      steps: [
        { action: 'Open the project’s Members page.', expectedResult: 'The current member list is shown.' },
        { action: 'Add a user by email and confirm.', expectedResult: 'The user appears in the member list.' },
      ],
    },

    // Test Case Management
    {
      title: 'Create a test case with steps', module: 'cases', suites: ['smoke', 'regMgmt'], priority: 'CRITICAL', estimatedTime: 5,
      description: 'A test case can be created with title, metadata and ordered steps.',
      preconditions: 'Inside a project with testcases:create.',
      expectedResult: 'The test case is saved with a generated TC-id and its steps in order.',
      steps: [
        { action: 'Open Test Cases and click "New test case".', expectedResult: 'The create dialog opens.' },
        { action: 'Fill title, priority and add three steps.', expectedResult: 'Steps are numbered 1–3.' },
        { action: 'Save the test case.', expectedResult: 'The case is listed with a TC-id and the steps persist.' },
      ],
    },
    {
      title: 'Edit an existing test case', module: 'cases', suites: ['regMgmt'], priority: 'HIGH', estimatedTime: 3,
      description: 'Editing a test case persists the changes.',
      preconditions: 'A test case exists.',
      expectedResult: 'Updated fields are saved and reflected in the detail view.',
      steps: [
        { action: 'Open a test case and click "Edit".', expectedResult: 'The edit form is pre-filled.' },
        { action: 'Change the title and priority, then save.', expectedResult: 'Changes are persisted and shown.' },
      ],
    },
    {
      title: 'Reorder and update test steps', module: 'cases', suites: ['regMgmt'], priority: 'MEDIUM', estimatedTime: 3,
      description: 'Steps can be added, edited, reordered and removed.',
      preconditions: 'A test case with steps exists.',
      expectedResult: 'The new step order and content are saved.',
      steps: [
        { action: 'Edit the steps of a test case; reorder two steps.', expectedResult: 'Step numbers update accordingly.' },
        { action: 'Save.', expectedResult: 'The reordered steps persist on reload.' },
      ],
    },
    {
      title: 'Delete a test case', module: 'cases', suites: ['regMgmt'], priority: 'MEDIUM', estimatedTime: 2,
      description: 'A test case can be removed by an authorized user.',
      preconditions: 'A disposable test case exists; user has testcases:delete.',
      expectedResult: 'The case is removed from the list.',
      steps: [
        { action: 'Open a test case and choose "Delete"; confirm.', expectedResult: 'A success message is shown.' },
        { action: 'Return to the list.', expectedResult: 'The case no longer appears.' },
      ],
    },
    {
      title: 'Import test cases from CSV', module: 'cases', suites: ['regMgmt'], priority: 'MEDIUM', estimatedTime: 6,
      description: 'Bulk import creates multiple test cases from an uploaded CSV.',
      preconditions: 'A valid CSV matching the import template.',
      expectedResult: 'All valid rows are imported; invalid rows are reported.',
      steps: [
        { action: 'Open Test Cases → Import and download the template.', expectedResult: 'A template CSV is downloaded.' },
        { action: 'Upload a populated CSV and confirm.', expectedResult: 'Imported cases appear; a summary lists any skipped rows.' },
      ],
    },

    // Suites & Modules
    {
      title: 'Create a test suite', module: 'suites', suites: ['smoke', 'regMgmt'], priority: 'HIGH', estimatedTime: 2,
      description: 'A suite can be created to group test cases.',
      preconditions: 'Inside a project with testsuites:create.',
      expectedResult: 'The suite is created and shown in the suite tree.',
      steps: [
        { action: 'Open Test Suites and click "New suite".', expectedResult: 'The create dialog opens.' },
        { action: 'Enter a name and save.', expectedResult: 'The suite appears in the tree.' },
      ],
    },
    {
      title: 'Create a nested (child) test suite', module: 'suites', suites: ['regMgmt'], priority: 'MEDIUM', estimatedTime: 2,
      description: 'A suite can be nested under a parent suite.',
      preconditions: 'A parent suite exists.',
      expectedResult: 'The child suite appears indented under its parent.',
      steps: [
        { action: 'Create a suite and set its parent to an existing suite.', expectedResult: 'The suite is created with a parent.' },
        { action: 'Inspect the suite tree.', expectedResult: 'The child is nested under the parent.' },
      ],
    },
    {
      title: 'Add test cases to a suite', module: 'suites', suites: ['regMgmt'], priority: 'HIGH', estimatedTime: 3,
      description: 'Existing test cases can be added to a suite.',
      preconditions: 'A suite and several test cases exist.',
      expectedResult: 'Selected cases are associated with the suite.',
      steps: [
        { action: 'Open a suite and choose "Add test cases".', expectedResult: 'Available cases are listed.' },
        { action: 'Select cases and confirm.', expectedResult: 'The cases now appear in the suite.' },
      ],
    },
    {
      title: 'Organize test cases into modules', module: 'suites', suites: ['regMgmt'], priority: 'LOW', estimatedTime: 3,
      description: 'Test cases can be assigned to modules for structure.',
      preconditions: 'Modules and test cases exist.',
      expectedResult: 'Cases are grouped under their module in the list.',
      steps: [
        { action: 'Assign a test case to a module.', expectedResult: 'The case shows its module.' },
        { action: 'Group the list by module.', expectedResult: 'Cases are grouped under their modules.' },
      ],
    },

    // Test Runs & Execution
    {
      title: 'Create a test run from suites', module: 'runs', suites: ['smoke', 'regMgmt'], priority: 'CRITICAL', estimatedTime: 4,
      description: 'A run can be seeded from one or more suites.',
      preconditions: 'A suite with cases exists.',
      expectedResult: 'The run is created and pre-populated with the suites’ cases.',
      steps: [
        { action: 'Open Test Runs and click "New run".', expectedResult: 'The create dialog opens.' },
        { action: 'Select suites and create the run.', expectedResult: 'The run lists all cases from the chosen suites.' },
      ],
    },
    {
      title: 'Start a test run', module: 'runs', suites: ['regMgmt'], priority: 'HIGH', estimatedTime: 2,
      description: 'Starting a run records its start time and moves it to In Progress.',
      preconditions: 'A planned run exists.',
      expectedResult: 'Run status becomes IN_PROGRESS and startedAt is set.',
      steps: [
        { action: 'Open a planned run and click "Start".', expectedResult: 'The status changes to In Progress.' },
      ],
    },
    {
      title: 'Record PASS/FAIL results per case', module: 'runs', suites: ['smoke', 'regMgmt'], priority: 'CRITICAL', estimatedTime: 6,
      description: 'A tester records a result and notes for each case in a run.',
      preconditions: 'An in-progress run with cases.',
      expectedResult: 'Each result is saved and reflected in the run summary.',
      steps: [
        { action: 'Mark a case PASSED with a comment.', expectedResult: 'The result is saved as Passed.' },
        { action: 'Mark another case FAILED with an error message.', expectedResult: 'The result is saved as Failed with details.' },
        { action: 'Refresh the run.', expectedResult: 'The summary counts reflect the recorded results.' },
      ],
    },
    {
      title: 'Complete a test run and view summary', module: 'runs', suites: ['regMgmt'], priority: 'HIGH', estimatedTime: 3,
      description: 'Completing a run sets completedAt and shows pass/fail/blocked totals.',
      preconditions: 'An in-progress run with recorded results.',
      expectedResult: 'Run status becomes COMPLETED and the summary totals are correct.',
      steps: [
        { action: 'Click "Complete" on an in-progress run.', expectedResult: 'The status becomes Completed and completedAt is set.' },
        { action: 'Review the summary.', expectedResult: 'Passed/Failed/Blocked/Skipped totals match the recorded results.' },
      ],
    },
    {
      title: 'Export test run results', module: 'reporting', suites: ['regMgmt'], priority: 'LOW', estimatedTime: 2,
      description: 'Run results can be exported for reporting.',
      preconditions: 'A completed run with results.',
      expectedResult: 'A results file is downloaded with the run’s data.',
      steps: [
        { action: 'Open a completed run and click "Export".', expectedResult: 'A results file is downloaded.' },
      ],
    },

    // Defect Management
    {
      title: 'Create a defect from a failed result', module: 'defects', suites: ['smoke', 'regDefect'], priority: 'CRITICAL', estimatedTime: 4,
      description: 'A defect can be raised and linked to the failing run/case.',
      preconditions: 'A failed result exists in a run.',
      expectedResult: 'The defect is created with a DEF-id and linked to the run.',
      steps: [
        { action: 'From a failed result, choose "Raise defect".', expectedResult: 'The defect form opens pre-linked to the run/case.' },
        { action: 'Set severity/priority and save.', expectedResult: 'The defect is created with a DEF-id.' },
      ],
    },
    {
      title: 'Link a defect to a test case', module: 'defects', suites: ['regDefect'], priority: 'HIGH', estimatedTime: 3,
      description: 'An existing defect can be associated with one or more test cases.',
      preconditions: 'A defect and a test case exist.',
      expectedResult: 'The defect appears under the test case’s linked defects.',
      steps: [
        { action: 'Open a test case → Defects → "Link defect".', expectedResult: 'Available defects are listed.' },
        { action: 'Select a defect and confirm.', expectedResult: 'The defect is linked to the case.' },
      ],
    },
    {
      title: 'Transition a defect through its lifecycle', module: 'defects', suites: ['regDefect'], priority: 'MEDIUM', estimatedTime: 4,
      description: 'A defect moves New → In Progress → Fixed → Tested → Closed.',
      preconditions: 'A defect exists.',
      expectedResult: 'Each status change persists and timestamps update appropriately.',
      steps: [
        { action: 'Move the defect to In Progress, then Fixed.', expectedResult: 'Status updates; resolvedAt is set on Fixed.' },
        { action: 'Move it to Tested, then Closed.', expectedResult: 'Status updates; closedAt is set on Closed.' },
      ],
    },
    {
      title: 'Comment on and watch a defect', module: 'defects', suites: ['regDefect'], priority: 'LOW', estimatedTime: 2,
      description: 'Users can comment on a defect and follow it as a watcher.',
      preconditions: 'A defect exists.',
      expectedResult: 'Comments are recorded and watchers receive updates.',
      steps: [
        { action: 'Add a comment to the defect.', expectedResult: 'The comment appears in the thread.' },
        { action: 'Click "Watch".', expectedResult: 'The user is added as a watcher.' },
      ],
    },

    // API & Access Control
    {
      title: 'Create an API key', module: 'api', suites: ['api', 'security'], priority: 'HIGH', estimatedTime: 3,
      description: 'A user can mint an API key for programmatic access.',
      preconditions: 'Logged in; on Settings → Account.',
      expectedResult: 'A key is generated and shown once, with a visible prefix afterward.',
      steps: [
        { action: 'Open Settings → Account → API keys → "Create".', expectedResult: 'A new key value is displayed once.' },
        { action: 'Copy the key and close the dialog.', expectedResult: 'Only the key prefix is shown thereafter.' },
      ],
    },
    {
      title: 'Authenticate an API request with a Bearer key', module: 'api', suites: ['api', 'smoke'], priority: 'CRITICAL', estimatedTime: 3,
      description: 'A valid API key authorizes a request to a protected endpoint.',
      preconditions: 'A valid API key and a project id.',
      expectedResult: 'The request returns 200 with the expected JSON body.',
      steps: [
        { action: 'GET /api/projects/{id}/testcases with Authorization: Bearer ez_...', expectedResult: 'HTTP 200 with a { data: [...] } body.' },
      ],
    },
    {
      title: 'Reject an API request with an invalid key', module: 'api', suites: ['api', 'security'], priority: 'HIGH', estimatedTime: 2,
      description: 'An invalid or missing key is rejected with 401.',
      preconditions: 'None.',
      expectedResult: 'The request returns 401 and no data.',
      steps: [
        { action: 'GET a protected endpoint with a bogus Bearer token.', expectedResult: 'HTTP 401 Unauthorized.' },
        { action: 'GET the same endpoint with no Authorization header.', expectedResult: 'HTTP 401 Unauthorized.' },
      ],
    },
    {
      title: 'Create a test case via the API', module: 'api', suites: ['api'], priority: 'HIGH', estimatedTime: 3,
      description: 'A test case can be created programmatically with inline steps.',
      preconditions: 'A valid API key with testcases:create.',
      expectedResult: 'HTTP 201 with the created case; it appears in the UI.',
      steps: [
        { action: 'POST /api/projects/{id}/testcases with a title and steps.', expectedResult: 'HTTP 201 with { data: { id, tcId, ... } }.' },
        { action: 'Open the project in the UI.', expectedResult: 'The new case is listed with its steps.' },
      ],
    },
    {
      title: 'Record a test result via the API', module: 'api', suites: ['api'], priority: 'HIGH', estimatedTime: 3,
      description: 'A result can be recorded against a run programmatically.',
      preconditions: 'A started run and a case in it; valid API key.',
      expectedResult: 'HTTP 201; the result is embedded in the run detail.',
      steps: [
        { action: 'POST /api/projects/{id}/testruns/{runId}/results with status PASSED.', expectedResult: 'HTTP 201 with the created result.' },
        { action: 'GET the run.', expectedResult: 'The result appears in data.results[].' },
      ],
    },

    // Security & RBAC
    {
      title: 'Viewer role cannot edit test cases', module: 'api', suites: ['security'], priority: 'HIGH', estimatedTime: 3,
      description: 'A VIEWER has read-only access and cannot mutate data.',
      preconditions: 'Logged in as the viewer account.',
      expectedResult: 'Edit/Create/Delete controls are hidden and the API rejects writes with 403.',
      steps: [
        { action: 'Log in as viewer@eztest.local and open a test case.', expectedResult: 'No Edit/Delete buttons are shown.' },
        { action: 'Attempt a PUT to the test case endpoint with the viewer’s key.', expectedResult: 'HTTP 403 Forbidden.' },
      ],
    },
    {
      title: 'Project-scoped key cannot access another project', module: 'api', suites: ['security'], priority: 'HIGH', estimatedTime: 3,
      description: 'A key scoped to one project is forbidden on other projects.',
      preconditions: 'A project-scoped API key and a second project id.',
      expectedResult: 'Requests to the other project return 403.',
      steps: [
        { action: 'GET another project’s testcases with a project-scoped key.', expectedResult: 'HTTP 403 Forbidden.' },
      ],
    },
  ];

  // Create cases (with steps) and build a title -> record map.
  const caseByTitle: Record<string, { id: string; tcId: string }> = {};
  let tc = 1;
  for (const c of cases) {
    const created = await prisma.testCase.create({
      data: {
        tcId: `TC-${tc++}`,
        title: c.title,
        description: c.description,
        preconditions: c.preconditions,
        expectedResult: c.expectedResult,
        priority: c.priority,
        status: c.status ?? 'ACTIVE',
        estimatedTime: c.estimatedTime,
        projectId: project.id,
        moduleId: modules[c.module].id,
        createdById: u.tester1.id,
        steps: {
          create: c.steps.map((s, i) => ({
            stepNumber: i + 1,
            action: s.action,
            expectedResult: s.expectedResult,
          })),
        },
      },
    });
    caseByTitle[c.title] = { id: created.id, tcId: created.tcId };

    // Link to suites (M2M).
    await prisma.testCaseSuite.createMany({
      data: c.suites.map((h) => ({ testCaseId: created.id, testSuiteId: suiteHandles[h].id })),
      skipDuplicates: true,
    });
  }

  // ---- Helper to create a run with suites + results ----
  type ResultDef = {
    title: string;
    status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'RETEST';
    by: keyof typeof DEMO_USER_EMAILS;
    duration: number;
    comment?: string;
    errorMessage?: string;
    when: Date;
  };
  async function createRun(
    data: Record<string, unknown>,
    suites: string[],
    results: ResultDef[]
  ) {
    const run = await prisma.testRun.create({ data: { ...data, projectId: project.id } });
    await prisma.testRunSuite.createMany({
      data: suites.map((h) => ({ testRunId: run.id, testSuiteId: suiteHandles[h].id })),
      skipDuplicates: true,
    });
    await prisma.testResult.createMany({
      data: results
        .filter((r) => caseByTitle[r.title])
        .map((r) => ({
          testRunId: run.id,
          testCaseId: caseByTitle[r.title].id,
          status: r.status,
          executedById: u[r.by].id,
          duration: r.duration,
          comment: r.comment,
          errorMessage: r.errorMessage,
          executedAt: r.when,
        })),
    });
    return run;
  }

  // ---- Run 1: Smoke sign-off (COMPLETED) ----
  await createRun(
    {
      name: 'Release 1.0 — Smoke Sign-off',
      description: 'Critical-path smoke run gating the 1.0 release.',
      assignedToId: u.pm.id, createdById: u.pm.id,
      environment: 'Staging', status: 'COMPLETED', executionType: 'MANUAL',
      startedAt: daysAgo(9), completedAt: daysAgo(9, 14),
    },
    ['smoke'],
    [
      { title: 'Log in with valid credentials', status: 'PASSED', by: 'tester1', duration: 18, when: daysAgo(9, 10), comment: 'Redirect to dashboard OK.' },
      { title: 'Create a new project', status: 'PASSED', by: 'tester1', duration: 25, when: daysAgo(9, 11) },
      { title: 'Create a test case with steps', status: 'PASSED', by: 'tester2', duration: 40, when: daysAgo(9, 11) },
      { title: 'Create a test suite', status: 'PASSED', by: 'tester2', duration: 15, when: daysAgo(9, 12) },
      { title: 'Create a test run from suites', status: 'PASSED', by: 'tester1', duration: 30, when: daysAgo(9, 12) },
      { title: 'Record PASS/FAIL results per case', status: 'PASSED', by: 'tester1', duration: 35, when: daysAgo(9, 13) },
      { title: 'Create a defect from a failed result', status: 'PASSED', by: 'tester2', duration: 28, when: daysAgo(9, 13) },
      { title: 'Authenticate an API request with a Bearer key', status: 'FAILED', by: 'tester3', duration: 12, when: daysAgo(9, 14), comment: 'Bearer worked, but "ApiKey " prefix returned 500.', errorMessage: 'HTTP 500 when Authorization uses the "ApiKey ez_..." form.' },
    ]
  );

  // ---- Run 2: Sprint 12 Regression (IN_PROGRESS) ----
  const regRun = await createRun(
    {
      name: 'Sprint 12 — Regression',
      description: 'Full regression pack for sprint 12; in progress.',
      assignedToId: u.tester1.id, createdById: u.pm.id,
      environment: 'QA', status: 'IN_PROGRESS', executionType: 'MANUAL',
      startedAt: daysAgo(2), completedAt: null,
    },
    ['regression', 'regAuth', 'regMgmt', 'regDefect'],
    [
      { title: 'Log in with valid credentials', status: 'PASSED', by: 'tester1', duration: 16, when: daysAgo(2, 9) },
      { title: 'Reject login with an invalid password', status: 'PASSED', by: 'tester1', duration: 14, when: daysAgo(2, 9) },
      { title: 'Register a new user account', status: 'PASSED', by: 'tester2', duration: 30, when: daysAgo(2, 10) },
      { title: 'Request a password reset email', status: 'FAILED', by: 'tester1', duration: 45, when: daysAgo(2, 10), comment: 'No email received after 5 minutes on Staging SMTP.', errorMessage: 'Reset email never delivered; SMTP relay timed out.' },
      { title: 'Edit an existing test case', status: 'PASSED', by: 'tester2', duration: 20, when: daysAgo(1, 11) },
      { title: 'Reorder and update test steps', status: 'PASSED', by: 'tester2', duration: 22, when: daysAgo(1, 11) },
      { title: 'Import test cases from CSV', status: 'FAILED', by: 'tester1', duration: 50, when: daysAgo(1, 12), comment: 'Rows with empty priority were skipped silently.', errorMessage: 'Importer drops rows missing "priority" without reporting them.' },
      { title: 'Complete a test run and view summary', status: 'BLOCKED', by: 'tester2', duration: 10, when: daysAgo(1, 13), comment: 'Blocked: summary count bug (see DEF) prevents sign-off.' },
      { title: 'Transition a defect through its lifecycle', status: 'PASSED', by: 'tester3', duration: 35, when: daysAgo(1, 14) },
      { title: 'Link a defect to a test case', status: 'PASSED', by: 'tester3', duration: 18, when: daysAgo(1, 14) },
      // remaining regression cases intentionally left unexecuted (run still in progress)
    ]
  );

  // ---- Run 3: Nightly API Automation (COMPLETED) ----
  await createRun(
    {
      name: 'Nightly API Automation',
      description: 'Automated API checks driven via API key against Staging.',
      assignedToId: u.tester3.id, createdById: u.tester3.id,
      environment: 'Staging', status: 'COMPLETED', executionType: 'AUTOMATION',
      startedAt: daysAgo(1, 2), completedAt: daysAgo(1, 2),
    },
    ['api'],
    [
      { title: 'Authenticate an API request with a Bearer key', status: 'PASSED', by: 'tester3', duration: 1, when: daysAgo(1, 2) },
      { title: 'Reject an API request with an invalid key', status: 'PASSED', by: 'tester3', duration: 1, when: daysAgo(1, 2) },
      { title: 'Create a test case via the API', status: 'PASSED', by: 'tester3', duration: 2, when: daysAgo(1, 2) },
      { title: 'Record a test result via the API', status: 'PASSED', by: 'tester3', duration: 2, when: daysAgo(1, 2) },
      { title: 'Create an API key', status: 'PASSED', by: 'tester3', duration: 1, when: daysAgo(1, 2) },
    ]
  );

  // ---- Defects (traced to failing results) ----
  type DefectDef = {
    title: string; description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'NEW' | 'IN_PROGRESS' | 'FIXED' | 'TESTED' | 'CLOSED';
    environment: string; assignedTo: keyof typeof DEMO_USER_EMAILS; createdBy: keyof typeof DEMO_USER_EMAILS;
    progress?: number; linkCases: string[]; runId?: string;
    resolvedAt?: Date | null; closedAt?: Date | null; dueInDays?: number;
    comments?: { by: keyof typeof DEMO_USER_EMAILS; content: string }[];
  };
  const defects: DefectDef[] = [
    {
      title: 'Password reset email not delivered on Staging SMTP',
      description: 'The forgot-password flow reports success but no email arrives. The Staging SMTP relay times out and the failure is swallowed. Users cannot reset their password.',
      severity: 'HIGH', priority: 'HIGH', status: 'IN_PROGRESS', environment: 'Staging',
      assignedTo: 'tester1', createdBy: 'tester1', progress: 40, runId: regRun.id, dueInDays: 5,
      linkCases: ['Request a password reset email'],
      comments: [
        { by: 'pm', content: 'Confirmed on Staging — relay connection times out after 30s.' },
        { by: 'tester1', content: 'Likely missing SMTP credentials in the Staging environment; investigating.' },
      ],
    },
    {
      title: 'API rejects the "ApiKey " prefix with a 500 instead of authenticating',
      description: 'Requests using `Authorization: ApiKey ez_...` (a documented accepted form) intermittently return HTTP 500 rather than authenticating. The `Bearer` form works.',
      severity: 'MEDIUM', priority: 'HIGH', status: 'NEW', environment: 'Staging',
      assignedTo: 'tester3', createdBy: 'tester3',
      linkCases: ['Authenticate an API request with a Bearer key'],
      comments: [{ by: 'tester3', content: 'Repro: send the ApiKey-prefixed header to /api/projects/{id}/testcases.' }],
    },
    {
      title: 'Test run summary miscounts BLOCKED cases',
      description: 'The run summary omits BLOCKED results from its totals, so completed-vs-total never reconciles and sign-off is blocked.',
      severity: 'MEDIUM', priority: 'MEDIUM', status: 'FIXED', environment: 'QA',
      assignedTo: 'tester2', createdBy: 'tester2', progress: 100, runId: regRun.id, resolvedAt: daysAgo(0, 9),
      linkCases: ['Complete a test run and view summary'],
      comments: [{ by: 'tester2', content: 'Fixed: BLOCKED now included in the denominator. Awaiting retest.' }],
    },
    {
      title: 'CSV import silently skips rows with an empty priority',
      description: 'Importing test cases drops rows that have a blank priority column without surfacing them in the import summary, so data is lost without warning.',
      severity: 'LOW', priority: 'MEDIUM', status: 'NEW', environment: 'QA',
      assignedTo: 'tester1', createdBy: 'tester1', runId: regRun.id,
      linkCases: ['Import test cases from CSV'],
    },
    {
      title: 'Viewer can reach the edit dialog via a deep link',
      description: 'While the UI hides edit controls for VIEWER, navigating directly to the edit route still renders the form. The API correctly returns 403 on save, but the control should not be reachable.',
      severity: 'HIGH', priority: 'CRITICAL', status: 'TESTED', environment: 'Staging',
      assignedTo: 'pm', createdBy: 'tester2', progress: 100, resolvedAt: daysAgo(3, 9),
      linkCases: ['Viewer role cannot edit test cases'],
      comments: [
        { by: 'pm', content: 'Route guard added; verifying VIEWER is redirected from the edit route.' },
        { by: 'tester2', content: 'Retested — edit route now redirects VIEWER to read-only view.' },
      ],
    },
  ];

  let def = 1;
  for (const d of defects) {
    const created = await prisma.defect.create({
      data: {
        defectId: `DEF-${def++}`,
        projectId: project.id,
        title: d.title,
        description: d.description,
        severity: d.severity,
        priority: d.priority,
        status: d.status,
        environment: d.environment,
        assignedToId: u[d.assignedTo].id,
        createdById: u[d.createdBy].id,
        testRunId: d.runId ?? null,
        progressPercentage: d.progress ?? null,
        dueDate: d.dueInDays ? daysAgo(-d.dueInDays) : null,
        resolvedAt: d.resolvedAt ?? null,
        closedAt: d.closedAt ?? null,
      },
    });

    for (const title of d.linkCases) {
      if (caseByTitle[title]) {
        await prisma.testCaseDefect.create({
          data: { testCaseId: caseByTitle[title].id, defectId: created.id },
        });
      }
    }
    if (d.comments?.length) {
      await prisma.defectComment.createMany({
        data: d.comments.map((c) => ({ defectId: created.id, userId: u[c.by].id, content: c.content })),
      });
    }
  }

  console.log(
    `   ✅ Created project "${project.name}" (${PROJECT_KEY}): ` +
      `${Object.keys(MODULE_KEYS).length} modules, 7 suites, ${cases.length} test cases, 3 runs, ${defects.length} defects.`
  );
}
