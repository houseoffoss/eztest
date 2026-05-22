-- CreateTable
CREATE TABLE "AgentTestCase" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "rubric" TEXT NOT NULL,
    "expectedBehavior" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentTestCase_configId_idx" ON "AgentTestCase"("configId");

-- AddForeignKey
ALTER TABLE "AgentTestCase" ADD CONSTRAINT "AgentTestCase_configId_fkey" FOREIGN KEY ("configId") REFERENCES "AgentTestConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
