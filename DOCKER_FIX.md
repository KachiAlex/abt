# Fix Docker Desktop Issue

## Quick Fix Steps:

1. **Close Docker Desktop completely:**
   - Right-click Docker Desktop icon in system tray
   - Click "Quit Docker Desktop"
   - Wait for all processes to close

2. **Restart Docker Desktop:**
   - Open Docker Desktop from Start Menu
   - Wait for it to fully start (whale icon should be steady, not animating)

3. **Verify Docker is working:**
   ```powershell
   docker ps
   ```
   Should return an empty list (not an error)

4. **Retry deployment:**
   ```powershell
   supabase functions deploy api --project-ref lyxwslsckkbcpepxigdx
   ```

## Alternative: Deploy via Dashboard (No Docker Required)

If Docker continues to have issues, use the Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/edge-functions
2. Click "Create a new function"
3. Name: `api`
4. Copy code from `supabase/functions/api/index.ts`
5. Deploy

