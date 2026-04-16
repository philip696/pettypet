import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-utils';
import { updateTask, deleteTask, verifyTaskOwnership } from '@/lib/server/tasks';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { updateTaskSchema } from '@/lib/validators';
import { ApiResponse, Task } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

/**
 * PUT /api/tasks/[id] - Update a task
 */
export async function PUT(
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

    // Parse and validate request body
    const body = await request.json();
    console.log('PUT /api/tasks - Request body:', body);
    const validatedData = updateTaskSchema.parse(body);

    // Update task
    const result = await updateTask(taskId, validatedData);

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
      NextResponse.json({
        success: true,
        data: result.data,
      } as ApiResponse<Task>)
    );
  } catch (error) {
    console.error('Error updating task:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update task',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}

/**
 * DELETE /api/tasks/[id] - Delete a task
 */
export async function DELETE(
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

    // Delete task
    const result = await deleteTask(taskId, userId);

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
      NextResponse.json({
        success: true,
        data: { message: 'Task deleted successfully' },
      } as ApiResponse<{ message: string }>)
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete task',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
