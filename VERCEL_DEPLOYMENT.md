# 🚀 Deploying ABT Frontend to Vercel

This guide walks you through hosting the Vite/React frontend on Vercel. It assumes you already have the backend API running (e.g., Render, Supabase Edge Functions, Firebase Functions, etc.).

## 1. Prerequisites

- Vercel account with the CLI installed (`npm i -g vercel`) or access to https://vercel.com/dashboard
- GitHub/GitLab/Bitbucket repo connected, or local project folder
- Live API endpoint for the backend (Render URL, Supabase Edge, etc.)

## 2. Required Environment Variables

In Vercel, go to **Project Settings → Environment Variables** and configure:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of your backend API, e.g. `https://abt-api.onrender.com/api` |
| `VITE_SOCKET_URL` *(optional)* | If you expose Socket.IO separately, point to that origin |
| `VITE_RENDER_API_URL` *(optional)* | Legacy fallback; can match `VITE_API_URL` |

> For preview environments you can use staging API URLs; for production use the live API.

## 3. Build & Output Settings

Vercel detects the `package.json` in the repo and uses the `vite` framework preset.

| Setting | Value |
| --- | --- |
| Framework Preset | `Vite` |
| Install Command | `npm install` (auto) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

These values are codified in `vercel.json` so you can also import the project manually if desired.

## 4. Deploy from the CLI (optional)

```bash
# 1. Authenticate
vercel login

# 2. Link project (create if first time)
vercel link

# 3. Set required env vars
vercel env add VITE_API_URL
# Repeat for any other variables

# 4. Deploy preview build
vercel

# 5. Promote to production
overcel --prod
```

## 5. Git-based Deployments

1. Push your repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **Import Project** and select the repository.
3. During setup, confirm the build/output settings above.
4. Add the required environment variables in the dashboard.
5. Every push to `main` (or the branch you choose) will trigger a deployment.

## 6. Post-Deployment Checklist

- ✅ Frontend loads at `https://your-project.vercel.app`
- ✅ Network requests call the configured backend API
- ✅ Auth flows, file uploads, and Socket.IO events work against production services
- ✅ Custom domain (optional): add via **Settings → Domains**
- ✅ Monitoring/logging: enable Vercel Analytics or connect a third-party tool

You're all set! The backend can remain on Render/Supabase/Firebase; only the static frontend is hosted on Vercel. Update `VITE_API_URL` whenever the backend endpoint changes.
