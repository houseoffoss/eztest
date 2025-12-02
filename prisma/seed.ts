import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedRBAC } from './seed-rbac';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed RBAC system first (Roles, Permissions, RolePermissions)
  await seedRBAC();

  // Get admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eztest.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  // Check if admin user already exists
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (adminUser) {
    console.log('✅ Admin user already exists:', adminEmail);
  } else {
    // Get ADMIN role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      throw new Error('ADMIN role not found. Make sure RBAC seeding completed successfully.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('   Role: ADMIN');
    console.log('\n⚠️  Please change the default admin password after first login!');
  }

  // Check if demo project exists for admin
  let demoProject = await prisma.project.findFirst({
    where: {
      createdById: adminUser.id,
      key: 'DEMO',
    },
  });

  if (demoProject) {
    console.log('✅ Demo project already exists for admin user');
  } else {
    // Create demo project for admin user
    demoProject = await prisma.project.create({
      data: {
        name: 'Demo Project',
        key: 'DEMO',
        description: 'Welcome to EZTest! This is a demo project to help you get started. Feel free to explore the features and create your own test suites, test cases, and test plans.',
        createdById: adminUser.id,
        members: {
          create: [
            {
              userId: adminUser.id,
            },
          ],
        },
      },
    });

    console.log('✅ Demo project created:', demoProject.name);

    // Create demo test suites
    const authSuite = await prisma.testSuite.create({
      data: {
        name: 'Authentication',
        description: 'Test cases for user authentication and authorization',
        projectId: demoProject.id,
        order: 1,
      },
    });
    console.log('   ✅ Test Suite: Authentication');

    const uiSuite = await prisma.testSuite.create({
      data: {
        name: 'User Interface',
        description: 'UI/UX testing and validation',
        projectId: demoProject.id,
        order: 2,
      },
    });
    console.log('   ✅ Test Suite: User Interface');

    const apiSuite = await prisma.testSuite.create({
      data: {
        name: 'API Testing',
        description: 'Backend API endpoint testing',
        projectId: demoProject.id,
        order: 3,
      },
    });
    console.log('   ✅ Test Suite: API Testing');

    // Create demo modules
    const authModule = await prisma.module.create({
      data: {
        name: 'Authentication Module',
        description: 'All authentication-related test cases including login, logout, password reset, and session management',
        projectId: demoProject.id,
        order: 1,
      },
    });
    console.log('   ✅ Module: Authentication Module');

    const uiModule = await prisma.module.create({
      data: {
        name: 'User Interface Module',
        description: 'UI/UX testing module covering dashboards, forms, navigation, and responsive design',
        projectId: demoProject.id,
        order: 2,
      },
    });
    console.log('   ✅ Module: User Interface Module');

    const apiModule = await prisma.module.create({
      data: {
        name: 'API Module',
        description: 'Backend API testing module for REST endpoints, authentication, and data validation',
        projectId: demoProject.id,
        order: 3,
      },
    });
    console.log('   ✅ Module: API Module');

    const securityModule = await prisma.module.create({
      data: {
        name: 'Security Module',
        description: 'Security testing including RBAC, XSS prevention, and data protection',
        projectId: demoProject.id,
        order: 4,
      },
    });
    console.log('   ✅ Module: Security Module');

    // Create demo test cases for Authentication suite
    let testCaseCounter = 1;
    const loginTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'User Login with Valid Credentials',
        description: 'Verify that users can successfully log in with valid email and password',
        expectedResult: 'User is successfully authenticated and dashboard is displayed',
        projectId: demoProject.id,
        suiteId: authSuite.id,
        moduleId: authModule.id,
        priority: 'CRITICAL',
        status: 'ACTIVE',
        estimatedTime: 5,
        preconditions: 'User account exists in the system',
        postconditions: 'User is logged in and redirected to dashboard',
        createdById: adminUser.id,
      },
    });

    const logoutTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'User Logout',
        description: 'Verify that users can successfully log out',
        expectedResult: 'User session is terminated and redirected to login page',
        projectId: demoProject.id,
        suiteId: authSuite.id,
        moduleId: authModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 3,
        preconditions: 'User is logged in',
        postconditions: 'User is logged out and redirected to login page',
        createdById: adminUser.id,
      },
    });

    const passwordResetTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Password Reset Flow',
        description: 'Verify that users can reset their password via email',
        expectedResult: 'Reset email is sent and user can set new password successfully',
        projectId: demoProject.id,
        suiteId: authSuite.id,
        moduleId: authModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 10,
        preconditions: 'User has a registered email address',
        postconditions: 'User receives reset email and can set new password',
        createdById: adminUser.id,
      },
    });

    const sessionManagementTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Session Timeout Handling',
        description: 'Verify that inactive sessions timeout correctly after configured period',
        expectedResult: 'User is automatically logged out after session timeout and redirected to login',
        projectId: demoProject.id,
        suiteId: authSuite.id,
        moduleId: authModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 15,
        preconditions: 'User is logged in and session timeout is configured',
        postconditions: 'User is logged out after timeout period',
        createdById: adminUser.id,
      },
    });
    console.log('   ✅ Test Cases: Authentication (4 cases)');

    // Create demo test cases for UI suite
    const dashboardTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Dashboard Layout Validation',
        description: 'Verify that dashboard displays all required widgets and information',
        expectedResult: 'All dashboard widgets are visible and properly formatted',
        projectId: demoProject.id,
        suiteId: uiSuite.id,
        moduleId: uiModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 7,
        preconditions: 'User is logged in',
        postconditions: 'Dashboard displays correctly with all elements',
        createdById: adminUser.id,
      },
    });

    const navigationTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Navigation Menu Functionality',
        description: 'Verify that all navigation menu items work correctly',
        expectedResult: 'All menu items navigate to their respective pages without errors',
        projectId: demoProject.id,
        suiteId: uiSuite.id,
        moduleId: uiModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 5,
        preconditions: 'User is logged in',
        postconditions: 'All menu items navigate to correct pages',
        createdById: adminUser.id,
      },
    });

    const responsiveDesignTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Responsive Design - Mobile View',
        description: 'Verify that application displays correctly on mobile devices',
        expectedResult: 'All UI elements are properly sized and accessible on mobile screens',
        projectId: demoProject.id,
        suiteId: uiSuite.id,
        moduleId: uiModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 10,
        preconditions: 'Access application from mobile device or emulator',
        postconditions: 'UI renders correctly in mobile viewport',
        createdById: adminUser.id,
      },
    });

    const formValidationTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Form Input Validation',
        description: 'Verify that form fields validate input correctly and display appropriate error messages',
        expectedResult: 'Invalid inputs are rejected with clear error messages',
        projectId: demoProject.id,
        suiteId: uiSuite.id,
        moduleId: uiModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 8,
        preconditions: 'User has access to forms',
        postconditions: 'Form validation works correctly for all input types',
        createdById: adminUser.id,
      },
    });
    console.log('   ✅ Test Cases: User Interface (4 cases)');

    // Create demo test cases for API suite
    const apiAuthTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'API Authentication Endpoint',
        description: 'Verify that /api/auth/login endpoint returns correct response',
        expectedResult: 'HTTP 200 response with valid JWT token in response body',
        projectId: demoProject.id,
        suiteId: apiSuite.id,
        moduleId: apiModule.id,
        priority: 'CRITICAL',
        status: 'ACTIVE',
        estimatedTime: 8,
        preconditions: 'API server is running',
        postconditions: 'Returns 200 status with valid JWT token',
        createdById: adminUser.id,
      },
    });

    const apiProjectsTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'API Projects List Endpoint',
        description: 'Verify that /api/projects endpoint returns user projects',
        expectedResult: 'HTTP 200 response with projects array containing user projects',
        projectId: demoProject.id,
        suiteId: apiSuite.id,
        moduleId: apiModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 6,
        preconditions: 'User is authenticated',
        postconditions: 'Returns 200 status with projects array',
        createdById: adminUser.id,
      },
    });

    const apiErrorHandlingTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'API Error Handling',
        description: 'Verify that API endpoints return appropriate error codes and messages',
        expectedResult: 'API returns correct HTTP status codes and error messages for various error scenarios',
        projectId: demoProject.id,
        suiteId: apiSuite.id,
        moduleId: apiModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 12,
        preconditions: 'API server is running',
        postconditions: 'Error responses are properly formatted and informative',
        createdById: adminUser.id,
      },
    });
    console.log('   ✅ Test Cases: API Testing (3 cases)');

    // Add some test cases for security module (not assigned to any suite yet)
    const rbacTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Role-Based Access Control Validation',
        description: 'Verify that users can only access resources permitted by their role',
        expectedResult: 'Users are restricted to accessing only permitted resources based on their role',
        projectId: demoProject.id,
        moduleId: securityModule.id,
        priority: 'CRITICAL',
        status: 'ACTIVE',
        estimatedTime: 20,
        preconditions: 'Multiple user roles are configured in the system',
        postconditions: 'All role-based restrictions are enforced correctly',
        createdById: adminUser.id,
      },
    });

    const xssPreventionTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'XSS Attack Prevention',
        description: 'Verify that application properly sanitizes user input to prevent XSS attacks',
        expectedResult: 'User input is sanitized and XSS payloads are neutralized',
        projectId: demoProject.id,
        moduleId: securityModule.id,
        priority: 'CRITICAL',
        status: 'ACTIVE',
        estimatedTime: 15,
        preconditions: 'Application has input fields that display user-generated content',
        postconditions: 'XSS payloads are properly escaped or rejected',
        createdById: adminUser.id,
      },
    });

    const dataEncryptionTestCase = await prisma.testCase.create({
      data: {
        tcId: `tc${testCaseCounter++}`,
        title: 'Sensitive Data Encryption',
        description: 'Verify that sensitive data is encrypted both in transit and at rest',
        expectedResult: 'All sensitive data is properly encrypted using industry-standard algorithms',
        projectId: demoProject.id,
        moduleId: securityModule.id,
        priority: 'CRITICAL',
        status: 'DRAFT',
        estimatedTime: 25,
        preconditions: 'Access to database and network traffic monitoring tools',
        postconditions: 'Sensitive data is encrypted according to security standards',
        createdById: adminUser.id,
      },
    });
    console.log('   ✅ Test Cases: Security Module (3 cases - not assigned to suite)');

    // Create demo test run
    const testRun = await prisma.testRun.create({
      data: {
        name: 'Sprint 1 Regression Testing',
        description: 'End-to-end regression testing for Sprint 1 release',
        projectId: demoProject.id,
        assignedToId: adminUser.id,
        environment: 'Staging',
        status: 'IN_PROGRESS',
        createdById: adminUser.id,
        startedAt: new Date(),
      },
    });

    // Create test results for the test run
    await prisma.testResult.createMany({
      data: [
        {
          testRunId: testRun.id,
          testCaseId: loginTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 3600000), // 1 hour ago
          comment: 'User successfully logged in with valid credentials',
          duration: 4,
        },
        {
          testRunId: testRun.id,
          testCaseId: logoutTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 3000000), // 50 minutes ago
          comment: 'User successfully logged out',
          duration: 2,
        },
        {
          testRunId: testRun.id,
          testCaseId: passwordResetTestCase.id,
          status: 'FAILED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 2400000), // 40 minutes ago
          comment: 'Email service might be experiencing delays',
          errorMessage: 'Email not received within expected time',
          duration: 10,
        },
        {
          testRunId: testRun.id,
          testCaseId: sessionManagementTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 2100000), // 35 minutes ago
          comment: 'Session timeout working as expected',
          duration: 14,
        },
        {
          testRunId: testRun.id,
          testCaseId: dashboardTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 1800000), // 30 minutes ago
          comment: 'Dashboard renders correctly with all widgets',
          duration: 6,
        },
        {
          testRunId: testRun.id,
          testCaseId: navigationTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 1200000), // 20 minutes ago
          comment: 'All navigation items working as expected',
          duration: 4,
        },
        {
          testRunId: testRun.id,
          testCaseId: responsiveDesignTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 900000), // 15 minutes ago
          comment: 'Mobile responsive design working correctly',
          duration: 9,
        },
        {
          testRunId: testRun.id,
          testCaseId: formValidationTestCase.id,
          status: 'PASSED',
          executedById: adminUser.id,
          executedAt: new Date(Date.now() - 600000), // 10 minutes ago
          comment: 'All form validations working as expected',
          duration: 7,
        },
        {
          testRunId: testRun.id,
          testCaseId: apiAuthTestCase.id,
          status: 'SKIPPED',
          executedById: adminUser.id,
        },
        {
          testRunId: testRun.id,
          testCaseId: apiProjectsTestCase.id,
          status: 'SKIPPED',
          executedById: adminUser.id,
        },
        {
          testRunId: testRun.id,
          testCaseId: apiErrorHandlingTestCase.id,
          status: 'SKIPPED',
          executedById: adminUser.id,
        },
      ],
    });
    console.log('   ✅ Test Run: Sprint 1 Regression Testing');
    console.log('      - 8 tests executed (7 passed, 1 failed)');
    console.log('      - 3 tests pending');
  }

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
