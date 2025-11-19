import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test runs for demo project...\n');

  try {
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@eztest.local' },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Get demo project
    const demoProject = await prisma.project.findFirst({
      where: {
        createdById: adminUser.id,
        key: 'DEMO',
      },
    });

    if (!demoProject) {
      console.log('❌ Demo project not found');
      return;
    }

    // Check if test run already exists
    const existingTestRun = await prisma.testRun.findFirst({
      where: { projectId: demoProject.id },
    });

    if (existingTestRun) {
      console.log('✅ Test runs already exist for demo project');
      return;
    }

    // Get test cases
    const testCases = await prisma.testCase.findMany({
      where: { projectId: demoProject.id },
      orderBy: { createdAt: 'asc' },
    });

    if (testCases.length === 0) {
      console.log('❌ No test cases found for demo project');
      return;
    }

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
    const testResults = testCases.map((tc, index) => {
      const statuses: string[] = ['PASSED', 'PASSED', 'FAILED', 'PASSED', 'PASSED', 'SKIPPED', 'SKIPPED'];
      const status = (statuses[index] || 'SKIPPED') as 'PASSED' | 'FAILED' | 'SKIPPED';

      const resultData = {
        testRunId: testRun.id,
        testCaseId: tc.id,
        status,
        executedById: adminUser.id,
        duration: Math.floor(Math.random() * 8) + 2,
      } as const;

      if (status !== 'SKIPPED') {
        return {
          ...resultData,
          executedAt: new Date(Date.now() - (testCases.length - index) * 600000),
          ...(status === 'PASSED' && { comment: 'Test passed successfully' }),
          ...(status === 'FAILED' && {
            comment: 'Test failed during execution',
            errorMessage: 'Assertion failed',
          }),
        };
      }

      return resultData;
    });

    await prisma.testResult.createMany({
      data: testResults,
    });

    const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
    const failedCount = testResults.filter((r) => r.status === 'FAILED').length;
    const skippedCount = testResults.filter((r) => r.status === 'SKIPPED').length;

    console.log('✅ Test Run: Sprint 1 Regression Testing created');
    console.log(`   - ${passedCount} tests passed`);
    console.log(`   - ${failedCount} tests failed`);
    console.log(`   - ${skippedCount} tests skipped`);

    console.log('\n🎉 Test runs seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding test runs:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
