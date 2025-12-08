# ⚠️ IMPORTANT: Create Database Schema First!

Before running the migration script, you MUST create the database tables in Supabase.

## Quick Steps:

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/sql/new

### 2. Copy Schema SQL
Open file: `supabase/migrations/001_initial_schema.sql`
Copy ALL contents

### 3. Paste and Run
- Paste into SQL Editor
- Click "Run" button
- Wait for "Success" message

### 4. Verify Tables Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- approvals
- contractor_profiles
- documents
- milestones
- projects
- submissions
- users

### 5. Then Run Migration
```bash
cd backend
npm run migrate:supabase
```

---

**⚠️ Without the schema, the migration will fail with "relation does not exist" errors!**

