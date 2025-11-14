# 🏗️ Abia Project Tracker - Cloud Architecture

## Overview

The Abia Project Tracker is designed as a modern, cloud-native application optimized for Firebase deployment with external database hosting.

---

## 🌐 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Users                                    │
│         (Citizens, Government, Contractors, M&E Officers)         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                              │
│                 (React SPA - Static Assets)                       │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Dashboard │  │  Projects  │  │   Reports  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                   │
│              Vite Build → Optimized Bundle                        │
│              Tailwind CSS → Utility-first Styling                │
│              React Router → Client-side Navigation               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    API Requests (/api/*)
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    Firebase Functions                             │
│                   (Node.js + Express API)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Express.js Server                       │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Auth Routes │  │Project Routes│  │Report Routes│    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────┐      │   │
│  │  │           Middleware Layer                    │      │   │
│  │  │  • JWT Authentication                         │      │   │
│  │  │  • Role-based Authorization                   │      │   │
│  │  │  • Request Validation                         │      │   │
│  │  │  • Rate Limiting                              │      │   │
│  │  │  • Error Handling                             │      │   │
│  │  └──────────────────────────────────────────────┘      │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────┐      │   │
│  │  │          Business Logic Layer                 │      │   │
│  │  │  • Controllers (Handle requests)              │      │   │
│  │  │  • Services (Business logic)                  │      │   │
│  │  │  • Validators (Input validation)              │      │   │
│  │  └──────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Socket.IO Server                          │   │
│  │          (Real-time Notifications)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    Database Queries (SQL)
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              Cloud PostgreSQL Database                            │
│                  (Neon / Supabase / Cloud SQL)                   │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Users    │  │  Projects  │  │Submissions │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │Contractors │  │ Documents  │  │ Approvals  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                   │
│                  Prisma ORM → Type-safe Queries                  │
│                  Migrations → Schema Version Control             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend Layer
```
React 19.1.1
├── Vite 7.1.2 (Build tool)
├── React Router 7.1.1 (Routing)
├── Tailwind CSS 3.4.15 (Styling)
├── Lucide React (Icons)
├── Recharts 2.13.3 (Charts)
└── Date-fns (Date utilities)
```

### Backend Layer
```
Node.js 18
├── Express.js 5.1.0 (Web framework)
├── TypeScript 5.9.2 (Type safety)
├── Prisma 6.16.2 (ORM)
├── Socket.IO 4.8.1 (WebSockets)
├── JWT (Authentication)
├── bcrypt (Password hashing)
├── Multer (File uploads)
├── Helmet (Security)
└── Express Validator (Validation)
```

### Database Layer
```
PostgreSQL 14+
└── Prisma Schema (14 main entities)
```

### Hosting & Infrastructure
```
Firebase
├── Hosting (Static frontend)
├── Functions (Backend API)
└── Configuration (Environment variables)

Cloud Database
└── Neon / Supabase / Cloud SQL
```

---

## 🔄 Request Flow

### 1. User Request Flow

```
User Action (Click Button)
    ↓
React Component (Dashboard.jsx)
    ↓
API Service (src/services/api.js)
    ↓
HTTP Request with JWT Token
    ↓
Firebase Functions (backend/src/server.ts)
    ↓
Express Route Handler (backend/src/routes/*.ts)
    ↓
Authentication Middleware (Verify JWT)
    ↓
Authorization Check (Role-based)
    ↓
Controller (backend/src/controllers/*.ts)
    ↓
Prisma Query (Type-safe SQL)
    ↓
PostgreSQL Database
    ↓
Response back through the chain
    ↓
React Component Updates (State)
    ↓
UI Re-renders (User sees result)
```

### 2. Authentication Flow

```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Validate credentials
    ↓
Query user from database
    ↓
Compare password hash (bcrypt)
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Store in localStorage (abt_auth)
    ↓
Include in all future requests (Authorization header)
```

### 3. Real-time Notification Flow

```
Event Occurs (e.g., Submission approved)
    ↓
Server emits Socket.IO event
    ↓
socket.emit('submission-reviewed', data)
    ↓
Client listening on socket
    ↓
Update notification state
    ↓
Show notification UI
    ↓
Play sound / Show toast (optional)
```

---

## 🗄️ Database Schema

### Entity Relationship Overview

```
User (1) ←→ (1) ContractorProfile
  ↓
  └──→ (Many) Submissions
  └──→ (Many) Approvals
  └──→ (Many) Notifications
  └──→ (Many) AuditLogs

Project (1) ←→ (1) ContractorProfile
  ↓
  └──→ (Many) Milestones
  └──→ (Many) Submissions
  └──→ (Many) Documents
  └──→ (Many) Inspections
  └──→ (Many) TeamMembers

Submission (1) ←→ (1) Project
  ↓
  └──→ (Many) Documents
  └──→ (Many) Approvals
```

### Key Entities

1. **Users** (Authentication & Roles)
   - Government Admin
   - Government Officer
   - M&E Officer
   - Contractor
   - Public

2. **Projects** (Core Entity)
   - Name, Description, Category
   - Budget, Status, Progress
   - Dates, Location
   - Quality metrics

3. **Contractors** (Service Providers)
   - Company info
   - Rating, Certifications
   - Projects assigned

4. **Submissions** (Progress Updates)
   - From contractors
   - Reviewed by M&E
   - Status workflow

5. **Milestones** (Project Phases)
   - Due dates
   - Progress tracking
   - Budget allocation

---

## 🔐 Security Architecture

### Authentication
```
User Login
    ↓
Email + Password
    ↓
Verify against database
    ↓
Generate JWT Token (signed with secret)
    ↓
Token contains: userId, role, email
    ↓
Client stores in localStorage
    ↓
Sent with every request (Authorization header)
```

### Authorization (Role-Based Access Control)

```
Request received
    ↓
Extract JWT from header
    ↓
Verify token signature
    ↓
Decode token payload
    ↓
Check user role
    ↓
Compare with route permissions
    ↓
Allow/Deny access
```

**Permission Matrix:**
```
Route                   | PUBLIC | CONTRACTOR | M&E | OFFICER | ADMIN |
------------------------|--------|------------|-----|---------|-------|
/api/public/*          |   ✅   |     ✅     | ✅  |   ✅    |  ✅   |
/api/auth/*            |   ✅   |     ✅     | ✅  |   ✅    |  ✅   |
/api/projects (read)   |   ❌   |     ✅     | ✅  |   ✅    |  ✅   |
/api/projects (write)  |   ❌   |     ❌     | ❌  |   ❌    |  ✅   |
/api/submissions (create)|  ❌   |     ✅     | ❌  |   ❌    |  ❌   |
/api/submissions (review)|  ❌   |     ❌     | ✅  |   ❌    |  ✅   |
```

---

## 🚀 Deployment Architecture

### Firebase Hosting + Functions

```
Git Push → main branch
    ↓
GitHub Actions (Optional)
    ↓
Build Frontend (npm run build)
    ↓
Build Backend (cd backend && npm run build)
    ↓
Firebase Deploy
    ↓
┌─────────────────────────────────┐
│     Upload to Firebase          │
│  • Static files → Hosting       │
│  • Functions → Cloud Functions  │
└─────────────────────────────────┘
    ↓
Live in < 5 minutes
```

### Configuration Management

**Local Development:**
```
.env files
└── backend/.env
    └── DATABASE_URL, JWT_SECRET, etc.
```

**Production (Firebase):**
```
Firebase Functions Config
└── firebase functions:config:set
    └── database.url, jwt.secret, etc.
```

**Backend reads from both:**
```typescript
// backend/src/config/index.ts
const databaseUrl = 
  functionsConfig.database?.url ||  // Firebase
  process.env.DATABASE_URL ||       // Local .env
  '';                               // Fallback
```

---

## 📊 Scalability Considerations

### Firebase Functions
- **Auto-scaling:** Automatically scales based on load
- **Cold starts:** ~2-3 seconds on first request
- **Concurrent executions:** Up to 1000 by default
- **Memory:** 256MB - 2GB configurable

### Database (Neon/Supabase)
- **Connection pooling:** Built-in
- **Auto-scaling:** Serverless model
- **Backup:** Automatic daily backups
- **Read replicas:** Available for high traffic

### Frontend (Firebase Hosting)
- **CDN:** Global edge network
- **Caching:** Aggressive caching of static assets
- **Compression:** Automatic gzip/brotli

---

## 🔄 Data Flow Examples

### Example 1: View Projects List

```
1. User clicks "Projects" → Dashboard
2. React component mounts → useEffect()
3. Call API: projectAPI.getAll()
4. Request: GET /api/projects
5. Firebase Functions receives request
6. Auth middleware validates JWT
7. Role check: User has access?
8. Controller: projectController.getProjects()
9. Prisma query: prisma.project.findMany()
10. PostgreSQL executes query
11. Results returned up the chain
12. React state updated
13. UI renders project list
```

### Example 2: Submit Progress Update (Contractor)

```
1. Contractor fills form
2. Clicks "Submit"
3. Call API: submissionAPI.create(data)
4. Request: POST /api/submissions
5. Auth: Verify contractor JWT
6. Validation: Check required fields
7. Controller: submissionController.create()
8. Prisma: prisma.submission.create()
9. Database: INSERT into submissions
10. Socket.IO: Emit 'new-submission' event
11. M&E officers notified in real-time
12. Response: Success + submission data
13. UI updates: Show success message
```

---

## 🎯 Performance Optimizations

### Frontend
- ✅ Code splitting (React.lazy)
- ✅ Tree shaking (Vite)
- ✅ Minification & compression
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Memoization (useMemo, useCallback)

### Backend
- ✅ Database query optimization
- ✅ Response compression (gzip)
- ✅ Connection pooling (Prisma)
- ✅ Rate limiting
- ✅ Efficient pagination
- ✅ Selective field loading

### Database
- ✅ Indexed columns (id, email, etc.)
- ✅ Efficient foreign keys
- ✅ Optimized queries via Prisma
- ✅ Connection pooling

---

## 📈 Monitoring & Observability

### Firebase Console
- Function execution logs
- Error tracking
- Performance metrics
- Hosting analytics

### Database Monitoring
- Query performance (Neon/Supabase dashboards)
- Connection usage
- Storage metrics

### Recommended Additional Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User analytics
- **Uptime Robot** - Uptime monitoring

---

## 🔄 Future Enhancements

### Potential Additions
1. **Redis** for caching
2. **Elasticsearch** for advanced search
3. **Message Queue** (Cloud Tasks) for async jobs
4. **Cloud Storage** (Firebase Storage) for files
5. **Pub/Sub** for event-driven architecture
6. **Cloud CDN** for global content delivery

---

## 📚 Architecture Patterns Used

1. **MVC Pattern** - Separation of concerns
2. **Repository Pattern** - Data access abstraction (Prisma)
3. **Middleware Pattern** - Request processing pipeline
4. **Service Layer Pattern** - Business logic encapsulation
5. **RESTful API** - Resource-based endpoints
6. **JWT Authentication** - Stateless auth
7. **Role-Based Access Control** - Authorization
8. **Event-Driven** - Socket.IO for real-time

---

**This architecture provides a scalable, secure, and maintainable foundation for the Abia Project Tracker. 🏗️**

