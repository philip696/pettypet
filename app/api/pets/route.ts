import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-utils';
import { createPet, getUserPets } from '@/lib/server/pets';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { createPetSchema } from '@/lib/validators';
import { ApiResponse, Pet } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

/**
 * POST /api/pets - Create a new pet
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

    const validatedData = createPetSchema.parse({
      name: body.name,
      type: body.type,
      breed: body.breed,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      profile_picture_url: body.profile_picture_url,
    });

    // Create pet
    const result = await createPet(
      userId,
      validatedData.name,
      validatedData.type,
      validatedData.breed,
      validatedData.gender,
      validatedData.dateOfBirth,
      validatedData.profile_picture_url
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
        } as ApiResponse<Pet>,
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('Error creating pet:', error);

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
          error: error instanceof Error ? error.message : 'Failed to create pet',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}

/**
 * GET /api/pets - List all pets for current user
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

    // Get user's pets
    const result = await getUserPets(userId);

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
      } as ApiResponse<Pet[]>)
    );
  } catch (error) {
    console.error('Error fetching pets:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch pets',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
