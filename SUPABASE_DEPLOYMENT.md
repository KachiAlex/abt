# Supabase Edge Functions Migration Guide

## Overview

This guide explains how to deploy the migrated API functions to Supabase Edge Functions.

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref lyxwslsckkbcpepxigdx
```

## Environment Variables

Set the following environment variables in your Supabase project dashboard (Settings > Edge Functions):

- `JWT_SECRET`: Your JWT secret key (same as Firebase)
- `JWT_EXPIRES_IN`: Token expiration (default: "7d")
- `SUPABASE_URL`: https://lyxwslsckkbcpepxigdx.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Database Migration

⚠️ **Important**: You need to migrate your Firestore data to Supabase PostgreSQL.

The function expects these tables:
- `users` (with columns: id, email, password, first_name, last_name, role, is_active, etc.)
- `projects`
- `contractors` / `contractor_profiles`
- `submissions`
- `milestones`
- And other collections from Firestore

### Quick Migration Steps:

1. Export data from Firestore
2. Transform to PostgreSQL schema
3. Import to Supabase database

Or use a migration script to convert Firestore documents to PostgreSQL rows.

## Deployment

Deploy the function:

```bash
supabase functions deploy api
```

Or deploy from the project root:

```bash
cd supabase/functions/api
supabase functions deploy api
```

## Testing

After deployment, test the endpoint:

```bash
curl https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/health
```

## API Endpoints

The function is available at:
```
https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api
```

### Available Routes:

- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/register` - Register new user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout
- `GET /health` - Health check

## Frontend Configuration

Update your frontend API URL to:

```javascript
const API_URL = 'https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api';
```

## Notes

- The function uses Supabase PostgreSQL instead of Firestore
- CORS is configured to allow requests from your frontend domains
- JWT authentication is handled the same way as before
- Password hashing uses bcrypt (same as Firebase version)

## Troubleshooting

1. **Function not found**: Make sure you've deployed the function
2. **Database errors**: Verify your database schema matches the expected structure
3. **CORS errors**: Check that your frontend origin is in the allowed origins list
4. **Auth errors**: Verify JWT_SECRET is set correctly

