#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Cloudflare Workers Config Check${NC}"
echo -e "${BLUE}================================${NC}\n"

# Track errors
ERRORS=0
WARNINGS=0

# 1. Check if Node.js is installed
echo -e "${BLUE}[1/8]${NC} Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS+1))
fi

# 2. Check if npm modules are installed
echo -e "\n${BLUE}[2/8]${NC} Checking npm dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${RED}✗${NC} node_modules not found - run 'npm install'"
    ERRORS=$((ERRORS+1))
fi

# 3. Check required files exist
echo -e "\n${BLUE}[3/8]${NC} Checking required configuration files..."
REQUIRED_FILES=(
    "next.config.js"
    "wrangler.toml"
    "middleware.ts"
    "src/worker.ts"
    "lib/supabase.ts"
    "lib/supabase-server.ts"
    ".github/workflows/ci.yml"
    ".github/workflows/deploy-cloudflare-workers.yml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS+1))
    fi
done

# 4. Check next.config.js for standalone output
echo -e "\n${BLUE}[4/8]${NC} Checking Next.js configuration..."
if grep -q "output: 'standalone'" next.config.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} next.config.js: output set to 'standalone'"
else
    echo -e "${RED}✗${NC} next.config.js: output not set to 'standalone'"
    ERRORS=$((ERRORS+1))
fi

# 5. Check wrangler.toml configuration
echo -e "\n${BLUE}[5/8]${NC} Checking Wrangler configuration..."
if grep -q 'name = "pettypet"' wrangler.toml 2>/dev/null; then
    echo -e "${GREEN}✓${NC} wrangler.toml: name set correctly"
else
    echo -e "${RED}✗${NC} wrangler.toml: name not configured"
    ERRORS=$((ERRORS+1))
fi

if grep -q 'type = "javascript"' wrangler.toml 2>/dev/null; then
    echo -e "${GREEN}✓${NC} wrangler.toml: type set to 'javascript'"
else
    echo -e "${RED}✗${NC} wrangler.toml: type not set"
    ERRORS=$((ERRORS+1))
fi

# Check account_id
ACCOUNT_ID=$(grep 'account_id' wrangler.toml | grep -oE '= "[^"]*"' | tr -d '= "')
if [ -z "$ACCOUNT_ID" ] || [ "$ACCOUNT_ID" = "" ]; then
    echo -e "${YELLOW}⚠${NC} wrangler.toml: account_id is empty (set after getting Cloudflare Account ID)"
    WARNINGS=$((WARNINGS+1))
else
    if [ ${#ACCOUNT_ID} -eq 32 ]; then
        echo -e "${GREEN}✓${NC} wrangler.toml: account_id is configured"
    else
        echo -e "${YELLOW}⚠${NC} wrangler.toml: account_id looks suspicious (should be 32 chars)"
        WARNINGS=$((WARNINGS+1))
    fi
fi

# 6. Check environment variables
echo -e "\n${BLUE}[6/8]${NC} Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓${NC} .env.local: NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo -e "${YELLOW}⚠${NC} .env.local: NEXT_PUBLIC_SUPABASE_URL not found"
        WARNINGS=$((WARNINGS+1))
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓${NC} .env.local: NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo -e "${YELLOW}⚠${NC} .env.local: NEXT_PUBLIC_SUPABASE_ANON_KEY not found"
        WARNINGS=$((WARNINGS+1))
    fi
    
    if grep -q "JWT_SECRET" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓${NC} .env.local: JWT_SECRET is set"
    else
        echo -e "${YELLOW}⚠${NC} .env.local: JWT_SECRET not found"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (create from .env.example)"
    WARNINGS=$((WARNINGS+1))
fi

# 7. Check middleware configuration
echo -e "\n${BLUE}[7/8]${NC} Checking middleware..."
if [ -f "middleware.ts" ]; then
    if grep -q "Access-Control-Allow-Origin" middleware.ts 2>/dev/null; then
        echo -e "${GREEN}✓${NC} middleware.ts: CORS headers configured"
    else
        echo -e "${RED}✗${NC} middleware.ts: CORS headers not found"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗${NC} middleware.ts not found"
    ERRORS=$((ERRORS+1))
fi

# 8. Check Supabase client configuration
echo -e "\n${BLUE}[8/8]${NC} Checking Supabase client setup..."
if grep -q "persistSession" lib/supabase.ts 2>/dev/null; then
    echo -e "${GREEN}✓${NC} lib/supabase.ts: Browser-aware configuration"
else
    echo -e "${RED}✗${NC} lib/supabase.ts: Missing browser-aware configuration"
    ERRORS=$((ERRORS+1))
fi

if grep -q "persistSession: false" lib/supabase-server.ts 2>/dev/null; then
    echo -e "${GREEN}✓${NC} lib/supabase-server.ts: Serverless configuration"
else
    echo -e "${RED}✗${NC} lib/supabase-server.ts: Missing serverless configuration"
    ERRORS=$((ERRORS+1))
fi

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Configuration Check Summary${NC}"
echo -e "${BLUE}================================${NC}\n"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Configuration complete with $WARNINGS warning(s).${NC}"
    echo -e "Run these before deployment:"
    echo -e "  1. Set GitHub Actions secrets (see DEPLOYMENT_QUICK_START.md)"
    echo -e "  2. Update wrangler.toml with your account_id"
    exit 0
else
    echo -e "${RED}✗ Configuration has $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo -e "\nFix errors before proceeding:"
    echo -e "  1. Ensure all required files exist"
    echo -e "  2. Check configuration values in files"
    echo -e "  3. Re-read WORKERS_CONFIGURATION.md"
    exit 1
fi
