# ⚡ Vercel Deployment Quick Start

**5-minute deployment guide for PettyPet MVP**

---

## ✅ Pre-Deployment Status

Your app is **ready to deploy**. All components verified:

- ✅ Next.js 15 configured
- ✅ TypeScript compiles without errors
- ✅ Enhanced API error handling
- ✅ JWT token auto-injection
- ✅ 401 redirect to login
- ✅ Environment variables configured
- ✅ Git repository ready

---

## 🚀 Deploy in 5 Steps

### 1️⃣ Commit Changes (1 minute)

```bash
cd /Users/philipdewanto/Downloads/Code/MIS2010

# Check what changed
git status

# Commit everything
git add .
git commit -m "feat: frontend deployment ready

- Enhanced api.ts with error handling
- Environment variables configured
- Vercel configuration ready
- Full end-to-end MVP functionality"

# Push to GitHub
git push origin main
```

### 2️⃣ Connect GitHub to Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Find and click **pettypet-mvp** repository
5. Click **"Import"**

### 3️⃣ Add Environment Variables (1 minute)

Vercel shows "Configure Project" screen:

**Paste these environment variables (DO NOT use real values):**

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[your-anon-key]
JWT_SECRET=sb_secret_[your-secret-key]
NEXT_PUBLIC_API_URL=
NODE_ENV=production
```

**Click "Deploy"** ✨

### 4️⃣ Wait for Build (2-5 minutes)

- Vercel builds your app
- Deploys to production
- Shows live URL

### 5️⃣ Test Production (1 minute)

**Visit your live URL and test:**

1. **Sign Up** → New account
2. **Create a Pet** → Add Fluffy
3. **Add Care Task** → Morning feeding
4. **View Calendar** → See tasks
5. **Check Errors** → DevTools console should be clean

---

## 📋 What's Configured

### API Error Handling ✅
```typescript
// In lib/api.ts:
- ✓ Auto-attach JWT token to all requests
- ✓ 401 Unauthorized → Redirect to /login
- ✓ User-friendly error messages
- ✓ Error logging to console
- ✓ getErrorMessage() helper for components
```

### Environment Variables ✅
```bash
# Local (.env.local) - not committed
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
JWT_SECRET
NEXT_PUBLIC_API_URL (optional)

# Vercel (dashboard) - same as above
```

### Deployment Config ✅
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "nodeVersion": "20.x"
}
```

---

## 🧪 End-to-End Test Cases

### Test 1: Authentication Flow ✅
```
1. Open production URL
2. Sign up: email, password, name
3. ✓ Redirects to dashboard
4. ✓ Token stored in localStorage
```

### Test 2: Pet Management ✅
```
1. Click "Add Pet"
2. Fill: name=Fluffy, type=dog, breed=Golden, DOB=2020-01-15
3. Click "Create"
4. ✓ Pet appears in dashboard
5. ✓ Network shows 201 response
```

### Test 3: Care Tasks ✅
```
1. Click on a pet
2. Click "Add Task"
3. Fill: title=Feeding, frequency=daily, due=today
4. Click "Save"
5. ✓ Task appears in list
6. Refresh → ✓ Still there
```

### Test 4: Calendar View ✅
```
1. Navigate to /calendar
2. ✓ Tasks appear on correct dates
3. Click task → Mark complete
4. Refresh → ✓ Status persists
```

### Test 5: Error Handling ✅
```
1. DevTools Console
2. Run: localStorage.removeItem('pettypet_token')
3. Refresh
4. ✓ Gracefully redirects to /login
5. ✓ No console errors
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete 8-phase deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Pre-deployment verification checklist |
| `verify-deployment.sh` | Automated verification script |
| `.env.example` | Environment variable documentation |
| `lib/api.ts` | API wrapper with error handling |

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** [Your repo URL]
- **Production URL:** https://[your-app].vercel.app
- **Supabase Console:** https://app.supabase.com

---

## 💡 Tips

**Auto-deploy on git push:**
```bash
# Every push to main automatically deploys
git push origin main  # Vercel deploys automatically
```

**Monitor deployments:**
- Vercel dashboard shows deployment history
- Click deployment to see logs if issues occur

**Rollback if needed:**
- Vercel dashboard → Deployments → Click previous → "Promote to Production"

**Update environment variables:**
- Vercel dashboard → Settings → Environment Variables
- Changes take effect on next deployment

---

## ✨ Success Criteria

- ✅ App builds successfully
- ✅ Deployed at Vercel URL
- ✅ Sign up works
- ✅ Create pet works
- ✅ Add task works
- ✅ Calendar displays tasks
- ✅ No console errors
- ✅ 401 redirects gracefully

---

## 🚨 Troubleshooting

**Build fails?**
```bash
# Test build locally first
npm run build

# Fix any errors, then retry
git add .
git commit -m "fix: build errors"
git push origin main
```

**Variables not working?**
- Check Vercel: Settings → Environment Variables
- Verify no typos
- Confirm "Production" scope is selected
- Redeploy after changes

**App crashes?**
- Check Vercel Logs: Dashboard → Deployment → Logs
- Check browser console: DevTools F12 → Console
- Look for 401 or network errors

---

**Ready to go live?** Run:
```bash
git push origin main
```

Then go to https://vercel.com to watch deployment! 🎉
