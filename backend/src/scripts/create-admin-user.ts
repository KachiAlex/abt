/**
 * Script to create an admin user with a known password
 * This allows you to log in to the admin dashboard
 * 
 * Usage:
 *   npm run create-admin
 * 
 * Or:
 *   ts-node src/scripts/create-admin-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Load environment variables
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

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lyxwslsckkbcpepxigdx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// PBKDF2 password hashing (matches Edge Function implementation)
async function hashPasswordPBKDF2(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const encoder = new TextEncoder();
  
  // Use Web Crypto API if available (Node.js 15+), otherwise fall back to crypto.pbkdf2
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const passwordKey = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const key = await globalThis.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      512 // 64 bytes = 512 bits
    );
    
    const saltHex = salt.toString('hex');
    const keyHex = Buffer.from(key).toString('hex');
    return `pbkdf2:${saltHex}:${keyHex}`;
  } else {
    // Fallback to Node.js crypto.pbkdf2
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else {
          const saltHex = salt.toString('hex');
          const keyHex = derivedKey.toString('hex');
          resolve(`pbkdf2:${saltHex}:${keyHex}`);
        }
      });
    });
  }
}

async function createAdminUser() {
  console.log('🔐 Creating Admin User...\n');

  // Default admin credentials (you can change these)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@abia.gov.ng';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';
  const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Name: ${adminFirstName} ${adminLastName}\n`);

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', adminEmail)
    .single();

  if (existingUser) {
    console.log('⚠️  User already exists. Updating password and role...');
    
    // Hash password with PBKDF2 (matches Edge Function)
    const hashedPassword = await hashPasswordPBKDF2(adminPassword);
    
    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        role: 'GOVERNMENT_ADMIN',
        first_name: adminFirstName,
        last_name: adminLastName,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Admin user updated successfully!');
    console.log(`   User ID: ${updatedUser.id}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    return;
  }

  // Create new admin user
  console.log('Creating new admin user...');

  // Hash password with PBKDF2 (matches Edge Function)
  const hashedPassword = await hashPasswordPBKDF2(adminPassword);

  // Generate user ID
  const userId = `admin-${Date.now()}`;

  // Insert user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: adminEmail,
      password: hashedPassword,
      first_name: adminFirstName,
      last_name: adminLastName,
      role: 'GOVERNMENT_ADMIN',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error creating user:', insertError.message);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully!');
  console.log(`   User ID: ${newUser.id}`);
  console.log(`   Email: ${newUser.email}`);
  console.log(`   Role: ${newUser.role}`);
  console.log('\n📝 Login Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n⚠️  IMPORTANT: Change this password after first login!');
}

// Run script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { createAdminUser };

