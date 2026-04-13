import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth-service';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || '');

    if (!token) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Missing authorization token',
          } as ApiResponse<null>,
          { status: 401 }
        )
      );
    }

    // Verify token is valid before logout
    const user = await verifyToken(token);

    if (!user) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired token',
          } as ApiResponse<null>,
          { status: 401 }
        )
      );
    }

    // TODO: In production, add token to blacklist table
    // This would prevent the token from being used after logout
    // For now, client-side token deletion is sufficient for MVP

    return withCORS(
      NextResponse.json(
        {
          success: true,
          data: {
            message: 'Successfully logged out. Please delete the token from your client.',
          },
        } as ApiResponse<{ message: string }>,
        { status: 200 }
      )
    );
  } catch (error) {
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to logout',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
