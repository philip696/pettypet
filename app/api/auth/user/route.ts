import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth-service';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types';

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

export async function GET(request: NextRequest) {
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

    return withCORS(
      NextResponse.json({
        success: true,
        data: user,
      } as ApiResponse<any>)
    );
  } catch (error) {
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch user',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
