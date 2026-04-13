import { NextRequest, NextResponse } from 'next/server';
import { refreshToken, extractTokenFromHeader } from '@/lib/auth-service';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

export async function POST(request: NextRequest) {
  try {
    // Accept token from Authorization header or body
    let token = extractTokenFromHeader(request.headers.get('authorization') || '');

    if (!token) {
      try {
        const body = await request.json();
        token = body.token;
      } catch {
        // Body is not JSON, continue without it
      }
    }

    if (!token) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Missing token. Provide via Authorization header or request body',
          } as ApiResponse<null>,
          { status: 401 }
        )
      );
    }

    // Attempt to refresh the token
    const newToken = await refreshToken(token);

    if (!newToken) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Token is invalid or expired. Please login again',
          } as ApiResponse<null>,
          { status: 401 }
        )
      );
    }

    return withCORS(
      NextResponse.json(
        {
          success: true,
          data: {
            token: newToken,
          },
        } as ApiResponse<{ token: string }>,
        { status: 200 }
      )
    );
  } catch (error) {
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Token refresh failed',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
