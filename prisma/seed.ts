import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedAuthorizationSystem } from './seed-auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed authorization system first
  console.log('📋 Seeding authorization system...');
  await seedAuthorizationSystem();
  console.log('✅ Authorization system seeded successfully!\n');

  // Get admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eztest.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', adminEmail);
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email:', adminUser.email);
  console.log('   Name:', adminUser.name);
  console.log('   Role:', adminUser.role);
  console.log('\n⚠️  Please change the default admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
