# Data Migration Guide: Firestore to Supabase

## Overview

This guide will help you migrate all data from Firestore to Supabase PostgreSQL.

---

## Prerequisites

1. **Firebase Admin SDK credentials**
   - Service account key JSON file
   - Or Firebase Admin SDK initialized (for deployed environments)

2. **Supabase credentials**
   - Supabase URL: `https://lyxwslsckkbcpepxigdx.supabase.co`
   - Service Role Key (from Supabase Dashboard → Settings → API)

3. **Environment setup**
   - Node.js installed
   - TypeScript installed
   - Dependencies installed

---

## Step 1: Install Dependencies

```bash
cd backend
npm install @supabase/supabase-js
```

---

## Step 2: Create Database Schema

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/sql/new

2. **Run the schema SQL**
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run"

This will create all necessary tables with proper indexes.

---

## Step 3: Set Environment Variables

Create or update `.env` file in the project root:

```env
# Firebase (for reading data)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
# OR if using Firebase Admin SDK in deployed environment, skip this

# Supabase (for writing data)
SUPABASE_URL=https://lyxwslsckkbcpepxigdx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Get Supabase Service Role Key:**
1. Go to: Supabase Dashboard → Settings → API
2. Copy the `service_role` key (secret key, not anon key)

---

## Step 4: Run Migration Script

```bash
cd backend
npm run migrate:supabase
```

Or directly:

```bash
cd backend
ts-node src/scripts/migrate-to-supabase.ts
```

---

## Migration Process

The script will:

1. ✅ **Connect to Firestore** - Read all collections
2. ✅ **Transform data** - Convert camelCase to snake_case, handle timestamps
3. ✅ **Insert into Supabase** - Batch insert with error handling
4. ✅ **Report progress** - Show migration status for each collection

### Migration Order

The script migrates in this order (respecting foreign key constraints):

1. `users` - Base user accounts
2. `contractorProfiles` → `contractor_profiles` - Contractor profiles
3. `projects` - Projects
4. `milestones` - Project milestones
5. `submissions` - Contractor submissions
6. `approvals` - Submission approvals
7. `documents` - Uploaded documents

---

## Data Transformations

### Field Name Conversions

| Firestore (camelCase) | PostgreSQL (snake_case) |
|----------------------|------------------------|
| `firstName` | `first_name` |
| `lastName` | `last_name` |
| `isActive` | `is_active` |
| `contractorId` | `contractor_id` |
| `projectId` | `project_id` |
| `createdAt` | `created_at` |
| etc. | etc. |

### Timestamp Handling

- Firestore `Timestamp` → PostgreSQL `TIMESTAMP` (ISO string)
- Handles: `createdAt`, `updatedAt`, `lastLogin`, `submittedAt`, etc.

### Array Fields

- `specialization` → PostgreSQL `TEXT[]` array
- `lga` → Can be TEXT or TEXT[] (stored as JSON)

### Object Fields

- `location` → PostgreSQL `JSONB` (stores coordinates and address)

---

## Troubleshooting

### Error: "relation does not exist"

**Solution:** Run the schema SQL first (Step 2)

### Error: "duplicate key value violates unique constraint"

**Solution:** The script uses `upsert` (insert or update), so this shouldn't happen. If it does, check for duplicate IDs.

### Error: "foreign key constraint violation"

**Solution:** Ensure data is migrated in order. The script handles this automatically.

### Error: "SUPABASE_SERVICE_ROLE_KEY is required"

**Solution:** Set the environment variable in `.env` file

### Error: Firebase Admin initialization failed

**Solution:** 
- Set `GOOGLE_APPLICATION_CREDENTIALS` to your service account key path
- Or ensure Firebase Admin is initialized in your environment

---

## Verification

After migration, verify data:

### Check record counts:

```sql
-- In Supabase SQL Editor
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'contractor_profiles', COUNT(*) FROM contractor_profiles
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'approvals', COUNT(*) FROM approvals
UNION ALL
SELECT 'documents', COUNT(*) FROM documents;
```

### Test a few records:

```sql
-- Check users
SELECT id, email, first_name, last_name, role FROM users LIMIT 5;

-- Check projects
SELECT id, name, status, category FROM projects LIMIT 5;

-- Check relationships
SELECT p.id, p.name, c.company_name 
FROM projects p 
LEFT JOIN contractor_profiles c ON p.contractor_id = c.id 
LIMIT 5;
```

---

## Rollback

If something goes wrong:

1. **Clear Supabase tables:**
```sql
-- WARNING: This deletes all data!
TRUNCATE documents, approvals, submissions, milestones, projects, contractor_profiles, users CASCADE;
```

2. **Re-run migration** after fixing issues

---

## Post-Migration

After successful migration:

1. ✅ Verify all data migrated correctly
2. ✅ Test API endpoints
3. ✅ Update frontend to use Supabase API
4. ✅ Monitor for any issues
5. ✅ Consider keeping Firestore as backup for a period

---

## Support

If you encounter issues:

1. Check migration script logs for specific errors
2. Verify environment variables are set correctly
3. Ensure database schema is created
4. Check Supabase logs in Dashboard

---

**Good luck with your migration!** 🚀

