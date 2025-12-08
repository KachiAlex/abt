# Render Quick Start Guide

Get your app running on Render in 5 minutes!

## Prerequisites

- Render account (sign up at https://render.com)
- Git repository with your code

## Quick Setup Steps

### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Name it: `abt-database`
4. Click **"Create Database"**
5. Wait for it to be ready (takes ~2 minutes)

### 2. Run Database Schema

1. In your database, click **"Connect"** → **"External Connection"**
2. Copy the connection string
3. Connect with a PostgreSQL client (pgAdmin, DBeaver, or `psql`)
4. Run the SQL from `supabase/migrations/001_initial_schema.sql`

**Quick way with psql:**
```bash
psql "your-connection-string-here"
# Then paste the SQL from supabase/migrations/001_initial_schema.sql
```

### 3. Deploy Backend

**Option A: Using render.yaml (Easiest)**

1. Push your code to GitHub/GitLab
2. In Render Dashboard → **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will auto-detect `render.yaml` and create services
5. Go to your web service → **"Environment"** tab
6. Add these environment variables:
   - `JWT_SECRET`: Generate a random string (use: `openssl rand -base64 32`)
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.onrender.com`)

**Option B: Manual Setup**

1. **"New +"** → **"Web Service"**
2. Connect your repository
3. Settings:
   - **Name**: `abt-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Starter ($7/month)
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (generate one)
   - `CORS_ORIGIN`: (your frontend URL)
   - `DATABASE_URL`: (auto-linked if you created database first)
5. Click **"Create Web Service"**

### 4. Link Database to Web Service

1. In your web service → **"Environment"** tab
2. Under **"Add Environment Variable"**, select **"Add from Database"**
3. Select `abt-database`
4. Select `DATABASE_URL`
5. Click **"Add"**

### 5. Test Your API

1. Wait for deployment to complete (~2-3 minutes)
2. Visit: `https://your-service-name.onrender.com/health`
3. Should see: `{"success":true,"database":"PostgreSQL"}`

### 6. Update Frontend

1. Update your frontend `.env.production`:
   ```env
   VITE_API_URL=https://your-service-name.onrender.com/api
   ```

2. Rebuild and redeploy frontend

## Environment Variables Checklist

### Backend (Render Web Service)

- ✅ `NODE_ENV` = `production`
- ✅ `JWT_SECRET` = (your secret key)
- ✅ `DATABASE_URL` = (auto-linked from database)
- ✅ `CORS_ORIGIN` = (your frontend URL)

### Frontend

- ✅ `VITE_API_URL` = `https://your-service-name.onrender.com/api`

## Common Issues

**"Database connection failed"**
- Check `DATABASE_URL` is set in environment variables
- Verify database is running (green status in Render)

**"CORS error"**
- Update `CORS_ORIGIN` to match your frontend URL exactly
- Include protocol: `https://your-app.com` not `your-app.com`

**"Service not responding"**
- Check build logs in Render Dashboard
- Verify `npm start` command works locally
- Check service logs for errors

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Create an admin user (use `npm run create-admin` script locally, or create via API)
3. ✅ Set up monitoring (optional)
4. ✅ Configure custom domain (optional)

## Need Help?

- Check `RENDER_MIGRATION_GUIDE.md` for detailed instructions
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com

