/**
 * Quick verification script to check if everything is ready for migration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('\n🔍 Verifying Migration Setup...\n');

let allGood = true;

// Check .env file
console.log('1. Checking environment variables...');
if (process.env.SUPABASE_URL) {
  console.log('   ✅ SUPABASE_URL is set');
} else {
  console.log('   ❌ SUPABASE_URL is missing');
  allGood = false;
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY is set');
} else {
  console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY is missing');
  allGood = false;
}

// Check migration script
console.log('\n2. Checking migration script...');
const migrationScript = path.join(__dirname, 'backend', 'src', 'scripts', 'migrate-to-supabase.ts');
if (fs.existsSync(migrationScript)) {
  console.log('   ✅ Migration script exists');
} else {
  console.log('   ❌ Migration script not found');
  allGood = false;
}

// Check schema file
console.log('\n3. Checking database schema file...');
const schemaFile = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
if (fs.existsSync(schemaFile)) {
  console.log('   ✅ Schema SQL file exists');
} else {
  console.log('   ❌ Schema SQL file not found');
  allGood = false;
}

// Check package.json for script
console.log('\n4. Checking package.json...');
const packageJson = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  if (pkg.scripts && pkg.scripts['migrate:supabase']) {
    console.log('   ✅ Migration script command exists');
  } else {
    console.log('   ❌ Migration script command not found in package.json');
    allGood = false;
  }
  
  if (pkg.dependencies && pkg.dependencies['@supabase/supabase-js']) {
    console.log('   ✅ @supabase/supabase-js is installed');
  } else {
    console.log('   ⚠️  @supabase/supabase-js may not be installed (run: npm install)');
  }
} else {
  console.log('   ❌ package.json not found');
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! Ready to migrate.');
  console.log('\nNext steps:');
  console.log('1. Create database schema in Supabase SQL Editor');
  console.log('2. Run: cd backend && npm run migrate:supabase');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);

