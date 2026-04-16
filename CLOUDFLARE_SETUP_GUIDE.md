# Cloudflare Workers & Pages Deployment Guide

## Prerequisites

1. **Cloudflare Account**: [Sign up for free](https://dash.cloudflare.com/sign-up)
2. **GitHub Repository**: Already configured ✓
3. **Supabase Instance**: Already configured ✓

## Step 1: Generate Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Select **Edit Cloudflare Workers** template
5. Under **Account Resources**, select:
   - **Include** → **All accounts**
6. Under **Zone Resources**, select:
   - **Include** → **All zones** (for Pages deployment)
7. Click **Continue to summary**
8. Review and click **Create Token**
9. **Copy the token** - you'll need it in the next step

## Step 2: Get Your Cloudflare Account ID

1. In [Cloudflare Dashboard](https://dash.cloudflare.com), go to any domain or Workers
2. Look at the URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/`
3. Copy your **Account ID**

## Step 3: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | Step 2 |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API Token | Step 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Supabase Dashboard |
| `JWT_SECRET` | Your JWT Secret Key | Supabase Dashboard or generate own |

## Step 4: Configure Wrangler (Local Development)

Install Wrangler CLI:

```bash
npm install -D wrangler
```

Configure `wrangler.toml`:

```bash
# Update wrangler.toml with your account details
# Your account_id is visible in Cloudflare dashboard
```

Authenticate with Cloudflare:

```bash
npx wrangler login
# This opens a browser to authorize the CLI
```

## Step 5: Deploy to Cloudflare Workers

### Option A: Automatic (via GitHub Actions)

The workflow will automatically deploy when you push to `main`:

```bash
git add .
git commit -m "chore: setup cloudflare workers deployment"
git push origin main
```

Check GitHub Actions tab to verify deployment.

### Option B: Manual Deployment

```bash
# Build the app
npm run build

# Deploy to Workers
npx wrangler deploy --env production
```

## Step 6: Deploy to Cloudflare Pages

### Option A: Connect via Dashboard

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository `pettypet`
4. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
5. Add environment variables (same as GitHub secrets)
6. Click **Save and Deploy**

### Option B: Automatic (via GitHub Actions)

The workflow will automatically deploy to Pages when you push to `main`.

## Step 7: Configure Custom Domain

1. In Cloudflare Pages deployment settings
2. Add your custom domain (e.g., `pettypet.com`)
3. Update DNS records in Cloudflare
4. Wait for SSL certificate to be issued (~24 hours)

## Environment Variables for Workers/Pages

These are automatically injected from GitHub secrets:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publicable_xxxxx
JWT_SECRET = sb_secret_xxxxx
NODE_ENV = production
```

## Deployment Checklist

- [ ] Cloudflare API Token created and stored in GitHub secrets
- [ ] Cloudflare Account ID stored in GitHub secrets
- [ ] Supabase credentials stored in GitHub secrets
- [ ] `wrangler.toml` configured with account ID
- [ ] GitHub Actions workflows are active
- [ ] First deployment triggered (push to main)
- [ ] Deployment successful in GitHub Actions
- [ ] Check deployed URL is accessible
- [ ] Test API endpoints from deployed instance
- [ ] CORS headers are properly configured
- [ ] Environment variables are loading correctly

## Troubleshooting

### Deployment fails with "Invalid credentials"

**Solution**: Verify your `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub secrets.

```bash
# Test locally
npx wrangler whoami
```

### Environment variables not loading

**Solution**: Ensure they're set in GitHub secrets AND in `wrangler.toml`:

```toml
[env.production.vars]
binding = "SUPABASE_URL"
```

### CORS errors when calling API

**Solution**: Update API response headers in `src/worker.ts`:

```typescript
headers: {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

### Build exceeds Workers size limit (1MB)

**Solution**: Function size might be too large. Options:
1. Split into multiple workers
2. Use Workers Analytics or bundling optimization
3. Move to Pages instead (larger size limit)

## Monitoring & Logs

### View deployment logs in real-time:

```bash
npx wrangler tail --env production
```

### Check GitHub Actions logs:

1. Go to GitHub repository
2. Click **Actions** tab
3. Select the workflow run
4. View detailed logs

### View Cloudflare logs:

1. In [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers** → **Logs**
3. Filter by deployment or endpoint

## Performance Tips

1. **Enable Cloudflare caching**: Add cache headers to static content
2. **Use Cloudflare KV for session storage**: Instead of memory
3. **Enable compression**: In response headers
4. **Monitor cold starts**: Use Web Vitals dashboard

## Next Steps

- [ ] Set up monitoring in Cloudflare Analytics
- [ ] Configure Cloudflare Firewall Rules
- [ ] Set up error tracking with Sentry/Rollbar
- [ ] Enable Web Analytics for performance insights
- [ ] Configure rate limiting for API routes
- [ ] Set up automated backups for Supabase
