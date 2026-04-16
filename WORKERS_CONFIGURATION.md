# Cloudflare Workers + Supabase - Complete Configuration Guide

## Overview

Your app is now configured to deploy to **Cloudflare Workers** with **Supabase** as the backend. This guide details all configuration changes and what they do.

---

## 🔧 Configuration Changes Made

### 1. **next.config.js** - Next.js Standalone Build

**What changed:**
```javascript
output: 'standalone' // Enables standalone mode for edge deployment
```

**Why:** 
- Workers require a minimal, self-contained build
- Standalone mode removes dependency on Node.js server
- Optimizes bundle size for 1MB Workers limit

**Also added:**
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Cache control for API vs static assets
- HTTPS redirect for production

---

### 2. **lib/supabase.ts** - Client-Side Supabase

**What changed:**
```typescript
auth: {
  persistSession: typeof window !== 'undefined', // Browser only
  autoRefreshToken: typeof window !== 'undefined',
  detectSessionInUrl: typeof window !== 'undefined',
}
```

**Why:**
- Workers don't have persistent storage like a browser
- Session persistence only works in browser context
- Prevents errors in serverless environment

---

### 3. **lib/supabase-server.ts** - Server-Side Supabase

**What changed:**
```typescript
auth: {
  autoRefreshToken: false,  // Don't auto-refresh in workers
  persistSession: false,     // Stateless in workers
}
```

**Why:**
- Cloudflare Workers are stateless
- Each request is independent
- Prevents connection pooling issues

**Also returns:**
- `supabaseAdmin` - For admin operations with service role
- `supabase` - For client operations with anon key

---

### 4. **middleware.ts** - New!

**What it does:**
- Adds CORS headers to all API responses
- Handles OPTIONS requests automatically
- Adds security headers (X-Content-Type-Options, etc.)
- Skips middleware for static assets

**Why critical for Workers:**
- Workers require explicit CORS handling
- API Gateway needs to handle cross-origin requests
- Security headers prevent common attacks

**Key: Automatically injects proper headers for Supabase API calls**

---

### 5. **wrangler.toml** - Cloudflare Workers Config

**What changed:**
```toml
name = "pettypet"
type = "javascript"
account_id = ""  # ← SET THIS with your account ID
main = "dist/worker.js"

[env.development]
name = "pettypet-dev"

[env.production]
name = "pettypet-prod"
```

**Why:**
- Defines how Workers runtime executes your app
- `account_id` routes to your Cloudflare account
- Separate dev/prod environments for isolation

---

### 6. **src/worker.ts** - Worker Entry Point

**What it does:**
- Routes `/api/*` requests
- Handles CORS preflight
- Provides `/health` endpoint for monitoring
- Forwards other requests to Next.js

**Why important:**
```typescript
// Intercepts ALL requests at edge before Next.js
// Adds global CORS headers
// Can rate-limit, cache, or block requests
```

---

### 7. **.env.example** - Environment Variables

**New variables added:**
```env
NEXT_PUBLIC_SUPABASE_URL=       # Required
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Required
JWT_SECRET=                      # Required for Workers
NODE_ENV=production              # Set for deployment
```

**Stored in GitHub Actions secrets** (not committed):
```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

---

## 📋 Required Settings for Workers Deployment

### Step 1: GitHub Actions Secrets

Must be set before deployment:

```
1. CLOUDFLARE_ACCOUNT_ID
   ├─ From: Cloudflare Dashboard URL bar
   └─ Pattern: 32-character alphanumeric

2. CLOUDFLARE_API_TOKEN
   ├─ From: Cloudflare → My Profile → API Tokens
   ├─ Template: Edit Cloudflare Workers
   └─ Scope: All accounts, all zones

3. NEXT_PUBLIC_SUPABASE_URL
   ├─ From: Supabase Dashboard → Settings → API
   └─ Pattern: https://xxxxx.supabase.co

4. NEXT_PUBLIC_SUPABASE_ANON_KEY
   ├─ From: Supabase Dashboard → Settings → API → Anon public key
   └─ Pattern: sb_publishable_xxxxx

5. JWT_SECRET
   ├─ From: Supabase Service Role Key OR generate own
   └─ Min 32 characters, strong random string

6. NODE_ENV
   ├─ Value: production
   └─ For: Environment detection
```

### Step 2: Update wrangler.toml

**CRITICAL: Line 3 in wrangler.toml**

```toml
account_id = ""  # ← FIND YOUR ACCOUNT ID AND SET IT HERE
```

If not set: Deployment will fail with "invalid account ID"

### Step 3: Verify API Routes

All files in `app/api/**` must:
- ✅ Have proper error handling
- ✅ Return JSON responses
- ✅ Support OPTIONS requests (for CORS)
- ✅ Use environment variables safely

**Template for API route:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }
    // Your logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Deployment Workflow

### How It Works:

```
1. git push to main
    ↓
2. GitHub Actions triggered
    ↓
3. CI workflow: lint, type-check, build
    ↓ (if all pass)
4. Wrangler reads secrets from GitHub
    ↓
5. Next.js builds with secrets injected
    ↓
6. Worker script deployed to Cloudflare edge
    ↓
7. App live at: pettypet.workers.dev
```

### Environment Variables Flow:

```
GitHub Actions Secrets
    ↓ (passed to workflow)
GitHub Actions Environment
    ↓ (read by wrangler)
Cloudflare Workers Secrets
    ↓ (available to app at runtime)
process.env.NEXT_PUBLIC_SUPABASE_URL
```

---

## ✅ Deployment Checklist

**Before first deployment:**
- [ ] Create Cloudflare account
- [ ] Generate API token
- [ ] Get Account ID
- [ ] Add all 6 GitHub secrets
- [ ] Update `wrangler.toml` with account ID
- [ ] Read DEPLOYMENT_QUICK_START.md

**After deployment:**
- [ ] Test: `curl https://pettypet.workers.dev/health`
- [ ] Test API: `curl https://pettypet.workers.dev/api/auth/user`
- [ ] Check logs: `npx wrangler tail --env production`
- [ ] Verify: Visit pettypet.workers.dev in browser

---

## 🔒 Security Configuration

### CORS Headers (Added by middleware.ts)

```typescript
headers: {
  'Access-Control-Allow-Origin': 'https://pettypet.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}
```

**Configure for your domain:**
- Edit `middleware.ts` line where origin is set
- Change from `'*'` to your specific domain in production

### Security Headers (next.config.js)

```javascript
'X-Content-Type-Options': 'nosniff',      // Prevent MIME sniffing
'X-Frame-Options': 'DENY',                // Prevent clickjacking
'X-XSS-Protection': '1; mode=block',      // Enable XSS filter
```

These are **automatically added** to all responses.

### Secret Storage

**NEVER commit secrets to Git:**
```bash
# ✅ Good - stored in GitHub secrets
CLOUDFLARE_API_TOKEN=xxx (in secrets)

# ❌ Bad - visible in git history
CLOUDFLARE_API_TOKEN=xxx (in .env committed)
```

---

## 🧪 Testing Configuration

### Local Testing

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your secrets
cp .env.example .env.local
# Edit .env.local with real values

# 3. Run locally
npm run dev
# Visit http://localhost:3000

# 4. Test API endpoint
curl http://localhost:3000/api/auth/user
```

### Test Deployed Workers

```bash
# 1. View logs
npx wrangler tail --env production

# 2. Test health endpoint
curl https://pettypet.workers.dev/health

# 3. Test API
curl https://pettypet.workers.dev/api/auth/user

# 4. Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://pettypet.workers.dev/api/auth/user
```

---

## 📊 What Each File Does (Updated)

| File | Purpose | Change | Impact |
|------|---------|--------|--------|
| `next.config.js` | Next.js config | Added `output: 'standalone'` | Enables Workers deployment |
| `lib/supabase.ts` | Client Supabase | Added browser-only persistence | Prevents serverless errors |
| `lib/supabase-server.ts` | Server Supabase | Disabled persistence | Stateless Workers operation |
| `middleware.ts` | CORS & auth | NEW - automatically applied | API calls work cross-origin |
| `wrangler.toml` | Workers config | Updated for deployment | Routes requests to Workers |
| `src/worker.ts` | Worker entry | API routing, health check | Edge request handling |
| `.env.example` | Default env vars | Added Cloudflare vars | Documentation of required config |
| `.github/workflows/` | CI/CD | Already created | Auto-deployment on git push |

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Solution:**
```bash
# 1. Check GitHub secrets are set
# Settings → Secrets and variables → Actions

# 2. Verify secret names match exactly:
#    NEXT_PUBLIC_SUPABASE_URL (not URL)
#    NEXT_PUBLIC_SUPABASE_ANON_KEY (not KEY)

# 3. Test locally with .env.local
# 4. Commit and push to trigger deployment
```

### Deployment fails - "Invalid account_id"

**Solution:**
```bash
# In wrangler.toml line 3:
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
#          Must be 32 characters from Cloudflare dashboard
```

### CORS errors on API calls

**Solution:**
```typescript
// In middleware.ts, update origin check:
const origin = request.headers.get('origin');
const allowedOrigins = [
  'https://yourdomain.com',
  'https://pettypet.workers.dev'
];

const corsOrigin = allowedOrigins.includes(origin) 
  ? origin 
  : 'https://yourdomain.com';
```

### Environment variables not loading

**Solution:**
```bash
# 1. Verify GitHub Actions passed secrets correctly
# 2. Check GitHub Actions logs:
#    Actions tab → select workflow → view logs

# 3. In Workers, secrets are passed as:
#    import { env } from 'process'
#    const url = env.NEXT_PUBLIC_SUPABASE_URL

# 4. Rebuild and redeploy:
#    git commit --allow-empty -m "redeploy"
#    git push
```

---

## 📚 Next Steps

1. ✅ Code configured for Workers
2. ⏳ Add GitHub secrets (NEXT: DEPLOYMENT_QUICK_START.md)
3. ⏳ Update wrangler.toml with account ID
4. ⏳ Deploy and test
5. ⏳ Monitor performance & logs

---

## 📖 Reference Files

- **Quick Start**: [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
- **Setup Guide**: [CLOUDFLARE_SETUP_GUIDE.md](./CLOUDFLARE_SETUP_GUIDE.md)
- **GitHub Workflows**: [.github/workflows/](./.github/workflows)
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
