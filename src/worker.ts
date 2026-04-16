// Cloudflare Worker entry point for PettyPet API Backend
// This worker receives API calls from Pages frontend and forwards to Supabase

declare global {
  interface Env {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    JWT_SECRET: string;
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
  method: string,
  body: any,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Route auth requests to Supabase
    const response = await callSupabaseAPI(
      `/auth/v1${path}`,
      method,
      body,
      env,
      {}
    );
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auth endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
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
