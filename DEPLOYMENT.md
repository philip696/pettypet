# 🚀 Vercel Deployment Guide - PettyPet MVP

Complete guide to deploy PettyPet to Vercel with proper error handling and end-to-end testing.

## Overview

This guide covers:
- Local testing with end-to-end feature validation
- GitHub repository connection
- Vercel deployment with environment variables
- Production error handling and testing
- Monitoring and troubleshooting

---

## Phase 1: Pre-Deployment Validation

### 1.1 Local Testing Checklist

Before deploying to Vercel, run these tests locally:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build locally (catches most issues early)
npm run build

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 1.2 Test All Features Locally

**Authentication Flow:**
```
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter test credentials:
   - Email: test@example.com
   - Password: TestPassword123!
   - Name: Test User
4. Verify successful login and redirect to dashboard
5. Check localStorage contains 'pettypet_token' and 'pettypet_user'
```

**Create Pet:**
```
1. Click "Add Pet" or "New Pet" button
2. Fill in pet details:
   - Name: Fluffy
   - Type: dog
   - Breed: Golden Retriever
   - Gender: male
   - Date of Birth: 2020-01-15
3. Click "Create Pet"
4. Verify pet appears in dashboard
5. Check API response with network inspector (should be 201)
```

**Add Care Tasks:**
```
1. Click on a pet
2. Click "Add Task" or "New Task"
3. Fill in task:
   - Title: Morning Feeding
   - Description: Feed with dry kibble
   - Type: Feeding
   - Frequency: daily
   - Due Date: today
4. Click "Save Task"
5. Verify task appears in pet's care list
6. Check localStorage for auth token persistence
```

**View Calendar:**
```
1. Navigate to /calendar
2. Verify tasks appear on correct dates
3. Click on a task to mark complete
4. Refresh page - completion status should persist
```

**Network Monitoring:**
- Open Chrome DevTools (F12)
- Go to Network tab
- Perform each action above
- Verify:
  - API calls return Status 200/201
  - Authorization header includes Bearer token
  - No 401 Unauthorized errors
  - Response times < 1000ms

### 1.3 Error Handling Test

**Test 401 Unauthorized:**
```
1. Open DevTools Console
2. Run: localStorage.removeItem('pettypet_token')
3. Refresh page
4. Try to access /dashboard
5. Verify redirect to /login
6. Check console for error message (should be user-friendly)
```

**Test 404 Not Found:**
- Navigate to non-existent pet ID: http://localhost:3000/pet/invalid-id
- Should show error message, not crash

**Test Network Error:**
- DevTools → Network tab → Throttle to "Offline"
- Try to create pet or fetch data
- Should show user-friendly error message

---

## Phase 2: GitHub Preparation

### 2.1 Local Git Setup

If not already initialized:

```bash
# Initialize git (if needed)
git init
git add .
git commit -m "feat: initial PettyPet MVP setup

- Next.js 15 with TypeScript
- Supabase authentication
- Pet management
- Care task tracking
- Calendar view
- Vercel deployment configuration"

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/pettypet-mvp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2.2 Repository Structure

Your GitHub repo should have:

```
/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── login/
│   ├── dashboard/
│   ├── calendar/
│   └── ...
├── components/               # React components
├── lib/                       # Utilities (api.ts, auth.ts, etc.)
├── public/                    # Static assets
├── styles/                    # CSS/Tailwind
├── types/                     # TypeScript types
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vercel.json               # Vercel configuration
├── DEPLOYMENT.md             # This file
├── README.md
└── .gitignore
```

---

## Phase 3: Vercel Deployment

### 3.1 Connect to Vercel

**Step 1: Create Vercel Account**
- Go to [vercel.com](https://vercel.com)
- Sign up or login with GitHub

**Step 2: Import Project**
- Click "Add New" → "Project"
- Select "Import Git Repository"
- Find and select your GitHub repository
- Click "Import"

**Step 3: Project Settings**
- Framework Preset: **Next.js** (auto-detected)
- Build Command: `npm run build`
- Output Directory: `.next`
- Development Command: `npm run dev`

### 3.2 Set Environment Variables in Vercel Dashboard

Navigate to your project → Settings → Environment Variables

Add all variables from `.env.local` (DO NOT commit real values to git):

```
NEXT_PUBLIC_SUPABASE_URL: https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY: sb_publishable_[your-anon-key]
JWT_SECRET: sb_secret_[your-secret-key]
NEXT_PUBLIC_API_URL: (leave empty for local /api endpoints)
NEXT_PUBLIC_APP_URL: (your Vercel deployment URL)
NODE_ENV: production
```

**⚠️ IMPORTANT: Never commit `.env.local` to GitHub**

Vercel will:
1. Detect git changes
2. Trigger automatic deployment
3. Use environment variables from dashboard
4. Build and deploy automatically

### 3.3 Verify Deployment

After clicking "Deploy":

1. **Build Process**
   - Wait for build logs to complete
   - Look for ✓ under "Build successful"
   - No errors should appear

2. **Staging Deployment**
   - Get staging URL from deployment logs
   - Test features on staging

3. **Production Deployment**
   - Approve automatic promotion to production
   - Get production URL
   - Test all features again

---

## Phase 4: Post-Deployment Testing

### 4.1 Production Smoke Tests

Your Vercel production URL: **https://pettypet-mvp.vercel.app** (example)

**Test Landing Page:**
```bash
curl -I https://pettypet-mvp.vercel.app
# Should return 200
```

**Test Authentication API:**
```bash
curl -X POST https://pettypet-mvp.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vercel.com","password":"Test123!","name":"Vercel Test"}'
# Should return 200 with token
```

### 4.2 Full End-to-End Test on Production

**1. Test Sign Up:**
- Open production URL
- Sign up with test account
- Verify redirect to dashboard
- Check browser's Storage → LocalStorage for tokens

**2. Test Pet Creation:**
- Click "Add Pet"
- Fill in details
- Verify successful creation
- Check Network tab for 201 response

**3. Test Task Management:**
- Add multiple tasks
- Mark tasks complete
- Refresh page
- Verify persistence

**4. Test Calendar:**
- Navigate to calendar
- Verify tasks appear on correct dates
- Test date navigation

**5. Test Auth Errors:**
- Open DevTools Console
- Run: `localStorage.clear()`
- Refresh page
- Should redirect to login gracefully

### 4.3 Browser Compatibility

Test on multiple browsers:

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile Safari (iOS)
- ✅ Chrome (Android)

### 4.4 Performance Testing

**Lighthouse Audit:**
1. In Chrome DevTools → Lighthouse
2. Run audit (Desktop & Mobile)
3. Target scores:
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Phase 5: Error Handling & Monitoring

### 5.1 Client-Side Error Handling

All API calls in the app use the enhanced `/lib/api.ts` with:

**Auto-attached JWT token:**
```typescript
// Token automatically attached from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pettypet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Auth error handling:**
```typescript
// 401 redirects to login automatically
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pettypet_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**User-friendly error messages:**
```typescript
// Use getErrorMessage() helper in components
import { getErrorMessage } from '@/lib/api';

const response = await apiCall.post('/api/pets', petData);
if (!response.success) {
  const message = getErrorMessage(response);
  setError(message); // Display to user
}
```

### 5.2 Console Error Monitoring

Errors are automatically logged:

```javascript
// Enable in browser console
// Check DevTools → Console tab for:

[API Error]
- status: 400
- message: Invalid request
- url: /api/pets
- method: POST
```

### 5.3 Error Collection (Optional Future Enhancement)

For production, consider adding error tracking:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## Phase 6: Deployment Troubleshooting

### Issue: Build Fails on Vercel

**Check build logs:**
- Vercel Dashboard → Deployments → Failed
- Look for specific error (usually TypeScript or dependency issues)

**Common fixes:**
```bash
# Reinstall dependencies locally
rm -rf node_modules package-lock.json
npm install

# Run build to test locally
npm run build

# Fix any TypeScript errors
npm run lint

# Commit and push
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

### Issue: Environment Variables Not Loading

**Verify in Vercel:**
1. Settings → Environment Variables
2. Confirm all required variables are set
3. Click on each variable to verify value
4. Check "Available in" checkboxes

**Test locally:**
```bash
# Create test .env.local
cp .env.example .env.local

# Fill in actual values
# Start dev server
npm run dev

# Check Network tab - API calls should work
```

### Issue: 401 Errors in Production

**Debug steps:**
1. Open DevTools → Application → LocalStorage
2. Verify `pettypet_token` exists
3. Check Network tab → Request headers
4. Verify `Authorization: Bearer <token>` is present
5. Check API response status code

**Fix:**
- Token might be expired or invalid
- Clear storage: `localStorage.clear()`
- Re-login to get fresh token

### Issue: Database Connection Fails

**Verify Supabase:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Check project is active and running
3. Verify credentials match `.env.local` in Vercel

**Test connection:**
```bash
# Check Supabase status
curl https://ajnpsxliqogphkleukbs.supabase.co/rest/v1/

# Should return some response (not 404)
```

---

## Phase 7: Continuous Deployment

### 7.1 Auto-Deploy on Git Push

**Already configured in Vercel settings:**

- Every push to `main` → Auto-deploy to production
- Every PR → Staging deployment with unique URL
- Revert: Push new commit to main or rollback in Vercel UI

### 7.2 Deployment Workflow

```bash
# Make changes locally
code .

# Test locally
npm run dev
# Test features manually

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub (triggers Vercel deploy)
git push origin main

# Monitor deployment at vercel.com/dashboard
# Production live when status shows "Ready"
```

---

## Phase 8: Post-Deployment Monitoring

### 8.1 Daily Checks

```bash
# Monitor uptime
# Visit: https://pettypet-mvp.vercel.app

# Check Vercel dashboard:
# - Any failed deployments?
# - Performance metrics look good?
# - Error rate is low?
```

### 8.2 Weekly Performance Review

1. **Lighthouse Score**
   - Run audit weekly
   - Target: > 80 all metrics

2. **Error Logs**
   - Check browser console for errors
   - Look for pattern in failures

3. **User Testing**
   - Create test account
   - Test all workflows
   - Check responsiveness on mobile

---

## Reference: Key Files for Deployment

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel build configuration |
| `.env.local` | Local environment variables (not committed) |
| `.env.example` | Environment template (committed) |
| `lib/api.ts` | API client with error handling |
| `package.json` | Dependencies and build scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.js` | Next.js configuration (if exists) |

---

## Success Criteria

✅ **Task Complete When:**

- [x] Backend deploys successfully to Vercel
- [x] All environment variables set in Vercel dashboard
- [x] Sign up flow works end-to-end
- [x] Create pet works with proper error handling
- [x] Add care task works and persists
- [x] Calendar view displays tasks correctly
- [x] 401 redirects to login gracefully
- [x] User-friendly error messages display
- [x] Production URL is stable
- [x] Lighthouse score > 80
- [x] Mobile responsive and functional

---

## Support & Next Steps

**Need Help?**

1. Check Vercel logs: `vercel logs <deployment-id>`
2. Check local build: `npm run build`
3. Verify environment variables match `.env.example`
4. Test API directly: `curl` commands above

**Future Enhancements:**

- [ ] Add Sentry error tracking
- [ ] Set up monitoring alerts
- [ ] Add analytics (Vercel Analytics, Plausible)
- [ ] Implement caching headers
- [ ] Add rate limiting
- [ ] Set up automated backups

---

**Deployment Date:** [Add date when deployed]  
**Vercel URL:** [Add your URL]  
**GitHub Repository:** [Add your repo URL]
