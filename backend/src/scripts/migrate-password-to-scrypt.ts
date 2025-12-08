/**
 * Script to migrate admin password from bcrypt to scrypt
 * This allows the admin to log in with the new scrypt-based system
 */

import { createClient } from "@supabase/supabase-js";
import * as bcrypt from "bcryptjs";
import * as readline from "readline";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://lyxwslsckkbcpepxigdx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eHdzbHNja2tiY3BlcHhpZ2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg3NzkyOCwiZXhwIjoyMDgwNDUzOTI4fQ.EPsVWjx4nwSzlbxnHWquB4tx7I-ohc2YMIZfFeFoOaw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Scrypt password hashing (matches Edge Function implementation)
async function hashPasswordScrypt(password: string): Promise<string> {
  const crypto = await import("crypto");
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else {
        const saltHex = salt.toString("hex");
        const keyHex = derivedKey.toString("hex");
        resolve(`scrypt:${saltHex}:${keyHex}`);
      }
    });
  });
}

async function migrateAdminPassword() {
  console.log("🔐 Migrating admin password from bcrypt to scrypt...\n");

  // Get admin user
  const { data: admin, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("email", "admin@abia.gov.ng")
    .single();

  if (fetchError || !admin) {
    console.error("❌ Admin user not found!");
    process.exit(1);
  }

  console.log(`Found admin user: ${admin.email}`);
  console.log(`Current password hash: ${admin.password?.substring(0, 20)}...`);

  // Check if already migrated
  if (admin.password?.startsWith("scrypt:")) {
    console.log("✅ Password already migrated to scrypt!");
    return;
  }

  // Ask for new password
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const newPassword = await new Promise<string>((resolve) => {
    rl.question("Enter new password for admin (or press Enter to use 'Admin@123!'): ", (answer) => {
      resolve(answer || "Admin@123!");
    });
  });

  rl.close();

  // Hash with scrypt
  console.log("\n🔄 Hashing password with scrypt...");
  const scryptHash = await hashPasswordScrypt(newPassword);

  // Update in database
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: scryptHash, updated_at: new Date().toISOString() })
    .eq("id", admin.id);

  if (updateError) {
    console.error("❌ Failed to update password:", updateError);
    process.exit(1);
  }

  console.log("✅ Admin password migrated successfully!");
  console.log(`   New password: ${newPassword}`);
  console.log(`   New hash format: scrypt:...`);
}

migrateAdminPassword().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

