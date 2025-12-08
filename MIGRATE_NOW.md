# 🚀 Quick Start: Migrate Data to Supabase

## Quick Steps

### 1. Set Environment Variables

Create `.env` file in project root (`D:\abt-master\.env`):

```env
# Supabase Configuration
SUPABASE_URL=https://lyxwslsckkbcpepxigdx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Firebase (if needed for local migration)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

**Get Supabase Service Role Key:**
1. Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/settings/api
2. Copy the `service_role` key (the secret one, not anon key)

### 2. Create Database Schema

1. Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/sql/new
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run"

### 3. Run Migration

```bash
cd backend
npm run migrate:supabase
```

That's it! The script will:
- ✅ Read all data from Firestore
- ✅ Transform to PostgreSQL format
- ✅ Insert into Supabase
- ✅ Show progress for each collection

---

## What Gets Migrated

- ✅ Users
- ✅ Contractor Profiles
- ✅ Projects
- ✅ Milestones
- ✅ Submissions
- ✅ Approvals
- ✅ Documents

---

## Troubleshooting

**"SUPABASE_SERVICE_ROLE_KEY is required"**
→ Set it in `.env` file

**"relation does not exist"**
→ Run the schema SQL first (Step 2)

**"Firebase Admin initialization error"**
→ Set `GOOGLE_APPLICATION_CREDENTIALS` or ensure Firebase is initialized

---

See `DATA_MIGRATION_GUIDE.md` for detailed instructions.

