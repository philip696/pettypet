import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { comparePassword, generateToken } from '@/lib/auth';
import { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'User must sign in with OAuth provider',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const token = generateToken(user.id);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    } as ApiResponse<{ user: Omit<User, 'password_hash'>; token: string }>);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
