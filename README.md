# ABT Backend API

**Abia Project Tracker Backend** - Comprehensive REST API for the digital accountability platform.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **File Upload**: Multer with local/cloud storage
- **Real-time**: Socket.IO for live notifications
- **Validation**: Express-validator
- **Security**: Helmet, CORS, rate limiting

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models (Prisma)
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── prisma/              # Database schema and migrations
├── uploads/             # File upload directory
└── dist/                # Compiled JavaScript
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Environment Setup
```bash
cp env.example .env
# Edit .env with your configuration
```

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Open Prisma Studio (optional)
npm run db:studio
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Projects
- `GET /api/projects` - Get projects (with filtering)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project (Admin only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `GET /api/projects/stats` - Get project statistics

### Contractors
- `GET /api/contractors` - Get contractors list
- `GET /api/contractors/:id` - Get contractor details
- `GET /api/contractors/:id/stats` - Get contractor statistics
- `PUT /api/contractors/:id` - Update contractor profile
- `GET /api/contractors/:id/performance` - Get performance data
- `POST /api/contractors/assign-project` - Assign project to contractor

### Submissions
- `GET /api/submissions` - Get submissions (role-based)
- `GET /api/submissions/:id` - Get submission details
- `POST /api/submissions` - Create submission (Contractor only)
- `PUT /api/submissions/:id` - Update submission
- `PUT /api/submissions/:id/review` - Review submission (M&E only)
- `DELETE /api/submissions/:id` - Delete submission
- `GET /api/submissions/stats` - Get submission statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/project-status-chart` - Project status chart data
- `GET /api/dashboard/budget-analysis` - Budget analysis data
- `GET /api/dashboard/lga-performance` - LGA performance data
- `GET /api/dashboard/recent-activity` - Recent activity feed

### Public (No authentication required)
- `GET /api/public/projects` - Get public projects
- `GET /api/public/projects/:id` - Get public project details
- `GET /api/public/stats` - Get public statistics
- `GET /api/public/projects-by-category` - Projects grouped by category
- `GET /api/public/projects-by-lga` - Projects grouped by LGA
- `GET /api/public/projects/search` - Search public projects

### Reports
- `GET /api/reports` - Get reports list
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id/download` - Download report

### Users
- `GET /api/users` - Get users (Admin only)
- `POST /api/users/upload-profile-image` - Upload profile image
- `GET /api/users/notifications` - Get user notifications
- `PUT /api/users/notifications/:id/read` - Mark notification as read
- `PUT /api/users/notifications/read-all` - Mark all notifications as read

## 🔐 Authentication & Authorization

### User Roles
- `GOVERNMENT_ADMIN` - Full system access
- `GOVERNMENT_OFFICER` - Government dashboard access
- `CONTRACTOR` - Contractor portal access
- `ME_OFFICER` - M&E dashboard access
- `PUBLIC` - Public portal access (limited)

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "GOVERNMENT_ADMIN",
  "contractorId": "uuid" // Only for contractors
}
```

### Authorization Matrix
| Endpoint | Public | Contractor | M&E Officer | Gov Officer | Gov Admin |
|----------|--------|------------|-------------|-------------|-----------|
| Public APIs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Own Projects | ❌ | ✅ | ✅ | ✅ | ✅ |
| All Projects | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create Project | ❌ | ❌ | ❌ | ❌ | ✅ |
| Review Submissions | ❌ | ❌ | ✅ | ❌ | ✅ |
| Generate Reports | ❌ | ❌ | ✅ | ✅ | ✅ |

## 📊 Database Schema

### Core Entities
- **Users** - System users with role-based access
- **ContractorProfiles** - Extended contractor information
- **Projects** - Project management and tracking
- **Milestones** - Project milestone tracking
- **Submissions** - Contractor submissions and updates
- **Approvals** - M&E review and approval workflow
- **Documents** - File management and storage
- **Notifications** - Real-time notification system
- **Reports** - Generated reports and analytics
- **AuditLogs** - System activity tracking

## 🔄 Real-time Features

### Socket.IO Events
- `new-submission` - New contractor submission
- `submission-reviewed` - Submission review completed
- `project-updated` - Project status/progress updated
- `deadline-reminder` - Upcoming deadline notifications
- `inspection-scheduled` - New inspection scheduled

### Notification Types
- `DEADLINE` - Project/milestone deadlines
- `PAYMENT` - Payment releases and updates
- `INSPECTION` - Site inspection schedules
- `APPROVAL` - Submission approvals
- `REJECTION` - Submission rejections
- `SYSTEM` - System-wide announcements

## 🛡️ Security Features

### Data Protection
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection (Helmet)
- Rate limiting
- CORS configuration

### File Upload Security
- File type validation
- File size limits (10MB)
- Secure file naming
- Directory traversal prevention
- Virus scanning (recommended for production)

## 📈 Performance Features

### Optimization
- Database query optimization
- Response compression
- Connection pooling (Prisma)
- Caching strategies (Redis recommended)
- Pagination for large datasets
- Efficient filtering and search

### Monitoring
- Request logging (Morgan)
- Error tracking
- Performance metrics
- Audit trail
- Real-time analytics

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
# See env.example for complete list
```

### Docker Support
```dockerfile
# Dockerfile included for containerization
# Supports multi-stage builds for optimization
```

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Security scanning
- Deployment automation

## 🧪 Testing

### Test Coverage
- Unit tests for controllers
- Integration tests for APIs
- Database tests with test containers
- Authentication flow tests
- File upload tests

### Running Tests
```bash
npm test
npm run test:coverage
npm run test:integration
```

## 📚 API Documentation

### Swagger/OpenAPI
- Interactive API documentation
- Request/response examples
- Authentication examples
- Error response formats

Access at: `http://localhost:5000/api-docs`

## 🔧 Development Tools

### Available Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Database Management
```bash
# Reset database
npm run db:reset

# Seed database with sample data
npm run db:seed

# View database in browser
npm run db:studio
```

## 📞 Support

**Developed by**: Kreatix Technologies  
**Contact**: info@kreatixtech.com  
**Documentation**: Full API docs available at `/api-docs`

---

© 2025 Kreatix Technologies. Built for Abia State Government.