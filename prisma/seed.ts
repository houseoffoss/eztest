import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedRBAC } from './seed-rbac';
import { seedDropdownOptions } from './seed-dropdown-options';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed RBAC system first (Roles, Permissions, RolePermissions)
  await seedRBAC();

  // Seed dropdown options
  await seedDropdownOptions();

  // Get admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eztest.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  // Get all roles
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });
  const projectManagerRole = await prisma.role.findUnique({
    where: { name: 'PROJECT_MANAGER' },
  });
  const testerRole = await prisma.role.findUnique({
    where: { name: 'TESTER' },
  });
  const viewerRole = await prisma.role.findUnique({
    where: { name: 'VIEWER' },
  });

  if (!adminRole || !projectManagerRole || !testerRole || !viewerRole) {
    throw new Error('Roles not found. Make sure RBAC seeding completed successfully.');
  }

  // Create or get users with different roles
  console.log('\n👥 Creating demo users...');
  
  // Admin user
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });
    console.log('   ✅ Admin:', adminUser.email);
  } else {
    console.log('   ✅ Admin already exists:', adminUser.email);
  }

  // Project Manager
  let projectManager = await prisma.user.findUnique({
    where: { email: 'pm@eztest.local' },
  });

  if (!projectManager) {
    const hashedPassword = await bcrypt.hash('Pm@123456', 10);
    projectManager = await prisma.user.create({
      data: {
        email: 'pm@eztest.local',
        name: 'Sarah Johnson',
        password: hashedPassword,
        roleId: projectManagerRole.id,
        bio: 'Project Manager with 5+ years of experience in QA management',
        phone: '+1-555-0101',
        location: 'San Francisco, CA',
      },
    });
    console.log('   ✅ Project Manager:', projectManager.email);
  } else {
    console.log('   ✅ Project Manager already exists:', projectManager.email);
  }

  // Testers
  const testerEmails = [
    { email: 'tester1@eztest.local', name: 'John Smith', bio: 'Senior QA Engineer specializing in API testing' },
    { email: 'tester2@eztest.local', name: 'Emily Davis', bio: 'QA Engineer with expertise in UI/UX testing' },
    { email: 'tester3@eztest.local', name: 'Michael Chen', bio: 'Automation Test Engineer' },
  ];

  const testers = [];
  for (const testerData of testerEmails) {
    let tester = await prisma.user.findUnique({
      where: { email: testerData.email },
    });

    if (!tester) {
      const hashedPassword = await bcrypt.hash('Tester@123456', 10);
      tester = await prisma.user.create({
        data: {
          email: testerData.email,
          name: testerData.name,
          password: hashedPassword,
          roleId: testerRole.id,
          bio: testerData.bio,
        },
      });
      console.log('   ✅ Tester:', tester.email);
    } else {
      console.log('   ✅ Tester already exists:', tester.email);
    }
    testers.push(tester);
  }

  // Viewer
  let viewer = await prisma.user.findUnique({
    where: { email: 'viewer@eztest.local' },
  });

  if (!viewer) {
    const hashedPassword = await bcrypt.hash('Viewer@123456', 10);
    viewer = await prisma.user.create({
      data: {
        email: 'viewer@eztest.local',
        name: 'David Wilson',
        password: hashedPassword,
        roleId: viewerRole.id,
        bio: 'Stakeholder and project observer',
      },
    });
    console.log('   ✅ Viewer:', viewer.email);
  } else {
    console.log('   ✅ Viewer already exists:', viewer.email);
  }

  console.log('✅ Demo users created/verified!\n');

  // Check if the demo project specifically exists (by key 'DEMO'), including deleted ones
  const existingDemoProject = await prisma.project.findFirst({
    where: {
      key: 'DEMO',
    },
  });

  let demoProject = existingDemoProject;
  let shouldCreateDemoData = false;

  if (existingDemoProject) {
    // If demo project exists but is deleted, restore it and clean up old data
    if (existingDemoProject.isDeleted) {
      console.log('🔄 Demo project was deleted - restoring it...');
      
      // Delete all old demo data before restoring (ONLY for the demo project ID)
      console.log('   🗑️  Cleaning up old demo data...');
      const projectId = existingDemoProject.id; // Only delete data for this specific demo project ID
      
      // Safety check: Ensure we're only deleting for the demo project
      if (existingDemoProject.key !== 'DEMO') {
        throw new Error('Safety check failed: Attempted to delete data for non-demo project');
      }
      
      // Get IDs first, then delete in order to respect foreign key constraints
      const defects = await prisma.defect.findMany({ where: { projectId }, select: { id: true } });
      const defectIds = defects.map((d: { id: string }) => d.id);
      
      const testRuns = await prisma.testRun.findMany({ where: { projectId }, select: { id: true } });
      const testRunIds = testRuns.map((tr: { id: string }) => tr.id);
      
      const testCases = await prisma.testCase.findMany({ where: { projectId }, select: { id: true } });
      const testCaseIds = testCases.map((tc: { id: string }) => tc.id);
      
      const testSuites = await prisma.testSuite.findMany({ where: { projectId }, select: { id: true } });
      const testSuiteIds = testSuites.map((ts: { id: string }) => ts.id);
      
      // Delete in order to respect foreign key constraints
      if (defectIds.length > 0) {
        await prisma.defectComment.deleteMany({ where: { defectId: { in: defectIds } } });
        await prisma.defectAttachment.deleteMany({ where: { defectId: { in: defectIds } } });
        await prisma.testCaseDefect.deleteMany({ where: { defectId: { in: defectIds } } });
      }
      await prisma.defect.deleteMany({ where: { projectId } });
      
      if (testRunIds.length > 0) {
        await prisma.testResult.deleteMany({ where: { testRunId: { in: testRunIds } } });
        await prisma.testRunSuite.deleteMany({ where: { testRunId: { in: testRunIds } } });
      }
      await prisma.testRun.deleteMany({ where: { projectId } });
      
      if (testCaseIds.length > 0) {
        await prisma.comment.deleteMany({ where: { testCaseId: { in: testCaseIds } } });
        await prisma.attachment.deleteMany({ where: { testCaseId: { in: testCaseIds } } });
        await prisma.testStep.deleteMany({ where: { testCaseId: { in: testCaseIds } } });
        await prisma.testCaseSuite.deleteMany({ where: { testCaseId: { in: testCaseIds } } });
        await prisma.testCaseDefect.deleteMany({ where: { testCaseId: { in: testCaseIds } } });
      }
      await prisma.testCase.deleteMany({ where: { projectId } });
      
      if (testSuiteIds.length > 0) {
        await prisma.testRunSuite.deleteMany({ where: { testSuiteId: { in: testSuiteIds } } });
        await prisma.testCaseSuite.deleteMany({ where: { testSuiteId: { in: testSuiteIds } } });
      }
      await prisma.testSuite.deleteMany({ where: { projectId } });
      
      await prisma.requirement.deleteMany({ where: { projectId } });
      await prisma.module.deleteMany({ where: { projectId } });
      
      console.log('   ✅ Old demo data cleaned up');
      
      // Restore the project
      demoProject = await prisma.project.update({
        where: { id: existingDemoProject.id },
        data: { isDeleted: false },
      });
      console.log('   ✅ Demo project restored');
      shouldCreateDemoData = true; // Recreate demo data since project was deleted
    } else {
      console.log('✅ Demo project already exists - skipping demo project creation');
      demoProject = existingDemoProject;
      
      // Ensure all demo users are added as project members
      console.log('\n👥 Ensuring all demo users are project members...');
      const existingMembers = await prisma.projectMember.findMany({
        where: { projectId: demoProject.id },
        select: { userId: true },
      });
      const existingMemberIds = new Set(existingMembers.map((m: { userId: string }) => m.userId));
      
      const allUsers = [adminUser, projectManager, ...testers, viewer];
      const usersToAdd = allUsers.filter(u => !existingMemberIds.has(u.id));
      
      if (usersToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: usersToAdd.map(u => ({
            projectId: demoProject.id,
            userId: u.id,
          })),
          skipDuplicates: true,
        });
        console.log(`   ✅ Added ${usersToAdd.length} users as project members`);
      } else {
        console.log('   ✅ All demo users are already project members');
      }
    }
  } else {
    shouldCreateDemoData = true; // Create new demo project with all data
  }

  if (shouldCreateDemoData) {
    // Check if demo project needs to be created (doesn't exist) or was restored
    if (!demoProject) {
      // Create demo project for admin user with all team members
      demoProject = await prisma.project.create({
        data: {
          name: 'Demo Project',
          key: 'DEMO',
          description: 'Welcome to EZTest! This is a demo project to help you get started. Feel free to explore the features and create your own test suites, test cases, and test plans.',
          createdById: adminUser.id,
          members: {
            create: [
              { userId: adminUser.id },
              { userId: projectManager.id },
              { userId: testers[0].id },
              { userId: testers[1].id },
              { userId: testers[2].id },
              { userId: viewer.id },
            ],
          },
        },
      });
      console.log('✅ Demo project created:', demoProject.name);
    } else {
      // Project was restored, ensure all demo users are project members
      console.log('\n👥 Ensuring all demo users are project members...');
      const existingMembers = await prisma.projectMember.findMany({
        where: { projectId: demoProject.id },
        select: { userId: true },
      });
      const existingMemberIds = new Set(existingMembers.map((m: { userId: string }) => m.userId));
      
      const allUsers = [adminUser, projectManager, ...testers, viewer];
      const usersToAdd = allUsers.filter(u => !existingMemberIds.has(u.id));
      
      if (usersToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: usersToAdd.map(u => ({
            projectId: demoProject.id,
            userId: u.id,
          })),
          skipDuplicates: true,
        });
        console.log(`   ✅ Added ${usersToAdd.length} users as project members`);
      } else {
        console.log('   ✅ All demo users are already project members');
      }
    }

    // Create fresh demo data (old data was already cleaned up if project was restored)

    // Create demo test suites
    // Test suites are groups of modules that can be used for test runs
    // Suite names are test types (Functional, Non-functional, Smoke, Regression, etc.)
    const functionalSuite = await prisma.testSuite.create({
      data: {
        name: 'Functional',
        description: 'Functional testing suite grouping Authentication, User Interface, API Integration, and Data Management modules. Contains test cases for core functionality including login, logout, UI components, API endpoints, and data operations.',
        projectId: demoProject.id,
        order: 1,
      },
    });
    console.log('   ✅ Test Suite: Functional (groups Authentication, UI, API Integration, and Data Management modules)');

    const smokeSuite = await prisma.testSuite.create({
      data: {
        name: 'Smoke',
        description: 'Smoke testing suite for quick validation of critical functionality. Groups test cases from Authentication and User Interface modules.',
        projectId: demoProject.id,
        order: 2,
      },
    });
    console.log('   ✅ Test Suite: Smoke (groups Authentication and UI modules)');

    const regressionSuite = await prisma.testSuite.create({
      data: {
        name: 'Regression',
        description: 'Regression testing suite covering all modules to ensure existing functionality works after changes. Groups Authentication, User Interface, API Integration, Data Management, and Security modules.',
        projectId: demoProject.id,
        order: 3,
      },
    });
    console.log('   ✅ Test Suite: Regression (groups all modules)');

    const nonFunctionalSuite = await prisma.testSuite.create({
      data: {
        name: 'Non-functional',
        description: 'Non-functional testing suite focusing on security, performance, and reliability. Groups Security and API modules.',
        projectId: demoProject.id,
        order: 4,
      },
    });
    console.log('   ✅ Test Suite: Non-functional (groups Security and API modules)');

    // Create demo modules
    // Modules are feature/component-based organization units
    // Suites (Functional, Smoke, Regression, Non-functional) group modules for test runs
    const authModule = await prisma.module.create({
      data: {
        name: 'Authentication',
        description: 'Authentication and authorization features including login, logout, password management, and session handling',
        projectId: demoProject.id,
        order: 1,
      },
    });
    console.log('   ✅ Module: Authentication');

    const uiModule = await prisma.module.create({
      data: {
        name: 'User Interface',
        description: 'User interface components including dashboards, forms, navigation, responsive design, and user interactions',
        projectId: demoProject.id,
        order: 2,
      },
    });
    console.log('   ✅ Module: User Interface');

    const apiModule = await prisma.module.create({
      data: {
        name: 'API Integration',
        description: 'REST API endpoints for authentication, projects, data retrieval, and error handling',
        projectId: demoProject.id,
        order: 3,
      },
    });
    console.log('   ✅ Module: API Integration');

    const securityModule = await prisma.module.create({
      data: {
        name: 'Security',
        description: 'Security features including role-based access control, input validation, XSS prevention, and data encryption',
        projectId: demoProject.id,
        order: 4,
      },
    });
    console.log('   ✅ Module: Security');

    const dataModule = await prisma.module.create({
      data: {
        name: 'Data Management',
        description: 'Data operations including CRUD operations, data validation, filtering, and search functionality',
        projectId: demoProject.id,
        order: 5,
      },
    });
    console.log('   ✅ Module: Data Management');

    // Create demo test cases for Authentication suite
    let testCaseCounter = 1;
    const loginTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'User Login with Valid Credentials',
        description: 'Verify that users can successfully log in with valid email and password',
        expectedResult: 'User is successfully authenticated and dashboard is displayed',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'User Logout',
        description: 'Verify that users can successfully log out',
        expectedResult: 'User session is terminated and redirected to login page',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'Password Reset Flow',
        description: 'Verify that users can reset their password via email',
        expectedResult: 'Reset email is sent and user can set new password successfully',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'Session Timeout Handling',
        description: 'Verify that inactive sessions timeout correctly after configured period',
        expectedResult: 'User is automatically logged out after session timeout and redirected to login',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'Dashboard Layout Validation',
        description: 'Verify that dashboard displays all required widgets and information',
        expectedResult: 'All dashboard widgets are visible and properly formatted',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'Navigation Menu Functionality',
        description: 'Verify that all navigation menu items work correctly',
        expectedResult: 'All menu items navigate to their respective pages without errors',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
        moduleId: uiModule.id,
        priority: 'LOW',
        status: 'ACTIVE',
        estimatedTime: 5,
        preconditions: 'User is logged in',
        postconditions: 'All menu items navigate to correct pages',
        createdById: adminUser.id,
      },
    });

    const responsiveDesignTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Responsive Design - Mobile View',
        description: 'Verify that application displays correctly on mobile devices',
        expectedResult: 'All UI elements are properly sized and accessible on mobile screens',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
        moduleId: uiModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 10,
        preconditions: 'Access application from mobile device or emulator',
        postconditions: 'UI renders correctly in mobile viewport',
        createdById: adminUser.id,
      },
    });

    const formValidationTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Form Input Validation',
        description: 'Verify that form fields validate input correctly and display appropriate error messages',
        expectedResult: 'Invalid inputs are rejected with clear error messages',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'API Authentication Endpoint',
        description: 'Verify that /api/auth/login endpoint returns correct response',
        expectedResult: 'HTTP 200 response with valid JWT token in response body',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'API Projects List Endpoint',
        description: 'Verify that /api/projects endpoint returns user projects',
        expectedResult: 'HTTP 200 response with projects array containing user projects',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
        moduleId: apiModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 6,
        preconditions: 'User is authenticated',
        postconditions: 'Returns 200 status with projects array',
        createdById: adminUser.id,
      },
    });

    const apiErrorHandlingTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'API Error Handling',
        description: 'Verify that API endpoints return appropriate error codes and messages',
        expectedResult: 'API returns correct HTTP status codes and error messages for various error scenarios',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
        moduleId: apiModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 12,
        preconditions: 'API server is running',
        postconditions: 'Error responses are properly formatted and informative',
        createdById: adminUser.id,
      },
    });
    console.log('   ✅ Test Cases: API Testing (3 cases)');

    // Add some test cases for security module (assigned to Security Suite)
    const rbacTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
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
        tcId: `TC-${testCaseCounter++}`,
        title: 'XSS Attack Prevention',
        description: 'Verify that application properly sanitizes user input to prevent XSS attacks',
        expectedResult: 'User input is sanitized and XSS payloads are neutralized',
        projectId: demoProject.id,
        moduleId: securityModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 15,
        preconditions: 'Application has input fields that display user-generated content',
        postconditions: 'XSS payloads are properly escaped or rejected',
        createdById: adminUser.id,
      },
    });

    const dataEncryptionTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Sensitive Data Encryption',
        description: 'Verify that sensitive data is encrypted both in transit and at rest',
        expectedResult: 'All sensitive data is properly encrypted using industry-standard algorithms',
        projectId: demoProject.id,
        moduleId: securityModule.id,
        priority: 'HIGH',
        status: 'DRAFT',
        estimatedTime: 25,
        preconditions: 'Access to database and network traffic monitoring tools',
        postconditions: 'Sensitive data is encrypted according to security standards',
        createdById: adminUser.id,
      },
    });
    console.log('   ✅ Test Cases: Security Module (3 cases - assigned to Security Suite)');

    // Add a few more test cases with different statuses for variety
    const deprecatedTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Legacy Login Method (Deprecated)',
        description: 'Old login method using username instead of email. This test case is deprecated.',
        expectedResult: 'N/A - Deprecated',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
        moduleId: authModule.id,
        priority: 'LOW',
        status: 'DEPRECATED',
        estimatedTime: 0,
        preconditions: 'N/A',
        postconditions: 'N/A',
        createdById: adminUser.id,
      },
    });

    const draftTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Two-Factor Authentication',
        description: 'Test case for 2FA implementation (work in progress)',
        expectedResult: 'User can enable and use 2FA for login',
        projectId: demoProject.id,
        suiteId: functionalSuite.id,
        moduleId: authModule.id,
        priority: 'HIGH',
        status: 'DRAFT',
        estimatedTime: 15,
        preconditions: '2FA feature is implemented',
        postconditions: 'User can successfully authenticate with 2FA',
        createdById: projectManager.id,
      },
    });
    console.log('   ✅ Additional test cases: 1 DEPRECATED, 1 DRAFT');

    // Add test cases for Data Management module
    const dataCreateTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Create New Record',
        description: 'Verify that users can create new records with valid data',
        expectedResult: 'New record is created successfully and displayed in the list',
        projectId: demoProject.id,
        moduleId: dataModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 8,
        preconditions: 'User is logged in and has create permissions',
        postconditions: 'New record is saved and visible in the system',
        createdById: testers[0].id,
      },
    });

    const dataUpdateTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Update Existing Record',
        description: 'Verify that users can update existing records',
        expectedResult: 'Record is updated successfully with new data',
        projectId: demoProject.id,
        moduleId: dataModule.id,
        priority: 'HIGH',
        status: 'ACTIVE',
        estimatedTime: 6,
        preconditions: 'Record exists in the system',
        postconditions: 'Record reflects the updated information',
        createdById: testers[0].id,
      },
    });

    const dataDeleteTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Delete Record',
        description: 'Verify that users can delete records with confirmation',
        expectedResult: 'Record is deleted after confirmation and removed from the list',
        projectId: demoProject.id,
        moduleId: dataModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 5,
        preconditions: 'Record exists in the system',
        postconditions: 'Record is permanently deleted from the system',
        createdById: testers[1].id,
      },
    });

    const dataSearchTestCase = await prisma.testCase.create({
      data: {
        tcId: `TC-${testCaseCounter++}`,
        title: 'Search and Filter Functionality',
        description: 'Verify that search and filter features work correctly',
        expectedResult: 'Search returns relevant results and filters apply correctly',
        projectId: demoProject.id,
        moduleId: dataModule.id,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        estimatedTime: 10,
        preconditions: 'Multiple records exist in the system',
        postconditions: 'Search and filter results match the criteria',
        createdById: testers[1].id,
      },
    });
    console.log('   ✅ Test Cases: Data Management (4 cases)');

    // Create demo test run (assigned to project manager)
    const testRun = await prisma.testRun.create({
      data: {
        name: 'Sprint 1 Regression Testing',
        description: 'End-to-end regression testing for Sprint 1 release',
        projectId: demoProject.id,
        assignedToId: projectManager.id,
        environment: 'Staging',
        status: 'IN_PROGRESS',
        createdById: adminUser.id,
        startedAt: new Date(),
      },
    });

    // Create test results for the test run (executed by different testers)
    await prisma.testResult.createMany({
      data: [
        {
          testRunId: testRun.id,
          testCaseId: loginTestCase.id,
          status: 'PASSED',
          executedById: testers[0].id,
          executedAt: new Date(Date.now() - 3600000), // 1 hour ago
          comment: 'User successfully logged in with valid credentials',
          duration: 4,
        },
        {
          testRunId: testRun.id,
          testCaseId: logoutTestCase.id,
          status: 'PASSED',
          executedById: testers[0].id,
          executedAt: new Date(Date.now() - 3000000), // 50 minutes ago
          comment: 'User successfully logged out',
          duration: 2,
        },
        {
          testRunId: testRun.id,
          testCaseId: passwordResetTestCase.id,
          status: 'FAILED',
          executedById: testers[1].id,
          executedAt: new Date(Date.now() - 2400000), // 40 minutes ago
          comment: 'Email service might be experiencing delays',
          errorMessage: 'Email not received within expected time',
          duration: 10,
        },
        {
          testRunId: testRun.id,
          testCaseId: sessionManagementTestCase.id,
          status: 'PASSED',
          executedById: testers[1].id,
          executedAt: new Date(Date.now() - 2100000), // 35 minutes ago
          comment: 'Session timeout working as expected',
          duration: 14,
        },
        {
          testRunId: testRun.id,
          testCaseId: dashboardTestCase.id,
          status: 'PASSED',
          executedById: testers[2].id,
          executedAt: new Date(Date.now() - 1800000), // 30 minutes ago
          comment: 'Dashboard renders correctly with all widgets',
          duration: 6,
        },
        {
          testRunId: testRun.id,
          testCaseId: navigationTestCase.id,
          status: 'PASSED',
          executedById: testers[2].id,
          executedAt: new Date(Date.now() - 1200000), // 20 minutes ago
          comment: 'All navigation items working as expected',
          duration: 4,
        },
        {
          testRunId: testRun.id,
          testCaseId: responsiveDesignTestCase.id,
          status: 'PASSED',
          executedById: testers[1].id,
          executedAt: new Date(Date.now() - 900000), // 15 minutes ago
          comment: 'Mobile responsive design working correctly',
          duration: 9,
        },
        {
          testRunId: testRun.id,
          testCaseId: formValidationTestCase.id,
          status: 'PASSED',
          executedById: testers[0].id,
          executedAt: new Date(Date.now() - 600000), // 10 minutes ago
          comment: 'All form validations working as expected',
          duration: 7,
        },
        {
          testRunId: testRun.id,
          testCaseId: apiAuthTestCase.id,
          status: 'SKIPPED',
          executedById: testers[2].id,
        },
        {
          testRunId: testRun.id,
          testCaseId: apiProjectsTestCase.id,
          status: 'SKIPPED',
          executedById: testers[2].id,
        },
        {
          testRunId: testRun.id,
          testCaseId: apiErrorHandlingTestCase.id,
          status: 'SKIPPED',
          executedById: testers[2].id,
        },
      ],
    });
    // Link test cases to suites using many-to-many relationship
    // This establishes which modules each suite groups (suites group modules via test cases)
    // Suites are test types (Functional, Smoke, Regression, Non-functional) that group modules
    console.log('\n🔗 Linking test cases to suites (suites group modules)...');
    await prisma.testCaseSuite.createMany({
      data: [
        // Functional Suite - groups Authentication, UI, and API modules
        { testCaseId: loginTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: logoutTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: passwordResetTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: sessionManagementTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: deprecatedTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: draftTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: dashboardTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: navigationTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: responsiveDesignTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: formValidationTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: apiAuthTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: apiProjectsTestCase.id, testSuiteId: functionalSuite.id },
        { testCaseId: apiErrorHandlingTestCase.id, testSuiteId: functionalSuite.id },
        // Smoke Suite - groups critical Authentication and UI test cases
        { testCaseId: loginTestCase.id, testSuiteId: smokeSuite.id },
        { testCaseId: logoutTestCase.id, testSuiteId: smokeSuite.id },
        { testCaseId: dashboardTestCase.id, testSuiteId: smokeSuite.id },
        // Regression Suite - groups all modules for comprehensive testing
        { testCaseId: loginTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: logoutTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: passwordResetTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: sessionManagementTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: deprecatedTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: dashboardTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: navigationTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: responsiveDesignTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: formValidationTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: apiAuthTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: apiProjectsTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: apiErrorHandlingTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: dataCreateTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: dataUpdateTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: dataDeleteTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: dataSearchTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: rbacTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: xssPreventionTestCase.id, testSuiteId: regressionSuite.id },
        { testCaseId: dataEncryptionTestCase.id, testSuiteId: regressionSuite.id },
        // Non-functional Suite - groups Security and API modules
        { testCaseId: rbacTestCase.id, testSuiteId: nonFunctionalSuite.id },
        { testCaseId: xssPreventionTestCase.id, testSuiteId: nonFunctionalSuite.id },
        { testCaseId: dataEncryptionTestCase.id, testSuiteId: nonFunctionalSuite.id },
        { testCaseId: apiAuthTestCase.id, testSuiteId: nonFunctionalSuite.id },
        { testCaseId: apiErrorHandlingTestCase.id, testSuiteId: nonFunctionalSuite.id },
      ],
    });
    console.log('   ✅ Linked test cases to suites (Functional, Smoke, Regression, Non-functional)');

    // Link test run to suites
    // Test runs use suites, and suites group modules (which contain test cases)
    await prisma.testRunSuite.createMany({
      data: [
        { testRunId: testRun.id, testSuiteId: functionalSuite.id }, // Functional testing suite
        { testRunId: testRun.id, testSuiteId: regressionSuite.id }, // Regression testing suite
      ],
    });
    console.log('   ✅ Linked test run to Functional and Regression suites');

    // Add test steps for all test cases
    console.log('\n📋 Adding test steps...');
    
    // Login test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: loginTestCase.id, stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login form is displayed with email and password fields' },
        { testCaseId: loginTestCase.id, stepNumber: 2, action: 'Enter valid email address', expectedResult: 'Email field accepts input' },
        { testCaseId: loginTestCase.id, stepNumber: 3, action: 'Enter valid password', expectedResult: 'Password field shows masked characters' },
        { testCaseId: loginTestCase.id, stepNumber: 4, action: 'Click Login button', expectedResult: 'Form submits and user is redirected to dashboard' },
      ],
    });

    // Logout test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: logoutTestCase.id, stepNumber: 1, action: 'Login to the application', expectedResult: 'User is authenticated and dashboard is displayed' },
        { testCaseId: logoutTestCase.id, stepNumber: 2, action: 'Click logout button in user menu', expectedResult: 'User is logged out and redirected to login page' },
      ],
    });

    // Password reset test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: passwordResetTestCase.id, stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login form is displayed' },
        { testCaseId: passwordResetTestCase.id, stepNumber: 2, action: 'Click "Forgot Password" link', expectedResult: 'Password reset form is displayed' },
        { testCaseId: passwordResetTestCase.id, stepNumber: 3, action: 'Enter registered email address', expectedResult: 'Email field accepts input' },
        { testCaseId: passwordResetTestCase.id, stepNumber: 4, action: 'Click "Send Reset Link" button', expectedResult: 'Success message is displayed' },
        { testCaseId: passwordResetTestCase.id, stepNumber: 5, action: 'Check email inbox', expectedResult: 'Password reset email is received within 5 minutes' },
        { testCaseId: passwordResetTestCase.id, stepNumber: 6, action: 'Click reset link in email', expectedResult: 'Password reset page is displayed' },
        { testCaseId: passwordResetTestCase.id, stepNumber: 7, action: 'Enter new password and confirm', expectedResult: 'Password is successfully reset' },
      ],
    });

    // Session management test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: sessionManagementTestCase.id, stepNumber: 1, action: 'Login to the application', expectedResult: 'User is authenticated' },
        { testCaseId: sessionManagementTestCase.id, stepNumber: 2, action: 'Wait for session timeout period (configured time)', expectedResult: 'Session expires after timeout' },
        { testCaseId: sessionManagementTestCase.id, stepNumber: 3, action: 'Try to access protected page', expectedResult: 'User is redirected to login page with session expired message' },
      ],
    });

    // Dashboard test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: dashboardTestCase.id, stepNumber: 1, action: 'Login to the application', expectedResult: 'User is authenticated' },
        { testCaseId: dashboardTestCase.id, stepNumber: 2, action: 'Navigate to dashboard', expectedResult: 'Dashboard page loads' },
        { testCaseId: dashboardTestCase.id, stepNumber: 3, action: 'Verify all widgets are displayed', expectedResult: 'All required widgets are visible and properly formatted' },
      ],
    });

    // Navigation test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: navigationTestCase.id, stepNumber: 1, action: 'Login to the application', expectedResult: 'User is authenticated' },
        { testCaseId: navigationTestCase.id, stepNumber: 2, action: 'Click each menu item in navigation', expectedResult: 'Each menu item navigates to its respective page without errors' },
        { testCaseId: navigationTestCase.id, stepNumber: 3, action: 'Verify breadcrumb navigation', expectedResult: 'Breadcrumb trail is displayed correctly' },
      ],
    });

    // Responsive design test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: responsiveDesignTestCase.id, stepNumber: 1, action: 'Open application in mobile browser or emulator', expectedResult: 'Application loads' },
        { testCaseId: responsiveDesignTestCase.id, stepNumber: 2, action: 'Set viewport to 320x568 (iPhone SE)', expectedResult: 'Viewport is set' },
        { testCaseId: responsiveDesignTestCase.id, stepNumber: 3, action: 'Navigate through all pages', expectedResult: 'All UI elements are properly sized and accessible' },
        { testCaseId: responsiveDesignTestCase.id, stepNumber: 4, action: 'Verify no horizontal scrolling required', expectedResult: 'All content fits within viewport' },
      ],
    });

    // Form validation test case steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: formValidationTestCase.id, stepNumber: 1, action: 'Navigate to any form', expectedResult: 'Form is displayed' },
        { testCaseId: formValidationTestCase.id, stepNumber: 2, action: 'Submit form with invalid data', expectedResult: 'Form validation errors are displayed' },
        { testCaseId: formValidationTestCase.id, stepNumber: 3, action: 'Verify error messages are clear and helpful', expectedResult: 'Error messages are informative' },
        { testCaseId: formValidationTestCase.id, stepNumber: 4, action: 'Correct errors and resubmit', expectedResult: 'Form submits successfully' },
      ],
    });

    // API test cases steps
    await prisma.testStep.createMany({
      data: [
        { testCaseId: apiAuthTestCase.id, stepNumber: 1, action: 'Send POST request to /api/auth/login with valid credentials', expectedResult: 'HTTP 200 response received' },
        { testCaseId: apiAuthTestCase.id, stepNumber: 2, action: 'Verify response contains JWT token', expectedResult: 'Valid JWT token is present in response body' },
        { testCaseId: apiProjectsTestCase.id, stepNumber: 1, action: 'Send GET request to /api/projects with valid auth token', expectedResult: 'HTTP 200 response received' },
        { testCaseId: apiProjectsTestCase.id, stepNumber: 2, action: 'Verify response contains projects array', expectedResult: 'Projects array is present with user projects' },
        { testCaseId: apiErrorHandlingTestCase.id, stepNumber: 1, action: 'Send request with invalid auth token', expectedResult: 'HTTP 401 Unauthorized response' },
        { testCaseId: apiErrorHandlingTestCase.id, stepNumber: 2, action: 'Send request with invalid data', expectedResult: 'HTTP 400 Bad Request with error message' },
        { testCaseId: apiErrorHandlingTestCase.id, stepNumber: 3, action: 'Send request to non-existent endpoint', expectedResult: 'HTTP 404 Not Found response' },
      ],
    });

    console.log('   ✅ Added test steps for all test cases');

    // Create requirements and link to test cases
    console.log('\n📄 Creating requirements...');
    const req1 = await prisma.requirement.create({
      data: {
        key: 'REQ-001',
        projectId: demoProject.id,
        title: 'User Authentication System',
        description: 'Users must be able to authenticate using email and password. The system must support login, logout, and password reset functionality.',
        priority: 'CRITICAL',
        status: 'APPROVED',
      },
    });

    const req2 = await prisma.requirement.create({
      data: {
        key: 'REQ-002',
        projectId: demoProject.id,
        title: 'Responsive User Interface',
        description: 'The application must be fully responsive and work correctly on mobile, tablet, and desktop devices.',
        priority: 'HIGH',
        status: 'APPROVED',
      },
    });

    const req3 = await prisma.requirement.create({
      data: {
        key: 'REQ-003',
        projectId: demoProject.id,
        title: 'RESTful API',
        description: 'The application must provide RESTful API endpoints for all core functionality with proper authentication and error handling.',
        priority: 'CRITICAL',
        status: 'APPROVED',
      },
    });

    // Add more requirements with different priorities and statuses
    const req4 = await prisma.requirement.create({
      data: {
        key: 'REQ-004',
        projectId: demoProject.id,
        title: 'Email Notification System',
        description: 'System should send email notifications for important events like password resets and defect assignments.',
        priority: 'MEDIUM',
        status: 'IMPLEMENTED',
      },
    });

    const req5 = await prisma.requirement.create({
      data: {
        key: 'REQ-005',
        projectId: demoProject.id,
        title: 'Dark Mode Support',
        description: 'Application should support dark mode theme for better user experience in low-light conditions.',
        priority: 'LOW',
        status: 'DRAFT',
      },
    });

    // Link requirements to test cases (many-to-many relationship)
    await prisma.requirement.update({
      where: { id: req1.id },
      data: { 
        testCases: { 
          connect: [
            { id: loginTestCase.id },
            { id: logoutTestCase.id },
            { id: passwordResetTestCase.id },
          ],
        },
      },
    });
    await prisma.requirement.update({
      where: { id: req2.id },
      data: { 
        testCases: { 
          connect: [{ id: responsiveDesignTestCase.id }],
        },
      },
    });
    await prisma.requirement.update({
      where: { id: req3.id },
      data: { 
        testCases: { 
          connect: [
            { id: apiAuthTestCase.id },
            { id: apiProjectsTestCase.id },
            { id: apiErrorHandlingTestCase.id },
          ],
        },
      },
    });
    console.log('   ✅ Created 3 requirements and linked to test cases');

    // Add comments to test cases (from different users)
    console.log('\n💬 Adding comments to test cases...');
    await prisma.comment.createMany({
      data: [
        {
          testCaseId: loginTestCase.id,
          userId: projectManager.id,
          content: 'This test case covers the core authentication flow. Make sure to test with various email formats.',
        },
        {
          testCaseId: passwordResetTestCase.id,
          userId: testers[1].id,
          content: 'Email delivery might be delayed in test environments. Consider using email testing services.',
        },
        {
          testCaseId: formValidationTestCase.id,
          userId: testers[0].id,
          content: 'Accessibility testing is crucial here. Ensure screen readers can announce validation errors.',
        },
        {
          testCaseId: apiAuthTestCase.id,
          userId: testers[2].id,
          content: 'API tests should be automated. Consider adding to CI/CD pipeline.',
        },
        {
          testCaseId: dashboardTestCase.id,
          userId: viewer.id,
          content: 'Great work on the dashboard layout! Looks professional.',
        },
      ],
    });
    console.log('   ✅ Added comments to test cases from different team members');

    // Create additional test runs for better demo (assigned to different users)
    console.log('\n🏃 Creating additional test runs...');
    const testRun2 = await prisma.testRun.create({
      data: {
        name: 'Sprint 2 Smoke Testing',
        description: 'Quick smoke tests for critical functionality',
        projectId: demoProject.id,
        assignedToId: testers[0].id,
        environment: 'QA',
        status: 'COMPLETED',
        createdById: projectManager.id,
        startedAt: new Date(Date.now() - 172800000), // 2 days ago
        completedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    });

    // Link test run 2 to suites (suites group modules for test runs)
    await prisma.testRunSuite.createMany({
      data: [
        { testRunId: testRun2.id, testSuiteId: smokeSuite.id }, // Smoke testing suite
      ],
    });

    await prisma.testResult.createMany({
      data: [
        {
          testRunId: testRun2.id,
          testCaseId: loginTestCase.id,
          status: 'PASSED',
          executedById: testers[0].id,
          executedAt: new Date(Date.now() - 172800000),
          comment: 'All smoke tests passed',
          duration: 3,
        },
        {
          testRunId: testRun2.id,
          testCaseId: logoutTestCase.id,
          status: 'PASSED',
          executedById: testers[0].id,
          executedAt: new Date(Date.now() - 172800000),
          duration: 2,
        },
      ],
    });

    const testRun3 = await prisma.testRun.create({
      data: {
        name: 'Production Release Testing',
        description: 'Full regression testing before production release',
        projectId: demoProject.id,
        assignedToId: testers[1].id,
        environment: 'Production',
        status: 'PLANNED',
        createdById: projectManager.id,
      },
    });

    // Link test run 3 to suites (suites group modules for test runs)
    await prisma.testRunSuite.createMany({
      data: [
        { testRunId: testRun3.id, testSuiteId: regressionSuite.id }, // Regression testing suite
        { testRunId: testRun3.id, testSuiteId: nonFunctionalSuite.id }, // Non-functional testing suite
      ],
    });

    await prisma.testResult.createMany({
      data: [
        {
          testRunId: testRun3.id,
          testCaseId: loginTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: logoutTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: passwordResetTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: sessionManagementTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: dashboardTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: navigationTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: responsiveDesignTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: formValidationTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: apiAuthTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: apiProjectsTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
        {
          testRunId: testRun3.id,
          testCaseId: apiErrorHandlingTestCase.id,
          status: 'SKIPPED',
          executedById: testers[1].id,
        },
      ],
    });

    console.log('   ✅ Created 2 additional test runs');

    console.log('   ✅ Test Run: Sprint 1 Regression Testing');
    console.log('      - 8 tests executed (7 passed, 1 failed)');
    console.log('      - 3 tests skipped');
  }

  // Create sample defects (outside the demo project creation block)
  if (demoProject) {
    const existingDefects = await prisma.defect.count({
      where: { projectId: demoProject.id },
    });

    if (existingDefects === 0) {
      console.log('\n📝 Creating sample defects...');
      
      // Get test cases for linking (using correct titles)
      const passwordResetTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Password Reset Flow' },
      });
      
      const dashboardTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Dashboard Layout Validation' },
      });
      
      const formValidationTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Form Input Validation' },
      });
      
      const navigationTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Navigation Menu Functionality' },
      });
      
      const sessionManagementTestCase = await prisma.testCase.findFirst({
        where: { projectId: demoProject.id, title: 'Session Timeout Handling' },
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
        assignedToId: testers[1].id, // Assigned to tester who found it
        createdById: testers[1].id,
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
        assignedToId: testers[2].id, // Assigned to tester
        createdById: testers[2].id,
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
        assignedToId: testers[0].id, // Assigned to tester
        createdById: testers[0].id,
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

    const defect4 = await prisma.defect.create({
      data: {
        defectId: 'DEF-4',
        projectId: demoProject.id,
        title: 'API rate limiting not enforced',
        description: 'API endpoints do not enforce rate limiting, allowing potential DDoS attacks.\n\nSteps: 1. Use API testing tool (Postman/curl)\n2. Send 1000 requests per second to /api/projects endpoint\n3. Observe response codes\n\nExpected: After 100 requests per minute, should return 429 Too Many Requests\nActual: All requests processed successfully without rate limiting',
        severity: 'CRITICAL',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        assignedToId: testers[2].id, // Assigned to automation tester
        createdById: testers[2].id,
        environment: 'Production',
        dueDate: new Date(Date.now() + 259200000),
        progressPercentage: 30,
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
        assignedToId: testers[1].id,
        createdById: testers[1].id,
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
        assignedToId: testers[0].id,
        createdById: testers[0].id,
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
        assignedToId: testers[1].id,
        createdById: testers[1].id,
        environment: 'Production',
        resolvedAt: new Date(Date.now() - 259200000),
        closedAt: new Date(Date.now() - 172800000),
        progressPercentage: 100,
      },
    });

    // Add comments to defects (from different team members)
    console.log('\n💬 Adding comments to defects...');
    await prisma.defectComment.createMany({
      data: [
        {
          defectId: defect1.id,
          userId: projectManager.id,
          content: 'I\'ve checked the email service logs. The emails are being sent but might be getting caught by spam filters. We should add SPF and DKIM records.',
        },
        {
          defectId: defect1.id,
          userId: testers[1].id,
          content: 'Update: Email service provider confirmed delivery. Issue might be on recipient side. Will investigate further.',
        },
        {
          defectId: defect2.id,
          userId: testers[2].id,
          content: 'Started working on responsive CSS. Using CSS Grid and Flexbox for better mobile support.',
        },
        {
          defectId: defect2.id,
          userId: projectManager.id,
          content: 'Great progress! Let me know when ready for review.',
        },
        {
          defectId: defect3.id,
          userId: testers[0].id,
          content: 'This is a critical accessibility issue. We need to add proper ARIA labels and live regions for screen readers.',
        },
        {
          defectId: defect3.id,
          userId: projectManager.id,
          content: 'Agreed. This should be prioritized. Accessibility is important for compliance.',
        },
        {
          defectId: defect4.id,
          userId: testers[2].id,
          content: 'This is a security vulnerability. We need to implement rate limiting immediately. Suggest using express-rate-limit middleware.',
        },
        {
          defectId: defect4.id,
          userId: adminUser.id,
          content: 'Approved. This is critical. Please implement ASAP.',
        },
        {
          defectId: defect6.id,
          userId: testers[0].id,
          content: 'Fixed by invalidating all user sessions when password is changed. Tested and verified.',
        },
        {
          defectId: defect6.id,
          userId: projectManager.id,
          content: 'Excellent work! Security issue resolved.',
        },
      ],
    });
    console.log('   ✅ Added comments to defects from different team members');

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
