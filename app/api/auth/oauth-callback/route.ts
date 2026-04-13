import { NextRequest, NextResponse } from 'next/server';
import { signupWithOAuth } from '@/lib/auth-service';
import { withCORS, handleCORSPreflight } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types';

interface OAuthCallbackBody {
  provider: 'google' | 'apple';
  providerId: string;
  email: string;
  name: string;
}

export async function OPTIONS(_request: NextRequest) {
  return handleCORSPreflight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, providerId, email, name } = body as OAuthCallbackBody;

    // Validate required fields
    if (!provider || !providerId || !email || !name) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: provider, providerId, email, name',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    // Validate provider
    if (!['google', 'apple'].includes(provider)) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: 'Invalid provider. Supported: google, apple',
          } as ApiResponse<null>,
          { status: 400 }
        )
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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

    // Create or authenticate OAuth user
    const result = await signupWithOAuth(provider, providerId, email, name);

    if (result.error || !result.user || !result.token) {
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: result.error || 'OAuth authentication failed',
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
        } as ApiResponse<any>,
        { status: 200 }
      )
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'OAuth callback failed',
        } as ApiResponse<null>,
        { status: 500 }
      )
    );
  }
}
