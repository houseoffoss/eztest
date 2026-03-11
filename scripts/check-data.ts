import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('=== データベース状態確認 ===\n');

  // Moduleの数を確認
  const modules = await prisma.module.findMany({
    include: {
      _count: {
        select: { testCases: true },
      },
    },
  });
  console.log(`📁 Module数: ${modules.length}`);
  modules.forEach((m) => {
    console.log(`  - ${m.name}: ${m._count.testCases} test cases`);
  });

  // Test Caseの数を確認
  const testCases = await prisma.testCase.findMany({
    include: {
      module: true,
    },
  });
  console.log(`\n📝 Test Case数: ${testCases.length}`);
  
  // moduleIdがnullのTest Case
  const ungrouped = testCases.filter((tc) => !tc.moduleId);
  console.log(`  - moduleId有り: ${testCases.length - ungrouped.length}`);
  console.log(`  - moduleId無し (Ungrouped): ${ungrouped.length}`);

  // Test Suiteの数を確認
  const testSuites = await prisma.testSuite.findMany({
    include: {
      _count: {
        select: { testCaseSuites: true },
      },
    },
  });
  console.log(`\n📦 Test Suite数: ${testSuites.length}`);
  testSuites.forEach((s) => {
    console.log(`  - ${s.name}: ${s._count.testCaseSuites} test cases`);
  });

  // TestCaseSuiteの関連数
  const testCaseSuites = await prisma.testCaseSuite.count();
  console.log(`\n🔗 TestCaseSuite関連数: ${testCaseSuites}`);

  // 最初の5つのTest Caseを表示
  if (testCases.length > 0) {
    console.log('\n--- 最初の5つのTest Case ---');
    testCases.slice(0, 5).forEach((tc) => {
      console.log(`  ID: ${tc.id}`);
      console.log(`  Title: ${tc.title}`);
      console.log(`  Module: ${tc.module?.name || '(なし)'}`);
      console.log(`  ModuleId: ${tc.moduleId || '(null)'}`);
      console.log('  ---');
    });
  }

  await prisma.$disconnect();
}

checkData().catch(console.error);
