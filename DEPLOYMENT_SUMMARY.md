# ✅ Supabase Edge Function Deployment - Complete!

## 🎉 Deployment Status

**Function Successfully Deployed!**

- **Function Name:** `api`
- **Function URL:** `https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api`
- **Dashboard:** https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/functions

## ✅ Completed

1. ✅ Created Supabase Edge Function structure
2. ✅ Migrated Express routes to Deno-compatible handlers
3. ✅ Converted Firestore queries to Supabase client queries
4. ✅ Configured CORS for frontend domains
5. ✅ Deployed function to Supabase
6. ✅ Updated frontend API URL configuration

## ⏳ Required Next Steps

### 1. Set Environment Variables (CRITICAL)

Go to: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

Add these secrets:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `JWT_SECRET` | Your JWT secret | From Firebase config or generate new |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Project Settings → API → service_role key |
| `SUPABASE_URL` | `https://lyxwslsckkbcpepxigdx.supabase.co` | Your project URL |

**Without these, the function will return errors!**

### 2. Create Database Schema

The function expects PostgreSQL tables. You need to:

1. **Go to SQL Editor** in Supabase Dashboard
2. **Create tables** with snake_case columns:
   - `users` (id, email, password, first_name, last_name, role, is_active, etc.)
   - `projects`
   - `contractors` / `contractor_profiles`
   - `submissions`
   - `milestones`
   - And other collections from Firestore

3. **Example users table:**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### 3. Migrate Data from Firestore

Export your Firestore data and import it into Supabase PostgreSQL tables.

**Column name mapping:**
- `firstName` → `first_name`
- `lastName` → `last_name`
- `isActive` → `is_active`
- `jobTitle` → `job_title`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `lastLogin` → `last_login`

### 4. Update Frontend Environment Variables (Optional)

If you want to use environment variables for the API URL:

Create `.env.production`:
```env
VITE_API_URL=https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get the anon key from: **Project Settings → API → anon/public key**

### 5. Test the Function

After setting environment variables:

```bash
# Test health endpoint
curl https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/health

# Test with anon key (if needed)
curl -H "apikey: YOUR_ANON_KEY" https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/health
```

## 📝 Available API Endpoints

Once database is set up:

- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/register` - Register new user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout
- `GET /health` - Health check

## 🔄 Update Function Code

To update the function:

```bash
# Edit: supabase/functions/api/index.ts
# Then redeploy:
supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx
```

## 📊 Monitor & Debug

- **View Logs:** Dashboard → Edge Functions → api → Logs
- **View Metrics:** Dashboard → Edge Functions → api → Metrics
- **Test Function:** Dashboard → Edge Functions → api → Test

## 🆘 Troubleshooting

### 401 Unauthorized
- Set environment variables (JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY)
- Add `apikey` header with anon key if required

### 500 Internal Server Error
- Check function logs in Dashboard
- Verify database tables exist
- Check column names match (snake_case)

### CORS Errors
- CORS is configured for your frontend domains
- Verify frontend URL matches allowed origins

### Database Errors
- Verify tables exist in Supabase
- Check column names (use snake_case)
- Verify service role key has permissions

## 📚 Files Modified

- ✅ `supabase/functions/api/index.ts` - Main function code
- ✅ `supabase/functions/_shared/cors.ts` - CORS headers
- ✅ `src/services/api.js` - Updated API URL to Supabase

## 🎯 Next Actions

1. ⏳ Set environment variables in Supabase Dashboard
2. ⏳ Create database schema (SQL Editor)
3. ⏳ Migrate data from Firestore to Supabase
4. ⏳ Test all endpoints
5. ⏳ Update frontend build and deploy

---

**Function is deployed and ready!** Just need to configure environment variables and database. 🚀

