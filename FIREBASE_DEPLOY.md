# 🔥 Firebase Deployment Guide - All-in-One Solution

## ✨ Why This is Perfect

**Everything on Firebase** - One trusted platform from Google:
- ✅ Firebase Hosting (Frontend)
- ✅ Firebase Functions (Backend API)
- ✅ Firestore Database (NoSQL)
- ✅ Firebase Storage (File uploads)
- ✅ Firebase Authentication (Optional)

**Benefits:**
- One dashboard
- One bill
- Trusted by millions
- Auto-scaling
- Global CDN
- $0-20/month

---

## 🚀 Deploy in 5 Steps (15 minutes)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Project (if not done)

```bash
firebase init
```

Select:
- ✅ **Firestore** - Database
- ✅ **Functions** - Backend API
- ✅ **Hosting** - Frontend

Or if already initialized, just continue to step 4.

### Step 4: Seed Firestore Database

```bash
cd backend
npm run seed
```

**Sample Users Created:**
- Admin: `admin@abia.gov.ng` / `Password123!`
- Officer: `officer@abia.gov.ng` / `Password123!`
- M&E: `me@abia.gov.ng` / `Password123!`
- Contractor: `contractor1@example.com` / `Password123!`

### Step 5: Build & Deploy

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
cd ..

# Deploy everything
firebase deploy
```

**🎉 Your app is LIVE!**

URL: `https://your-project-id.web.app`

---

## 📊 What You Get

### Free Tier (Perfect for Testing)

**Firebase:**
- 10GB hosting
- 50GB data transfer
- 20,000 document reads/day
- 20,000 document writes/day
- 10,000 document deletes/day

**For ~1,000 daily users:** $0/month (within free tier)

### Paid Tier (When You Scale)

**Blaze Plan (Pay as you go):**
- Free tier included
- $0.026 per 100,000 document reads
- $0.104 per 100,000 document writes
- $0.018 per GB storage

**For ~5,000 daily users:** ~$5-15/month

---

## 🗄️ Firestore Database Structure

### Collections

```
users/
  └─ {userId}/
      ├─ email
      ├─ role
      ├─ firstName
      └─ ...

contractorProfiles/
  └─ {profileId}/
      ├─ userId
      ├─ companyName
      └─ ...

projects/
  └─ {projectId}/
      ├─ name
      ├─ status
      ├─ progress
      ├─ budget
      └─ milestones/ (subcollection)
          └─ {milestoneId}/

submissions/
  └─ {submissionId}/
      ├─ projectId
      ├─ contractorId
      └─ ...
```

---

## 🔐 Security Rules

Firestore automatically creates security rules. Update them:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for public projects
    match /projects/{projectId} {
      allow read: if resource.data.isPublic == true;
      allow read, write: if request.auth != null;
    }
    
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin can read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'GOVERNMENT_ADMIN';
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📝 Common Commands

### Deploy Everything
```bash
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

### Deploy Only Database Rules
```bash
firebase deploy --only firestore:rules
```

### View Logs
```bash
firebase functions:log
```

### Test Locally
```bash
# Start emulators
firebase emulators:start

# In another terminal
npm run dev
```

---

## 🔧 Configuration

### Set JWT Secret

```bash
firebase functions:config:set jwt.secret="your-super-secure-random-string-2025"
```

### Set CORS Origin (after first deploy)

```bash
firebase functions:config:set cors.origin="https://your-project-id.web.app"
```

### View Config

```bash
firebase functions:config:get
```

---

## ✅ Verify Deployment

### 1. Test API Health

Open in browser:
```
https://your-project-id.web.app/health
```

Should see:
```json
{
  "success": true,
  "message": "ABT API is running with Firestore",
  "database": "Firestore"
}
```

### 2. Test Frontend

Open:
```
https://your-project-id.web.app
```

### 3. Test Login

Login with:
- **Email:** `admin@abia.gov.ng`
- **Password:** `Password123!`

### 4. Check Firestore Console

Go to: https://console.firebase.google.com
- Select your project
- Click **Firestore Database**
- Should see collections: users, projects, etc.

---

## 🎯 Post-Deployment Tasks

### 1. Change Default Passwords

Go to Firestore Console → users collection → Update passwords

### 2. Update CORS

```bash
firebase functions:config:set cors.origin="https://your-project-id.web.app"
firebase deploy --only functions
```

### 3. Add Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS instructions
4. SSL certificate auto-provisioned

### 4. Set Up Monitoring

Firebase Console → Functions → Monitor performance

### 5. Enable Analytics (Optional)

```bash
firebase init analytics
```

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
firebase deploy --only hosting     # Frontend only
firebase deploy --only functions   # Backend only
```

---

## 📊 Monitor Your App

### Firebase Console

**https://console.firebase.google.com**

Check:
1. **Hosting** → Bandwidth, requests
2. **Functions** → Invocations, errors, execution time
3. **Firestore** → Reads, writes, storage
4. **Performance** → App performance metrics

### View Function Logs

```bash
# Real-time logs
firebase functions:log

# Specific function
firebase functions:log --only api
```

---

## 🐛 Troubleshooting

### "Firebase command not found"

```bash
npm install -g firebase-tools
```

### "Not logged in"

```bash
firebase login
```

### "No project selected"

```bash
firebase use --add
# Select your project from the list
```

### "Build failed"

```bash
# Clear and rebuild
rm -rf dist backend/dist
npm run build
cd backend && npm run build
```

### "Functions deploy error"

```bash
# Check if backend builds successfully
cd backend
npm run build

# Check logs
firebase functions:log
```

### "CORS error in browser"

```bash
firebase functions:config:set cors.origin="https://your-actual-url.web.app"
firebase deploy --only functions
```

---

## 💰 Cost Optimization

### Tips to Stay in Free Tier:

1. **Cache responses** - Reduce database reads
2. **Optimize queries** - Use indexes
3. **Batch operations** - Reduce write operations
4. **Use pagination** - Don't load all data at once
5. **CDN caching** - Firebase Hosting does this automatically

### Monitor Usage:

- Firebase Console → Usage tab
- Set up budget alerts
- Check daily usage

---

## 🔐 Security Best Practices

### 1. Update Firestore Rules

Test your rules:
```bash
firebase emulators:start --only firestore
# Test rules in Firebase Console
```

### 2. Set Strong JWT Secret

```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Set it
firebase functions:config:set jwt.secret="<generated-secret>"
```

### 3. Enable App Check (Optional)

Prevents unauthorized access to Firebase resources:

```bash
firebase init appcheck
```

### 4. Review IAM Permissions

Firebase Console → Project Settings → Service Accounts

---

## 📚 Firestore Best Practices

### 1. Use Subcollections

```javascript
// Good: Subcollections
projects/{projectId}/milestones/{milestoneId}

// Avoid: All in one collection
milestones/{milestoneId} with projectId field
```

### 2. Denormalize Data

```javascript
// Store commonly accessed data together
{
  projectName: "...",
  contractor: {
    name: "...",
    rating: 4.5
  }
}
```

### 3. Use Composite Indexes

For complex queries, create indexes in Firebase Console

### 4. Batch Operations

```javascript
const batch = db.batch();
batch.set(ref1, data1);
batch.update(ref2, data2);
await batch.commit();
```

---

## 🎓 Learning Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore Guide**: https://firebase.google.com/docs/firestore
- **Functions Guide**: https://firebase.google.com/docs/functions
- **Firebase YouTube**: https://www.youtube.com/firebase

---

## ✨ Summary

**You now have:**
- ✅ Frontend on Firebase Hosting
- ✅ Backend API on Firebase Functions
- ✅ Database on Firestore
- ✅ Auto-scaling
- ✅ Global CDN
- ✅ SSL included
- ✅ Sample data loaded
- ✅ Ready for production

**Deploy command:**
```bash
firebase deploy
```

**Monitor:**
```
https://console.firebase.google.com
```

**Your app:**
```
https://your-project-id.web.app
```

---

**🎉 Congratulations! Your app is 100% on Firebase! 🔥**

No external databases, no extra services - just Firebase!

---

**Questions? Check the [Firebase Documentation](https://firebase.google.com/docs)**

