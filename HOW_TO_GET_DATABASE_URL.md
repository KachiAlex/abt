# How to Get Database URL from Render

## Step-by-Step Instructions

### Method 1: From Render Dashboard (Easiest)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in to your account

2. **Find Your PostgreSQL Database**
   - In the left sidebar, click **"Databases"** or look for your database in the services list
   - Click on your database name (e.g., `abt-database`)

3. **Get the Connection String**
   - In the database dashboard, look for the **"Connect"** tab (or section)
   - You'll see several connection options:
     - **Internal Database URL** (for services in same region)
     - **External Connection** (for local development)
   
4. **Copy the Internal Database URL**
   - Click on **"Internal Database URL"** section
   - You'll see a connection string that looks like:
     ```
     postgresql://abt_user:password123@dpg-xxxxx-a.oregon-postgres.render.com/abt_tracker
     ```
   - Click the **copy button** (📋) next to it
   - **This is your DATABASE_URL**

5. **Add to Environment Variables**
   - Go to your Web Service → **"Environment"** tab
   - Click **"Add Environment Variable"**
   - Key: `DATABASE_URL`
   - Value: Paste the connection string you copied
   - Click **"Save Changes"**

---

### Method 2: Manual Construction (If you know the details)

If you need to construct it manually, the format is:

```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]
```

**Where to find each part:**

1. **USERNAME**: 
   - Database Dashboard → **"Info"** tab → Look for "User"
   - Usually: `abt_user` or similar

2. **PASSWORD**:
   - Database Dashboard → **"Info"** tab → Look for "Password"
   - Or: **"Connect"** tab → Shows password
   - ⚠️ If you don't see it, you may need to reset it

3. **HOST**:
   - Database Dashboard → **"Info"** tab → Look for "Host"
   - Format: `dpg-xxxxx-a.oregon-postgres.render.com` (varies by region)

4. **PORT**:
   - Usually `5432` (PostgreSQL default)
   - Check **"Info"** tab if different

5. **DATABASE_NAME**:
   - Database Dashboard → **"Info"** tab → Look for "Database"
   - Usually: `abt_tracker` or what you set during creation

**Example:**
```
postgresql://abt_user:MySecurePassword123@dpg-abc123def456-a.oregon-postgres.render.com:5432/abt_tracker
```

---

### Method 3: Using Render Shell (Alternative)

1. **Go to Database Dashboard**
2. **Click "Connect" tab**
3. **Click "Shell" button**
4. **Run this command:**
   ```bash
   echo $DATABASE_URL
   ```
5. **Copy the output** - that's your connection string

---

## Where to Find Database Info in Render Dashboard

### Database Dashboard Sections:

1. **"Info" Tab:**
   - Shows: Host, Port, Database name, User
   - Does NOT show password (for security)

2. **"Connect" Tab:**
   - Shows: Connection strings (Internal & External)
   - Shows: Connection examples
   - **This is where you'll find the full DATABASE_URL**

3. **"Settings" Tab:**
   - Database configuration
   - Can reset password here if needed

---

## If You Can't Find the Password

If the password is not visible:

1. **Reset Password:**
   - Go to Database → **"Settings"** tab
   - Look for **"Reset Password"** or **"Change Password"**
   - Generate a new password
   - **Save it immediately** - you won't see it again!

2. **Use the Connection String from "Connect" Tab:**
   - The connection string in "Connect" tab already includes the password
   - Just copy the entire string - it's already formatted correctly

---

## Quick Checklist

- [ ] Go to Render Dashboard
- [ ] Click on your PostgreSQL database
- [ ] Click **"Connect"** tab
- [ ] Find **"Internal Database URL"**
- [ ] Copy the entire connection string
- [ ] Go to Web Service → **"Environment"** tab
- [ ] Add `DATABASE_URL` = (paste connection string)
- [ ] Save

---

## Example Connection String Format

```
postgresql://abt_user:password123@dpg-abc123def456-a.oregon-postgres.render.com:5432/abt_tracker?sslmode=require
```

**Parts breakdown:**
- `postgresql://` - Protocol
- `abt_user` - Username
- `password123` - Password
- `dpg-abc123def456-a.oregon-postgres.render.com` - Host
- `5432` - Port (may be omitted if default)
- `abt_tracker` - Database name
- `?sslmode=require` - SSL parameters (may be included)

---

## Important Notes

1. **Keep it Secret**: The connection string contains your password. Never commit it to Git or share it publicly.

2. **Internal vs External**:
   - **Internal Database URL**: Use this for Render services (faster, more secure)
   - **External Connection**: Use this for local development or external tools

3. **SSL Required**: Render PostgreSQL requires SSL. The connection string should include SSL parameters or Render handles it automatically.

4. **Password Reset**: If you reset the password, you'll need to update the `DATABASE_URL` in your Web Service environment variables.

---

## Still Can't Find It?

1. **Check Database Status**: Make sure database is "Available" (green status)
2. **Check Permissions**: Make sure you're the owner of the database
3. **Try "Connect" Tab**: This is where connection strings are usually shown
4. **Contact Support**: If still stuck, Render support can help

---

## Direct Links

- **Render Dashboard**: https://dashboard.render.com
- **Your Databases**: https://dashboard.render.com/databases
- **Render Docs**: https://render.com/docs/databases

---

**The connection string should look something like this:**
```
postgresql://abt_user:your-password@dpg-xxxxx-a.oregon-postgres.render.com/abt_tracker
```

Copy the **entire string** and use it as your `DATABASE_URL` environment variable!

