# Migration Status: Supabase → Render

## ✅ Completed

1. **PostgreSQL Database Connection**
   - Created `backend/src/config/database.ts` with PostgreSQL connection pool
   - Supports Render PostgreSQL connection strings
   - Includes helper functions for camelCase ↔ snake_case conversion

2. **Backend Configuration**
   - Updated `backend/src/config/index.ts` - removed Firebase-specific code
   - Simplified environment variable handling
   - Updated `backend/src/server.ts` - removed Firebase Functions logic
   - Updated health check to test database connection

3. **Authentication Routes**
   - Migrated `backend/src/routes/auth.ts` to use PostgreSQL
   - All auth endpoints now use SQL queries instead of Firestore
   - Supports both bcrypt and PBKDF2 password hashes (for migration compatibility)

4. **Dependencies**
   - Updated `backend/package.json`:
     - Added `pg` (PostgreSQL client)
     - Added `@types/pg`
     - Removed `@supabase/supabase-js`
     - Removed `@google-cloud/firestore` (can be removed if not needed)
     - Removed `firebase-admin` (can be removed if not needed)

5. **Frontend API Service**
   - Updated `src/services/api.js` to point to Render API
   - Removed Supabase-specific headers (apikey, etc.)
   - Simplified to use standard JWT authentication

6. **Render Configuration**
   - Created `render.yaml` for automated deployment
   - Created `.renderignore` to exclude unnecessary files
   - Configured PostgreSQL database and web service

7. **Documentation**
   - Created `RENDER_MIGRATION_GUIDE.md` - comprehensive migration guide
   - Created `RENDER_QUICK_START.md` - quick setup instructions
   - Updated `env.example` with Render-specific notes

## ⚠️ Still Needs Migration

The following routes still use Firestore and need to be migrated to PostgreSQL:

1. **Projects Routes** (`backend/src/routes/projects.ts`)
   - Need to convert Firestore queries to SQL
   - Tables: `projects`, `milestones`

2. **Contractors Routes** (`backend/src/routes/contractors.ts`)
   - Need to convert Firestore queries to SQL
   - Tables: `contractor_profiles`

3. **Submissions Routes** (`backend/src/routes/submissions.ts`)
   - Need to convert Firestore queries to SQL
   - Tables: `submissions`, `approvals`, `documents`

4. **Dashboard Routes** (`backend/src/routes/dashboard.ts`)
   - Need to convert Firestore queries to SQL
   - Uses aggregated queries from multiple tables

5. **Public Routes** (`backend/src/routes/public.ts`)
   - Need to convert Firestore queries to SQL
   - Public-facing project data

6. **Files Routes** (`backend/src/routes/files.ts`)
   - Need to convert Firestore queries to SQL
   - Table: `documents`
   - May need file storage solution (S3, Render Disk, etc.)

7. **Seed Routes** (`backend/src/routes/seed.ts`)
   - Need to convert Firestore seed data to SQL inserts

## 🔧 Migration Pattern

For each route file, follow this pattern:

1. **Remove Firestore imports**:
   ```typescript
   // Remove:
   import { db, Collections } from '../config/firestore';
   ```

2. **Add PostgreSQL imports**:
   ```typescript
   // Add:
   import { query, rowToCamelCase, objectToSnakeCase } from '../config/database';
   ```

3. **Convert Firestore queries to SQL**:
   ```typescript
   // Before (Firestore):
   const docs = await db.collection(Collections.PROJECTS)
     .where('status', '==', 'ACTIVE')
     .get();
   
   // After (PostgreSQL):
   const result = await query(
     'SELECT * FROM projects WHERE status = $1',
     ['ACTIVE']
   );
   const projects = result.rows.map(rowToCamelCase);
   ```

4. **Handle data conversion**:
   - Use `rowToCamelCase()` when reading from database
   - Use `objectToSnakeCase()` when writing to database
   - Handle JSONB fields (location, preferences, etc.)

## 📋 Next Steps

1. **Migrate remaining routes** (projects, contractors, submissions, etc.)
2. **Test all endpoints** after migration
3. **Update seed scripts** to use PostgreSQL
4. **Remove unused dependencies** (Firestore, Firebase Admin)
5. **Deploy to Render** and test
6. **Migrate existing data** from Supabase (if needed)

## 🚀 Quick Migration Commands

```bash
# Install PostgreSQL client locally (for testing)
npm install --save-dev pg

# Test database connection locally
cd backend
npm run dev

# Run database schema
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql

# Deploy to Render
git push origin main  # Render will auto-deploy if connected
```

## 📝 Notes

- **Password Hashes**: The auth route supports both bcrypt and PBKDF2 (from Supabase). Users with PBKDF2 hashes may need to reset passwords or you can create a migration script.

- **File Storage**: Currently files are stored locally. For production on Render, consider:
  - Render Disk (ephemeral, resets on deploy)
  - AWS S3 (persistent, recommended)
  - Cloudinary (for images)

- **Socket.IO**: Socket.IO should work on Render, but you may need to configure it for production (consider Redis adapter for multiple instances).

## 🔗 Resources

- Render Docs: https://render.com/docs
- PostgreSQL Node.js Client: https://node-postgres.com/
- Migration Guide: See `RENDER_MIGRATION_GUIDE.md`
- Quick Start: See `RENDER_QUICK_START.md`

