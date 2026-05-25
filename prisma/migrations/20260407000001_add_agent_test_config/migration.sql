-- CreateTable
CREATE TABLE "AgentTestConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agentApiUrl" TEXT NOT NULL,
    "langfusePublicKey" TEXT NOT NULL,
    "langfuseSecretKey" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentTestConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentTestConfig_createdById_idx" ON "AgentTestConfig"("createdById");

-- AddForeignKey
ALTER TABLE "AgentTestConfig" ADD CONSTRAINT "AgentTestConfig_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
