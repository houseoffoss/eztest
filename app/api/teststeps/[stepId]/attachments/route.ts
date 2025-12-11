import { NextRequest, NextResponse } from 'next/server';
import { testStepController } from '@/backend/controllers/teststep/controller';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  BadRequestException,
  NotFoundException,
  InternalServerException,
} from '@/backend/utils/exceptions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stepId } = await params;
    const result = await testStepController.associateAttachments(stepId, request);

    return NextResponse.json({
      data: result.data,
      error: null,
    }, { status: result.statusCode });
  } catch (error) {
    console.error('Error associating test step attachments:', error);
    
    if (error instanceof BadRequestException) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof InternalServerException) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to associate attachments',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stepId } = await params;
    const result = await testStepController.getTestStepAttachments(stepId);

    return NextResponse.json({
      data: result.data,
      error: null,
    }, { status: result.statusCode });
  } catch (error) {
    console.error('Error fetching test step attachments:', error);
    
    if (error instanceof BadRequestException) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof InternalServerException) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch attachments',
      },
      { status: 500 }
    );
  }
}
