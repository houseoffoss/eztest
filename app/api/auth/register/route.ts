import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Get TESTER role
    const testerRole = await prisma.role.findUnique({
      where: { name: 'TESTER' },
    });

    if (!testerRole) {
      return NextResponse.json(
        { error: 'System configuration error: TESTER role not found' },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId: testerRole.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        createdAt: true,
      },
    });

    // Create demo project for new user
    await prisma.project.create({
      data: {
        name: 'Demo Project',
        key: 'DEMO',
        description: 'Welcome to EZTest! This is a demo project to help you get started. Feel free to explore the features and create your own test suites, test cases, and test plans.',
        createdById: user.id,
        members: {
          create: [
            {
              userId: user.id,
            },
          ],
        },
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
