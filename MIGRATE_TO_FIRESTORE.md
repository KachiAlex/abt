# Migrating Back to Firestore

## Progress
1. ✅ Updated package.json - Added firebase-admin, removed pg
2. ✅ Converted auth.ts to Firestore
3. 🔄 Converting projects.ts, contractors.ts, submissions.ts
4. ⏳ Update server.ts health check
5. ⏳ Update tsconfig.json
6. ⏳ Test build

## Key Changes Needed

### Routes to Convert:
- projects.ts - Large file with filtering, pagination, stats
- contractors.ts - CRUD operations, stats, performance
- submissions.ts - CRUD, review workflow, stats

### Server.ts:
- Change health check from PostgreSQL to Firestore
- Update database message

### Config:
- Remove database.ts (PostgreSQL)
- Use firestore.ts instead

