# Complete Render Backend Settings & Environment Variables

This document contains **ALL** the exact settings and environment variables you need to configure in Render for your backend.

---

## 📋 Render Web Service Settings

### Basic Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `abt-api` | Your service name (can be anything) |
| **Region** | Choose closest to you | e.g., `Oregon (US West)` |
| **Branch** | `master` or `main` | Your main Git branch |
| **Root Directory** | (Leave empty) | Root of repository |
| **Environment** | `Node` | Select from dropdown |
| **Build Command** | `cd backend && npm install && npm run build` | **EXACT** command |
| **Start Command** | `cd backend && npm start` | **EXACT** command |
| **Plan** | `Starter` | $7/month (512MB RAM) |
| **Instance Type** | `Starter` | Default |

### Advanced Settings (Optional)

| Setting | Value | Notes |
|---------|-------|-------|
| **Health Check Path** | `/health` | Health endpoint |
| **Auto-Deploy** | `Yes` | Deploy on git push |
| **Pull Request Previews** | `No` | Optional |

---

## 🔐 Environment Variables (Complete List)

Go to: **Your Web Service → Environment Tab → Add Environment Variable**

### ✅ REQUIRED Variables

#### 1. Database Connection

**Option A: Manual Setup (Recommended if auto-link doesn't work)**

1. **Get Connection String:**
   - Go to Render Dashboard → Your PostgreSQL Database
   - Click **"Connect"** tab
   - Find **"Internal Database URL"** section
   - Copy the entire connection string (looks like: `postgresql://user:pass@host:port/dbname`)

2. **Add to Environment Variables:**
   - Go to Web Service → **"Environment"** tab
   - Click **"Add Environment Variable"**
   - Key: `DATABASE_URL`
   - Value: Paste the connection string you copied
   - Click **"Save Changes"**

**Option B: Auto-link (If available)**
```
1. In Web Service → Environment tab
2. Click "Add from Database"
3. Select your PostgreSQL database
4. Select "DATABASE_URL"
5. Click "Add"
```

**Connection String Format:**
```
postgresql://username:password@host:port/database_name
Example: postgresql://abt_user:mypass123@dpg-abc123-a.oregon-postgres.render.com:5432/abt_tracker
```

#### 2. Server Configuration
```
Key: NODE_ENV
Value: production
```

```
Key: PORT
Value: 10000
Note: Render sets this automatically, but good to have
```

#### 3. JWT Authentication
```
Key: JWT_SECRET
Value: [Generate a secure random string - see below]
Required: YES
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use online: https://www.random.org/strings/
# Settings: Length=32, Characters=Alphanumeric
```

**Example JWT_SECRET:**
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1p
```

```
Key: JWT_EXPIRES_IN
Value: 7d
Required: NO (default: 7d)
```

#### 4. CORS Configuration
```
Key: CORS_ORIGIN
Value: https://your-frontend-url.onrender.com
Required: YES
Examples:
  - Local dev: http://localhost:5173
  - Production: https://abt-frontend.onrender.com
  - Multiple origins: https://app1.com,https://app2.com
```

```
Key: SOCKET_CORS_ORIGIN
Value: (Same as CORS_ORIGIN)
Required: NO
```

---

### ⚙️ OPTIONAL Variables

#### File Upload (Optional)
```
Key: MAX_FILE_SIZE
Value: 10485760
Note: 10MB in bytes
```

```
Key: UPLOAD_PATH
Value: uploads
Note: Render disk is ephemeral - use S3 for production
```

#### Rate Limiting (Optional)
```
Key: RATE_LIMIT_WINDOW_MS
Value: 900000
Note: 15 minutes in milliseconds
```

```
Key: RATE_LIMIT_MAX_REQUESTS
Value: 100
Note: Max requests per window
```

#### Email Configuration (Optional - if using email features)
```
Key: SMTP_HOST
Value: smtp.gmail.com
```

```
Key: SMTP_PORT
Value: 587
```

```
Key: SMTP_USER
Value: your-email@gmail.com
```

```
Key: SMTP_PASS
Value: your-app-password
Note: Use Gmail App Password, not regular password
```

```
Key: ENABLE_EMAIL_NOTIFICATIONS
Value: true
```

#### AWS S3 (Optional - for file storage)
```
Key: AWS_ACCESS_KEY_ID
Value: AKIA...
```

```
Key: AWS_SECRET_ACCESS_KEY
Value: (your-secret-key)
```

```
Key: AWS_BUCKET_NAME
Value: abt-files
```

```
Key: AWS_REGION
Value: us-east-1
```

```
Key: ENABLE_CLOUD_STORAGE
Value: true
```

---

## 📝 Complete Environment Variables Template

Copy this and fill in your values:

```env
# ============================================
# REQUIRED - Must Set
# ============================================
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your-generated-32-character-secret-key-here
CORS_ORIGIN=https://your-frontend-url.onrender.com

# ============================================
# OPTIONAL - JWT
# ============================================
JWT_EXPIRES_IN=7d

# ============================================
# OPTIONAL - File Upload
# ============================================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# ============================================
# OPTIONAL - Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# OPTIONAL - Email
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENABLE_EMAIL_NOTIFICATIONS=true

# ============================================
# OPTIONAL - AWS S3
# ============================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=abt-files
AWS_REGION=us-east-1
ENABLE_CLOUD_STORAGE=true
```

---

## 🎯 Step-by-Step: Setting Environment Variables in Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your Web Service** (e.g., `abt-api`)
3. **Click "Environment" tab** (left sidebar)
4. **For each variable:**
   - Click **"Add Environment Variable"**
   - Enter **Key** (exact name from list above)
   - Enter **Value** (your value)
   - Click **"Save Changes"**

5. **For DATABASE_URL:**
   - Click **"Add from Database"** (easier)
   - Select your PostgreSQL database
   - Select `DATABASE_URL`
   - Click **"Add"**

---

## ✅ Minimum Required Variables Checklist

Before deploying, ensure these are set:

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (linked from database)
- [ ] `JWT_SECRET` = (generated secure string)
- [ ] `CORS_ORIGIN` = (your frontend URL)

**Without these 4, your app will NOT work!**

---

## 🔍 How to Verify Settings

### 1. Check Build Logs
After deployment, check build logs:
- Should see: `npm install` running
- Should see: `npm run build` compiling
- Should see: `npm start` starting server
- **No errors** = Good!

### 2. Check Service Logs
- Go to **"Logs"** tab
- Should see: `🚀 GPT API Server running on port 10000`
- Should see: `✅ Database connected successfully`

### 3. Test Health Endpoint
```bash
curl https://your-service-name.onrender.com/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "GPT API is running with PostgreSQL",
  "database": "PostgreSQL"
}
```

---

## 🚨 Common Mistakes to Avoid

1. **Wrong Build Command**
   - ❌ `npm install && npm run build` (missing `cd backend`)
   - ✅ `cd backend && npm install && npm run build`

2. **Wrong Start Command**
   - ❌ `npm start` (runs from root)
   - ✅ `cd backend && npm start`

3. **Missing JWT_SECRET**
   - ❌ Not set or empty
   - ✅ Must be set with secure random string

4. **Wrong CORS_ORIGIN**
   - ❌ `your-app.com` (missing protocol)
   - ✅ `https://your-app.com` (with https://)

5. **DATABASE_URL Not Set**
   - ❌ Missing or incorrect
   - ✅ Must be linked from database or set manually

---

## 📊 Render Dashboard Navigation

### Where to Find Settings:

1. **Service Settings:**
   - Dashboard → Your Service → **"Settings"** tab
   - Build Command, Start Command, etc.

2. **Environment Variables:**
   - Dashboard → Your Service → **"Environment"** tab
   - Add/Edit variables here

3. **Database Connection:**
   - Dashboard → Your Database → **"Connect"** tab
   - Copy connection string here

4. **Logs:**
   - Dashboard → Your Service → **"Logs"** tab
   - Real-time and historical logs

5. **Metrics:**
   - Dashboard → Your Service → **"Metrics"** tab
   - CPU, Memory, Request stats

---

## 🔗 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Your Service**: https://dashboard.render.com/web/[your-service-name]
- **Your Database**: https://dashboard.render.com/databases/[your-db-name]
- **Render Docs**: https://render.com/docs

---

## 📞 Support

If you encounter issues:

1. **Check Build Logs** - Look for TypeScript or npm errors
2. **Check Service Logs** - Look for runtime errors
3. **Verify Environment Variables** - All required vars set?
4. **Test Health Endpoint** - Is service responding?
5. **Check Database** - Is it running and accessible?

---

## ✨ Summary

**Minimum Setup:**
1. Create PostgreSQL database
2. Create Web Service
3. Set 4 required environment variables
4. Deploy!

**Your API will be available at:**
```
https://your-service-name.onrender.com
```

**Health Check:**
```
https://your-service-name.onrender.com/health
```

**API Endpoints:**
```
https://your-service-name.onrender.com/api/auth/login
https://your-service-name.onrender.com/api/projects
https://your-service-name.onrender.com/api/contractors
https://your-service-name.onrender.com/api/submissions
```

---

**That's it! Follow these exact settings and your backend will deploy successfully on Render! 🚀**

