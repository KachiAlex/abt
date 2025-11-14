# ⚡ Quick Start - Commands Reference

## 🚀 Get Started in 5 Minutes

### 1️⃣ Install Dependencies (First Time Only)
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2️⃣ Set Up Environment (First Time Only)
```bash
# Copy environment template
cd backend
copy ..\env.example .env

# Edit .env file and update:
# - DATABASE_URL with your PostgreSQL credentials
# - JWT_SECRET with a secure random string
```

### 3️⃣ Set Up Database (First Time Only)
```bash
# Make sure PostgreSQL is running, then:
cd backend

# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Add sample data
npm run db:seed
```

**✅ Sample Login Credentials:**
- Admin: `admin@abia.gov.ng` / `Password123!`
- Officer: `officer@abia.gov.ng` / `Password123!`
- M&E: `me@abia.gov.ng` / `Password123!`
- Contractor: `contractor1@example.com` / `Password123!`

### 4️⃣ Start Development Servers

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
```
✅ Backend running at: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

### 5️⃣ Open Browser
Navigate to: **http://localhost:5173**

---

## 📝 Common Commands

### Development
```bash
# Start backend dev server
cd backend && npm run dev

# Start frontend dev server
npm run dev

# View database in browser
cd backend && npm run db:studio
```

### Database
```bash
cd backend

# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (⚠️ deletes all data)
npm run db:reset
```

### Build & Production
```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build

# Start production server
cd backend && npm start
```

---

## 🔍 Verify Installation

After starting both servers, check:

1. **Backend Health Check:**
   - Open: `http://localhost:5000/health`
   - Should see: `{"success": true, "message": "ABT API is running"}`

2. **Frontend:**
   - Open: `http://localhost:5173`
   - Should see: Landing page with login option

3. **Database:**
   - Run: `cd backend && npm run db:studio`
   - Opens Prisma Studio in browser
   - Should see 5 users, 2 contractors, 5 projects

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: systemctl status postgresql

# Test database connection
psql -U postgres -d abt_database
```

### "Port already in use"
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port 5000
lsof -ti:5000 | xargs kill
```

### "Prisma Client not found"
```bash
cd backend
npm run db:generate
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

cd backend
rm -rf node_modules
npm install
```

---

## 📚 Next Steps

After you have the app running:

1. ✅ Log in with sample credentials
2. ✅ Explore the dashboard
3. ✅ Check out the projects page
4. 📖 Read `NEXT_STEPS.md` for API integration
5. 📖 Read `SETUP_GUIDE.md` for detailed documentation

---

## 🎯 Development Workflow

```bash
# 1. Start backend (Terminal 1)
cd backend
npm run dev

# 2. Start frontend (Terminal 2)
npm run dev

# 3. Make changes to code
# - Frontend auto-reloads
# - Backend restarts automatically (nodemon)

# 4. View database (Terminal 3 - optional)
cd backend
npm run db:studio

# 5. Test your changes at http://localhost:5173
```

---

## 🔐 Important Security Notes

Before deploying to production:

1. ⚠️ **Change `JWT_SECRET`** to a strong random value
2. ⚠️ **Update `DATABASE_URL`** to production database
3. ⚠️ **Set `NODE_ENV=production`**
4. ⚠️ **Update `CORS_ORIGIN`** to your domain
5. ⚠️ **Never commit `.env` files**

---

## ✅ Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js v18+ installed
- [ ] Dependencies installed (npm install)
- [ ] Environment file created (backend/.env)
- [ ] Database created (abt_database)
- [ ] Prisma client generated
- [ ] Database schema pushed
- [ ] Sample data seeded
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Able to log in with sample credentials

---

**Ready to build! 🚀**

For detailed guides, see:
- `SETUP_GUIDE.md` - Complete setup documentation
- `NEXT_STEPS.md` - Integration and enhancement guide
- `IMPROVEMENTS_SUMMARY.md` - What has been completed

