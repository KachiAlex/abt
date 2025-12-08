/**
 * Migration Script: Firestore to Supabase PostgreSQL
 * 
 * This script migrates all data from Firestore to Supabase PostgreSQL database.
 * 
 * Usage:
 *   npm run migrate:supabase
 * 
 * Or:
 *   ts-node src/scripts/migrate-to-supabase.ts
 */

import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Timestamp } from 'firebase-admin/firestore';

// Load environment variables
// Try multiple paths
const envPaths = [
  '../../.env',
  '../.env',
  '.env',
  process.env.ENV_PATH
].filter(Boolean);

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.SUPABASE_URL) break;
  } catch (e) {
    // Continue to next path
  }
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lyxwslsckkbcpepxigdx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required!');
  console.error('Set it in .env file or as environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper: Convert Firestore Timestamp to ISO string
function convertTimestamp(timestamp: any): string | null {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return null;
}

// Helper: Convert camelCase to snake_case
function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// Helper: Transform object keys from camelCase to snake_case
function transformKeys(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);
  
  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    
    // Handle special cases
    if (key === 'id') {
      transformed.id = value;
    } else if (value instanceof Timestamp || (value && typeof value === 'object' && 'toDate' in value)) {
      transformed[snakeKey] = convertTimestamp(value);
    } else if (key === 'createdAt' || key === 'updatedAt' || key === 'lastLogin' || 
               key === 'submittedAt' || key === 'reviewedAt' || key === 'startDate' || 
               key === 'expectedEndDate' || key === 'actualEndDate' || key === 'dueDate' ||
               key === 'completedDate' || key === 'scheduledAt' || key === 'completedAt') {
      transformed[snakeKey] = convertTimestamp(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle nested objects (like location)
      if (key === 'location' && typeof value === 'object' && value !== null && 'coordinates' in value) {
        transformed.location = JSON.stringify(value);
      } else {
        transformed[snakeKey] = transformKeys(value);
      }
    } else {
      transformed[snakeKey] = value;
    }
  }
  return transformed;
}

// Migration functions
async function migrateUsers() {
  console.log('\n📦 Migrating Users...');
  try {
    const snapshot = await db.collection('users').get();
    console.log(`  Found ${snapshot.size} users`);

    if (snapshot.empty) {
      console.log('  ⚠️  No users to migrate');
      return;
    }

    const users = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedUsers = users.map((user: any) => {
      const transformed = transformKeys(user);
      
      // Handle users without passwords (Firebase Auth users)
      // If no password, generate a temporary one that will need to be reset
      let password = transformed.password;
      if (!password) {
        // Generate a secure random password that users will need to reset
        // Using a placeholder that clearly indicates password reset is needed
        const crypto = require('crypto');
        password = '$2a$10$' + crypto.randomBytes(16).toString('base64') + 'TEMPORARY_PASSWORD_NEEDS_RESET';
        console.log(`    ⚠️  User ${transformed.email} has no password - temporary password set (needs reset)`);
      }
      
      // Ensure required fields
      return {
        id: transformed.id,
        email: transformed.email,
        password: password,
        first_name: transformed.first_name || '',
        last_name: transformed.last_name || '',
        role: transformed.role || 'PUBLIC', // Default to PUBLIC if no role
        is_active: transformed.is_active !== undefined ? transformed.is_active : true,
        phone: transformed.phone || null,
        department: transformed.department || null,
        job_title: transformed.job_title || null,
        address: transformed.address || null,
        city: transformed.city || null,
        state: transformed.state || null,
        profile_image: transformed.profile_image || null,
        preferences: transformed.preferences || null,
        created_at: transformed.created_at || new Date().toISOString(),
        updated_at: transformed.updated_at || new Date().toISOString(),
        last_login: transformed.last_login || null
      };
    });

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < transformedUsers.length; i += batchSize) {
      const batch = transformedUsers.slice(i, i + batchSize);
      const { error } = await supabase.from('users').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        // Try inserting one by one to identify problematic records
        for (const user of batch) {
          const { error: singleError } = await supabase.from('users').upsert(user, { onConflict: 'id' });
          if (singleError) {
            console.error(`    Failed to insert user ${user.id}:`, singleError.message);
          }
        }
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} users)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedUsers.length} users`);
  } catch (error: any) {
    console.error('  ❌ Error migrating users:', error.message);
    throw error;
  }
}

async function migrateContractors() {
  console.log('\n📦 Migrating Contractors...');
  try {
    const snapshot = await db.collection('contractorProfiles').get();
    console.log(`  Found ${snapshot.size} contractors`);

    if (snapshot.empty) {
      console.log('  ⚠️  No contractors to migrate');
      return;
    }

    const contractors = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedContractors = contractors.map((contractor: any) => {
      const transformed = transformKeys(contractor);
      return {
        id: transformed.id,
        user_id: transformed.user_id,
        company_name: transformed.company_name || '',
        registration_no: transformed.registration_no || '',
        contact_person: transformed.contact_person || '',
        company_email: transformed.company_email || '',
        company_phone: transformed.company_phone || '',
        company_address: transformed.company_address || '',
        rating: transformed.rating || 0,
        is_verified: transformed.is_verified || false,
        is_certified: transformed.is_certified || false,
        years_experience: transformed.years_experience || null,
        specialization: transformed.specialization || [],
        created_at: transformed.created_at || new Date().toISOString(),
        updated_at: transformed.updated_at || new Date().toISOString()
      };
    });

    const batchSize = 100;
    for (let i = 0; i < transformedContractors.length; i += batchSize) {
      const batch = transformedContractors.slice(i, i + batchSize);
      const { error } = await supabase.from('contractor_profiles').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} contractors)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedContractors.length} contractors`);
  } catch (error: any) {
    console.error('  ❌ Error migrating contractors:', error.message);
    throw error;
  }
}

async function migrateProjects() {
  console.log('\n📦 Migrating Projects...');
  try {
    const snapshot = await db.collection('projects').get();
    console.log(`  Found ${snapshot.size} projects`);

    if (snapshot.empty) {
      console.log('  ⚠️  No projects to migrate');
      return;
    }

    const projects = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedProjects = projects.map((project: any) => {
      const transformed = transformKeys(project);
      
      // Handle location object
      let location = null;
      if (transformed.location) {
        if (typeof transformed.location === 'string') {
          location = transformed.location;
        } else {
          location = JSON.stringify(transformed.location);
        }
      }

      return {
        id: transformed.id,
        name: transformed.name || '',
        description: transformed.description || '',
        category: transformed.category || '',
        lga: transformed.lga || '', // Can be string or array
        priority: transformed.priority || 'MEDIUM',
        status: transformed.status || 'NOT_STARTED',
        progress: transformed.progress || 0,
        budget: transformed.budget || 0,
        allocated_budget: transformed.allocated_budget || transformed.budget || 0,
        spent_budget: transformed.spent_budget || 0,
        funding_source: transformed.funding_source || '',
        start_date: transformed.start_date || null,
        expected_end_date: transformed.expected_end_date || null,
        actual_end_date: transformed.actual_end_date || null,
        beneficiaries: transformed.beneficiaries || null,
        contractor_id: transformed.contractor_id || null,
        project_manager_id: transformed.project_manager_id || null,
        location: location,
        is_public: transformed.is_public !== undefined ? transformed.is_public : true,
        quality_score: transformed.quality_score || 0,
        safety_compliance: transformed.safety_compliance || null,
        weather_delay: transformed.weather_delay || 0,
        safety_incidents: transformed.safety_incidents || 0,
        created_at: transformed.created_at || new Date().toISOString(),
        updated_at: transformed.updated_at || new Date().toISOString()
      };
    });

    const batchSize = 100;
    for (let i = 0; i < transformedProjects.length; i += batchSize) {
      const batch = transformedProjects.slice(i, i + batchSize);
      const { error } = await supabase.from('projects').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        // Try one by one
        for (const project of batch) {
          const { error: singleError } = await supabase.from('projects').upsert(project, { onConflict: 'id' });
          if (singleError) {
            console.error(`    Failed to insert project ${project.id}:`, singleError.message);
          }
        }
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} projects)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedProjects.length} projects`);
  } catch (error: any) {
    console.error('  ❌ Error migrating projects:', error.message);
    throw error;
  }
}

async function migrateMilestones() {
  console.log('\n📦 Migrating Milestones...');
  try {
    const snapshot = await db.collection('milestones').get();
    console.log(`  Found ${snapshot.size} milestones`);

    if (snapshot.empty) {
      console.log('  ⚠️  No milestones to migrate');
      return;
    }

    const milestones = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedMilestones = milestones.map((milestone: any) => {
      const transformed = transformKeys(milestone);
      return {
        id: transformed.id,
        project_id: transformed.project_id,
        name: transformed.name || '',
        description: transformed.description || null,
        order: transformed.order || 0,
        due_date: transformed.due_date || null,
        completed_date: transformed.completed_date || null,
        status: transformed.status || 'PENDING',
        progress: transformed.progress || 0,
        budget: transformed.budget || null,
        created_at: transformed.created_at || new Date().toISOString(),
        updated_at: transformed.updated_at || new Date().toISOString()
      };
    });

    const batchSize = 100;
    for (let i = 0; i < transformedMilestones.length; i += batchSize) {
      const batch = transformedMilestones.slice(i, i + batchSize);
      const { error } = await supabase.from('milestones').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} milestones)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedMilestones.length} milestones`);
  } catch (error: any) {
    console.error('  ❌ Error migrating milestones:', error.message);
    throw error;
  }
}

async function migrateSubmissions() {
  console.log('\n📦 Migrating Submissions...');
  try {
    const snapshot = await db.collection('submissions').get();
    console.log(`  Found ${snapshot.size} submissions`);

    if (snapshot.empty) {
      console.log('  ⚠️  No submissions to migrate');
      return;
    }

    const submissions = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedSubmissions = submissions.map((submission: any) => {
      const transformed = transformKeys(submission);
      return {
        id: transformed.id,
        project_id: transformed.project_id,
        milestone_id: transformed.milestone_id || null,
        contractor_id: transformed.contractor_id,
        submitted_by: transformed.submitted_by,
        type: transformed.type || '',
        title: transformed.title || '',
        description: transformed.description || '',
        progress: transformed.progress || null,
        estimated_value: transformed.estimated_value || null,
        priority: transformed.priority || 'MEDIUM',
        status: transformed.status || 'PENDING',
        quality_score: transformed.quality_score || null,
        safety_compliance: transformed.safety_compliance || null,
        weather_impact: transformed.weather_impact || null,
        media_count: transformed.media_count || 0,
        due_date: transformed.due_date || null,
        submitted_at: transformed.submitted_at || new Date().toISOString(),
        reviewed_at: transformed.reviewed_at || null,
        reviewed_by: transformed.reviewed_by || null,
        review_comments: transformed.review_comments || null,
        created_at: transformed.created_at || new Date().toISOString(),
        updated_at: transformed.updated_at || new Date().toISOString()
      };
    });

    const batchSize = 100;
    for (let i = 0; i < transformedSubmissions.length; i += batchSize) {
      const batch = transformedSubmissions.slice(i, i + batchSize);
      const { error } = await supabase.from('submissions').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} submissions)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedSubmissions.length} submissions`);
  } catch (error: any) {
    console.error('  ❌ Error migrating submissions:', error.message);
    throw error;
  }
}

async function migrateApprovals() {
  console.log('\n📦 Migrating Approvals...');
  try {
    const snapshot = await db.collection('approvals').get();
    console.log(`  Found ${snapshot.size} approvals`);

    if (snapshot.empty) {
      console.log('  ⚠️  No approvals to migrate');
      return;
    }

    const approvals = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedApprovals = approvals.map((approval: any) => {
      const transformed = transformKeys(approval);
      return {
        id: transformed.id,
        submission_id: transformed.submission_id,
        reviewer_id: transformed.reviewer_id,
        action: transformed.action || '',
        comments: transformed.comments || null,
        created_at: transformed.created_at || new Date().toISOString()
      };
    });

    const batchSize = 100;
    for (let i = 0; i < transformedApprovals.length; i += batchSize) {
      const batch = transformedApprovals.slice(i, i + batchSize);
      const { error } = await supabase.from('approvals').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} approvals)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedApprovals.length} approvals`);
  } catch (error: any) {
    console.error('  ❌ Error migrating approvals:', error.message);
    throw error;
  }
}

async function migrateDocuments() {
  console.log('\n📦 Migrating Documents...');
  try {
    const snapshot = await db.collection('documents').get();
    console.log(`  Found ${snapshot.size} documents`);

    if (snapshot.empty) {
      console.log('  ⚠️  No documents to migrate');
      return;
    }

    const documents = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    const transformedDocuments = documents.map((doc: any) => {
      const transformed = transformKeys(doc);
      return {
        id: transformed.id,
        project_id: transformed.project_id || null,
        submission_id: transformed.submission_id || null,
        file_name: transformed.file_name || '',
        original_name: transformed.original_name || '',
        file_path: transformed.file_path || '',
        file_size: transformed.file_size || 0,
        mime_type: transformed.mime_type || '',
        category: transformed.category || '',
        uploaded_by: transformed.uploaded_by,
        is_public: transformed.is_public || false,
        created_at: transformed.created_at || new Date().toISOString()
      };
    });

    const batchSize = 100;
    for (let i = 0; i < transformedDocuments.length; i += batchSize) {
      const batch = transformedDocuments.slice(i, i + batchSize);
      const { error } = await supabase.from('documents').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      } else {
        console.log(`  ✅ Inserted batch ${i / batchSize + 1} (${batch.length} documents)`);
      }
    }

    console.log(`  ✅ Migrated ${transformedDocuments.length} documents`);
  } catch (error: any) {
    console.error('  ❌ Error migrating documents:', error.message);
    throw error;
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting Firestore to Supabase Migration\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('=' .repeat(60));

  try {
    // Migrate in order (respecting foreign key constraints)
    await migrateUsers();
    await migrateContractors();
    await migrateProjects();
    await migrateMilestones();
    await migrateSubmissions();
    await migrateApprovals();
    await migrateDocuments();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { migrate };

