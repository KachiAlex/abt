# ⚡ Cloud Deployment - Quick Start

## 🎯 Deploy to Firebase in 10 Minutes

### Prerequisites
- Firebase account (free)
- Cloud database account (Neon recommended - free)

---

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

---

## Step 2: Login to Firebase

```bash
firebase login
```

---

## Step 3: Create Cloud Database

### Option A: Neon.tech (Recommended - Free)

1. Go to **https://console.neon.tech**
2. Sign up / Login
3. Click **New Project**
4. Select region closest to your users
5. Wait for project creation
6. Click **Connect** → Copy connection string

Your connection string will look like:
```
postgresql://user:password@ep-xxx-xxx.neon.tech/neondb?sslmode=require
```

### Option B: Supabase (Alternative - Free)

1. Go to **https://supabase.com**
2. New Project
3. Settings → Database → Connection String → Connection Pooler
4. Copy the connection string

---

## Step 4: Set Up Database

```bash
# Navigate to backend
cd backend

# Create temporary .env file for migrations
echo DATABASE_URL="your_connection_string_here" > .env

# Generate Prisma client
npm run db:generate

# Deploy schema to cloud database
npm run db:migrate:deploy

# Seed with sample data
npm run db:seed

# Delete .env (important!)
del .env
```

**Sample Login Credentials (after seeding):**
- Admin: `admin@abia.gov.ng` / `Password123!`
- Officer: `officer@abia.gov.ng` / `Password123!`
- M&E: `me@abia.gov.ng` / `Password123!`
- Contractor: `contractor1@example.com` / `Password123!`

---

## Step 5: Configure Firebase

```bash
# Set database connection
firebase functions:config:set database.url="your_connection_string_here"

# Set JWT secret (generate a secure random string)
firebase functions:config:set jwt.secret="your-super-secure-random-string-2025"

# Set CORS (will update after first deploy)
firebase functions:config:set cors.origin="*"

# Verify configuration
firebase functions:config:get
```

---

## Step 6: Build & Deploy

```bash
# Build backend
cd backend
npm run build
cd ..

# Build frontend
npm run build

# Deploy to Firebase
firebase deploy
```

**⏱️ First deployment takes 3-5 minutes**

---

## Step 7: Get Your Live URL

After deployment completes:

```
✔ Deploy complete!

Hosting URL: https://your-project-id.web.app
```

**Your app is now LIVE! 🎉**

---

## Step 8: Update CORS

Now that you have your live URL, update CORS:

```bash
# Update CORS with your actual Firebase URL
firebase functions:config:set cors.origin="https://your-project-id.web.app"

# Redeploy functions only
firebase deploy --only functions
```

---

## 🔧 Common Commands

### View Logs
```bash
firebase functions:log
```

### Update & Redeploy
```bash
npm run build
firebase deploy
```

### Deploy Only Frontend
```bash
npm run build
firebase deploy --only hosting
```

### Deploy Only Backend
```bash
cd backend && npm run build && cd ..
firebase deploy --only functions
```

---

## ✅ Verify Deployment

### Test Backend API
Open in browser:
```
https://your-project-id.web.app/api/health
```

Should see:
```json
{
  "success": true,
  "message": "ABT API is running"
}
```

### Test Frontend
Open:
```
https://your-project-id.web.app
```

Should see the landing page. Click **Sign In** and login with:
- Email: `admin@abia.gov.ng`
- Password: `Password123!`

---

## 🔒 Security (Do This Next!)

### Generate Secure JWT Secret

```bash
# Generate random secret (Windows - Git Bash)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Update Firebase config
firebase functions:config:set jwt.secret="your_generated_secret"

# Redeploy
firebase deploy --only functions
```

---

## 💰 Costs

### Firebase (Blaze Plan)
- **Free tier includes:**
  - 2M function invocations/month
  - 10GB hosting
  - 360,000 GB-seconds
- **For ~1000 users:** ~$5-10/month

### Neon Database
- **Free tier includes:**
  - 3GB storage
  - Unlimited queries
- **Cost:** $0/month

**Total: ~$5-10/month for moderate traffic**

---

## 🚨 Troubleshooting

### "Error deploying functions"

**Check:**
1. Built backend: `cd backend && npm run build`
2. Check firebase.json has correct settings
3. View detailed error: `firebase functions:log`

### "Cannot connect to database"

**Check:**
1. Connection string is correct
2. Database is accessible (check Neon/Supabase dashboard)
3. SSL mode is enabled: `?sslmode=require`
4. Firewall/IP restrictions (Neon doesn't have any by default)

### "CORS error in browser"

**Update CORS:**
```bash
firebase functions:config:set cors.origin="https://your-project-id.web.app"
firebase deploy --only functions
```

### "Function timeout"

**Increase timeout in firebase.json:**
```json
{
  "functions": {
    "runtime": "nodejs18",
    "timeoutSeconds": 120
  }
}
```

---

## 📊 Monitor Your App

### Firebase Console
**https://console.firebase.google.com**

Check:
- **Functions** → Performance, Logs, Errors
- **Hosting** → Usage, Bandwidth
- **Performance** → App metrics

### Database Console
- **Neon:** https://console.neon.tech
- **Supabase:** https://app.supabase.com

---

## 🔄 Update Workflow

When you make changes:

```bash
# 1. Make your code changes

# 2. Build
npm run build
cd backend && npm run build && cd ..

# 3. Deploy
firebase deploy

# Or deploy specific parts:
firebase deploy --only hosting
firebase deploy --only functions
```

---

## 🌐 Custom Domain (Optional)

1. Go to **Firebase Console** → **Hosting**
2. Click **Add custom domain**
3. Enter your domain (e.g., `abt.abia.gov.ng`)
4. Follow DNS setup instructions
5. Wait for SSL certificate (automatic, ~15 mins)

---

## 📚 Next Steps

✅ **Deployed!** Your app is live

**Now:**
1. ✅ Test all features
2. ✅ Change default passwords
3. ✅ Set up error tracking (Sentry)
4. ✅ Configure custom domain
5. ✅ Set up monitoring
6. ✅ Train users

---

## 🆘 Need Help?

- **Firebase Issues:** https://firebase.google.com/support
- **Neon Database:** https://neon.tech/docs
- **Detailed Guide:** See `CLOUD_DEPLOYMENT.md`

---

## ✨ Congratulations!

Your Abia Project Tracker is now running in the cloud! 🎊

**Live at:** `https://your-project-id.web.app`

---

**Questions? Check the detailed `CLOUD_DEPLOYMENT.md` guide!**

