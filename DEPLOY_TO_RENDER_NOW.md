# Deploy to Render - Quick Start Guide

## 🚀 Step-by-Step Deployment

### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** (top right) → **"PostgreSQL"**
3. Fill in:
   - **Name**: `abt-database`
   - **Database**: `abt_tracker`
   - **User**: `abt_user`
   - **Region**: Choose closest (e.g., `Oregon (US West)`)
   - **Plan**: `Starter` ($7/month) or `Free` (for testing)
4. Click **"Create Database"**
5. **Wait 2-3 minutes** for it to be ready

### Step 2: Get Database Connection String

1. Click on your database (`abt-database`)
2. Click **"Connect"** tab
3. Find **"Internal Database URL"** section
4. **Copy the entire connection string** (looks like: `postgresql://user:pass@host:port/dbname`)
5. **Save it** - you'll need it in Step 4

### Step 3: Run Database Schema

**Using Render Shell (Easiest):**

1. In database dashboard → **"Connect"** tab → Click **"Shell"** button
2. Run:
   ```bash
   psql $DATABASE_URL
   ```
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the shell and press Enter
5. You should see: `CREATE TABLE`, `CREATE INDEX`, etc.

**OR using external client:**
- Use the External Connection string from Step 2
- Connect with pgAdmin, DBeaver, or psql
- Run the SQL from `supabase/migrations/001_initial_schema.sql`

### Step 4: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. **Connect Repository:**
   - If public: Select from list
   - If private: Click "Configure account" → Authorize Render → Select repo
3. **Repository**: Select `KachiAlex/abt` (or your repo)
4. **Branch**: `main`

### Step 5: Configure Web Service

Fill in these **exact** settings:

| Setting | Value |
|---------|-------|
| **Name** | `abt-api` |
| **Region** | Same as database |
| **Root Directory** | (Leave empty) |
| **Environment** | `Node` |
| **Build Command** | `cd backend && npm install && npm run build` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | `Starter` ($7/month) or `Free` |

**Advanced Settings:**
- Click **"Advanced"**
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes`

### Step 6: Set Environment Variables

In the Web Service dashboard → **"Environment"** tab → Add these:

#### Required Variables:

1. **DATABASE_URL**
   ```
   Key: DATABASE_URL
   Value: [Paste the connection string from Step 2]
   ```

2. **JWT_SECRET**
   ```
   Key: JWT_SECRET
   Value: [Generate a random string, e.g., use: openssl rand -base64 32]
   ```
   Or click "Generate" in Render if available

3. **NODE_ENV**
   ```
   Key: NODE_ENV
   Value: production
   ```

4. **PORT**
   ```
   Key: PORT
   Value: 10000
   ```

5. **CORS_ORIGIN**
   ```
   Key: CORS_ORIGIN
   Value: https://your-frontend-url.onrender.com
   ```
   Or for local testing: `http://localhost:3000`

6. **JWT_EXPIRES_IN** (Optional)
   ```
   Key: JWT_EXPIRES_IN
   Value: 7d
   ```

### Step 7: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Run `npm run build`
   - Start the server
3. **Watch the build logs** - it should complete successfully
4. Once deployed, you'll get a URL like: `https://abt-api.onrender.com`

### Step 8: Verify Deployment

1. **Check Health Endpoint:**
   ```
   https://your-service-url.onrender.com/health
   ```
   Should return: `{"status":"ok","database":"PostgreSQL"}`

2. **Test API:**
   ```
   https://your-service-url.onrender.com/api/health
   ```

---

## 🎯 Quick Checklist

- [ ] PostgreSQL database created
- [ ] Database connection string copied
- [ ] Database schema run (from `supabase/migrations/001_initial_schema.sql`)
- [ ] Web service created
- [ ] Build command: `cd backend && npm install && npm run build`
- [ ] Start command: `cd backend && npm start`
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `CORS_ORIGIN`
- [ ] Service deployed successfully
- [ ] Health endpoint working

---

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `render.yaml` is in root directory
- Verify `backend/package.json` has all dependencies

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check database is "Available" (green status)
- Ensure you're using "Internal Database URL" (not External)

### Service Won't Start
- Check start command: `cd backend && npm start`
- Verify `PORT` environment variable is set
- Check logs for error messages

### 502 Bad Gateway
- Service might be starting up (wait 1-2 minutes)
- Check health endpoint: `/health`
- Verify database connection

---

## 📝 Important Notes

1. **Free Plan Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading to Starter ($7/month) for production

2. **Database URL:**
   - Use "Internal Database URL" for Render services
   - Use "External Connection" only for local development

3. **Auto-Deploy:**
   - Every push to `main` branch will trigger a new deployment
   - Monitor the "Events" tab for deployment status

4. **Environment Variables:**
   - Changes require a manual redeploy (click "Manual Deploy")
   - Or wait for next git push

---

## 🎉 Success!

Once deployed, your API will be available at:
```
https://your-service-name.onrender.com
```

Update your frontend to use this URL instead of Supabase!

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Render Support**: support@render.com
- **Check Logs**: Service Dashboard → "Logs" tab

