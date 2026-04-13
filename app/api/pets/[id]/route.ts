import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-utils';
import { getPet, updatePet, deletePet, verifyPetOwnership } from '@/lib/server/pets';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { updatePetSchema } from '@/lib/validators';
import { ApiResponse, Pet } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

/**
 * GET /api/pets/[id] - Get a single pet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params;

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

    // Verify ownership
    const isOwner = await verifyPetOwnership(petId, userId);
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

    // Get pet
    const result = await getPet(petId);

    if (!result.success) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: result.error,
          } as ApiResponse<null>,
          { status: 404 }
        )
      );
    }

    return withCORS(
      NextResponse.json({
        success: true,
        data: result.data,
      } as ApiResponse<Pet>)
    );
  } catch (error) {
    console.error('Error fetching pet:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch pet',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}

/**
 * PUT /api/pets/[id] - Update a pet
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params;

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

    // Verify ownership
    const isOwner = await verifyPetOwnership(petId, userId);
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
    const validatedData = updatePetSchema.parse(body);

    // Update pet
    const result = await updatePet(petId, validatedData);

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
      } as ApiResponse<Pet>)
    );
  } catch (error) {
    console.error('Error updating pet:', error);

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
          error: error instanceof Error ? error.message : 'Failed to update pet',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}

/**
 * DELETE /api/pets/[id] - Delete a pet
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params;

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

    // Verify ownership
    const isOwner = await verifyPetOwnership(petId, userId);
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

    // Delete pet
    const result = await deletePet(petId);

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
        data: { message: 'Pet deleted successfully' },
      } as ApiResponse<{ message: string }>)
    );
  } catch (error) {
    console.error('Error deleting pet:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete pet',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
