/*
  Warnings:

*/
-- CreateTable
CREATE TABLE "TestRunSuite" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "testSuiteId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestRunSuite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestRunSuite_testRunId_idx" ON "TestRunSuite"("testRunId");

-- CreateIndex
CREATE INDEX "TestRunSuite_testSuiteId_idx" ON "TestRunSuite"("testSuiteId");

-- CreateIndex
CREATE UNIQUE INDEX "TestRunSuite_testRunId_testSuiteId_key" ON "TestRunSuite"("testRunId", "testSuiteId");

-- AddForeignKey
ALTER TABLE "TestRunSuite" ADD CONSTRAINT "TestRunSuite_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRunSuite" ADD CONSTRAINT "TestRunSuite_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES "TestSuite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
