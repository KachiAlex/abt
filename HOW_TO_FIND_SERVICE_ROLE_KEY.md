# 🔑 How to Find Your Supabase Service Role Key

## Step-by-Step Guide

### Step 1: Sign in to Supabase
1. Go to: https://supabase.com/dashboard
2. Sign in with your account

### Step 2: Navigate to Your Project
1. After signing in, you'll see your projects
2. Click on your project: **lyxwslsckkbcpepxigdx** (or the project name)

### Step 3: Go to API Settings
1. In the left sidebar, look for **Settings** (gear icon ⚙️)
2. Click on **Settings**
3. In the settings menu, click on **API**

**Direct Link:** https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/settings/api

### Step 4: Find the Service Role Key
On the API Settings page, you'll see several sections:

#### You'll see:
- **Project URL** - Your Supabase URL
- **anon public** key - This is NOT what you need (it's public)
- **service_role secret** key - **THIS IS WHAT YOU NEED!** 🔑

#### Look for:
- A section labeled **"Project API keys"** or **"API Keys"**
- Two keys will be shown:
  1. **anon** or **public** key (starts with `eyJ...` but shorter)
  2. **service_role** key (also starts with `eyJ...` but much longer - 200+ characters)

### Step 5: Copy the Service Role Key
1. Find the **service_role** key (it will say "secret" next to it)
2. Click the **eye icon** 👁️ or **"Reveal"** button to show the full key
3. Click the **copy icon** 📋 next to the key to copy it
4. The key will be a very long JWT token (starts with `eyJ...`)

### Step 6: Update Your .env File
1. Open your `.env` file in the project root (`D:\abt-master\.env`)
2. Find the line: `SUPABASE_SERVICE_ROLE_KEY=...`
3. Replace the value with the complete key you just copied
4. Save the file

**Example:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eHdzbHNja2tiY3BleHBpZ2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODk2NzI4MCwiZXhwIjoyMDE0NTQzMjgwfQ.very-long-key-continues-here...
```

### ⚠️ Important Notes:

1. **Keep it Secret!** 
   - The service_role key has full access to your database
   - Never commit it to Git
   - Never share it publicly
   - Only use it in server-side code

2. **Key Format:**
   - Service role keys are JWT tokens
   - They start with `eyJ...`
   - They are typically 200-300+ characters long
   - They have 3 parts separated by dots (`.`)

3. **Don't Confuse:**
   - ❌ **anon key** - Public key, limited permissions
   - ✅ **service_role key** - Secret key, full permissions (what you need)

### Step 7: Verify the Key
After updating your `.env` file, you can verify it works by running:

```bash
cd backend
npm run migrate:supabase
```

If the key is correct, the migration should proceed without "Invalid API key" errors.

---

## Visual Guide

```
Supabase Dashboard
├── Your Project (lyxwslsckkbcpepxigdx)
│   ├── Settings ⚙️
│   │   └── API
│   │       ├── Project URL
│   │       ├── anon public key (❌ not this one)
│   │       └── service_role secret key (✅ THIS ONE!)
```

---

## Troubleshooting

**Q: I can't see the service_role key?**
- Make sure you're looking at the **API** settings page
- Click the "Reveal" or eye icon to show hidden keys
- Make sure you have admin access to the project

**Q: The key seems too short?**
- Service role keys are very long (200+ characters)
- Make sure you copied the entire key
- It should start with `eyJ` and have 3 parts separated by dots

**Q: I get "Invalid API key" error?**
- Double-check you copied the **service_role** key, not the **anon** key
- Make sure there are no extra spaces in your `.env` file
- Make sure the key is on one line (no line breaks)

---

**Once you have the key, update your `.env` file and we can continue with the migration!** 🚀

