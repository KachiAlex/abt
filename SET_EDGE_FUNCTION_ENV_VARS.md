# 🔧 Set Edge Function Environment Variables

## Problem
The `ERR_INSUFFICIENT_RESOURCES` error suggests the Edge Function might be failing because environment variables are not set.

## Solution: Set Environment Variables in Supabase

### Step 1: Go to Edge Function Settings
1. Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/functions
2. Click on the `api` function
3. Go to "Settings" or "Environment Variables" tab

### Step 2: Add Required Environment Variables

Add these environment variables:

#### 1. SUPABASE_SERVICE_ROLE_KEY (Required)
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your service role key (the secret one)
- **Get it from**: Settings → API → service_role secret key

#### 2. SUPABASE_URL (Optional - has default)
- **Key**: `SUPABASE_URL`
- **Value**: `https://lyxwslsckkbcpepxigdx.supabase.co`

#### 3. JWT_SECRET (Optional - has default)
- **Key**: `JWT_SECRET`
- **Value**: A secure random string (for JWT token signing)

### Step 3: Save and Redeploy
1. Save the environment variables
2. The function will automatically use them on next invocation

## Alternative: Use Supabase Anon Key

If you can't set the service role key, the function will try to use the anon key as a fallback. However, the service role key is recommended for full database access.

## Verify

After setting the variables:
1. Wait a few seconds for them to take effect
2. Try logging in again
3. Check the function logs in Supabase Dashboard for any errors

---

**The function needs the SUPABASE_SERVICE_ROLE_KEY to access the database!** 🔑

