# 🔐 Authentication Guide - Post Migration

## Current Situation

After migrating from Firestore to Supabase, you have:

### ✅ What Works:
- **API Authentication**: Your Supabase Edge Function handles login/logout correctly
- **JWT Tokens**: Token generation and verification works
- **Database**: All user data is in Supabase

### ⚠️ Potential Issues:
1. **Migrated Users**: The 5 users from Firestore had no passwords (they were Firebase Auth users)
   - Temporary passwords were set, but they're not usable
   - These users will need to reset their passwords

2. **Admin Access**: You need an admin account to access the dashboard

## Solution: Create Admin User

I've created a script to create an admin user with a known password.

### Step 1: Create Admin User

```bash
cd backend
npm run create-admin
```

**Default Credentials:**
- Email: `admin@abia.gov.ng`
- Password: `Admin@123!`
- Role: `GOVERNMENT_ADMIN`

### Step 2: Customize Credentials (Optional)

You can set custom credentials via environment variables in `.env`:

```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=Your
ADMIN_LAST_NAME=Name
```

Then run:
```bash
npm run create-admin
```

## How to Log In

### 1. Start Your Frontend
```bash
npm run dev
```

### 2. Navigate to Login
- Go to your app URL (usually `http://localhost:5173`)
- Click "Sign In" or navigate to the login page

### 3. Use Admin Credentials
- Email: `admin@abia.gov.ng` (or your custom email)
- Password: `Admin@123!` (or your custom password)

### 4. Access Admin Dashboard
After login, you'll be redirected to:
- `/me/dashboard` (for GOVERNMENT_ADMIN role)

## User Roles & Access

### Available Roles:
- `GOVERNMENT_ADMIN` - Full access, can manage everything
- `GOVERNMENT_OFFICER` - Can view and manage projects
- `CONTRACTOR` - Can submit progress reports
- `ME_OFFICER` - Can review submissions
- `PUBLIC` - Read-only access

### Role-Based Redirects:
- `GOVERNMENT_ADMIN` → `/me/dashboard`
- `GOVERNMENT_OFFICER` → `/me/dashboard`
- `CONTRACTOR` → `/contractor/dashboard`
- `ME_OFFICER` → `/me/dashboard`
- `PUBLIC` → `/dashboard`

## Handling Migrated Users

The 5 users migrated from Firestore have temporary passwords that won't work. You have two options:

### Option 1: Password Reset Flow
Implement a "Forgot Password" feature that:
1. Sends a reset link to the user's email
2. Allows them to set a new password
3. Uses the `/api/auth/change-password` endpoint

### Option 2: Manual Password Update
Update passwords directly in Supabase:
1. Go to Supabase Dashboard → Table Editor → `users`
2. Find the user
3. Update the `password` field with a bcrypt hash
4. Or use the script to update a specific user

## Testing Authentication

### Test Login Endpoint:
```bash
curl -X POST https://lyxwslsckkbcpepxigdx.supabase.co/functions/v1/api/auth/login \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "admin@abia.gov.ng",
    "password": "Admin@123!"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@abia.gov.ng",
      "role": "GOVERNMENT_ADMIN",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Troubleshooting

### "Invalid email or password"
- Check that the user exists in Supabase
- Verify the password is correctly hashed (bcrypt)
- Check that `is_active` is `true`

### "Token expired"
- Tokens expire after 7 days (configurable)
- User needs to log in again

### "Authorization required"
- Make sure you're sending the token in the `Authorization` header:
  ```
  Authorization: Bearer YOUR_TOKEN
  ```

### Can't Access Admin Dashboard
- Verify user role is `GOVERNMENT_ADMIN`
- Check route protection in frontend
- Verify token is being sent with requests

## Security Best Practices

1. **Change Default Password**: After first login, change the admin password
2. **Use Strong Passwords**: Minimum 8 characters, mix of letters, numbers, symbols
3. **Rotate Passwords**: Change passwords periodically
4. **Limit Admin Accounts**: Only create admin accounts for trusted users
5. **Monitor Access**: Check Supabase logs for suspicious activity

## Next Steps

1. ✅ Create admin user: `npm run create-admin`
2. ✅ Test login with admin credentials
3. ✅ Access admin dashboard
4. ⚠️ Implement password reset for migrated users
5. ⚠️ Update user roles if needed
6. ⚠️ Set up proper password policies

---

**You're all set! Create the admin user and you'll be able to log in and access the dashboard.** 🚀

