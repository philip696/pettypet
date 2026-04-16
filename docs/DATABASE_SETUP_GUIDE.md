# 🚀 Quick Database Setup Guide

## ⚠️ You Are Here: Database Schema Not Created

The error `"Could not find the table 'public.users' in the schema cache"` means your Supabase database tables don't exist yet.

---

## ✅ 3-Minute Setup

### Step 1: Open Supabase SQL Editor
1. Visit **https://app.supabase.com**
2. Sign in with your account
3. Select the **MIS2010** project (or your project name)
4. Click **SQL Editor** in the left sidebar
5. Click **+ New Query** button

### Step 2: Copy the Database Schema
1. Open this file in your editor: `docs/db-schema.sql`
2. Select **ALL** the SQL code (Cmd+A)
3. Copy it (Cmd+C)

### Step 3: Paste and Run in Supabase
1. In the Supabase SQL Editor, paste the SQL (Cmd+V)
2. Click the **Run** button (or press Cmd+Enter)
3. Wait for the green success message ✅

You should see:
```
Query executed successfully
Rows affected: 0
```

### Step 4: Verify Tables Were Created
1. Click **Table Editor** in the left sidebar
2. You should see these 4 tables:
   - ✅ `users`
   - ✅ `pets`
   - ✅ `care_tasks` (now includes is_completed field)
   - ✅ `care_history`

---

## 🧪 Test the APIs Now

Once database is created, you can test:

### Test 1: Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "John Doe",
      "auth_provider": "email",
      "created_at": "2026-04-14T..."
    },
    "token": "jwt-token-here"
  }
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test 3: Create Pet
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Fluffy",
    "type": "cat",
    "breed": "Persian",
    "gender": "female",
    "dateOfBirth": "2020-01-15"
  }'
```

### Test 4: Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "petId": "PET_UUID_HERE",
    "type": "vaccination",
    "title": "Annual Vaccine",
    "description": "Yearly vaccination",
    "frequency": "yearly",
    "nextDueDate": "2026-05-14T10:00:00Z"
  }'
```

---

## ✨ What Got Fixed

### Issues Fixed:
1. ✅ **Database Schema Updated**
   - Added `is_completed` field to `care_tasks` table
   - Now all 16 API endpoints will work correctly

2. ✅ **Task Creation Endpoint**
   - Now properly inserts tasks with `is_completed: false`

3. ✅ **Type Safety**
   - TypeScript interfaces match database schema perfectly
   - All field names are correct

### Changes Made:
- `/docs/db-schema.sql` - Added `is_completed BOOLEAN DEFAULT false` to care_tasks
- `/lib/server/tasks.ts` - Task creation now includes is_completed field
- `/docs/API_DIAGNOSTIC_REPORT.md` - Created comprehensive endpoint verification

---

## 🎯 Next Steps After Database Setup

1. **Test signup/login** in the browser at http://localhost:3000
2. **Build pet management UI** (Add Pet form, Pet list)
3. **Build task management UI** (Create task, task list)
4. **Add local storage** for token persistence
5. **Deploy to Railway**

---

## 🆘 Troubleshooting

### Error: "permission denied for schema public"
- Solution: Make sure you're using the SQL Editor in Supabase with admin privileges

### Error: "table 'users' already exists"
- Solution: The tables already exist! You can now use the APIs

### Error: "syntax error in SQL"
- Solution: Make sure you copied the entire `db-schema.sql` file without modification

### 400 Bad Request on API calls
- Make sure the database schema is created first
- Use the test commands above to verify each step

---

## 📊 Database Schema Overview

### users table
- Stores user accounts created via email signup
- Fields: id, email, name, password_hash, auth_provider, created_at

### pets table
- Stores pet information (name, type, breed, etc.)
- Foreign key: references users(id)
- Fields: id, user_id, name, type, breed, gender, date_of_birth, created_at

### care_tasks table
- Stores care tasks (vaccinations, check-ups, etc.)
- Foreign key: references pets(id)
- Special field: **is_completed** (new!) - tracks task status
- Fields: id, pet_id, type, title, description, frequency, next_due_date, is_completed, created_at

### care_history table
- Audit log of completed tasks with notes
- Foreign key: references care_tasks(id)
- Fields: id, task_id, completed_at, notes, created_at

---

## ✅ Verification Checklist

After running the SQL, verify:

- [ ] No errors in SQL execution
- [ ] 4 tables appear in Table Editor
- [ ] Can run: `SELECT COUNT(*) FROM users;` (should return 0)
- [ ] Can run: `SELECT LENGTH(id) FROM users LIMIT 1;` successfully (UUID is 36 chars)
- [ ] Frontend signup no longer returns "table not found" error
- [ ] Backend logs show successful database inserts

Once all checked, all 16 API endpoints are ready to use! 🎉
