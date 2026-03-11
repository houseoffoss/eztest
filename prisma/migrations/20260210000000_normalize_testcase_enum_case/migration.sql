-- Normalize TestCase.layer: Prisma enum TestLayer expects SMOKE, CORE, EXTENDED, UNKNOWN (uppercase)
UPDATE "TestCase" SET layer = 'SMOKE' WHERE layer::text IN ('Smoke', 'smoke');
UPDATE "TestCase" SET layer = 'CORE' WHERE layer::text IN ('Core', 'core');
UPDATE "TestCase" SET layer = 'EXTENDED' WHERE layer::text IN ('Extended', 'extended');
UPDATE "TestCase" SET layer = 'UNKNOWN' WHERE layer::text IN ('Unknown', 'unknown');

-- Normalize TestCase.targetType: TargetType enum expects uppercase
UPDATE "TestCase" SET "targetType" = 'FUNCTIONAL' WHERE "targetType"::text IN ('Functional', 'functional');
UPDATE "TestCase" SET "targetType" = 'NON_FUNCTIONAL' WHERE "targetType"::text IN ('Non_functional', 'non_functional', 'NonFunctional', 'nonfunctional');
UPDATE "TestCase" SET "targetType" = 'PERFORMANCE' WHERE "targetType"::text IN ('Performance', 'performance');
UPDATE "TestCase" SET "targetType" = 'SECURITY' WHERE "targetType"::text IN ('Security', 'security');
UPDATE "TestCase" SET "targetType" = 'USABILITY' WHERE "targetType"::text IN ('Usability', 'usability');
UPDATE "TestCase" SET "targetType" = 'COMPATIBILITY' WHERE "targetType"::text IN ('Compatibility', 'compatibility');
UPDATE "TestCase" SET "targetType" = 'API' WHERE "targetType"::text IN ('Api', 'api');
UPDATE "TestCase" SET "targetType" = 'SCREEN' WHERE "targetType"::text IN ('Screen', 'screen');
