-- CreateTable
CREATE TABLE "DefectWatcher" (
    "id" TEXT NOT NULL,
    "defectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefectWatcher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DefectWatcher_defectId_idx" ON "DefectWatcher"("defectId");

-- CreateIndex
CREATE INDEX "DefectWatcher_userId_idx" ON "DefectWatcher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DefectWatcher_defectId_userId_key" ON "DefectWatcher"("defectId", "userId");

-- AddForeignKey
ALTER TABLE "DefectWatcher" ADD CONSTRAINT "DefectWatcher_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectWatcher" ADD CONSTRAINT "DefectWatcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
