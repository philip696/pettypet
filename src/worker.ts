// Cloudflare Worker entry point for PettyPet API Backend
// This worker receives API calls from Pages frontend and forwards to Supabase

declare global {
  interface Env {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    JWT_SECRET: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Auth',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // API routes handling
      if (pathname.startsWith('/api/')) {
        const apiPath = pathname.replace('/api', '');
        const method = request.method;
        const headers: Record<string, string> = {};

        // Copy relevant headers
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        let body: any = null;
        if (method !== 'GET' && method !== 'HEAD') {
          try {
            body = await request.json();
          } catch {
            // Body might be empty
          }
        }

        // Log API calls
        console.log(`[API] ${method} ${apiPath}`);

        // Route specific API endpoints
        switch (true) {
          // Supabase proxy endpoints
          case apiPath.startsWith('/auth/'):
            return await handleAuthEndpoint(apiPath, method, body, env, corsHeaders);

          case apiPath.startsWith('/tasks/'):
            return await handleTasksEndpoint(apiPath, method, body, env, headers, corsHeaders);

          case apiPath.startsWith('/pets/'):
            return await handlePetsEndpoint(apiPath, method, body, env, headers, corsHeaders);

          case apiPath.startsWith('/users/'):
            return await handleUsersEndpoint(apiPath, method, body, env, headers, corsHeaders);

          default:
            return new Response(
              JSON.stringify({ error: 'Not Found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
      }

      // Health check endpoint
      if (pathname === '/health') {
        return new Response(JSON.stringify({ status: 'healthy' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Debug endpoint to verify configuration
      if (pathname === '/debug') {
        return new Response(
          JSON.stringify({
            status: 'debug',
            hasServiceKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
            hasJwtSecret: !!env.JWT_SECRET,
            supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
            anonKeyPrefix: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Non-API requests - return ready status
      return new Response('Worker Ready', { status: 200 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', details: String(error) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};

// Timeout wrapper for fetch calls
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Supabase API proxy helpers
async function callSupabaseAPI(
  endpoint: string,
  method: string,
  body: any,
  env: Env,
  headers: Record<string, any>
): Promise<Response> {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const requestInit: RequestInit = {
    method,
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestInit.body = JSON.stringify(body);
  }

  try {
    const url = `${supabaseUrl}${endpoint}`;
    console.log(`Calling Supabase: ${method} ${url}`);
    const response = await fetch(url, requestInit);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Supabase API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to call Supabase API', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Authentication endpoints
async function handleAuthEndpoint(
  path: string,
  _method: string,
  body: any,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const authPath = path.substring(5); // Remove '/auth' prefix
    
    if (authPath === '/login') {
      return await handleLogin(body, env, corsHeaders);
    } else if (authPath === '/signup') {
      return await handleSignup(body, env, corsHeaders);
    } else if (authPath === '/me') {
      return await handleGetUser(body, env, corsHeaders);
    } else if (authPath === '/logout') {
      return new Response(JSON.stringify({ message: 'Logged out' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(
      JSON.stringify({ error: 'Auth endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auth endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Custom login handler using REST API
async function handleLogin(
  body: any,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { email, password } = body;
  
  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query users table to find user and verify password (use service role key)
    const usersResponse = await fetchWithTimeout(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      console.error(`[Login] User query failed: ${usersResponse.status} ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let users: any[] = [];
    try {
      users = await usersResponse.json();
    } catch (e) {
      console.error('Failed to parse users response:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to parse response from database', details: String(e) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[Login] Query response status: ${usersResponse.status}, users found: ${Array.isArray(users) ? users.length : 'error'}`);
    
    if (!Array.isArray(users) || users.length === 0) {
      console.log(`[Login] No user found with email: ${email}`);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password', details: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = users[0];
    
    // Simple password verification (in production, use bcrypt or similar)
    // For now, just check if password matches (plaintext - NOT secure!)
    console.log(`[Login] User found: ${user.email}, checking password...`);
    console.log(`[Login] Password provided: ${password}, stored hash: ${user.password_hash}`);
    
    if (user.password_hash !== password) {
      console.log(`[Login] Password mismatch for ${user.email}`);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password', details: 'Password mismatch' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Login] Authentication successful for ${user.email}`);

    // Generate a mock JWT token using base64url encoding
    const tokenData = JSON.stringify({ userId: user.id, email: user.email });
    const token = Buffer.from(tokenData).toString('base64');

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          access_token: token,
          token_type: 'Bearer',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error, 'Stack:', error instanceof Error ? error.stack : 'no stack');
    return new Response(
      JSON.stringify({ error: 'Login failed', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Custom signup handler
async function handleSignup(
  body: any,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { email, password, name } = body;
  
  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new user in database
    const createResponse = await fetchWithTimeout(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password_hash: password, // NOT secure - should use bcrypt or Supabase auth
        name: name || email.split('@')[0],
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('Supabase create user error:', error, 'Status:', createResponse.status);
      return new Response(
        JSON.stringify({ error: 'Signup failed', details: error }),
        { status: createResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = await createResponse.json();
    const tokenData = JSON.stringify({ userId: user.id, email: user.email });
    const token = Buffer.from(tokenData).toString('base64');

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          access_token: token,
          token_type: 'Bearer',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Signup failed', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get current user from token
async function handleGetUser(
  _body: any,
  _env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Parse token from body or would come from headers in real app
    // For now, return mock response
    return new Response(
      JSON.stringify({ id: 'user-id', email: 'user@example.com' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Tasks endpoints
async function handleTasksEndpoint(
  path: string,
  method: string,
  body: any,
  env: Env,
  headers: Record<string, string>,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const response = await callSupabaseAPI(
      `/rest/v1/tasks${path}`,
      method,
      body,
      env,
      headers
    );
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Tasks endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process tasks' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Pets endpoints
async function handlePetsEndpoint(
  path: string,
  method: string,
  body: any,
  env: Env,
  headers: Record<string, string>,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const response = await callSupabaseAPI(
      `/rest/v1/pets${path}`,
      method,
      body,
      env,
      headers
    );
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Pets endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process pets' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Users endpoints
async function handleUsersEndpoint(
  path: string,
  method: string,
  body: any,
  env: Env,
  headers: Record<string, string>,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const response = await callSupabaseAPI(
      `/rest/v1/users${path}`,
      method,
      body,
      env,
      headers
    );
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Users endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process users' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
