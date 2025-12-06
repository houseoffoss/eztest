-- Drop stepsToReproduce, actualResult, and expectedResult columns from Defect table
ALTER TABLE "Defect" DROP COLUMN "stepsToReproduce";
ALTER TABLE "Defect" DROP COLUMN "actualResult";
ALTER TABLE "Defect" DROP COLUMN "expectedResult";
