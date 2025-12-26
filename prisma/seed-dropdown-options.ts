import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed dropdown options data
 * This populates the DropdownOption table with initial values
 */
export async function seedDropdownOptions() {
  console.log('🎨 Seeding dropdown options...');

  const dropdownOptions = [
    // Priority options (used in TestCase, Requirement, Defect)
    { entity: 'TestCase', field: 'priority', value: 'CRITICAL', label: 'Critical', order: 1 },
    { entity: 'TestCase', field: 'priority', value: 'HIGH', label: 'High', order: 2 },
    { entity: 'TestCase', field: 'priority', value: 'MEDIUM', label: 'Medium', order: 3 },
    { entity: 'TestCase', field: 'priority', value: 'LOW', label: 'Low', order: 4 },

    // TestStatus options (used in TestCase)
    { entity: 'TestCase', field: 'status', value: 'ACTIVE', label: 'Active', order: 1 },
    { entity: 'TestCase', field: 'status', value: 'DEPRECATED', label: 'Deprecated', order: 2 },
    { entity: 'TestCase', field: 'status', value: 'DRAFT', label: 'Draft', order: 3 },

    // TestRunStatus options (used in TestRun)
    { entity: 'TestRun', field: 'status', value: 'PLANNED', label: 'Planned', order: 1 },
    { entity: 'TestRun', field: 'status', value: 'IN_PROGRESS', label: 'In Progress', order: 2 },
    { entity: 'TestRun', field: 'status', value: 'COMPLETED', label: 'Completed', order: 3 },
    { entity: 'TestRun', field: 'status', value: 'CANCELLED', label: 'Cancelled', order: 4 },

    // TestResultStatus options (used in TestResult)
    { entity: 'TestResult', field: 'status', value: 'PASSED', label: 'Passed', order: 1 },
    { entity: 'TestResult', field: 'status', value: 'FAILED', label: 'Failed', order: 2 },
    { entity: 'TestResult', field: 'status', value: 'BLOCKED', label: 'Blocked', order: 3 },
    { entity: 'TestResult', field: 'status', value: 'SKIPPED', label: 'Skipped', order: 4 },
    { entity: 'TestResult', field: 'status', value: 'RETEST', label: 'Retest', order: 5 },

    // RequirementStatus options (used in Requirement)
    { entity: 'Requirement', field: 'status', value: 'DRAFT', label: 'Draft', order: 1 },
    { entity: 'Requirement', field: 'status', value: 'APPROVED', label: 'Approved', order: 2 },
    { entity: 'Requirement', field: 'status', value: 'IMPLEMENTED', label: 'Implemented', order: 3 },
    { entity: 'Requirement', field: 'status', value: 'VERIFIED', label: 'Verified', order: 4 },
    { entity: 'Requirement', field: 'status', value: 'DEPRECATED', label: 'Deprecated', order: 5 },

    // Priority options for Requirement
    { entity: 'Requirement', field: 'priority', value: 'CRITICAL', label: 'Critical', order: 1 },
    { entity: 'Requirement', field: 'priority', value: 'HIGH', label: 'High', order: 2 },
    { entity: 'Requirement', field: 'priority', value: 'MEDIUM', label: 'Medium', order: 3 },
    { entity: 'Requirement', field: 'priority', value: 'LOW', label: 'Low', order: 4 },

    // DefectSeverity options (used in Defect)
    { entity: 'Defect', field: 'severity', value: 'CRITICAL', label: 'Critical', order: 1 },
    { entity: 'Defect', field: 'severity', value: 'HIGH', label: 'High', order: 2 },
    { entity: 'Defect', field: 'severity', value: 'MEDIUM', label: 'Medium', order: 3 },
    { entity: 'Defect', field: 'severity', value: 'LOW', label: 'Low', order: 4 },

    // DefectStatus options (used in Defect)
    { entity: 'Defect', field: 'status', value: 'NEW', label: 'New', order: 1 },
    { entity: 'Defect', field: 'status', value: 'IN_PROGRESS', label: 'In Progress', order: 2 },
    { entity: 'Defect', field: 'status', value: 'FIXED', label: 'Fixed', order: 3 },
    { entity: 'Defect', field: 'status', value: 'TESTED', label: 'Tested', order: 4 },
    { entity: 'Defect', field: 'status', value: 'CLOSED', label: 'Closed', order: 5 },

    // Priority options for Defect
    { entity: 'Defect', field: 'priority', value: 'CRITICAL', label: 'Critical', order: 1 },
    { entity: 'Defect', field: 'priority', value: 'HIGH', label: 'High', order: 2 },
    { entity: 'Defect', field: 'priority', value: 'MEDIUM', label: 'Medium', order: 3 },
    { entity: 'Defect', field: 'priority', value: 'LOW', label: 'Low', order: 4 },

    // Environment options for TestRun
    { entity: 'TestRun', field: 'environment', value: 'Production', label: 'Production', order: 1 },
    { entity: 'TestRun', field: 'environment', value: 'Staging', label: 'Staging', order: 2 },
    { entity: 'TestRun', field: 'environment', value: 'QA', label: 'QA', order: 3 },
    { entity: 'TestRun', field: 'environment', value: 'Development', label: 'Development', order: 4 },

    // Environment options for Defect
    { entity: 'Defect', field: 'environment', value: 'Production', label: 'Production', order: 1 },
    { entity: 'Defect', field: 'environment', value: 'Staging', label: 'Staging', order: 2 },
    { entity: 'Defect', field: 'environment', value: 'QA', label: 'QA', order: 3 },
    { entity: 'Defect', field: 'environment', value: 'Development', label: 'Development', order: 4 },
  ];

  console.log('  📝 Upserting dropdown options...');
  let created = 0;
  let updated = 0;

  for (const option of dropdownOptions) {
    const result = await prisma.dropdownOption.upsert({
      where: {
        entity_field_value: {
          entity: option.entity,
          field: option.field,
          value: option.value,
        },
      },
      update: {
        label: option.label,
        order: option.order,
        isActive: true, // Ensure all options are active
      },
      create: option,
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`  ✅ Created ${created} new options, updated ${updated} existing options`);
  console.log('✅ Dropdown options seeded successfully!\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDropdownOptions()
    .catch((e) => {
      console.error('❌ Error seeding dropdown options:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
