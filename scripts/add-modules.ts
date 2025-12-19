/**
 * Add Modules to Existing Test Cases
 * 
 * Purpose: Database migration utility to add module associations to existing test cases
 * Usage: npx tsx scripts/add-modules.ts
 * 
 * This script creates modules for the demo project and associates existing test cases
 * with their appropriate modules based on their test suite.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addModulesToExistingData() {
  console.log('🔄 Adding modules to existing test cases...\n');

  // Get the demo project
  const demoProject = await prisma.project.findFirst({
    where: { key: 'DEMO' },
  });

  if (!demoProject) {
    console.log('❌ Demo project not found. Please run the main seed first.');
    return;
  }

  console.log('✅ Found demo project:', demoProject.name);

  // Check if modules already exist
  const existingModules = await prisma.module.findMany({
    where: { projectId: demoProject.id },
  });

  if (existingModules.length === 0) {
    // Create modules
    console.log('📦 Creating modules...');
    
    await prisma.module.create({
      data: {
        name: 'Authentication Module',
        description: 'All authentication-related test cases',
        projectId: demoProject.id,
        order: 1,
      },
    });
    console.log('   ✅ Module: Authentication Module');

    await prisma.module.create({
      data: {
        name: 'User Interface Module',
        description: 'UI/UX testing module',
        projectId: demoProject.id,
        order: 2,
      },
    });
    console.log('   ✅ Module: User Interface Module');

    await prisma.module.create({
      data: {
        name: 'API Module',
        description: 'Backend API testing module',
        projectId: demoProject.id,
        order: 3,
      },
    });
    console.log('   ✅ Module: API Module');
  } else {
    console.log('✅ Modules already exist');
  }

  // Get all modules
  const authModule = await prisma.module.findFirst({
    where: { projectId: demoProject.id, name: 'Authentication Module' },
  });
  const uiModule = await prisma.module.findFirst({
    where: { projectId: demoProject.id, name: 'User Interface Module' },
  });
  const apiModule = await prisma.module.findFirst({
    where: { projectId: demoProject.id, name: 'API Module' },
  });

  console.log('📝 Updating test cases with modules...');

  // Get test suites
  const authSuite = await prisma.testSuite.findFirst({
    where: { projectId: demoProject.id, name: 'Authentication' },
  });
  const uiSuite = await prisma.testSuite.findFirst({
    where: { projectId: demoProject.id, name: 'User Interface' },
  });
  const apiSuite = await prisma.testSuite.findFirst({
    where: { projectId: demoProject.id, name: 'API Testing' },
  });

  console.log('📋 Found suites:', {
    auth: authSuite?.name,
    ui: uiSuite?.name,
    api: apiSuite?.name,
  });

  console.log('📋 Found modules:', {
    auth: authModule?.name,
    ui: uiModule?.name,
    api: apiModule?.name,
  });

  // Update test cases with modules
  if (authModule && authSuite) {
    // Count test cases before update
    const beforeCount = await prisma.testCase.count({
      where: { suiteId: authSuite.id },
    });
    console.log(`   📊 Found ${beforeCount} test cases in Authentication suite`);
    
    const authTestCases = await prisma.testCase.updateMany({
      where: { suiteId: authSuite.id },
      data: { moduleId: authModule.id },
    });
    console.log(`   ✅ Updated ${authTestCases.count} test cases in Authentication suite`);
  }

  if (uiModule && uiSuite) {
    const beforeCount = await prisma.testCase.count({
      where: { suiteId: uiSuite.id },
    });
    console.log(`   📊 Found ${beforeCount} test cases in User Interface suite`);
    
    const uiTestCases = await prisma.testCase.updateMany({
      where: { suiteId: uiSuite.id },
      data: { moduleId: uiModule.id },
    });
    console.log(`   ✅ Updated ${uiTestCases.count} test cases in User Interface suite`);
  }

  if (apiModule && apiSuite) {
    const beforeCount = await prisma.testCase.count({
      where: { suiteId: apiSuite.id },
    });
    console.log(`   📊 Found ${beforeCount} test cases in API Testing suite`);
    
    const apiTestCases = await prisma.testCase.updateMany({
      where: { suiteId: apiSuite.id },
      data: { moduleId: apiModule.id },
    });
    console.log(`   ✅ Updated ${apiTestCases.count} test cases in API Testing suite`);
  }

  // Verify the updates
  const allTestCases = await prisma.testCase.findMany({
    where: { projectId: demoProject.id },
    select: {
      id: true,
      title: true,
      moduleId: true,
      suiteId: true,
    },
  });
  
  console.log('\n📊 Final test case status:');
  allTestCases.forEach(tc => {
    console.log(`   - ${tc.title}: moduleId=${tc.moduleId ? '✅' : '❌'}, suiteId=${tc.suiteId ? '✅' : '❌'}`);
  });

  console.log('\n🎉 Modules added successfully!');
}

addModulesToExistingData()
  .catch((e) => {
    console.error('❌ Error updating database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
