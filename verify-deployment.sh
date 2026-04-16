#!/bin/bash
# PettyPet MVP - Pre-Deployment Verification Script
# This script validates all components are ready for Vercel deployment

set -e

echo "🚀 PettyPet MVP - Pre-Deployment Verification"
echo "=============================================="
echo ""

# Check 1: Dependencies
echo "✓ Step 1: Checking dependencies..."
if [ -f "package.json" ]; then
  echo "  ✅ package.json found"
else
  echo "  ❌ package.json missing"
  exit 1
fi

# Check 2: Next.js Structure
echo ""
echo "✓ Step 2: Checking Next.js app structure..."
required_dirs=(
  "app"
  "components"
  "lib"
  "types"
  "public"
)

for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✅ /$dir exists"
  else
    echo "  ❌ /$dir missing"
  fi
done

# Check 3: Configuration Files
echo ""
echo "✓ Step 3: Checking configuration files..."
config_files=(
  "tsconfig.json"
  "tailwind.config.ts"
  "package.json"
  "vercel.json"
  ".env.example"
  "DEPLOYMENT.md"
)

for file in "${config_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file found"
  else
    echo "  ⚠️  $file missing (may be needed for deployment)"
  fi
done

# Check 4: Environment Setup
echo ""
echo "✓ Step 4: Checking environment setup..."
if [ -f ".env.local" ]; then
  echo "  ✅ .env.local found"
  echo "  👉 Make sure .env.local is in .gitignore (not committed)"
else
  echo "  ⚠️  .env.local not found (copy from .env.example)"
fi

# Check 5: API Setup
echo ""
echo "✓ Step 5: Checking API configuration..."
if grep -q "NEXT_PUBLIC_API_URL" ".env.example"; then
  echo "  ✅ API URL configuration documented"
else
  echo "  ❌ API URL configuration missing"
fi

if grep -q "getErrorMessage\|handleApiError" "lib/api.ts" 2>/dev/null; then
  echo "  ✅ Error handling functions found in lib/api.ts"
else
  echo "  ⚠️  Error handling not fully configured"
fi

# Check 6: Build Test (optional - can be slow)
echo ""
echo "✓ Step 6: Testing build..."
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build compiles successfully"
  echo "  📦 Build artifacts in .next/"
else
  echo "  ❌ Build failed"
  echo "  👉 Run: npm run build"
  exit 1
fi

# Check 7: Git Status
echo ""
echo "✓ Step 7: Checking git status..."
if [ -d ".git" ]; then
  echo "  ✅ Git repository initialized"
  
  # Check if .gitignore exists
  if [ -f ".gitignore" ]; then
    if grep -q ".env.local" ".gitignore"; then
      echo "  ✅ .env.local is in .gitignore"
    else
      echo "  ⚠️  .env.local should be added to .gitignore"
    fi
  fi
else
  echo "  ⚠️  Not a git repository"
  echo "  👉 Run: git init && git add . && git commit -m 'Initial commit'"
fi

# Summary
echo ""
echo "=============================================="
echo "✅ Pre-Deployment Verification Complete!"
echo "=============================================="
echo ""
echo "📋 Next Steps for Vercel Deployment:"
echo "   1. Push code to GitHub: git push origin main"
echo "   2. Connect repo in Vercel: vercel.com"
echo "   3. Set environment variables in Vercel dashboard:"
echo "      - NEXT_PUBLIC_SUPABASE_URL"
echo "      - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "      - JWT_SECRET"
echo "      - NEXT_PUBLIC_API_URL (leave empty for local /api)"
echo "      - NODE_ENV=production"
echo "   4. Deploy: git push triggers auto-deployment"
echo "   5. Test: Login, create pet, add task, view calendar"
echo ""
echo "📚 Documentation: See DEPLOYMENT.md for full guide"
echo ""
