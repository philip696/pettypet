import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.JWT_SECRET || '';

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
}

if (!supabaseServiceKey) {
  console.warn('JWT_SECRET or SUPABASE_SERVICE_ROLE_KEY not configured - admin operations will fail');
}

// Server-side client with service role (for admin operations)
// Cloudflare Workers compatible configuration
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'User-Agent': 'pettypet-admin/1.0.0',
    },
  },
});

// Client-side compatible client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Important for serverless/Workers
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'User-Agent': 'pettypet/1.0.0',
    },
  },
});
