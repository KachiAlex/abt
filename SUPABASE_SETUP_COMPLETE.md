# Supabase Edge Function Deployment - Next Steps

## ✅ Deployment Successful!

Your function has been deployed to:
```
https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api
```

## 🔧 Required Setup Steps

### 1. Set Environment Variables

Go to Supabase Dashboard:
**Project Settings → Edge Functions → Secrets**

Add these secrets:

#### Required:
- **JWT_SECRET** - Your JWT signing secret (same as Firebase)
  - Example: `your-super-secure-jwt-secret-key-change-in-production`
  - Get from: Firebase Functions config or generate a new one

- **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key
  - Get from: **Project Settings → API → service_role key** (the `secret` key)
  - ⚠️ Keep this secret! Never expose it in frontend code

- **SUPABASE_URL** - Your Supabase project URL
  - Value: `https://lyxwslsckkbcpepxigdx.supabase.co`

#### Optional:
- **JWT_EXPIRES_IN** - Token expiration (default: "7d")

### 2. Test the Function

After setting environment variables, test the health endpoint:

```bash
curl https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "API ready"
  }
}
```

### 3. Database Migration Required ⚠️

**IMPORTANT:** The function expects PostgreSQL tables, not Firestore collections.

You need to:

1. **Create database schema** in Supabase:
   - Go to: **SQL Editor** in Supabase Dashboard
   - Create tables: `users`, `projects`, `contractors`, `submissions`, `milestones`, etc.
   - Use snake_case column names (e.g., `first_name`, `is_active`, `created_at`)

2. **Migrate data from Firestore to Supabase:**
   - Export data from Firestore
   - Transform to PostgreSQL format
   - Import into Supabase tables

3. **Schema mapping:**
   - Firestore `users` collection → PostgreSQL `users` table
   - Column names: `firstName` → `first_name`, `isActive` → `is_active`, etc.

### 4. Update Frontend Configuration

Update your frontend API URL:

**File:** `src/services/api.js`

Change:
```javascript
const API_URL = 'https://us-central1-abt-abia-tracker.cloudfunctions.net/apiV1/api';
```

To:
```javascript
const API_URL = 'https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api';
```

### 5. Available API Endpoints

After setup, these endpoints will be available:

- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/register` - Register new user
- `PUT /api/auth/profile` - Update profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/logout` - Logout
- `GET /health` - Health check

## 📊 Monitor Function

View logs and monitor function:
- Dashboard: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/functions
- Logs: **Edge Functions → api → Logs**

## 🔄 Update Function

To update the function code:

```bash
# Make changes to supabase/functions/api/index.ts
# Then redeploy:
supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx
```

## 📝 Next Steps

1. ✅ Function deployed
2. ⏳ Set environment variables (JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL)
3. ⏳ Create database schema in Supabase
4. ⏳ Migrate data from Firestore to Supabase
5. ⏳ Update frontend API URL
6. ⏳ Test all endpoints

## 🆘 Troubleshooting

### Function returns 500 error:
- Check environment variables are set correctly
- Check function logs in Dashboard
- Verify database tables exist

### CORS errors:
- CORS is configured to allow your frontend domains
- Check that your frontend URL matches allowed origins

### Database errors:
- Verify tables exist in Supabase
- Check column names match (snake_case)
- Verify service role key has proper permissions

