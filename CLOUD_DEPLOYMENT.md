# ☁️ Abia Project Tracker - Cloud Deployment Guide

## Overview

This guide covers deploying the Abia Project Tracker to the cloud using **Firebase Hosting + Functions** for a fully managed, scalable solution.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                         │
│              (React App - Static Files)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Functions                         │
│              (Express API + Socket.IO)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Cloud Database (PostgreSQL)                     │
│  Options: Neon, Supabase, Google Cloud SQL, Railway         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Deploy (5 Steps)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Set Up Cloud Database

Choose one of these cloud PostgreSQL providers:

#### Option A: Neon (Recommended - Free Tier Available)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. Format: `postgresql://user:pass@host/database?sslmode=require`

#### Option B: Supabase (Great for PostgreSQL + Extras)
1. Go to https://supabase.com
2. Create new project
3. Go to Database Settings → Connection String
4. Copy the connection pooler URL

#### Option C: Railway (Simple & Fast)
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy the connection string

#### Option D: Google Cloud SQL (Enterprise)
1. Go to Google Cloud Console
2. Create Cloud SQL PostgreSQL instance
3. Set up connection

### Step 4: Configure Firebase Environment

```bash
# Set environment variables for Firebase Functions
firebase functions:config:set \
  database.url="your_postgresql_connection_string" \
  jwt.secret="your-super-secure-jwt-secret-2025" \
  jwt.expires="7d" \
  cors.origin="https://your-app.web.app"

# Or set them in Firebase Console:
# Functions → Configuration → Environment Variables
```

**Important Environment Variables:**
- `database.url` - PostgreSQL connection string (REQUIRED)
- `jwt.secret` - JWT signing secret (REQUIRED)
- `jwt.expires` - Token expiration (default: 7d)
- `cors.origin` - Your Firebase app URL

### Step 5: Deploy

```bash
# Build frontend
npm run build

# Deploy everything to Firebase
firebase deploy
```

Your app will be live at: `https://your-project.web.app`

---

## 📋 Detailed Setup

### 1. Firebase Project Setup

#### Initialize Firebase (if not already done)
```bash
firebase init
```

Select:
- ✅ Hosting
- ✅ Functions

Configuration:
- Functions language: **JavaScript** (already compiled from TypeScript)
- Hosting public directory: **dist**
- Single-page app: **Yes**
- Overwrites: **No**

#### Link to Firebase Project
```bash
firebase use your-project-id
```

Or create new project:
```bash
firebase projects:create abt-project
firebase use abt-project
```

### 2. Database Setup

#### Set Up Cloud PostgreSQL

**Using Neon (Recommended):**

```bash
# 1. Sign up at https://neon.tech
# 2. Create new project
# 3. Get connection string

# 4. Update backend to use the connection string
firebase functions:config:set database.url="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

**Connection String Format:**
```
postgresql://username:password@host:5432/database?sslmode=require
```

#### Run Database Migrations

Since we're using cloud database, we need to run migrations from local:

```bash
cd backend

# Create .env for migration purposes
echo DATABASE_URL="your_cloud_database_url" > .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# Seed database
npm run db:seed
```

**⚠️ Important:** After seeding, delete the `.env` file or add to `.gitignore`

### 3. Environment Configuration

#### Set Firebase Functions Config

```bash
# Required configurations
firebase functions:config:set \
  database.url="postgresql://..." \
  jwt.secret="change-this-to-secure-random-string" \
  jwt.expires="7d"

# Optional configurations
firebase functions:config:set \
  cors.origin="https://your-app.web.app" \
  upload.maxsize="10485760" \
  ratelimit.window="900000" \
  ratelimit.max="100"

# View current config
firebase functions:config:get
```

#### Update Backend Config for Firebase

Update `backend/src/config/index.ts`:

```typescript
import * as functions from 'firebase-functions';

export const config = {
  nodeEnv: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // Firebase Functions config
  databaseUrl: functions.config().database?.url || process.env.DATABASE_URL || '',
  jwtSecret: functions.config().jwt?.secret || process.env.JWT_SECRET || '',
  jwtExpiresIn: functions.config().jwt?.expires || process.env.JWT_EXPIRES_IN || '7d',
  
  corsOrigin: functions.config().cors?.origin || process.env.CORS_ORIGIN || '*',
  socketCorsOrigin: functions.config().cors?.origin || process.env.SOCKET_CORS_ORIGIN || '*',
  
  maxFileSize: parseInt(functions.config().upload?.maxsize || process.env.MAX_FILE_SIZE || '10485760', 10),
  uploadPath: functions.config().upload?.path || process.env.UPLOAD_PATH || '/tmp',
  
  rateLimitWindowMs: parseInt(functions.config().ratelimit?.window || process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(functions.config().ratelimit?.max || process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};
```

### 4. Update Frontend Environment

Create `.env.production`:

```env
VITE_API_URL=https://your-project.web.app/api
VITE_SOCKET_URL=https://your-project.web.app
VITE_APP_ENV=production
```

### 5. Build & Deploy

#### Build Backend
```bash
cd backend
npm run build
```

#### Build Frontend
```bash
npm run build
```

#### Deploy to Firebase
```bash
firebase deploy
```

Or deploy specific services:
```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:api
```

---

## 🔧 Firebase Configuration

### Current firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "backend",
    "runtime": "nodejs18",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  }
}
```

### Update Package.json (if needed)

Add deploy scripts to root `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:functions": "firebase deploy --only functions"
  }
}
```

---

## 🗄️ Database Options Comparison

| Provider | Free Tier | Best For | Pros | Cons |
|----------|-----------|----------|------|------|
| **Neon** | 3GB storage | Development, MVP | Serverless, auto-scaling, branching | US/EU regions only |
| **Supabase** | 500MB | Full-stack apps | PostgreSQL + Auth + Storage | Limited connections |
| **Railway** | $5 credit | Quick deploys | Simple, fast setup | Pay-as-you-go |
| **Google Cloud SQL** | No free tier | Enterprise | High performance, integrated | More expensive |

### Recommended: Neon.tech

**Why Neon?**
- ✅ Generous free tier (3GB)
- ✅ Serverless (pay only when used)
- ✅ Auto-scaling
- ✅ Database branching (great for staging)
- ✅ Fast connection pooling

**Setup Neon:**
1. Go to https://console.neon.tech
2. Create account
3. Create new project → Select region
4. Copy connection string
5. Use in Firebase Functions config

---

## 🔒 Security Configuration

### Set Up Firebase Security

#### 1. CORS Configuration
Update `backend/src/server.ts`:

```typescript
import cors from 'cors';

// For Firebase hosting
const allowedOrigins = [
  'https://your-project.web.app',
  'https://your-project.firebaseapp.com',
  'https://your-custom-domain.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

#### 2. Firebase Functions Permissions

Update `backend/package.json`:

```json
{
  "engines": {
    "node": "18"
  }
}
```

#### 3. Environment Secrets

Never commit secrets! Use Firebase config:

```bash
# Set secrets
firebase functions:config:set jwt.secret="$(openssl rand -base64 32)"

# View secrets (masked)
firebase functions:config:get
```

---

## 📊 Monitoring & Logging

### Firebase Console

Access at: https://console.firebase.google.com

**Key Sections:**
1. **Functions** → View logs, errors, execution times
2. **Hosting** → View bandwidth, requests
3. **Performance** → Track app performance

### View Logs

```bash
# Real-time logs
firebase functions:log

# Tail logs
firebase functions:log --only api
```

### Error Tracking

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for usage

---

## 🚀 Deployment Workflow

### Development → Staging → Production

```bash
# 1. Test locally first (optional but recommended)
npm run dev

# 2. Build and preview
npm run build
firebase serve

# 3. Deploy to staging (if you have multiple projects)
firebase use staging
firebase deploy

# 4. Deploy to production
firebase use production
firebase deploy
```

### Continuous Deployment

Set up GitHub Actions:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install
      
      - name: Build backend
        run: cd backend && npm run build
      
      - name: Build frontend
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## 💰 Cost Estimation

### Firebase (Blaze Plan - Pay as you go)

**Free Tier Includes:**
- 2 million function invocations/month
- 5GB storage
- 360,000 GB-seconds compute time
- 10GB hosting
- 10GB/month transfer

**Estimated Costs for Medium Traffic:**
- ~1000 daily active users
- ~50,000 API calls/day
- **Est. Cost: $5-20/month**

### Database (Neon Free Tier)
- 3GB storage
- Unlimited queries
- **Cost: $0/month** (up to limits)

**Total Monthly Cost: ~$5-20** for moderate usage

---

## 🔄 Update & Rollback

### Deploy New Version
```bash
npm run build
firebase deploy
```

### Rollback to Previous Version
```bash
# View hosting releases
firebase hosting:channel:list

# Rollback to specific version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Cloud database created and accessible
- [ ] Database schema deployed (`npm run db:migrate:deploy`)
- [ ] Database seeded (optional for production)
- [ ] Firebase project created
- [ ] Firebase CLI installed and logged in
- [ ] Environment variables set (`firebase functions:config:set`)
- [ ] Backend built successfully (`cd backend && npm run build`)
- [ ] Frontend built successfully (`npm run build`)
- [ ] CORS configured for your domain
- [ ] JWT secret set (strong random string)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Firebase)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Monitoring set up

---

## 🌐 Custom Domain Setup

```bash
# Add custom domain in Firebase Console
firebase hosting:channel:deploy your-domain.com

# Or via console:
# 1. Firebase Console → Hosting → Add Custom Domain
# 2. Follow DNS setup instructions
# 3. Wait for SSL certificate provisioning
```

---

## 📞 Support & Resources

### Documentation
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firebase Functions: https://firebase.google.com/docs/functions
- Neon Database: https://neon.tech/docs

### Common Issues
- **Cold starts:** First request after inactivity may be slow (~2-3s)
- **Function timeout:** Default 60s, increase if needed
- **Memory limits:** Default 256MB, increase for heavy operations

---

## 🎯 Next Steps

1. **Create Firebase project** → https://console.firebase.google.com
2. **Set up Neon database** → https://console.neon.tech
3. **Configure Firebase Functions** → `firebase functions:config:set`
4. **Deploy** → `firebase deploy`
5. **Monitor** → Firebase Console

**Your app will be live at: `https://your-project.web.app`**

---

**Ready for cloud deployment! ☁️🚀**

