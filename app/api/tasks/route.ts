import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-utils';
import { createTask, getTasksByPet } from '@/lib/server/tasks';
import { verifyPetOwnership } from '@/lib/server/pets';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { createTaskSchema } from '@/lib/validators';
import { ApiResponse, Task } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json();
    console.log('POST /api/tasks - Request body:', body);
    console.log('POST /api/tasks - UserId:', userId);
    
    const validatedData = createTaskSchema.parse({
      petId: body.petId,
      type: body.type,
      title: body.title,
      description: body.description,
      frequency: body.frequency,
      nextDueDate: body.nextDueDate,
      nextDueTime: body.nextDueTime,
    });

    // Verify pet ownership
    const isOwner = await verifyPetOwnership(validatedData.petId, userId);
    if (!isOwner) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Forbidden - pet not found',
          } as ApiResponse<null>,
          { status: 403 }
        )
      );
    }

    // Create task
    const result = await createTask(
      validatedData.petId,
      validatedData.type,
      validatedData.title,
      validatedData.description || '',
      validatedData.frequency,
      validatedData.nextDueDate,
      validatedData.nextDueTime
    );

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
        } as ApiResponse<Task>,
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('Error creating task:', error);

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
          error: error instanceof Error ? error.message : 'Failed to create task',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}

/**
 * GET /api/tasks?petId=... - Get tasks for a specific pet
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get petId from query parameters
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Missing petId query parameter',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    // Verify pet ownership
    const isOwner = await verifyPetOwnership(petId, userId);
    if (!isOwner) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Forbidden - pet not found',
          } as ApiResponse<null>,
          { status: 403 }
        )
      );
    }

    // Get tasks for pet
    const result = await getTasksByPet(petId);

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
      } as ApiResponse<Task[]>)
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
