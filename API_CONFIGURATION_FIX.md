# 🔧 API Configuration Fix

## Problem

The frontend was trying to connect to `localhost:5000` which caused `ERR_CONNECTION_REFUSED` errors when the backend wasn't running locally.

## Solution

Updated the API configuration to automatically detect the environment and use the correct API URL:

### Changes Made

1. **`src/services/api.js`** - Auto-detects environment:
   - If running on Firebase hosting (`*.web.app` or `*.firebaseapp.com`), uses Firebase Functions URL
   - If running locally, uses `localhost:5000`
   - Can be overridden with `VITE_API_URL` environment variable

2. **`src/services/socket.js`** - Handles Socket.IO gracefully:
   - Disables Socket.IO in production (Firebase Functions v1 doesn't support WebSockets)
   - Only works in local development
   - Shows warning messages instead of errors

3. **`src/components/Notifications/NotificationCenter.jsx`** - Checks if socket is available before using it

## API URLs

### Production (Firebase)
- **API URL:** `https://us-central1-abt-abia-tracker.cloudfunctions.net/apiV1/api`
- **Hosting URL:** `https://abt-abia-tracker.web.app`

### Local Development
- **API URL:** `http://localhost:5000/api`
- **Frontend:** `http://localhost:5173`

## Testing

### Test on Deployed Site
1. Visit: https://abt-abia-tracker.web.app
2. Try logging in
3. Should connect to Firebase Functions automatically

### Test Locally
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Should connect to localhost automatically

## Socket.IO Note

⚠️ **Important:** Socket.IO (real-time notifications) only works in local development. Firebase Functions v1 doesn't support WebSockets.

To enable real-time features in production, you would need to:
- Upgrade to Firebase Functions v2 (supports WebSockets)
- Or use Firebase Realtime Database / Firestore listeners
- Or use a separate WebSocket service

## Status

✅ **Fixed and Deployed**
- Frontend now automatically uses correct API URL
- No more connection errors on deployed site
- Local development still works as before

