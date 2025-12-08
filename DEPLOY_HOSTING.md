# 🚀 Deploy Frontend to Firebase Hosting

## Quick Deploy

```bash
# Build the app (already done)
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Environment Variables

Your frontend needs the Supabase anon key for API calls. You have two options:

### Option 1: Set in Firebase Hosting (Recommended)

1. Go to Firebase Console → Hosting → Your site
2. Add environment variable:
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key (get it from Supabase Dashboard → Settings → API)

### Option 2: Build with Environment Variable

Create a `.env.production` file:
```env
VITE_API_URL=https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then rebuild:
```bash
npm run build
firebase deploy --only hosting
```

## Deployment Steps

1. **Build the app** (already done ✅)
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

3. **Verify deployment**
   - Your app will be live at: `https://abt-abia-tracker.web.app`
   - Or: `https://abt-abia-tracker.firebaseapp.com`

## Post-Deployment

After deployment, verify:
- ✅ App loads correctly
- ✅ Login works with admin credentials
- ✅ API calls work (check browser console)
- ✅ All routes work (SPA routing)

## Troubleshooting

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
firebase login
```

### "Permission denied"
Make sure you're logged in:
```bash
firebase login
```

### API calls failing
- Check that `VITE_SUPABASE_ANON_KEY` is set
- Verify API URL is correct in `src/services/api.js`
- Check browser console for errors

---

**Ready to deploy!** 🚀

