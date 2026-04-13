import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth-service';
import { User } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = extractTokenFromHeader(req.headers.get('authorization') || '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;

    return handler(req as AuthenticatedRequest);
  };
}

/**
 * Add CORS headers for frontend requests
 */
export function withCORS(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCORSPreflight(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return withCORS(response);
}
