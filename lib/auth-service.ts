import { supabaseAdmin } from './supabase-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AuthResponse {
  user: Omit<User, 'password_hash'> | null;
  token: string | null;
  error: string | null;
}

/**
 * Sign up with email and password
 */
export async function signupWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          name,
          password_hash: passwordHash,
          auth_provider: 'email',
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        user: null,
        token: null,
        error: error.message || 'Failed to create user',
      };
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
      },
      token,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return {
        user: null,
        token: null,
        error: 'Invalid email or password',
      };
    }

    if (!user.password_hash) {
      return {
        user: null,
        token: null,
        error: 'User must sign in with OAuth provider',
      };
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return {
        user: null,
        token: null,
        error: 'Invalid email or password',
      };
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
      },
      token,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign up with OAuth provider
 */
export async function signupWithOAuth(
  provider: 'google' | 'github' | 'apple',
  providerId: string,
  email: string,
  name: string
): Promise<AuthResponse> {
  try {
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_provider_id', providerId)
      .eq('auth_provider', provider)
      .single();

    if (existingUser) {
      const token = generateToken(existingUser.id);
      return {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          auth_provider: existingUser.auth_provider,
          created_at: existingUser.created_at,
        },
        token,
        error: null,
      };
    }

    // Create new user with OAuth
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          name,
          auth_provider: provider,
          auth_provider_id: providerId,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        user: null,
        token: null,
        error: error.message || 'Failed to create user',
      };
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
      },
      token,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify JWT token and return user
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Fetch user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      auth_provider: user.auth_provider,
      created_at: user.created_at,
    } as User;
  } catch (error) {
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Refresh JWT token
 */
export function refreshToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return generateToken(decoded.userId);
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}
