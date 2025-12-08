# 🔧 Fix API Authentication Error

## Problem
You're getting `401 Unauthorized` and "Missing authorization header" errors because the Supabase anon key is not set in the production build.

## Solution

### Step 1: Get Your Supabase Anon Key

1. Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/settings/api
2. Find the **anon** `public` key (NOT the service_role key)
3. Copy the entire key (it's a JWT token, starts with `eyJ...`)

### Step 2: Create Production Environment File

Create a `.env.production` file in the project root:

```env
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api
```

**Replace `your-anon-key-here` with your actual anon key.**

### Step 3: Rebuild and Redeploy

```bash
# Rebuild with the environment variable
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Alternative: Set in Firebase Hosting (If Supported)

Some hosting platforms allow setting environment variables. Check Firebase Hosting documentation for environment variable support.

## Verify

After redeploying:
1. Visit your site: https://abt-abia-tracker.web.app
2. Try to log in
3. Check browser console - should not see "Missing authorization header" error
4. Login should work with admin credentials

---

**Quick Fix Command:**
```bash
# After getting your anon key, run:
echo "VITE_SUPABASE_ANON_KEY=your-key-here" > .env.production
npm run build
firebase deploy --only hosting
```

