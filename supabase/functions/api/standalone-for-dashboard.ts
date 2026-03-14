// Supabase Edge Function - API Handler (Standalone Version for Dashboard)
// Copy this ENTIRE file into Supabase Dashboard Edge Functions editor

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers (inline - no external file needed)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

// JWT and bcrypt imports for Deno
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// Configuration
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-super-secure-jwt-secret-key-change-in-production";
const JWT_EXPIRES_IN = Deno.env.get("JWT_EXPIRES_IN") || "7d";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://lyxwslsckkbcpepxigdx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Allowed origins for CORS
const allowedOrigins = [
  "https://abt-abia-tracker.web.app",
  "https://abt-abia-tracker.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper: Verify JWT token
async function verifyToken(authHeader: string | null): Promise<any> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization token required");
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    return payload;
  } catch (error: any) {
    if (error.message && error.message.includes("expired")) {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}

// Helper: Create JWT token
async function createToken(payload: any): Promise<string> {
  const exp = getNumericDate(7 * 24 * 60 * 60); // 7 days
  return await create({ alg: "HS256", typ: "JWT", exp }, payload, JWT_SECRET);
}

// Helper: JSON response
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Helper: Error response
function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, message }, status);
}

// Helper: Success response
function successResponse(data: any, message?: string, status = 200): Response {
  return jsonResponse({ success: true, message, data }, status);
}

// Route handlers
async function handleAuth(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "");

  if (req.method === "POST" && path === "/login") {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Get user from Supabase
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error || !users) {
      return errorResponse("Invalid email or password", 401);
    }

    // Verify password
    const isValidPassword = await compare(password, users.password);
    if (!isValidPassword) {
      return errorResponse("Invalid email or password", 401);
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", users.id);

    // Generate JWT token
    const token = await createToken({
      userId: users.id,
      email: users.email,
      role: users.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = users;

    return successResponse({ user: userWithoutPassword, token }, "Login successful");
  }

  if (req.method === "GET" && path === "/profile") {
    try {
      const authHeader = req.headers.get("authorization");
      const decoded = await verifyToken(authHeader);

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", decoded.userId)
        .single();

      if (error || !user) {
        return errorResponse("User not found", 404);
      }

      const { password: _, ...userWithoutPassword } = user;
      return successResponse({ user: userWithoutPassword });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  if (req.method === "POST" && path === "/register") {
    const { email, password, firstName, lastName, role, phone, department, jobTitle } = await req.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return errorResponse("Email, password, firstName, lastName, and role are required", 400);
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return errorResponse("User with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hash(password);

    // Create user
    const userId = `${role.toLowerCase()}-${Date.now()}`;
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        is_active: true,
        department,
        job_title: jobTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return errorResponse("Failed to create user", 500);
    }

    const { password: _, ...userWithoutPassword } = user;
    return successResponse({ user: userWithoutPassword }, "User registered successfully", 201);
  }

  if (req.method === "PUT" && path === "/profile") {
    try {
      const authHeader = req.headers.get("authorization");
      const decoded = await verifyToken(authHeader);

      const { firstName, lastName, phone, department, jobTitle, address, city, state, profileImage, preferences } = await req.json();

      const updateData: any = { updated_at: new Date().toISOString() };
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (phone) updateData.phone = phone;
      if (department) updateData.department = department;
      if (jobTitle) updateData.job_title = jobTitle;
      if (address) updateData.address = address;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (profileImage) updateData.profile_image = profileImage;
      if (preferences) updateData.preferences = preferences;

      const { data: user, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", decoded.userId)
        .select()
        .single();

      if (error) {
        return errorResponse("Failed to update profile", 500);
      }

      const { password: _, ...userWithoutPassword } = user;
      return successResponse({ user: userWithoutPassword }, "Profile updated successfully");
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  if (req.method === "PUT" && path === "/change-password") {
    try {
      const authHeader = req.headers.get("authorization");
      const decoded = await verifyToken(authHeader);

      const { currentPassword, newPassword } = await req.json();

      if (!currentPassword || !newPassword) {
        return errorResponse("Current password and new password are required", 400);
      }

      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("password")
        .eq("id", decoded.userId)
        .single();

      if (fetchError || !user) {
        return errorResponse("User not found", 404);
      }

      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return errorResponse("Current password is incorrect", 401);
      }

      const hashedNewPassword = await hash(newPassword);
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedNewPassword, updated_at: new Date().toISOString() })
        .eq("id", decoded.userId);

      if (updateError) {
        return errorResponse("Failed to update password", 500);
      }

      return successResponse(null, "Password changed successfully");
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  if (req.method === "POST" && path === "/logout") {
    return successResponse(null, "Logged out successfully");
  }

  return errorResponse("Route not found", 404);
}

// Health check
async function handleHealth(): Promise<Response> {
  return successResponse({ message: "API ready" });
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Health check
    if (path === "/health" || path === "/api/health") {
      return await handleHealth();
    }

    // Auth routes
    if (path.startsWith("/api/auth")) {
      return await handleAuth(req);
    }

    // For other routes, return 404 for now
    // You can add more route handlers here
    return errorResponse("Route not found", 404);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
});

