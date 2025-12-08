# Supabase Edge Function Deployment Instructions

## Issue: 403 Access Control Error

You're getting a 403 error because your account doesn't have access to project `lyxwslsckkbcpepxigdx`.

## Solutions

### Option 1: Get Project Access (Recommended)

1. **Contact Project Owner:**
   - Ask them to add you as a collaborator
   - Go to: Supabase Dashboard → Project Settings → Team
   - Add your email as a collaborator

2. **Or Verify Project Reference:**
   - Check if `lyxwslsckkbcpepxigdx` is the correct project reference
   - Find it in: Supabase Dashboard → Project Settings → General → Reference ID

### Option 2: Deploy via Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/edge-functions

2. **Create New Function:**
   - Click "Create a new function"
   - Name: `api`
   - Copy the contents of `supabase/functions/api/index.ts` into the editor

3. **Set Environment Variables:**
   - Go to: Project Settings → Edge Functions → Secrets
   - Add:
     - `JWT_SECRET` - Your JWT secret
     - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key
     - `SUPABASE_URL` - https://lyxwslsckkbcpepxigdx.supabase.co

4. **Deploy:**
   - Click "Deploy" button

### Option 3: Use Access Token

If you have an access token:

```bash
# Set access token
$env:SUPABASE_ACCESS_TOKEN="your-access-token-here"

# Deploy
supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx
```

### Option 4: Create New Project

If you can't get access, create a new Supabase project:

1. Go to https://supabase.com/dashboard
2. Create new project
3. Note the new project reference ID
4. Update the SUPABASE_URL in `supabase/functions/api/index.ts`
5. Deploy to new project:
   ```bash
   supabase functions deploy api --project-ref YOUR_NEW_PROJECT_REF
   ```

## Function Files Location

Your function files are ready at:
- `supabase/functions/api/index.ts` - Main function code
- `supabase/functions/_shared/cors.ts` - CORS headers

## After Deployment

1. **Set Environment Variables:**
   - JWT_SECRET
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_URL

2. **Test the Function:**
   ```bash
   curl https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/health
   ```

3. **Update Frontend:**
   - Change API URL to: `https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api`

## Database Migration Required

⚠️ **Important:** You still need to:
1. Create PostgreSQL tables in Supabase (users, projects, contractors, etc.)
2. Migrate data from Firestore to Supabase
3. Update column names to snake_case format

