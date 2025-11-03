import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In Firebase Functions, credentials are automatic
// For local development, set GOOGLE_APPLICATION_CREDENTIALS env var
if (!admin.apps.length) {
  try {
    // Use minimal initialization to avoid deployment timeout
    admin.initializeApp({
      // In Firebase Functions, credentials are automatically provided
      // Only specify credential in local dev
    });
    // Only log in non-production to avoid deployment delays
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Firebase Admin SDK initialized');
    }
  } catch (error) {
    // Only log errors in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Firebase Admin initialization error:', error);
    }
  }
}

// Export Firestore instance
export const db = admin.firestore();

// Export Auth instance
export const auth = admin.auth();

// Export Storage instance
export const storage = admin.storage();

// Configure Firestore settings (lazy - only when db is actually used)
// Don't configure during module load to avoid deployment timeout
try {
  db.settings({
    ignoreUndefinedProperties: true,
  });
} catch (error) {
  // Settings might fail during deployment, ignore
}

// Collection names
export const Collections = {
  USERS: 'users',
  CONTRACTOR_PROFILES: 'contractorProfiles',
  PROJECTS: 'projects',
  MILESTONES: 'milestones',
  SUBMISSIONS: 'submissions',
  APPROVALS: 'approvals',
  DOCUMENTS: 'documents',
  TEAM_MEMBERS: 'teamMembers',
  INSPECTIONS: 'inspections',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
};

export default db;

