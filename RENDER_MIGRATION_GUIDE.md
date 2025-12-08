# Migration Guide: Supabase to Render

This guide will help you migrate your application from Supabase to Render.

## Overview

The migration involves:
1. **Database**: Moving from Supabase PostgreSQL to Render PostgreSQL
2. **API**: Moving from Supabase Edge Functions to Render Web Service
3. **Frontend**: Updating API endpoints to point to Render

## Prerequisites

1. **Render Account**: Sign up at https://render.com
2. **Database Backup**: Export your data from Supabase (optional, if you want to migrate existing data)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Create Render PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `abt-database`
   - **Database**: `abt_tracker`
   - **User**: `abt_user`
   - **Plan**: Starter (or your preferred plan)
4. Click **"Create Database"**
5. **Save the connection string** - you'll need it later

## Step 2: Run Database Schema

1. In Render Dashboard, go to your PostgreSQL database
2. Click **"Connect"** → **"External Connection"**
3. Copy the connection string
4. Use a PostgreSQL client (pgAdmin, DBeaver, or psql) to connect
5. Run the schema from `supabase/migrations/001_initial_schema.sql`

Alternatively, you can use the Render Shell:
```bash
# In Render Dashboard, go to your database → Shell
psql $DATABASE_URL
# Then paste and run the SQL from supabase/migrations/001_initial_schema.sql
```

## Step 3: Migrate Data (Optional)

If you have existing data in Supabase:

### Option A: Export from Supabase, Import to Render

1. **Export from Supabase**:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;`
   - Repeat for each table

2. **Import to Render**:
   - Connect to Render PostgreSQL
   - Use `COPY` command or pgAdmin import

### Option B: Use Migration Script

Create a script to copy data directly (requires both database connections):

```typescript
// backend/src/scripts/migrate-to-render.ts
// Connect to both databases and copy data
```

## Step 4: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect `render.yaml` and create services
5. Update environment variables in Render Dashboard

### Option B: Manual Setup

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name**: `abt-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Starter (or your preferred plan)
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render sets this automatically, but good to have)
   - `JWT_SECRET`: Generate a secure random string
   - `JWT_EXPIRES_IN`: `7d`
   - `DATABASE_URL`: From your Render PostgreSQL database (auto-linked if using render.yaml)
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.onrender.com`)

5. Click **"Create Web Service"**

## Step 5: Update Frontend Configuration

1. Update `.env.production` or build environment variables:
   ```env
   VITE_API_URL=https://abt-api.onrender.com/api
   VITE_RENDER_API_URL=https://abt-api.onrender.com/api
   ```

2. Rebuild and redeploy your frontend

## Step 6: Test the Migration

1. **Health Check**: Visit `https://abt-api.onrender.com/health`
   - Should return: `{ "success": true, "database": "PostgreSQL" }`

2. **Test Authentication**:
   - Try logging in with existing credentials
   - If passwords don't work, you may need to reset them (passwords hashed with PBKDF2 from Supabase may need re-hashing)

3. **Test API Endpoints**:
   - Verify all API routes work correctly
   - Check database queries return expected data

## Step 7: Update DNS/Deploy Frontend

1. Update your frontend to point to the new Render API
2. Deploy frontend (can also use Render Static Site, or keep existing hosting)
3. Update CORS settings in Render if needed

## Environment Variables Reference

### Backend (Render Web Service)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Render |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.com` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://abt-api.onrender.com/api` |
| `VITE_RENDER_API_URL` | Render API URL | `https://abt-api.onrender.com/api` |

## Troubleshooting

### Database Connection Issues

- **Error**: "Connection refused"
  - **Solution**: Check `DATABASE_URL` is set correctly in Render Dashboard
  - Verify database is running and accessible

- **Error**: "SSL required"
  - **Solution**: Render PostgreSQL requires SSL. The connection string should include SSL parameters.

### API Not Responding

- **Check**: Render service logs in Dashboard
- **Verify**: Health endpoint returns 200 OK
- **Test**: Local connection with same environment variables

### CORS Errors

- **Solution**: Update `CORS_ORIGIN` environment variable in Render
- **Add**: Your frontend domain to allowed origins

### Password Authentication Issues

- **Issue**: Passwords from Supabase (PBKDF2) may not work with bcrypt
- **Solution**: Users may need to reset passwords, or create a migration script to re-hash passwords

## Post-Migration Checklist

- [ ] Database schema created and migrated
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] Authentication working
- [ ] All API endpoints tested
- [ ] Frontend updated and deployed
- [ ] CORS configured correctly
- [ ] Monitoring set up (optional)
- [ ] Old Supabase services can be decommissioned

## Cost Comparison

Render pricing:
- **Starter PostgreSQL**: $7/month (1GB RAM, 10GB storage)
- **Starter Web Service**: $7/month (512MB RAM)
- **Total**: ~$14/month for starter tier

Compare with your Supabase costs.

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

## Next Steps

1. Set up monitoring and alerts in Render
2. Configure custom domain (if needed)
3. Set up automated backups for PostgreSQL
4. Review and optimize database queries
5. Set up CI/CD for automatic deployments

