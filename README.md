# PettyPet MVP - Next.js TypeScript Project

A modern pet care management application built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anonymous key from Settings > API
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   JWT_SECRET=your_jwt_secret_here
   ```

### 3. Create Database Schema

Go to Supabase SQL Editor and run the SQL in `docs/db-schema.sql` to create all tables.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
✓ /app                 # Next.js app directory (pages & layouts)
✓ /app/api            # API routes (backend)
✓ /lib                # Shared utilities (Supabase, Auth, API client)
✓ /types              # TypeScript type definitions
✓ /styles             # Global styles & Tailwind config
✓ /public             # Static assets
```

## 🗄️ Database Schema

### Tables
- **users** - User authentication and profiles
- **pets** - Pet information for each user
- **care_tasks** - Recurring care tasks for pets
- **care_history** - History of completed care tasks

Run SQL script from `docs/db-schema.sql` to create these tables.

## 🔐 Authentication

- Email/password authentication with bcrypt hashing
- JWT tokens for API requests
- Extensible for OAuth providers (Google, GitHub)

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📚 Documentation

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

## 🎯 Next Steps

1. [ ] Create database schema
2. [ ] Implement authentication pages
3. [ ] Build pet management UI
4. [ ] Add care task tracking
5. [ ] Implement reminders/notifications
6. [ ] Deploy to Vercel

## 📝 License

MIT
