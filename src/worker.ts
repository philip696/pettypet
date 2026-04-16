// Cloudflare Worker entry point for PettyPet

declare global {
  interface Env {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    JWT_SECRET: string;
    NEXT_PUBLIC_API_URL: string;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // API routes handling
      if (pathname.startsWith('/api/')) {
        // Extract API path and method
        const apiPath = pathname.replace('/api', '');
        const method = request.method;

        // Log API calls for monitoring
        console.log(`[API] ${method} ${apiPath}`);

        // Add CORS headers
        const response = new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });

        // Handle CORS preflight
        if (method === 'OPTIONS') {
          return response;
        }

        // Forward to Next.js backend
        // This would be your actual API handler
        return new Response(JSON.stringify({ message: 'API Gateway' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Static files handling
      if (pathname.startsWith('/public/') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
        return fetch(request);
      }

      // Health check endpoint
      if (pathname === '/health') {
        return new Response(JSON.stringify({ status: 'healthy' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Root path or any other path - serve from Next.js
      const nextUrl = new URL(pathname + url.search, request.url);
      const nextRequest = new Request(nextUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      return fetch(nextRequest);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
