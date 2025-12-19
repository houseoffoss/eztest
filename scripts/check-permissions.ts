/**
 * Check Role Permissions
 * 
 * Purpose: Utility script to display all role permissions in the database
 * Usage: npx tsx scripts/check-permissions.ts
 * 
 * This script queries the database and displays a summary of permissions
 * assigned to each role, grouped by category.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRolePermissions() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });

  console.log('\n📋 Role Permissions Summary:\n');
  
  roles.forEach(role => {
    console.log(`\n${role.name} (${role.permissions.length} permissions):`);
    
    // Group permissions by category
    const grouped: Record<string, string[]> = {};
    role.permissions.forEach(rp => {
      const [category] = rp.permission.name.split(':');
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(rp.permission.name);
    });
    
    Object.entries(grouped).forEach(([category, perms]) => {
      console.log(`  ${category}:`);
      perms.forEach(p => console.log(`    - ${p}`));
    });
  });

  await prisma.$disconnect();
}

checkRolePermissions().catch(console.error);
