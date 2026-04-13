# Railway Deployment Guide - PettyPet MVP

Complete step-by-step guide to deploy the Next.js backend to Railway with automatic CI/CD.

## Prerequisites

- Railway account (https://railway.app)
- GitHub account with MIS2010 repository pushed
- Supabase project with credentials
- ~5 minutes to complete

## Step 1: Create GitHub Repository

### 1.1 Create repo on GitHub

```bash
# On GitHub.com, create new public repo named 'MIS2010'
# (or your preferred name)
```

### 1.2 Push local code to GitHub

```bash
cd /Users/philipdewanto/Downloads/Code/MIS2010

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/MIS2010.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Visit https://github.com/USERNAME/MIS2010 and see all code uploaded

---

## Step 2: Create Railway Account

1. Visit https://railway.app
2. Click **"Start for Free"**
3. Sign up with GitHub (recommended - auto-links to repos)
4. Authorize Railway to access GitHub

---

## Step 3: Deploy via Railway Dashboard

### 3.1 Create New Project

1. Go to https://railway.app/dashboard
2. Click **"+ New Project"**
3. Select **"Deploy from GitHub repo"**
4. Search for and select **MIS2010** repo
5. Click **"Deploy Now"**

### 3.2 Configure Build & Deploy Settings

After deployment starts, Railway will:
- Auto-detect Next.js
- Run: `npm install`
- Run: `npm run build`
- Run: `npm start`

This is automatically configured via `railway.json`.

---

## Step 4: Set Environment Variables

### 4.1 In Railway Dashboard

1. Go to **Deployments** → Your **MIS2010 service**
2. Click the **Variables** tab
3. Add each variable (click **+ New Variable**):

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
JWT_SECRET = your_jwt_secret_key
NODE_ENV = production
```

Where to find these values:

**Supabase:**
1. Go to your Supabase project settings
2. **Settings** → **API** → Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon (public) Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

**JWT Secret:**
```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.2 Redeploy After Adding Variables

1. Click **Deploy** button to trigger new build with environment variables
2. Wait ~2-3 minutes for build to complete

---

## Step 5: Enable Automatic Deployments

### 5.1 Configure Auto-Deploy

In Railway Dashboard:

1. Go to your **MIS2010** service
2. Click **Settings** tab
3. Under **"Source"** section
4. Toggle **"Automatic deployment"** → **ON**
5. Select branch: **main**

Now every time you push to GitHub `main` branch:
- Railway auto-detects changes
- Rebuilds the app (~2-3 min)
- Deploys new version
- Zero-downtime rollout

### 5.2 Test Auto-Deploy

```bash
# From your local MIS2010 repo
echo "# Test deployment" >> README.md
git add .
git commit -m "test: trigger auto-deploy"
git push origin main

# Watch Railway dashboard - new build should start automatically
```

---

## Step 6: Get Your Deployed URL

### 6.1 Find Public URL

In Railway Dashboard:

1. Go to **MIS2010** service
2. Under **"Public URL"** section
3. Copy the generated URL: `https://xxxx-production.railway.app`

This is your **live API endpoint**.

---

## Step 7: Test Deployed Endpoints

### 7.1 Test Health Check

```bash
DEPLOYED_URL="https://your-railway-app.railway.app"

# Test home route
curl -s "$DEPLOYED_URL/" | head -20
```

Expected: Returns HTML homepage

### 7.2 Test Auth Endpoints

```bash
DEPLOYED_URL="https://your-railway-app.railway.app"

# Signup
curl -X POST "$DEPLOYED_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "fullName": "Test User"
  }'

# Expected: 201 with user object
```

### 7.3 Test Pet API

```bash
DEPLOYED_URL="https://your-railway-app.railway.app"
TOKEN="your_access_token_from_signup"

# Create pet
curl -X POST "$DEPLOYED_URL/api/pets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fluffy",
    "type": "cat",
    "breed": "Siamese",
    "gender": "female",
    "dateOfBirth": "2022-01-15"
  }'

# Expected: 201 with pet object
```

---

## Step 8: Logs & Monitoring

### 8.1 View Live Logs

In Railway Dashboard:

1. Go to **MIS2010** service
2. Click **Logs** tab
3. See real-time deployment and runtime logs

### 8.2 Monitor Deployments

1. Click **Deployments** tab
2. See history of all deployed versions
3. Click any to view build logs

---

## Step 9: Production Checklist

Before going live with users:

- [ ] All environment variables set correctly
- [ ] Supabase security rules configured
- [ ] CORS settings allow your domain
- [ ] Database backups enabled
- [ ] Monitoring/alerting set up
- [ ] Rate limiting configured
- [ ] Error tracking integrated (optional: Sentry)
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### Build Failed

**Issue:** Railway build fails with TypeScript errors

**Solution:**
```bash
# Local test
npm run build

# If local build passes but Railway fails:
# 1. Check Railway logs for specific error
# 2. Verify Node version (Railway uses 20.x by default)
# 3. Hard reset and redeploy:
#    - In Railway: delete deployment, trigger new build
```

### Deployment Stuck

**Issue:** Deployment shows "building" for >10 minutes

**Solution:**
1. Check **Logs** tab for errors
2. Cancel deployment, wait 2 min, redeploy
3. Railway support: https://railway.app/support

### Environment Variables Not Applied

**Issue:** API returns 500 with "missing SUPABASE_URL"

**Solution:**
1. Verify variables in Railway dashboard
2. Click **Deploy** to trigger rebuild with new env vars
3. Check logs: `echo $SUPABASE_URL`

### API Returning 401 Unauthorized

**Issue:** All requests return 401 even with valid token

**Solution:**
1. Verify `JWT_SECRET` matches local `.env.local`
2. Verify token is being sent: `curl -H "Authorization: Bearer $TOKEN"`
3. Check token expiration: `node -e "console.log(new Date(Date.now() + 3600000))"`

---

## Continuous Development

### Local Development
```bash
npm run dev
# Visit http://localhost:3000
```

### Deploying Updates

```bash
# Make changes locally
nano app/api/pets/route.ts

# Test locally
npm run build
npm start

# Push to GitHub
git add .
git commit -m "feat: add pet filtering"
git push origin main

# Railway auto-deploys! View progress in dashboard
```

---

## Performance Optimization

### Next.js Build Optimization

Already configured in `next.config.js`:
- Image optimization
- Font optimization
- Auto-minification

### Railway Optimization

1. **Enable caching:**
   - Railway → Settings → Deploy → Enable "Build cache"

2. **Scale resources:**
   - Railway → Settings → Resources → Increase CPU/Memory if needed

3. **Monitor performance:**
   - Use Railway dashboard metrics
   - Monitor database query times in Supabase

---

## Security Notes

⚠️ **Never commit `.env.local`** - Already in `.gitignore`

✅ **Environment variables** are encrypted at rest in Railway

✅ **HTTPS** automatically enabled on Railway URLs

✅ **Supabase** credentials should be service role for server operations

---

## Next Steps

1. **Frontend Integration:**
   - Update frontend API calls to use Railway URL
   - Example: `https://xxx-production.railway.app/api/pets`

2. **Custom Domain:**
   - Railway → Settings → Domain → Add custom domain
   - Point DNS to Railway nameservers

3. **CI/CD Enhancements:**
   - Add GitHub Actions for testing before deploy
   - Add automated accessibility checks
   - Add performance budgets

4. **Monitoring & Alerts:**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring (UptimeRobot)
   - Add performance monitoring (Vercel Analytics)

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Docs:** https://supabase.com/docs
- **Railway Community:** https://railway.app/community

---

**Deployment completed!** Your backend is now live and auto-deploying on every GitHub push.
