import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-service';
import { User } from '@/types';

/**
 * Extract user from authenticated request
 * Returns null if token is invalid or missing
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const user = await verifyToken(token);
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Extract user ID from authenticated request
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const user = await getAuthenticatedUser(request);
  return user?.id || null;
}
