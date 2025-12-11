-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "testStepId" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_testStepId_idx" ON "Attachment"("testStepId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_testStepId_fkey" FOREIGN KEY ("testStepId") REFERENCES "TestStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
