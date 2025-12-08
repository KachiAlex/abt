# Complete Render Setup Guide

This guide provides **ALL** the details you need to configure your backend on Render.

## Table of Contents
1. [Render Dashboard Setup](#render-dashboard-setup)
2. [PostgreSQL Database Configuration](#postgresql-database-configuration)
3. [Web Service Configuration](#web-service-configuration)
4. [Environment Variables (Complete List)](#environment-variables-complete-list)
5. [Step-by-Step Setup Instructions](#step-by-step-setup-instructions)
6. [Testing & Verification](#testing--verification)

---

## Render Dashboard Setup

### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in the form:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `abt-database` | Your database name |
| **Database** | `abt_tracker` | Database name (auto-filled) |
| **User** | `abt_user` | Database user (auto-filled) |
| **Region** | Choose closest to you | e.g., `Oregon (US West)` |
| **PostgreSQL Version** | `16` (or latest) | Default is fine |
| **Plan** | `Starter` ($7/month) | Or choose higher plan |
| **Datadog API Key** | (Leave empty) | Optional monitoring |

5. Click **"Create Database"**
6. **Wait 2-3 minutes** for database to be ready
7. **Save the connection string** - You'll see it in the database dashboard

### Step 2: Run Database Schema

**Option A: Using Render Shell (Easiest)**

1. In your database dashboard, click **"Connect"** tab
2. Click **"Shell"** button
3. Run:
   ```bash
   psql $DATABASE_URL
   ```
4. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Press Enter
6. You should see: `CREATE TABLE`, `CREATE INDEX`, etc.

**Option B: Using External Client**

1. In database dashboard → **"Connect"** → **"External Connection"**
2. Copy the connection string (looks like: `postgresql://user:pass@host:port/dbname`)
3. Use pgAdmin, DBeaver, or psql:
   ```bash
   psql "postgresql://user:pass@host:port/dbname" < supabase/migrations/001_initial_schema.sql
   ```

---

## Web Service Configuration

### Step 3: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your Git repository:
   - **Public Git repository**: Select from list
   - **Private repository**: Click "Configure account" and authorize Render

### Step 4: Configure Web Service Settings

Fill in these **exact** settings:

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `abt-api` | Your service name |
| **Region** | Same as database | Keep consistent |
| **Branch** | `main` or `master` | Your main branch |
| **Root Directory** | (Leave empty) | Root of repo |
| **Environment** | `Node` | Select from dropdown |
| **Build Command** | `cd backend && npm install && npm run build` | Builds TypeScript |
| **Start Command** | `cd backend && npm start` | Starts the server |
| **Plan** | `Starter` ($7/month) | 512MB RAM, sufficient for most apps |
| **Instance Type** | `Starter` | Default |

### Step 5: Advanced Settings (Optional)

Click **"Advanced"** to configure:

| Setting | Value | Notes |
|---------|-------|-------|
| **Dockerfile Path** | (Leave empty) | Not using Docker |
| **Docker Context** | (Leave empty) | Not using Docker |
| **Health Check Path** | `/health` | Health endpoint |
| **Auto-Deploy** | `Yes` | Deploy on git push |
| **Pull Request Previews** | `No` | Optional |

---

## Environment Variables (Complete List)

### Required Environment Variables

Go to your Web Service → **"Environment"** tab → **"Add Environment Variable"**

#### 1. Database Connection

| Key | Value | How to Get |
|-----|-------|------------|
| `DATABASE_URL` | `postgresql://...` | **Auto-linked**: In Environment tab, click "Add from Database" → Select `abt-database` → Select `DATABASE_URL` → Click "Add" |

**OR** manually:
- Go to your PostgreSQL database → **"Connect"** → **"Internal Database URL"**
- Copy the connection string
- Add as environment variable: `DATABASE_URL`

#### 2. Server Configuration

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `NODE_ENV` | Environment | `production` | ✅ Yes |
| `PORT` | Server port | `10000` | ⚠️ Auto-set by Render (but good to have) |

#### 3. JWT Authentication

| Key | Value | How to Generate | Required |
|-----|-------|----------------|----------|
| `JWT_SECRET` | Secret key | Generate random string | ✅ Yes |
| `JWT_EXPIRES_IN` | Token expiration | `7d` | ⚠️ Optional (default: 7d) |

**Generate JWT_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use online generator:
# https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new
```

#### 4. CORS Configuration

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `CORS_ORIGIN` | Allowed frontend URL | `https://your-app.onrender.com` | ✅ Yes |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS | Same as CORS_ORIGIN | ⚠️ Optional |

**Important**: 
- For local development: `http://localhost:5173`
- For production: Your frontend URL (e.g., `https://abt-frontend.onrender.com`)
- For multiple origins: `https://app1.com,https://app2.com` (comma-separated)

#### 5. File Upload (Optional)

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `MAX_FILE_SIZE` | Max file size (bytes) | `10485760` (10MB) | ⚠️ Optional |
| `UPLOAD_PATH` | Upload directory | `uploads` | ⚠️ Optional |

**Note**: Render's disk is ephemeral. For production, use S3 or similar.

#### 6. Rate Limiting (Optional)

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `RATE_LIMIT_WINDOW_MS` | Time window (ms) | `900000` (15 min) | ⚠️ Optional |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ⚠️ Optional |

#### 7. Email Configuration (Optional)

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` | ⚠️ Optional |
| `SMTP_PORT` | SMTP port | `587` | ⚠️ Optional |
| `SMTP_USER` | Email username | `your-email@gmail.com` | ⚠️ Optional |
| `SMTP_PASS` | Email password | `your-app-password` | ⚠️ Optional |

#### 8. AWS S3 (Optional - for file storage)

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` | ⚠️ Optional |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `...` | ⚠️ Optional |
| `AWS_BUCKET_NAME` | S3 bucket name | `abt-files` | ⚠️ Optional |
| `AWS_REGION` | AWS region | `us-east-1` | ⚠️ Optional |

#### 9. Feature Flags (Optional)

| Key | Value | Example | Required |
|-----|-------|---------|----------|
| `ENABLE_EMAIL_NOTIFICATIONS` | Enable emails | `true` or `false` | ⚠️ Optional |
| `ENABLE_CLOUD_STORAGE` | Enable S3 | `true` or `false` | ⚠️ Optional |

---

## Complete Environment Variables Template

Copy this template and fill in your values:

```env
# ============================================
# REQUIRED - Must Set
# ============================================
NODE_ENV=production
PORT=10000
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters
DATABASE_URL=postgresql://user:pass@host:port/dbname

# ============================================
# REQUIRED - CORS
# ============================================
CORS_ORIGIN=https://your-frontend-url.com
SOCKET_CORS_ORIGIN=https://your-frontend-url.com

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
# OPTIONAL - Email (if using email features)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENABLE_EMAIL_NOTIFICATIONS=true

# ============================================
# OPTIONAL - AWS S3 (if using cloud storage)
# ============================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=abt-files
AWS_REGION=us-east-1
ENABLE_CLOUD_STORAGE=true
```

---

## Step-by-Step Setup Instructions

### Phase 1: Database Setup (5 minutes)

1. ✅ Create PostgreSQL database in Render
2. ✅ Wait for database to be ready (green status)
3. ✅ Run database schema (use Shell or external client)
4. ✅ Verify tables created:
   ```sql
   \dt  -- List all tables
   ```

### Phase 2: Web Service Setup (10 minutes)

1. ✅ Create Web Service in Render
2. ✅ Connect your Git repository
3. ✅ Configure build and start commands
4. ✅ **DO NOT deploy yet** - we need to set environment variables first

### Phase 3: Environment Variables (5 minutes)

1. ✅ Go to Web Service → **"Environment"** tab
2. ✅ Link `DATABASE_URL` from database (click "Add from Database")
3. ✅ Add `NODE_ENV` = `production`
4. ✅ Generate and add `JWT_SECRET`
5. ✅ Add `CORS_ORIGIN` (your frontend URL)
6. ✅ Add `JWT_EXPIRES_IN` = `7d` (optional)
7. ✅ Add any optional variables you need

### Phase 4: Deploy (5 minutes)

1. ✅ Click **"Manual Deploy"** → **"Deploy latest commit"**
2. ✅ Watch build logs - should see:
   - `npm install` running
   - `npm run build` compiling TypeScript
   - `npm start` starting server
3. ✅ Wait for "Live" status (green)
4. ✅ Check logs for any errors

### Phase 5: Test (5 minutes)

1. ✅ Visit: `https://your-service-name.onrender.com/health`
2. ✅ Should see: `{"success":true,"database":"PostgreSQL"}`
3. ✅ Test API endpoints (see Testing section)

---

## Testing & Verification

### 1. Health Check

```bash
curl https://your-service-name.onrender.com/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "GPT API is running with PostgreSQL",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "PostgreSQL"
}
```

### 2. Test Authentication

```bash
# Register a user
curl -X POST https://your-service-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "role": "GOVERNMENT_ADMIN"
  }'

# Login
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Test Protected Endpoint

```bash
# Get profile (replace TOKEN with token from login)
curl https://your-service-name.onrender.com/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
- Check `DATABASE_URL` is set correctly
- Verify database is running (green status)
- Check database allows connections from Render's IPs
- Review logs: `Web Service → Logs`

### Issue: "CORS error"

**Solution:**
- Update `CORS_ORIGIN` to match your frontend URL exactly
- Include protocol: `https://` not just domain
- For multiple origins, use comma-separated list

### Issue: "JWT_SECRET not set"

**Solution:**
- Generate a secure random string (see JWT section)
- Add it to environment variables
- Redeploy service

### Issue: "Build failed"

**Solution:**
- Check build logs for errors
- Verify `package.json` has all dependencies
- Ensure TypeScript compiles: `cd backend && npm run build`
- Check Node version compatibility

### Issue: "Service not responding"

**Solution:**
- Check service logs
- Verify `PORT` environment variable (Render sets it automatically)
- Check health endpoint: `/health`
- Verify start command is correct

---

## Render Dashboard Navigation

### Key Locations:

1. **Services List**: https://dashboard.render.com
   - See all your services
   - Click service name to open

2. **Service Dashboard**: 
   - **Overview**: Service status, URL, metrics
   - **Logs**: Real-time and historical logs
   - **Environment**: Environment variables
   - **Settings**: Service configuration
   - **Events**: Deployment history

3. **Database Dashboard**:
   - **Overview**: Database status, connection info
   - **Connect**: Connection strings, Shell access
   - **Backups**: Automatic backups (if enabled)
   - **Settings**: Database configuration

---

## Quick Reference Checklist

### Before Deployment:
- [ ] PostgreSQL database created and running
- [ ] Database schema executed (tables created)
- [ ] Web service created
- [ ] Git repository connected
- [ ] Build command: `cd backend && npm install && npm run build`
- [ ] Start command: `cd backend && npm start`
- [ ] `DATABASE_URL` environment variable set (linked from database)
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` generated and set
- [ ] `CORS_ORIGIN` set to frontend URL

### After Deployment:
- [ ] Service shows "Live" status
- [ ] Health check returns success
- [ ] Can register/login users
- [ ] API endpoints respond correctly
- [ ] No errors in logs
- [ ] Frontend can connect to API

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Render Community**: https://community.render.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Next Steps After Setup

1. **Create Admin User**: Use the API or create-admin script
2. **Update Frontend**: Point frontend to Render API URL
3. **Set Up Monitoring**: Enable Datadog or similar (optional)
4. **Configure Backups**: Enable automatic database backups
5. **Set Up Custom Domain**: Add custom domain in Render (optional)
6. **Enable SSL**: Automatic with Render (HTTPS by default)

---

**Your Render API URL will be**: `https://abt-api.onrender.com` (or your service name)

**Save this URL** - you'll need it for your frontend configuration!

