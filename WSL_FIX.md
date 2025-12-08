# Fix WSL Corruption Issue

## Manual WSL Repair Steps:

1. **Open PowerShell as Administrator:**
   - Right-click Start Menu → Windows PowerShell (Admin)
   - Or search "PowerShell" → Right-click → Run as administrator

2. **Unregister and reinstall WSL:**
   ```powershell
   # Unregister WSL
   wsl --unregister
   
   # Reinstall WSL
   wsl --install
   ```

3. **If that doesn't work, try:**
   ```powershell
   # Enable WSL feature
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   
   # Enable Virtual Machine Platform
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   
   # Restart computer
   Restart-Computer
   
   # After restart, update WSL
   wsl --update
   ```

4. **Restart Docker Desktop** after WSL is fixed

## Alternative: Use Supabase Dashboard (No Docker/WSL Needed!)

You can deploy directly via the Supabase Dashboard without needing Docker or WSL.

