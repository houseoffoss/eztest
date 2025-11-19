import { hasPermission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = hasPermission(
  async (request, context) => {
    try {
      const { id } = await context!.params;

      // Fetch test results for this test case across all test runs
      const results = await prisma.testResult.findMany({
        where: {
          testCaseId: id,
        },
        include: {
          executedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          testRun: {
            select: {
              id: true,
              name: true,
              environment: true,
              status: true,
            },
          },
        },
        orderBy: {
          executedAt: 'desc',
        },
      });

      return NextResponse.json({
        data: results,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching test case history:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to fetch test case history',
        },
        { status: 500 }
      );
    }
  },
  'testcases',
  'read'
);
