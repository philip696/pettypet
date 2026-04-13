import { NextRequest, NextResponse } from 'next/server';
import { signupWithEmail } from '@/lib/auth-service';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: email, password, name',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Invalid email format',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    // Password validation (at least 8 characters)
    if (password.length < 8) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Password must be at least 8 characters',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    const result = await signupWithEmail(email, password, name);

    if (result.error) {
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
          data: {
            user: result.user,
            token: result.token,
          },
        } as ApiResponse<{ user: any; token: string }>,
        { status: 201 }
      )
    );
  } catch (error) {
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Signup failed',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
