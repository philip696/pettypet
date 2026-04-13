#!/bin/bash

# PettyPet MVP - Interactive Environment Setup
# This script guides you through setting up your Supabase credentials

echo "🐾 PettyPet MVP - Supabase Configuration"
echo "========================================"
echo ""
echo "This script will help you set up your .env.local file with Supabase credentials."
echo ""
echo "BEFORE YOU BEGIN, you need to:"
echo "1. Create a Supabase account at https://supabase.com"
echo "2. Create a new project"
echo "3. Go to Settings > API to find your credentials"
echo ""
echo "Ready? Press Enter to continue..."
read

echo ""
echo "Enter your Supabase Project URL"
echo "(looks like: https://your-project-id.supabase.co)"
read -p "URL: " SUPABASE_URL

echo ""
echo "Enter your Supabase Anon Public Key"
echo "(looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
read -p "Anon Key: " SUPABASE_ANON_KEY

echo ""
echo "Enter a JWT Secret (use any random string, minimum 32 characters)"
echo "(or press Enter to use a generated one)"
read -p "JWT Secret: " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT Secret: $JWT_SECRET"
fi

# Create .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Authentication
JWT_SECRET=$JWT_SECRET
EOF

echo ""
echo "✓ .env.local created successfully!"
echo ""
echo "Next steps:"
echo "1. Run the database schema SQL:"
echo "   - Go to Supabase SQL Editor"
echo "   - Copy contents from: docs/db-schema.sql"
echo "   - Paste and execute in Supabase"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Visit http://localhost:3000"
