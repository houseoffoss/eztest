-- CreateTable
CREATE TABLE "TestCaseSuite" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "testSuiteId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCaseSuite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestCaseSuite_testCaseId_idx" ON "TestCaseSuite"("testCaseId");

-- CreateIndex
CREATE INDEX "TestCaseSuite_testSuiteId_idx" ON "TestCaseSuite"("testSuiteId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCaseSuite_testCaseId_testSuiteId_key" ON "TestCaseSuite"("testCaseId", "testSuiteId");

-- AddForeignKey
ALTER TABLE "TestCaseSuite" ADD CONSTRAINT "TestCaseSuite_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseSuite" ADD CONSTRAINT "TestCaseSuite_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES "TestSuite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from TestCase.suiteId to TestCaseSuite table
INSERT INTO "TestCaseSuite" ("id", "testCaseId", "testSuiteId", "addedAt")
SELECT gen_random_uuid(), "id", "suiteId", "createdAt"
FROM "TestCase"
WHERE "suiteId" IS NOT NULL;
