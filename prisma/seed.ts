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
  }
  
  if (!demoProject) {
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

  // Create sample defects (outside the demo project creation block)
  if (demoProject) {
    const existingDefects = await prisma.defect.count({
      where: { projectId: demoProject.id },
    });

    if (existingDefects === 0) {
      console.log('\n📝 Creating sample defects...');
      
      // Get test cases for linking (if they exist)
      const passwordResetTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Password reset functionality' },
      });
      
      const dashboardTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Dashboard data display' },
      });
      
      const formValidationTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Form field validation' },
      });
      
      const navigationTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Navigation between pages' },
      });
      
      const sessionManagementTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Session timeout handling' },
      });
      
      const testRun = await prisma.testRun.findFirst({
        where: { projectId: demoProject.id },
      });
      
      const defect1 = await prisma.defect.create({
      data: {
        defectId: 'DEF-1',
        projectId: demoProject.id,
        testRunId: testRun?.id,
        title: 'Password reset email not delivered',
        description: 'Users report not receiving password reset emails. Tested with multiple email providers (Gmail, Outlook, Yahoo).\n\nSteps: 1. Navigate to login page\n2. Click "Forgot Password"\n3. Enter valid email address\n4. Click "Send Reset Link"\n5. Check email inbox and spam folder\n\nExpected: Password reset email delivered within 5 minutes\nActual: No email received after 30 minutes',
        severity: 'HIGH',
        priority: 'HIGH',
        status: 'NEW',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        environment: 'Production',
      },
    });
    
    // Link defect to test case
    if (passwordResetTestCase) {
      await prisma.testCaseDefect.create({
        data: {
          testCaseId: passwordResetTestCase.id,
          defectId: defect1.id,
        },
      });
    }

    const defect2 = await prisma.defect.create({
      data: {
        defectId: 'DEF-2',
        projectId: demoProject.id,
        title: 'Dashboard widgets not responsive on mobile',
        description: 'Dashboard widgets overflow on mobile devices with screen width less than 375px.\n\nSteps: 1. Login to application\n2. Navigate to dashboard\n3. Open Chrome DevTools\n4. Set viewport to 320x568 (iPhone SE)\n5. Observe widget layout\n\nExpected: Dashboard widgets should be responsive and fit within mobile viewport\nActual: Widgets overflow horizontally, requiring horizontal scrolling',
        severity: 'MEDIUM',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        environment: 'Staging',
        progressPercentage: 45,
      },
    });
    
    if (dashboardTestCase) {
      await prisma.testCaseDefect.create({
        data: {
          testCaseId: dashboardTestCase.id,
          defectId: defect2.id,
        },
      });
    }

    const defect3 = await prisma.defect.create({
      data: {
        defectId: 'DEF-3',
        projectId: demoProject.id,
        title: 'Form validation error messages not accessible',
        description: 'Screen readers cannot properly announce form validation errors, making the application inaccessible to visually impaired users.\n\nSteps: 1. Enable screen reader (NVDA/JAWS)\n2. Navigate to any form\n3. Submit form with invalid data\n4. Listen to screen reader announcement\n\nExpected: Screen reader should announce error messages with proper ARIA labels\nActual: Screen reader does not announce validation errors',
        severity: 'MEDIUM',
        priority: 'HIGH',
        status: 'NEW',
        createdById: adminUser.id,
        environment: 'Production',
        dueDate: new Date(Date.now() + 604800000),
      },
    });
    
    if (formValidationTestCase) {
      await prisma.testCaseDefect.create({
        data: {
          testCaseId: formValidationTestCase.id,
          defectId: defect3.id,
        },
      });
    }

    await prisma.defect.create({
      data: {
        defectId: 'DEF-4',
        projectId: demoProject.id,
        title: 'API rate limiting not enforced',
        description: 'API endpoints do not enforce rate limiting, allowing potential DDoS attacks.\n\nSteps: 1. Use API testing tool (Postman/curl)\n2. Send 1000 requests per second to /api/projects endpoint\n3. Observe response codes\n\nExpected: After 100 requests per minute, should return 429 Too Many Requests\nActual: All requests processed successfully without rate limiting',
        severity: 'CRITICAL',
        priority: 'CRITICAL',
        status: 'NEW',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        environment: 'Production',
        dueDate: new Date(Date.now() + 259200000),
      },
    });

    const defect5 = await prisma.defect.create({
      data: {
        defectId: 'DEF-5',
        projectId: demoProject.id,
        title: 'Breadcrumb navigation broken on deep routes',
        description: 'Breadcrumb navigation does not display correctly when navigating more than 3 levels deep.\n\nSteps: 1. Navigate to Projects > Demo Project > Test Cases > Edit Test Case\n2. Observe breadcrumb navigation\n3. Try clicking on breadcrumb items\n\nExpected: Full breadcrumb trail should be visible and clickable\nActual: Only last 2 breadcrumb items are visible, earlier items are truncated',
        severity: 'LOW',
        priority: 'LOW',
        status: 'FIXED',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        environment: 'QA',
        resolvedAt: new Date(Date.now() - 86400000),
        progressPercentage: 100,
      },
    });
    
    if (navigationTestCase) {
      await prisma.testCaseDefect.create({
        data: {
          testCaseId: navigationTestCase.id,
          defectId: defect5.id,
        },
      });
    }

    const defect6 = await prisma.defect.create({
      data: {
        defectId: 'DEF-6',
        projectId: demoProject.id,
        title: 'Session not invalidated after password change',
        description: 'User sessions remain active even after password is changed, posing a security risk.\n\nSteps: 1. Login to application in two different browsers\n2. In Browser A, change password\n3. In Browser B, try to access protected pages\n\nExpected: Browser B session should be invalidated, requiring re-login\nActual: Browser B session remains active, can access all pages',
        severity: 'HIGH',
        priority: 'CRITICAL',
        status: 'TESTED',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        environment: 'Staging',
        resolvedAt: new Date(Date.now() - 172800000),
        progressPercentage: 100,
      },
    });
    
    if (sessionManagementTestCase) {
      await prisma.testCaseDefect.create({
        data: {
          testCaseId: sessionManagementTestCase.id,
          defectId: defect6.id,
        },
      });
    }

    await prisma.defect.create({
      data: {
        defectId: 'DEF-7',
        projectId: demoProject.id,
        title: 'Dark mode toggle causes flash of unstyled content',
        description: 'Switching between light and dark mode causes a brief flash of unstyled content (FOUC).\n\nSteps: 1. Navigate to Settings\n2. Toggle dark mode switch multiple times\n3. Observe visual behavior\n\nExpected: Smooth transition between light and dark mode without visual glitches\nActual: Brief flash of white background before dark mode applies',
        severity: 'LOW',
        priority: 'MEDIUM',
        status: 'CLOSED',
        createdById: adminUser.id,
        environment: 'Production',
        resolvedAt: new Date(Date.now() - 259200000),
        closedAt: new Date(Date.now() - 172800000),
        progressPercentage: 100,
      },
    });

    console.log('   ✅ Created 7 sample defects:');
    console.log('      - DEF-1: Password reset email (HIGH/NEW)');
    console.log('      - DEF-2: Dashboard mobile responsive (MEDIUM/IN_PROGRESS)');
    console.log('      - DEF-3: Form accessibility (MEDIUM/NEW)');
    console.log('      - DEF-4: API rate limiting (CRITICAL/NEW)');
    console.log('      - DEF-5: Breadcrumb navigation (LOW/FIXED)');
    console.log('      - DEF-6: Session invalidation (HIGH/TESTED)');
    console.log('      - DEF-7: Dark mode FOUC (LOW/CLOSED)');
    } else {
      console.log('✅ Sample defects already exist for demo project');
    }
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
