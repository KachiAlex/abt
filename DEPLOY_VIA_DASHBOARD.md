# 🚀 Deploy Edge Function via Supabase Dashboard

## Quick Steps

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/functions

### Step 2: Edit the `api` Function
1. Find the `api` function in the list
2. Click on it to open
3. Click "Edit" or the code editor icon

### Step 3: Replace the Code
1. Open `supabase/functions/api/index.ts` in your editor
2. **Select All** (Ctrl+A) and **Copy** (Ctrl+C)
3. Go back to Supabase Dashboard
4. **Select All** in the editor and **Paste** (Ctrl+V) to replace

### Step 4: Deploy
1. Click "Deploy" or "Save" button
2. Wait for deployment to complete
3. You should see a success message

### Step 5: Test
1. Visit: https://abt-abia-tracker.web.app
2. Try logging in
3. Should work now! ✅

---

## Alternative: Use Supabase CLI with No Docker

If you have Node.js installed, you can try:

```bash
# Install Supabase CLI globally (if not already)
npm install -g supabase

# Deploy without Docker (if supported)
supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx --no-verify-jwt
```

---

**The code is fixed, just needs to be deployed!** 🚀

