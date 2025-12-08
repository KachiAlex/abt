# Deploy via Supabase Dashboard (No Docker/WSL Needed!)

## Step-by-Step Instructions:

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/edge-functions

### 2. Create New Function
- Click **"Create a new function"** button
- Function name: `api`
- Click **"Create function"**

### 3. Copy the Code
Copy the ENTIRE contents of the file below and paste into the editor:

**File to copy:** `supabase/functions/api/standalone.ts` (see below)

### 4. Set Environment Variables
Go to: **Project Settings → Edge Functions → Secrets**

Add these secrets:
- `JWT_SECRET` - Your JWT secret (same as Firebase)
- `SUPABASE_SERVICE_ROLE_KEY` - Get from: Project Settings → API → service_role key
- `SUPABASE_URL` - https://lyxwslsckkbcpepxigdx.supabase.co

### 5. Deploy
Click the **"Deploy"** button

### 6. Test
After deployment, test with:
```
https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/health
```

---

## Alternative: Fix WSL First (If you want to use CLI)

If you prefer to fix WSL and use CLI deployment:

1. **Open PowerShell as Administrator**
2. Run:
   ```powershell
   wsl --unregister
   wsl --install
   ```
3. **Restart your computer**
4. **After restart:**
   ```powershell
   wsl --update
   ```
5. **Restart Docker Desktop**
6. **Deploy:**
   ```powershell
   supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx
   ```

