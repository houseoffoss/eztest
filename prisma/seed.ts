import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedRBAC } from './seed-rbac';
import { seedDropdownOptions } from './seed-dropdown-options';

const prisma = new PrismaClient();

/**
 * Main seed function
 * Creates initial data for the EZTest application:
 * 1. RBAC data (roles, permissions)
 * 2. Dropdown options
 * 3. Admin user (from environment variables)
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Seed RBAC data (roles, permissions)
  await seedRBAC();

    // 2. Seed dropdown options
  await seedDropdownOptions();

    // 3. Create admin user from environment variables
    await seedAdminUser();

    console.log('✅ Database seed completed successfully!\n');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

/**
 * Create admin user from environment variables
 */
async function seedAdminUser() {
  console.log('👤 Creating admin user...');

  const rawEmail = process.env.ADMIN_EMAIL || 'admin@eztest.local';
  const adminEmail = rawEmail.replace(/@@/g, '@'); // @@ を @ に正規化
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  // Get admin role
  const adminRole = await prisma.role.findFirst({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    console.error('  ❌ ADMIN role not found. Please run RBAC seed first.');
    return;
  }

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail.toLowerCase() },
  });

  if (existingAdmin) {
    console.log(`  ℹ️  Admin user already exists: ${adminEmail}`);
    return;
  }

  // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const adminUser = await prisma.user.create({
      data: {
      email: adminEmail.toLowerCase(),
        name: adminName,
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });

  console.log(`  ✅ Admin user created: ${adminUser.email}`);
  console.log('✅ Admin user seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
