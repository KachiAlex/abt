import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In Firebase Functions, credentials are automatic
// For local development, set GOOGLE_APPLICATION_CREDENTIALS env var
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

// Export Firestore instance
export const db = admin.firestore();

// Export Auth instance
export const auth = admin.auth();

// Export Storage instance
export const storage = admin.storage();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

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

