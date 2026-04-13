#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🐾 PettyPet MVP - Project Verification"
echo "======================================"

# Check Node modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node modules installed"
else
    echo -e "${RED}✗${NC} Node modules not found"
    exit 1
fi

# Check key dependencies
echo -e "\n${YELLOW}Checking dependencies:${NC}"

deps=("next" "@supabase/supabase-js" "jsonwebtoken" "bcryptjs" "axios" "tailwindcss")

for dep in "${deps[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        echo -e "${GREEN}✓${NC} $dep"
    else
        echo -e "${RED}✗${NC} $dep not found"
    fi
done

# Check configuration files
echo -e "\n${YELLOW}Checking configuration files:${NC}"

configs=("tsconfig.json" "next.config.js" "tailwind.config.ts" ".eslintrc.json" "postcss.config.mjs")

for config in "${configs[@]}"; do
    if [ -f "$config" ]; then
        echo -e "${GREEN}✓${NC} $config"
    else
        echo -e "${RED}✗${NC} $config missing"
    fi
done

# Check source files
echo -e "\n${YELLOW}Checking source files:${NC}"

sources=("app/page.tsx" "app/layout.tsx" "app/globals.css" "lib/supabase.ts" "lib/auth.ts" "lib/api.ts" "types/index.ts")

for source in "${sources[@]}"; do
    if [ -f "$source" ]; then
        echo -e "${GREEN}✓${NC} $source"
    else
        echo -e "${RED}✗${NC} $source missing"
    fi
done

# Check API routes
echo -e "\n${YELLOW}Checking API routes:${NC}"

apis=("app/api/users/route.ts" "app/api/auth/login/route.ts")

for api in "${apis[@]}"; do
    if [ -f "$api" ]; then
        echo -e "${GREEN}✓${NC} $api"
    else
        echo -e "${RED}✗${NC} $api missing"
    fi
done

# Check database schema
echo -e "\n${YELLOW}Checking database schema:${NC}"

if [ -f "docs/db-schema.sql" ]; then
    lines=$(wc -l < docs/db-schema.sql)
    echo -e "${GREEN}✓${NC} docs/db-schema.sql ($lines lines)"
else
    echo -e "${RED}✗${NC} docs/db-schema.sql missing"
fi

# Check environment template
echo -e "\n${YELLOW}Checking environment configuration:${NC}"

if [ -f ".env.local.example" ]; then
    echo -e "${GREEN}✓${NC} .env.local.example"
else
    echo -e "${RED}✗${NC} .env.local.example missing"
fi

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local created"
else
    echo -e "${RED}✗${NC} .env.local missing"
fi

# Check documentation
echo -e "\n${YELLOW}Checking documentation:${NC}"

docs=("README.md" "SETUP.md" "QUICK_START.md")

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${RED}✗${NC} $doc missing"
    fi
done

# Check git
echo -e "\n${YELLOW}Checking git repository:${NC}"

if [ -d ".git" ]; then
    commits=$(git log --oneline | wc -l)
    echo -e "${GREEN}✓${NC} Git repository with $commits commits"
else
    echo -e "${RED}✗${NC} Git repository not found"
fi

# Check gitignore
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} .gitignore configured"
else
    echo -e "${RED}✗${NC} .gitignore missing"
fi

echo -e "\n${GREEN}======================================"
echo "✨ Project setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Fill in .env.local with Supabase credentials"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
