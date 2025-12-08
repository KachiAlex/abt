# 🔧 Fix 404 Error - Deploy Updated Edge Function

## Problem
Getting `404 Not Found` when calling `/api/auth/login` because the Edge Function path includes `/functions/v1` prefix.

## Solution Applied
I've updated the Edge Function to strip the `/functions/v1` prefix from the pathname before routing.

## Deploy the Fix

### Option 1: Via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/functions

2. **Edit the `api` function:**
   - Click on the `api` function
   - Click "Edit" or "Deploy"

3. **Copy the updated code:**
   - Open `supabase/functions/api/index.ts`
   - Copy all contents
   - Paste into the Supabase Dashboard editor

4. **Deploy:**
   - Click "Deploy" or "Save"

### Option 2: Via CLI (If Docker Works)

```bash
# Restart Docker Desktop first, then:
cd supabase
supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx
```

### Option 3: Manual File Upload

1. Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/functions/api
2. Use the file upload feature if available
3. Upload the updated `index.ts` file

## What Was Fixed

The Edge Function now correctly handles the Supabase path structure:

**Before:**
```typescript
const path = url.pathname; // /functions/v1/api/auth/login
if (path.startsWith("/api/auth")) { // ❌ Fails
```

**After:**
```typescript
let path = url.pathname; // /functions/v1/api/auth/login
if (path.startsWith("/functions/v1")) {
  path = path.replace("/functions/v1", ""); // /api/auth/login
}
if (path.startsWith("/api/auth")) { // ✅ Works
```

## Verify

After deploying, test the login:
1. Visit: https://abt-abia-tracker.web.app
2. Try logging in
3. Should work now! ✅

---

**The fix is ready, just needs to be deployed!** 🚀

