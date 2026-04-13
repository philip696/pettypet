# 🐾 PettyPet MVP - Environment Setup Guide

## Step 1: Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project (choose any region close to you)
3. Wait for the project to be provisioned
4. Go to **Settings > API** in your Supabase dashboard
5. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `docs/db-schema.sql`
4. Click **RUN** and wait for completion

## Step 3: Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here_starts_with_eyJ

# Authentication
JWT_SECRET=use_any_random_string_minimum_32_characters_long
```

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh123456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your_super_secret_jwt_token_key_change_me_in_production
```

## Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Tables Created

✅ **users** - User profiles and authentication  
✅ **pets** - Pet information  
✅ **care_tasks** - Recurring care tasks  
✅ **care_history** - Completed tasks history  

Each with Row Level Security (RLS) policies enabled.

## 🔒 Security Notes

- Store `.env.local` in git ignore (already configured)
- Never commit secrets to git
- JWT_SECRET should be rotated in production
- Use environment variables for all API keys
