import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed RBAC data: Roles, Permissions, and RolePermissions
 * This creates a production-ready permission system for the EZTest application
 */
export async function seedRBAC() {
  console.log('🔐 Seeding RBAC data...');

  // Define all permissions with descriptive names
  const permissions = [
    // Project permissions
    { name: 'projects:read', description: 'View projects' },
    { name: 'projects:create', description: 'Create new projects' },
    { name: 'projects:update', description: 'Update project details' },
    { name: 'projects:delete', description: 'Delete projects' },
    { name: 'projects:manage_members', description: 'Add/remove project members' },
    
    // Test Suite permissions
    { name: 'testsuites:read', description: 'View test suites' },
    { name: 'testsuites:create', description: 'Create new test suites' },
    { name: 'testsuites:update', description: 'Update test suites' },
    { name: 'testsuites:delete', description: 'Delete test suites' },
    
    // Test Case permissions
    { name: 'testcases:read', description: 'View test cases' },
    { name: 'testcases:create', description: 'Create new test cases' },
    { name: 'testcases:update', description: 'Update test cases' },
    { name: 'testcases:delete', description: 'Delete test cases' },
    
    // Test Run permissions
    { name: 'testruns:read', description: 'View test runs' },
    { name: 'testruns:create', description: 'Create new test runs' },
    { name: 'testruns:update', description: 'Update test runs' },
    { name: 'testruns:delete', description: 'Delete test runs' },
    { name: 'testruns:execute', description: 'Execute tests and log results' },
    
    // User management permissions
    { name: 'users:read', description: 'View users' },
    { name: 'users:create', description: 'Create new users' },
    { name: 'users:update', description: 'Update user details' },
    { name: 'users:delete', description: 'Delete users' },
    { name: 'users:manage_roles', description: 'Assign roles to users' },
    
    // Requirement permissions
    { name: 'requirements:read', description: 'View requirements' },
    { name: 'requirements:create', description: 'Create new requirements' },
    { name: 'requirements:update', description: 'Update requirements' },
    { name: 'requirements:delete', description: 'Delete requirements' },
  ];

  // Upsert all permissions
  console.log('  📝 Creating permissions...');
  const permissionRecords = await Promise.all(
    permissions.map((perm) =>
      prisma.permission.upsert({
        where: { name: perm.name },
        update: { description: perm.description },
        create: perm,
      })
    )
  );
  console.log(`  ✅ Created ${permissionRecords.length} permissions`);

  // Define roles
  console.log('  👥 Creating roles...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const projectManagerRole = await prisma.role.upsert({
    where: { name: 'PROJECT_MANAGER' },
    update: {},
    create: { name: 'PROJECT_MANAGER' },
  });

  const testerRole = await prisma.role.upsert({
    where: { name: 'TESTER' },
    update: {},
    create: { name: 'TESTER' },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {},
    create: { name: 'VIEWER' },
  });

  console.log('  ✅ Created 4 roles');

  // Assign permissions to ADMIN (all permissions)
  console.log('  🔗 Assigning permissions to roles...');
  await prisma.rolePermission.createMany({
    data: permissionRecords.map((perm) => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });
  console.log('    ✅ ADMIN: Full access (all permissions)');

  // Assign permissions to PROJECT_MANAGER
  // PROJECT_MANAGER can: view projects + all test operations (cannot update/delete projects or manage members)
  const pmPermissions = permissionRecords.filter((perm) =>
    [
      'projects:read',
      'testsuites:read',
      'testsuites:create',
      'testsuites:update',
      'testsuites:delete',
      'testcases:read',
      'testcases:create',
      'testcases:update',
      'testcases:delete',
      'testruns:read',
      'testruns:create',
      'testruns:update',
      'testruns:delete',
      'testruns:execute',
      'requirements:read',
      'requirements:create',
      'requirements:update',
      'requirements:delete',
      'users:read',
    ].includes(perm.name)
  );
  await prisma.rolePermission.createMany({
    data: pmPermissions.map((perm) => ({
      roleId: projectManagerRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });
  console.log('    ✅ PROJECT_MANAGER: Full access to test suites, test cases, test runs (cannot update/delete projects or manage members)');

  // Assign permissions to TESTER
  // TESTER can: view projects + execute test operations (cannot create/update/delete projects)
  const testerPermissions = permissionRecords.filter((perm) =>
    [
      'projects:read',
      'testsuites:read',
      'testsuites:create',
      'testsuites:update',
      'testsuites:delete',
      'testcases:read',
      'testcases:create',
      'testcases:update',
      'testcases:delete',
      'testruns:read',
      'testruns:create',
      'testruns:update',
      'testruns:delete',
      'testruns:execute',
      'requirements:read',
      'requirements:create',
      'requirements:update',
      'requirements:delete',
      'users:read',
    ].includes(perm.name)
  );
  await prisma.rolePermission.createMany({
    data: testerPermissions.map((perm) => ({
      roleId: testerRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });
  console.log('    ✅ TESTER: Full access to test operations (cannot create, update, or delete projects or manage members)');

  // Assign permissions to VIEWER (read-only)
  const viewerPermissions = permissionRecords.filter((perm) =>
    [
      'projects:read',
      'testsuites:read',
      'testcases:read',
      'testruns:read',
      'requirements:read',
      'users:read',
    ].includes(perm.name)
  );
  await prisma.rolePermission.createMany({
    data: viewerPermissions.map((perm) => ({
      roleId: viewerRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });
  console.log('    ✅ VIEWER: Read-only access');

  console.log('✅ RBAC data seeded successfully!\n');
}

// Run if executed directly
if (require.main === module) {
  seedRBAC()
    .catch((e) => {
      console.error('❌ Error seeding RBAC:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
