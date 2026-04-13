import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-utils';
import { completeTask, verifyTaskOwnership } from '@/lib/server/tasks';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { ApiResponse, CareHistory } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

/**
 * POST /api/tasks/[id]/complete - Mark a task as complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // Verify authentication
    const userId = await getUserId(request);
    if (!userId) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          } as ApiResponse<null>,
          { status: 401 }
        )
      );
    }

    // Verify task ownership
    const isOwner = await verifyTaskOwnership(taskId, userId);
    if (!isOwner) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
          } as ApiResponse<null>,
          { status: 403 }
        )
      );
    }

    // Complete task
    const result = await completeTask(taskId);

    if (!result.success) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: result.error,
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    return withCORS(
      NextResponse.json(
        {
          success: true,
          data: result.data,
        } as ApiResponse<CareHistory>,
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('Error completing task:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to complete task',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
