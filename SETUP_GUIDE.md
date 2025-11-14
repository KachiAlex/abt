# Abia Project Tracker - Setup Guide

This guide will help you set up the Abia Project Tracker application for development and production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (optional but recommended)

## 🚀 Quick Start

### 1. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 2. Set Up Environment Variables

#### Backend Environment (.env)
Create a `.env` file in the `backend` directory:

```bash
cd backend
copy ..\env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database - IMPORTANT: Update with your PostgreSQL credentials
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/abt_database?schema=public"

# JWT - IMPORTANT: Change this secret in production!
JWT_SECRET=abt-super-secure-jwt-secret-key-change-in-production-2025
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment (.env)
Create a `.env.development` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Environment
VITE_APP_ENV=development

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_REALTIME=true
```

### 3. Set Up the Database

#### Create PostgreSQL Database

```bash
# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE abt_database;

# Grant privileges (if needed)
GRANT ALL PRIVILEGES ON DATABASE abt_database TO your_username;

# Exit
\q
```

#### Run Prisma Migrations

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (recommended for production)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

**Sample Login Credentials** (after seeding):
- **Admin**: `admin@abia.gov.ng` / `Password123!`
- **Officer**: `officer@abia.gov.ng` / `Password123!`
- **M&E Officer**: `me@abia.gov.ng` / `Password123!`
- **Contractor**: `contractor1@example.com` / `Password123!`

### 4. Start Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

The backend API will be available at `http://localhost:5000`

#### Terminal 2 - Frontend Dev Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 5. Open Your Browser

Navigate to `http://localhost:5173` and log in with the sample credentials.

---

## 🔧 Advanced Setup

### Database Management Commands

```bash
cd backend

# View database in browser (Prisma Studio)
npm run db:studio

# Reset database (WARNING: Deletes all data!)
npm run db:reset

# Create new migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy
```

### Build for Production

#### Build Frontend
```bash
npm run build
```

The production build will be in the `dist` directory.

#### Build Backend
```bash
cd backend
npm run build
```

The compiled JavaScript will be in the `backend/dist` directory.

### Run Production Server

#### Backend
```bash
cd backend
npm start
```

#### Frontend
Use any static file server to serve the `dist` directory, or deploy to:
- Firebase Hosting
- Vercel
- Netlify
- AWS S3 + CloudFront

---

## 🔐 Security Considerations

### For Production Deployment

1. **Change JWT Secret**
   - Generate a strong, random secret key
   - Never commit the actual secret to version control

2. **Update Database URL**
   - Use a production database
   - Enable SSL connections
   - Use connection pooling

3. **Configure CORS**
   - Set `CORS_ORIGIN` to your production domain
   - Never use `*` (wildcard) in production

4. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Configure your web server (nginx, Apache) with HTTPS
   - Enable HTTP Strict Transport Security (HSTS)

5. **Environment Variables**
   - Never commit `.env` files
   - Use environment variable managers (AWS Secrets Manager, etc.)

6. **Rate Limiting**
   - Adjust rate limits based on your needs
   - Consider using Redis for distributed rate limiting

---

## 📊 Database Schema

The application uses the following main entities:

- **Users** - System users with role-based access
- **ContractorProfiles** - Contractor company information
- **Projects** - Government projects
- **Milestones** - Project milestones and deliverables
- **Submissions** - Contractor progress submissions
- **Approvals** - M&E review workflow
- **Documents** - File attachments
- **Inspections** - Site inspections
- **Notifications** - Real-time notifications
- **Reports** - Generated reports
- **AuditLogs** - System activity tracking

---

## 🐛 Troubleshooting

### "Cannot connect to database"

**Solution:**
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env` is correct
3. Ensure database exists: `psql -U postgres -l`
4. Test connection: `psql -U your_username -d abt_database`

### "Prisma Client not generated"

**Solution:**
```bash
cd backend
npm run db:generate
```

### "Port 5000 already in use"

**Solution:**
1. Kill the process using port 5000:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill`
2. Or change the port in `backend/.env`

### "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install
```

### Frontend can't connect to backend

**Solution:**
1. Ensure backend is running on port 5000
2. Check `VITE_API_URL` in `.env.development`
3. Check browser console for CORS errors
4. Verify `CORS_ORIGIN` in `backend/.env`

---

## 📱 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <your_token_here>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile

#### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project

#### Public (No auth required)
- `GET /api/public/projects` - Public project list
- `GET /api/public/stats` - Public statistics

See `backend/src/routes/` for complete API documentation.

---

## 🚀 Deployment

### Firebase Hosting + Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init
```

4. Deploy:
```bash
npm run build
firebase deploy
```

### Traditional Server (VPS)

1. Set up nginx or Apache as reverse proxy
2. Use PM2 to manage Node.js process:
```bash
npm install -g pm2
cd backend
pm2 start npm --name "abt-api" -- start
```

3. Serve frontend from nginx/Apache
4. Configure SSL with Let's Encrypt

---

## 📞 Support

For issues or questions:
- **Email**: support@abia.gov.ng
- **Developer**: Kreatix Technologies (info@kreatixtech.com)

---

## 📄 License

© 2025 Kreatix Technologies. Built for Abia State Government.

