# Quick Deploy Reference Card

## 🚀 5-Minute Deployment

### Step 1: GitHub (2 min)
```bash
cd /Users/philipdewanto/Downloads/Code/MIS2010
git remote add origin https://github.com/YOUR_USERNAME/MIS2010.git
git push -u origin main
```

### Step 2: Railway Account (1 min)
Visit: https://railway.app (sign up with GitHub)

### Step 3: Deploy (1 min)
- Railway dashboard → "+ New Project"
- Select "Deploy from GitHub repo"
- Choose MIS2010
- "Deploy Now"

### Step 4: Environment Variables (1 min)
In Railway → MIS2010 → Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
NODE_ENV=production
```
Then click "Deploy"

### Step 5: Get URL (30 sec)
Railway → MIS2010 → Public URL → Your Live Backend URL!

## Test It
```bash
DEPLOYED_URL="https://your-railway-app.railway.app"

# Signup
curl -X POST "$DEPLOYED_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!","fullName":"Test"}'

# Get token from response, then create pet
TOKEN="paste_token_here"
curl -X POST "$DEPLOYED_URL/api/pets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fluffy","type":"cat","breed":"Persian","gender":"female","dateOfBirth":"2023-06-15"}'
```

## Auto-Deploy After Setup
```bash
# Every git push now auto-deploys!
git add .
git commit -m "feat: your change"
git push origin main
# → Railway rebuilds + deploys (3-4 min)
```

## 📚 Full Guides
- `DEPLOYMENT_MANIFEST.md` - Executive summary
- `docs/RAILWAY_DEPLOYMENT.md` - Detailed step-by-step
- `docs/DEPLOYMENT_READINESS.md` - Checklist

---
**Status:** ✅ Ready to deploy now!
