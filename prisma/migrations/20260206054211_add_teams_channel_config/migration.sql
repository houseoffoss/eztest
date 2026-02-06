-- CreateTable
CREATE TABLE "TeamsChannelConfig" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "configuredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamsChannelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamsChannelConfig_channelId_key" ON "TeamsChannelConfig"("channelId");

-- CreateIndex
CREATE INDEX "TeamsChannelConfig_teamId_idx" ON "TeamsChannelConfig"("teamId");

-- CreateIndex
CREATE INDEX "TeamsChannelConfig_projectId_idx" ON "TeamsChannelConfig"("projectId");

-- CreateIndex
CREATE INDEX "TeamsChannelConfig_configuredBy_idx" ON "TeamsChannelConfig"("configuredBy");

-- AddForeignKey
ALTER TABLE "TeamsChannelConfig" ADD CONSTRAINT "TeamsChannelConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
