# Cloudflare Workers + Supabase Deployment Configuration

## Quick Start Checklist

- [ ] Create Cloudflare account & get API token
- [ ] Create Cloudflare Pages project
- [ ] Get Cloudflare Account ID
- [ ] Add GitHub secrets (6 total)
- [ ] Deploy to Workers (first)
- [ ] Configure environment variables
- [ ] Test deployment

---

## 1. SETTINGS TO CHANGE FOR CLOUDFLARE WORKERS DEPLOYMENT

### 1.1 GitHub Secrets Configuration

**Location**: GitHub Repo → Settings → Secrets and variables → Actions

**Required Secrets** (6 total):

```
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_API_TOKEN=<your-api-token>
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
JWT_SECRET=sb_secret_xxxxx
```

### 1.2 Next.js Configuration

File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone build for Workers
  output: 'standalone',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Headers for Cloudflare
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // CORS handling
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
```

### 1.3 Wrangler Configuration

File: `wrangler.toml` (already created)

**Update with your details**:

```toml
name = "pettypet"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID_HERE"  # ← UPDATE THIS
workers_dev = true

[env.production]
name = "pettypet-prod"
```

### 1.4 Environment Variables File

File: `.env.local` (local development only)

```env
# DO NOT COMMIT THIS FILE TO GIT
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 1.5 API Routes Configuration

Ensure all API routes in `app/api/**` are set up for Workers:

**Key changes in API routes** (`app/api/auth/login/route.ts` example):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get environment variables from Cloudflare Workers
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const jwtSecret = process.env.JWT_SECRET;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Your API logic here
    const body = await request.json();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 1.6 CORS Configuration for Supabase

File: `lib/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});

// Add response interceptor for CORS errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. SUPABASE-SPECIFIC SETTINGS

### 2.1 Supabase Project Configuration

**In Supabase Dashboard**:

1. **API Settings**:
   - Copy `Project URL` → Set as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `Anon Public Key` → Set as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `Service Role Key` → Set as `JWT_SECRET` (keep private!)

2. **CORS Settings** (if needed):
   - Go to Project Settings → API → CORS Allowed Origins
   - Add: `https://pettypet.workers.dev`
   - Add: `https://your-domain.com`

3. **Authentication**:
   - Go to Authentication → Providers → Email
   - Enable Email/Password provider
   - Configure SMTP if needed

4. **Database**:
   - Ensure all tables have RLS (Row Level Security) policies
   - Set appropriate read/write permissions

### 2.2 Database Connection Pool

File: `lib/server/db.ts` (if exists)

```typescript
import { createClient } from '@supabase/supabase-js';

// Use connection pool for better resource management in Workers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.JWT_SECRET!; // Use service role in backend

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false, // Important for serverless
  },
});
```

---

## 3. CLOUDFLARE WORKERS-SPECIFIC SETTINGS

### 3.1 Worker Entry Point

File: `src/worker.ts` (already created)

The worker serves as a gateway:
- Intercepts `/api/*` requests
- Handles CORS headers
- Routes other requests to Next.js
- Provides health checks

### 3.2 Module Build Configuration

File: `wrangler.toml`

```toml
[build]
command = "npm run build"
cwd = "./"

[build.upload]
format = "modules"
main = "./dist/worker.js"
```

### 3.3 Size Limits & Optimization

**Workers Limits**:
- Script size: 1MB (compressed)
- Request: 30 seconds timeout
- Memory: 128MB

**To stay under limits**:
```json
// package.json - Remove unused dependencies
{
  "dependencies": {
    // Keep only what's necessary for runtime
  }
}
```

---

## 4. GITHUB ACTIONS WORKFLOWS

### 4.1 CI Workflow (`.github/workflows/ci.yml`)

**Triggers on**: Push to main/develop, Pull Requests

**What it does**:
- ✅ Runs ESLint
- ✅ TypeScript type checking
- ✅ Builds application
- ✅ Tests (if added)

### 4.2 Workers Deployment (`deploy-cloudflare-workers.yml`)

**Triggers on**: Push to main (automatic)

**Requirements**:
- All GitHub secrets must be set
- `wrangler.toml` properly configured
- Account ID must match

**Process**:
1. Checks out code
2. Installs dependencies
3. Runs build
4. Deploys via Wrangler

### 4.3 Pages Deployment (`deploy-cloudflare-pages.yml`)

**Triggers on**: Push to main (automatic)

**For static/hybrid apps**:
- Better for mostly static content
- Can use Cloudflare Functions for serverless
- Easier scaling

---

## 5. DEPLOYMENT SEQUENCE (STEP BY STEP)

### Phase 1: Initial Setup (15 min)

```bash
# 1. Create Cloudflare account
# 2. Get API token
# 3. Get Account ID
```

### Phase 2: Add GitHub Secrets (5 min)

```bash
# 1. Go to GitHub repo Settings → Secrets
# 2. Add 6 secrets (see section 2.0)
# 3. Verify all are added
```

### Phase 3: Deploy to Workers (5 min)

```bash
# 1. Push to main (or trigger workflow manually)
# 2. Check GitHub Actions tab
# 3. Wait for CI to pass
# 4. Wait for Workers deployment
# 5. Get deployment URL: https://pettypet.workers.dev
```

### Phase 4: Verify Deployment (10 min)

```bash
# 1. Test GET /health endpoint
curl https://pettypet.workers.dev/health

# 2. Test API endpoint
curl https://pettypet.workers.dev/api/auth/user

# 3. Check logs
npx wrangler tail --env production
```

### Phase 5: Configure Custom Domain (optional, 5 min)

```bash
# 1. In Cloudflare Dashboard, add custom domain
# 2. Update DNS records
# 3. Wait for SSL certificate
```

---

## 6. COMMON ISSUES & SOLUTIONS

### Issue: "Invalid credentials" error in deployment

**Solution**:
```bash
# Verify token locally
npx wrangler whoami

# If fails, regenerate token in Cloudflare
# Update CLOUDFLARE_API_TOKEN in GitHub secrets
```

### Issue: Environment variables not loading in Worker

**Solution**: Ensure they're in GitHub secrets AND `wrangler.toml`:

```toml
[env.production.vars]
binding = "SUPABASE_URL"
```

### Issue: CORS errors calling Supabase from Worker

**Solution**: Add CORS headers in `src/worker.ts`:

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}
```

### Issue: Build exceeds 1MB size limit

**Solution**: 
1. Minimize dependencies
2. Use dynamic imports for large libraries
3. Split into multiple workers

---

## 7. MONITORING & LOGS

### View Deployment Logs

```bash
# Real-time logs from Workers
npx wrangler tail --env production

# View GitHub Actions logs
# → Go to Actions tab in GitHub
# → Select workflow run
# → View job logs
```

### Monitor Performance

1. Cloudflare Dashboard → Workers → Analytics
2. Monitor request count, errors, performance
3. Set up alerts for failures

---

## 8. NEXT STEPS

1. ✅ Push code to GitHub (DONE - commit `1247649`)
2. ✅ Create CI/CD workflows (DONE)
3. ⏳ Add GitHub secrets (NEXT)
4. ⏳ Deploy to Workers
5. ⏳ Verify endpoints
6. ⏳ Configure custom domain
7. ⏳ Set up monitoring

---

## Quick Reference: Essential Commands

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build for deployment
npm run build

# Deploy to Workers locally
npx wrangler deploy

# View logs
npx wrangler tail

# Authenticate with Cloudflare
npx wrangler login

# Check deployment status
npx wrangler deployments list
```

---

## Support & Resources

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Actions**: https://docs.github.com/en/actions
