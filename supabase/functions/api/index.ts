// Supabase Edge Function - API Handler
// Migrated from Firebase Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// JWT imports for Deno - using djwt v3 which has better Edge Function support
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
// Use Deno's built-in Web Crypto API for password hashing (no Worker dependency)
// Note: crypto is a global in Deno, no need to import
import { encode as hexEncode } from "https://deno.land/std@0.208.0/encoding/hex.ts";

// Configuration
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-super-secure-jwt-secret-key-change-in-production";
const JWT_EXPIRES_IN = Deno.env.get("JWT_EXPIRES_IN") || "7d";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://lyxwslsckkbcpepxigdx.supabase.co";

// Get service role key - try multiple environment variable names
const SUPABASE_SERVICE_ROLE_KEY = 
  Deno.env.get("SERVICE_ROLE_KEY") || // Custom name (can be set via CLI)
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || // Standard name (dashboard only)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eHdzbHNja2tiY3BlcHhpZ2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg3NzkyOCwiZXhwIjoyMDgwNDUzOTI4fQ.EPsVWjx4nwSzlbxnHWquB4tx7I-ohc2YMIZfFeFoOaw"; // Hardcoded fallback

// Allowed origins for CORS
const allowedOrigins = [
  "https://abt-abia-tracker.web.app",
  "https://abt-abia-tracker.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Password hashing utilities using Deno's Web Crypto API (PBKDF2)
// PBKDF2 is available in Deno Edge Functions and doesn't require external dependencies
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const key = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    512 // 64 bytes = 512 bits
  );
  
  const saltHex = hexEncode(salt);
  const keyHex = hexEncode(new Uint8Array(key));
  return `pbkdf2:${saltHex}:${keyHex}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!password || !hash) {
      console.warn("Password verification: missing password or hash");
      return false;
    }

    // Check if it's a PBKDF2 hash (new format)
    if (hash.startsWith("pbkdf2:")) {
      const parts = hash.split(":");
      if (parts.length !== 3) {
        console.warn("Invalid PBKDF2 hash format");
        return false;
      }
      
      const [, saltHex, keyHex] = parts;
      if (!saltHex || !keyHex) {
        console.warn("Invalid PBKDF2 hash: missing salt or key");
        return false;
      }

      try {
        const salt = new Uint8Array(
          saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
        );
        const storedKey = new Uint8Array(
          keyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
        );
        
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
          "raw",
          encoder.encode(password),
          "PBKDF2",
          false,
          ["deriveBits"]
        );
        
        const computedKey = await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
          },
          passwordKey,
          512 // 64 bytes = 512 bits
        );
        
        const computedKeyArray = new Uint8Array(computedKey);
        
        // Constant-time comparison
        if (storedKey.length !== computedKeyArray.length) {
          return false;
        }
        let result = 0;
        for (let i = 0; i < storedKey.length; i++) {
          result |= storedKey[i] ^ computedKeyArray[i];
        }
        return result === 0;
      } catch (cryptoError: any) {
        console.error("PBKDF2 verification crypto error:", cryptoError);
        return false;
      }
    }
    
    // Check if it's an old scrypt hash (for backward compatibility during migration)
    if (hash.startsWith("scrypt:")) {
      console.warn("Scrypt hash detected - password needs to be reset or re-hashed");
      return false;
    }
    
    // For backward compatibility with bcrypt hashes
    // BCrypt hashes start with $2a$, $2b$, or $2y$
    // Since we can't verify bcrypt in Edge Functions (Worker issue),
    // we'll need users to reset passwords or migrate
    if (hash.startsWith("$2")) {
      console.warn("BCrypt hash detected - password verification unavailable in Edge Functions");
      return false;
    }
    
    console.warn("Unknown hash format:", hash.substring(0, 20) + "...");
    return false;
  } catch (error: any) {
    console.error("Password verification error:", error);
    const errorMsg = error instanceof Error ? error.message : (error?.message || String(error) || "Unknown error");
    console.error("Error details:", { error, errorMsg, type: typeof error });
    return false;
  }
}

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
  console.log(`[DEBUG] verifyToken - Token length: ${token.length}, Preview: ${token.substring(0, 30)}...`);
  
  try {
    // Create the key using Web Crypto API (same as in createToken)
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    console.log(`[DEBUG] verifyToken - Key imported successfully`);
    
    // djwt v3 verify function signature: verify(token, key)
    // The verify function should automatically detect the algorithm from the token header
    const payload = await verify(token, key);
    
    console.log(`[DEBUG] verifyToken - Token verified, payload:`, { 
      userId: payload.userId, 
      email: payload.email, 
      role: payload.role,
      exp: payload.exp 
    });
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error(`[DEBUG] verifyToken - Token expired. Exp: ${payload.exp}, Now: ${Math.floor(Date.now() / 1000)}`);
      throw new Error("Token expired");
    }
    
    // Return the payload with expected fields
    return {
      userId: payload.userId || payload.sub || payload.id,
      email: payload.email,
      role: payload.role,
      ...payload
    };
  } catch (error: any) {
    console.error("Token verification error:", error);
    console.error("Error details:", { 
      message: error?.message, 
      name: error?.name,
      stack: error?.stack?.substring(0, 200)
    });
    
    if (error.message && (error.message.includes("expired") || error.message.includes("Expired"))) {
      throw new Error("Token expired");
    }
    if (error.message && error.message.includes("Invalid")) {
      throw new Error("Invalid token");
    }
    throw new Error(`Token verification failed: ${error?.message || String(error)}`);
  }
}

// Helper: Create JWT token
async function createToken(payload: any): Promise<string> {
  const exp = getNumericDate(7 * 24 * 60 * 60); // 7 days
  // In djwt v3, we use Web Crypto API keys
  try {
    // Create the key using Web Crypto API
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const header = { alg: "HS256", typ: "JWT" };
    const tokenPayload = { ...payload, exp };
    
    // djwt v3 create function signature: create(header, payload, key)
    return await create(header, tokenPayload, key);
  } catch (error: any) {
    console.error("JWT creation error:", error);
    console.error("Error details:", { message: error?.message, stack: error?.stack });
    throw new Error(`Failed to create token: ${error?.message || String(error)}`);
  }
}

// Helper: JSON response
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true"
    },
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

// Helper: Normalize path (remove /functions/v1 prefix)
function normalizePath(pathname: string): string {
  if (pathname.startsWith("/functions/v1")) {
    return pathname.replace("/functions/v1", "");
  }
  return pathname;
}

// Route handlers
async function handleAuth(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // Normalize path - remove /functions/v1 if present, then remove /api/auth
  let path = normalizePath(url.pathname);
  const originalPath = path;
  // Remove /api/auth prefix, handling both /api/auth and /api/auth/
  path = path.replace(/^\/api\/auth\/?/, "") || "/";
  // Ensure path starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  console.log(`[DEBUG] handleAuth - original: ${originalPath}, normalized: ${path}, method: ${req.method}`);

  if (req.method === "POST" && (path === "/login" || path === "login")) {
    try {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return errorResponse("Email and password are required", 400);
      }

      // Get user from Supabase
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Database error:", error);
        return errorResponse("Database error", 500);
      }

      if (!user) {
        return errorResponse("Invalid email or password", 401);
      }

      // Verify password using PBKDF2
      console.log(`[DEBUG] Verifying password for user: ${user.email}, hash format: ${user.password?.substring(0, 20) || 'none'}...`);
      let isValidPassword = false;
      try {
        isValidPassword = await verifyPassword(password, user.password || "");
        console.log(`[DEBUG] Password verification result: ${isValidPassword}`);
      } catch (verifyError: any) {
        console.error("[DEBUG] Password verification threw error:", verifyError);
        const errorMsg = verifyError instanceof Error ? verifyError.message : (verifyError?.message || String(verifyError) || "Password verification failed");
        return errorResponse(`Password verification error: ${errorMsg}`, 500);
      }
      
      if (!isValidPassword) {
        // If it's a bcrypt or scrypt hash, provide helpful error message
        if (user.password?.startsWith("$2") || user.password?.startsWith("scrypt:")) {
          return errorResponse(
            "Password verification unavailable. Please reset your password or contact support.",
            401
          );
        }
        return errorResponse("Invalid email or password", 401);
      }

      // Update last login (don't await - fire and forget)
      supabase
        .from("users")
        .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .then(() => {}, (err) => console.error("Update error:", err));

      // Generate JWT token
      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return successResponse({ user: userWithoutPassword, token }, "Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : (error?.message || String(error) || "Login failed");
      return errorResponse(errorMessage, 500);
    }
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

    // Hash password using scrypt
    const hashedPassword = await hashPassword(password);

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

      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return errorResponse("Current password is incorrect", 401);
      }

      const hashedNewPassword = await hashPassword(newPassword);
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

  // If no route matched in handleAuth, return 404 with path info
  console.log(`[DEBUG] handleAuth - No route matched. Method: ${req.method}, Path: ${path}, Original: ${originalPath}`);
  return jsonResponse({ error: "Not Found", path: originalPath }, 404);
}

// Projects handlers
async function handleProjects(req: Request, user: any): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = normalizePath(url.pathname).replace("/api/projects", "").split("/").filter(p => p);
  const path = pathParts[0] || "";
  const id = pathParts[1];

  // GET /api/projects - List projects
  if (req.method === "GET" && !path && !id) {
    try {
      const params = url.searchParams;
      const status = params.get("status");
      const category = params.get("category");
      const lga = params.get("lga");
      const priority = params.get("priority");
      const contractorId = params.get("contractorId");
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "20");
      const search = params.get("search");

      let query = supabase.from("projects").select("*");

      if (status) query = query.eq("status", status);
      if (category) query = query.eq("category", category);
      if (priority) query = query.eq("priority", priority);
      if (contractorId) query = query.eq("contractor_id", contractorId);

      const { data: projects, error } = await query;

      if (error) throw error;

      let filteredProjects = projects || [];

      // Filter by LGA (can be array or string)
      if (lga) {
        const lgaFilter = Array.isArray(lga) ? lga : [lga];
        filteredProjects = filteredProjects.filter((p: any) => {
          const projectLga = Array.isArray(p.lga) ? p.lga : [p.lga];
          return projectLga.some((l: string) => lgaFilter.includes(l));
        });
      }

      // Search filter
      if (search) {
        const searchTerm = search.toLowerCase();
        filteredProjects = filteredProjects.filter((p: any) => {
          const lgaText = Array.isArray(p.lga) ? p.lga.join(" ") : p.lga;
          return p.name?.toLowerCase().includes(searchTerm) ||
                 p.description?.toLowerCase().includes(searchTerm) ||
                 lgaText?.toLowerCase().includes(searchTerm);
        });
      }

      const total = filteredProjects.length;
      const offset = (page - 1) * limit;
      const paginatedProjects = filteredProjects.slice(offset, offset + limit);

      return successResponse({
        projects: paginatedProjects,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get projects", 500);
    }
  }

  // GET /api/projects/:id - Get project by ID
  if (req.method === "GET" && path === "" && id) {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !project) {
        return errorResponse("Project not found", 404);
      }

      // Get contractor
      let contractor = null;
      if (project.contractor_id) {
        const { data: contractorData } = await supabase
          .from("contractor_profiles")
          .select("*")
          .eq("id", project.contractor_id)
          .single();
        contractor = contractorData;
      }

      // Get milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", id)
        .order("order", { ascending: true });

      // Get recent submissions
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("project_id", id)
        .order("submitted_at", { ascending: false })
        .limit(5);

      return successResponse({
        project: { ...project, contractor, milestones: milestones || [], recentSubmissions: submissions || [] }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get project", 500);
    }
  }

  // POST /api/projects - Create project (Admin only)
  if (req.method === "POST" && !path) {
    try {
      if (user.role !== "GOVERNMENT_ADMIN") {
        return errorResponse("Admin access required", 403);
      }

      const body = await req.json();
      const { name, description, category, lga, priority = "MEDIUM", budget, allocatedBudget, fundingSource, startDate, expectedEndDate, beneficiaries, contractorId, projectManagerId, location } = body;

      if (!name || !description || !category || !lga || !budget || !fundingSource || !startDate || !expectedEndDate) {
        return errorResponse("Required fields: name, description, category, lga, budget, fundingSource, startDate, expectedEndDate", 400);
      }

      const projectId = `project-${Date.now()}`;
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          id: projectId,
          name,
          description,
          category,
          lga,
          priority,
          status: "NOT_STARTED",
          progress: 0,
          budget: parseFloat(budget),
          allocated_budget: allocatedBudget ? parseFloat(allocatedBudget) : parseFloat(budget),
          spent_budget: 0,
          funding_source: fundingSource,
          start_date: startDate,
          expected_end_date: expectedEndDate,
          beneficiaries,
          contractor_id: contractorId,
          project_manager_id: projectManagerId,
          location,
          is_public: true,
          quality_score: 0,
          safety_compliance: "Not Started",
          weather_delay: 0,
          safety_incidents: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return successResponse({ project }, "Project created successfully", 201);
    } catch (error: any) {
      return errorResponse(error.message || "Failed to create project", 500);
    }
  }

  // PUT /api/projects/:id - Update project
  if (req.method === "PUT" && path === "" && id) {
    try {
      const { data: existingProject } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!existingProject) {
        return errorResponse("Project not found", 404);
      }

      const isAdmin = user.role === "GOVERNMENT_ADMIN";
      const isProjectManager = existingProject.project_manager_id === user.userId;
      const isContractor = existingProject.contractor_id && user.role === "CONTRACTOR";

      if (!isAdmin && !isProjectManager && !isContractor) {
        return errorResponse("Not authorized to update this project", 403);
      }

      const updateData = await req.json();
      delete updateData.id;
      delete updateData.created_at;
      updateData.updated_at = new Date().toISOString();

      // Convert camelCase to snake_case
      const snakeCaseData: any = {};
      Object.keys(updateData).forEach(key => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        snakeCaseData[snakeKey] = updateData[key];
      });

      const { data: project, error } = await supabase
        .from("projects")
        .update(snakeCaseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return successResponse({ project }, "Project updated successfully");
    } catch (error: any) {
      return errorResponse(error.message || "Failed to update project", 500);
    }
  }

  // DELETE /api/projects/:id - Delete project (Admin only)
  if (req.method === "DELETE" && path === "" && id) {
    try {
      if (user.role !== "GOVERNMENT_ADMIN") {
        return errorResponse("Admin access required", 403);
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return successResponse(null, "Project deleted successfully");
    } catch (error: any) {
      return errorResponse(error.message || "Failed to delete project", 500);
    }
  }

  // GET /api/projects/stats - Get project statistics
  if (req.method === "GET" && path === "stats") {
    try {
      const { data: projects, error } = await supabase.from("projects").select("*");
      if (error) throw error;

      const stats = {
        total: projects?.length || 0,
        byStatus: {
          NOT_STARTED: projects?.filter((p: any) => p.status === "NOT_STARTED").length || 0,
          IN_PROGRESS: projects?.filter((p: any) => p.status === "IN_PROGRESS").length || 0,
          NEAR_COMPLETION: projects?.filter((p: any) => p.status === "NEAR_COMPLETION").length || 0,
          COMPLETED: projects?.filter((p: any) => p.status === "COMPLETED").length || 0,
          DELAYED: projects?.filter((p: any) => p.status === "DELAYED").length || 0,
          ON_HOLD: projects?.filter((p: any) => p.status === "ON_HOLD").length || 0,
          CANCELLED: projects?.filter((p: any) => p.status === "CANCELLED").length || 0,
        },
        totalBudget: projects?.reduce((sum: number, p: any) => sum + (p.allocated_budget || p.budget || 0), 0) || 0,
        averageProgress: projects && projects.length > 0
          ? projects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projects.length
          : 0
      };

      return successResponse({ stats });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get project statistics", 500);
    }
  }

  return errorResponse("Route not found", 404);
}

// Contractors handlers
async function handleContractors(req: Request, user: any): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = normalizePath(url.pathname).replace("/api/contractors", "").split("/").filter(p => p);
  const path = pathParts[0] || "";
  const id = pathParts[1];

  // GET /api/contractors - List contractors
  if (req.method === "GET" && !path && !id) {
    try {
      const params = url.searchParams;
      const verified = params.get("verified");
      const certified = params.get("certified");
      const specialization = params.get("specialization");
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "20");
      const search = params.get("search");

      let query = supabase.from("contractor_profiles").select("*");

      if (verified !== null) query = query.eq("is_verified", verified === "true");
      if (certified !== null) query = query.eq("is_certified", certified === "true");

      const { data: contractors, error } = await query;
      if (error) throw error;

      let filtered = contractors || [];

      if (specialization) {
        filtered = filtered.filter((c: any) => 
          Array.isArray(c.specialization) && c.specialization.includes(specialization)
        );
      }

      if (search) {
        const searchTerm = search.toLowerCase();
        filtered = filtered.filter((c: any) =>
          c.company_name?.toLowerCase().includes(searchTerm) ||
          c.contact_person?.toLowerCase().includes(searchTerm) ||
          c.company_email?.toLowerCase().includes(searchTerm)
        );
      }

      // Get user info for each contractor
      const contractorsWithUsers = await Promise.all(
        filtered.map(async (contractor: any) => {
          const { data: userData } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, phone, is_active")
            .eq("id", contractor.user_id)
            .single();
          return { ...contractor, user: userData };
        })
      );

      const total = contractorsWithUsers.length;
      const offset = (page - 1) * limit;
      const paginated = contractorsWithUsers.slice(offset, offset + limit);

      return successResponse({
        contractors: paginated,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get contractors", 500);
    }
  }

  // GET /api/contractors/:id - Get contractor by ID
  if (req.method === "GET" && path === "" && id) {
    try {
      const { data: contractor, error } = await supabase
        .from("contractor_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !contractor) {
        return errorResponse("Contractor not found", 404);
      }

      // Get user info
      const { data: userData } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, phone, is_active")
        .eq("id", contractor.user_id)
        .single();

      // Get projects
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("contractor_id", id);

      // Get submissions
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("contractor_id", id)
        .order("submitted_at", { ascending: false })
        .limit(10);

      return successResponse({
        contractor: { ...contractor, user: userData, projects: projects || [], recentSubmissions: submissions || [] }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get contractor", 500);
    }
  }

  // POST /api/contractors - Create contractor (Admin only)
  if (req.method === "POST" && !path) {
    try {
      if (user.role !== "GOVERNMENT_ADMIN") {
        return errorResponse("Admin access required", 403);
      }

      const body = await req.json();
      const { userId, companyName, registrationNo, contactPerson, companyEmail, companyPhone, companyAddress, yearsExperience, specialization } = body;

      if (!userId || !companyName || !registrationNo || !contactPerson || !companyEmail || !companyPhone || !companyAddress) {
        return errorResponse("Required fields: userId, companyName, registrationNo, contactPerson, companyEmail, companyPhone, companyAddress", 400);
      }

      // Check if user exists and is contractor
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!userData || userData.role !== "CONTRACTOR") {
        return errorResponse("User must have contractor role", 400);
      }

      // Check if profile exists
      const { data: existing } = await supabase
        .from("contractor_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        return errorResponse("Contractor profile already exists", 409);
      }

      const contractorId = `contractor-${Date.now()}`;
      const { data: contractor, error } = await supabase
        .from("contractor_profiles")
        .insert({
          id: contractorId,
          user_id: userId,
          company_name: companyName,
          registration_no: registrationNo,
          contact_person: contactPerson,
          company_email: companyEmail,
          company_phone: companyPhone,
          company_address: companyAddress,
          rating: 0,
          is_verified: false,
          is_certified: false,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          specialization: specialization || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return successResponse({ contractor }, "Contractor profile created successfully", 201);
    } catch (error: any) {
      return errorResponse(error.message || "Failed to create contractor", 500);
    }
  }

  // PUT /api/contractors/:id - Update contractor
  if (req.method === "PUT" && path === "" && id) {
    try {
      const { data: contractor } = await supabase
        .from("contractor_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!contractor) {
        return errorResponse("Contractor not found", 404);
      }

      const isAdmin = user.role === "GOVERNMENT_ADMIN";
      const isOwner = contractor.user_id === user.userId;

      if (!isAdmin && !isOwner) {
        return errorResponse("Not authorized", 403);
      }

      const updateData = await req.json();
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.created_at;
      updateData.updated_at = new Date().toISOString();

      const snakeCaseData: any = {};
      Object.keys(updateData).forEach(key => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        snakeCaseData[snakeKey] = updateData[key];
      });

      const { data: updated, error } = await supabase
        .from("contractor_profiles")
        .update(snakeCaseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return successResponse({ contractor: updated }, "Contractor updated successfully");
    } catch (error: any) {
      return errorResponse(error.message || "Failed to update contractor", 500);
    }
  }

  return errorResponse("Route not found", 404);
}

// Submissions handlers
async function handleSubmissions(req: Request, user: any): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = normalizePath(url.pathname).replace("/api/submissions", "").split("/").filter(p => p);
  const path = pathParts[0] || "";
  const id = pathParts[1];

  // GET /api/submissions - List submissions
  if (req.method === "GET" && !path && !id) {
    try {
      const params = url.searchParams;
      const projectId = params.get("projectId");
      const contractorId = params.get("contractorId");
      const status = params.get("status");
      const type = params.get("type");
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "20");

      let query = supabase.from("submissions").select("*");

      if (projectId) query = query.eq("project_id", projectId);
      if (contractorId) query = query.eq("contractor_id", contractorId);
      if (status) query = query.eq("status", status);
      if (type) query = query.eq("type", type);

      query = query.order("submitted_at", { ascending: false });

      const { data: submissions, error } = await query;
      if (error) throw error;

      // Get related data
      const submissionsWithDetails = await Promise.all(
        (submissions || []).map(async (sub: any) => {
          const [project, contractor, submitter] = await Promise.all([
            supabase.from("projects").select("id, name, lga").eq("id", sub.project_id).single(),
            supabase.from("contractor_profiles").select("id, company_name").eq("id", sub.contractor_id).single(),
            supabase.from("users").select("id, first_name, last_name").eq("id", sub.submitted_by).single()
          ]);

          return {
            ...sub,
            project: project.data ? { id: project.data.id, name: project.data.name, lga: project.data.lga } : null,
            contractor: contractor.data ? { id: contractor.data.id, companyName: contractor.data.company_name } : null,
            submitter: submitter.data ? { id: submitter.data.id, firstName: submitter.data.first_name, lastName: submitter.data.last_name } : null
          };
        })
      );

      const total = submissionsWithDetails.length;
      const offset = (page - 1) * limit;
      const paginated = submissionsWithDetails.slice(offset, offset + limit);

      return successResponse({
        submissions: paginated,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get submissions", 500);
    }
  }

  // GET /api/submissions/:id - Get submission by ID
  if (req.method === "GET" && path === "" && id) {
    try {
      const { data: submission, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !submission) {
        return errorResponse("Submission not found", 404);
      }

      // Get related data
      const [project, contractor, submitter, milestone, documents, approvals] = await Promise.all([
        supabase.from("projects").select("*").eq("id", submission.project_id).single(),
        supabase.from("contractor_profiles").select("*").eq("id", submission.contractor_id).single(),
        supabase.from("users").select("*").eq("id", submission.submitted_by).single(),
        submission.milestone_id ? supabase.from("milestones").select("*").eq("id", submission.milestone_id).single() : Promise.resolve({ data: null }),
        supabase.from("documents").select("*").eq("submission_id", id),
        supabase.from("approvals").select("*").eq("submission_id", id).order("created_at", { ascending: false })
      ]);

      return successResponse({
        submission: {
          ...submission,
          project: project.data,
          contractor: contractor.data,
          submitter: submitter.data,
          milestone: milestone.data,
          documents: documents.data || [],
          approvals: approvals.data || []
        }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get submission", 500);
    }
  }

  // POST /api/submissions - Create submission (Contractor only)
  if (req.method === "POST" && !path) {
    try {
      if (user.role !== "CONTRACTOR") {
        return errorResponse("Only contractors can create submissions", 403);
      }

      const body = await req.json();
      const { projectId, milestoneId, type, title, description, progress, estimatedValue, priority = "MEDIUM", qualityScore, safetyCompliance, weatherImpact, dueDate } = body;

      if (!projectId || !type || !title || !description) {
        return errorResponse("Required fields: projectId, type, title, description", 400);
      }

      // Check project exists and contractor is assigned
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (!project || project.contractor_id !== user.userId) {
        return errorResponse("Not authorized to submit for this project", 403);
      }

      const submissionId = `submission-${Date.now()}`;
      const { data: submission, error } = await supabase
        .from("submissions")
        .insert({
          id: submissionId,
          project_id: projectId,
          milestone_id: milestoneId || null,
          contractor_id: user.userId,
          submitted_by: user.userId,
          type,
          title,
          description,
          progress: progress ? parseInt(progress) : null,
          estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
          priority,
          status: "PENDING",
          quality_score: qualityScore ? parseFloat(qualityScore) : null,
          safety_compliance: safetyCompliance,
          weather_impact: weatherImpact,
          media_count: 0,
          due_date: dueDate || null,
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return successResponse({ submission }, "Submission created successfully", 201);
    } catch (error: any) {
      return errorResponse(error.message || "Failed to create submission", 500);
    }
  }

  // PUT /api/submissions/:id - Update submission
  if (req.method === "PUT" && path === "" && id) {
    try {
      const { data: submission } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (!submission) {
        return errorResponse("Submission not found", 404);
      }

      const isAdmin = user.role === "GOVERNMENT_ADMIN";
      const isMEOfficer = user.role === "ME_OFFICER";
      const isOwner = submission.contractor_id === user.userId;

      if (!isAdmin && !isMEOfficer && !isOwner) {
        return errorResponse("Not authorized", 403);
      }

      // Contractors can only update pending submissions
      if (isOwner && submission.status !== "PENDING") {
        return errorResponse("Can only update pending submissions", 403);
      }

      const updateData = await req.json();
      delete updateData.id;
      delete updateData.project_id;
      delete updateData.contractor_id;
      delete updateData.submitted_by;
      delete updateData.created_at;
      updateData.updated_at = new Date().toISOString();

      const snakeCaseData: any = {};
      Object.keys(updateData).forEach(key => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        snakeCaseData[snakeKey] = updateData[key];
      });

      const { data: updated, error } = await supabase
        .from("submissions")
        .update(snakeCaseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return successResponse({ submission: updated }, "Submission updated successfully");
    } catch (error: any) {
      return errorResponse(error.message || "Failed to update submission", 500);
    }
  }

  // PUT /api/submissions/:id/review - Review submission (M&E Officer)
  if (req.method === "PUT" && path === "review" && id) {
    try {
      if (user.role !== "ME_OFFICER" && user.role !== "GOVERNMENT_ADMIN") {
        return errorResponse("M&E Officer access required", 403);
      }

      const body = await req.json();
      const { action, comments, qualityScore, safetyCompliance } = body;

      if (!action) {
        return errorResponse("Action is required", 400);
      }

      const statusMap: any = {
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        FLAGGED: "FLAGGED"
      };

      const updateData: any = {
        status: statusMap[action] || "REQUIRES_CLARIFICATION",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.userId,
        review_comments: comments,
        updated_at: new Date().toISOString()
      };

      if (qualityScore) updateData.quality_score = parseFloat(qualityScore);
      if (safetyCompliance) updateData.safety_compliance = safetyCompliance;

      const { data: submission, error } = await supabase
        .from("submissions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Create approval record
      await supabase.from("approvals").insert({
        id: `approval-${Date.now()}`,
        submission_id: id,
        reviewer_id: user.userId,
        action,
        comments,
        created_at: new Date().toISOString()
      });

      return successResponse({ submission }, "Submission reviewed successfully");
    } catch (error: any) {
      return errorResponse(error.message || "Failed to review submission", 500);
    }
  }

  // DELETE /api/submissions/:id - Delete submission
  if (req.method === "DELETE" && path === "" && id) {
    try {
      const { data: submission } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (!submission) {
        return errorResponse("Submission not found", 404);
      }

      const isAdmin = user.role === "GOVERNMENT_ADMIN";
      const isOwner = submission.contractor_id === user.userId;

      if (!isAdmin && !isOwner) {
        return errorResponse("Not authorized", 403);
      }

      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return successResponse(null, "Submission deleted successfully");
    } catch (error: any) {
      return errorResponse(error.message || "Failed to delete submission", 500);
    }
  }

  return errorResponse("Route not found", 404);
}

// Dashboard handlers
async function handleDashboard(req: Request, user: any): Promise<Response> {
  const url = new URL(req.url);
  const path = normalizePath(url.pathname).replace("/api/dashboard", "");

  // GET /api/dashboard/stats
  if (req.method === "GET" && path === "/stats") {
    try {
      const [projects, submissions, contractors] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("submissions").select("*"),
        supabase.from("contractor_profiles").select("*")
      ]);

      const projectsData = projects.data || [];
      const submissionsData = submissions.data || [];
      const contractorsData = contractors.data || [];

      const stats = {
        total: projectsData.length,
        byStatus: {
          NOT_STARTED: projectsData.filter((p: any) => p.status === "NOT_STARTED").length,
          IN_PROGRESS: projectsData.filter((p: any) => p.status === "IN_PROGRESS").length,
          NEAR_COMPLETION: projectsData.filter((p: any) => p.status === "NEAR_COMPLETION").length,
          COMPLETED: projectsData.filter((p: any) => p.status === "COMPLETED").length,
          DELAYED: projectsData.filter((p: any) => p.status === "DELAYED").length,
          ON_HOLD: projectsData.filter((p: any) => p.status === "ON_HOLD").length,
          CANCELLED: projectsData.filter((p: any) => p.status === "CANCELLED").length,
        },
        totalBudget: projectsData.reduce((sum: number, p: any) => sum + (p.allocated_budget || p.budget || 0), 0),
        averageProgress: projectsData.length > 0
          ? projectsData.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projectsData.length
          : 0,
        projects: {
          total: projectsData.length,
          active: projectsData.filter((p: any) => p.status === "IN_PROGRESS").length,
          completed: projectsData.filter((p: any) => p.status === "COMPLETED").length,
          delayed: projectsData.filter((p: any) => p.status === "DELAYED").length,
          notStarted: projectsData.filter((p: any) => p.status === "NOT_STARTED").length
        },
        submissions: {
          total: submissionsData.length,
          pending: submissionsData.filter((s: any) => s.status === "PENDING").length,
          underReview: submissionsData.filter((s: any) => s.status === "UNDER_REVIEW").length,
          approved: submissionsData.filter((s: any) => s.status === "APPROVED").length,
          rejected: submissionsData.filter((s: any) => s.status === "REJECTED").length
        },
        contractors: {
          total: contractorsData.length,
          verified: contractorsData.filter((c: any) => c.is_verified).length,
          certified: contractorsData.filter((c: any) => c.is_certified).length
        },
        budget: {
          totalAllocated: projectsData.reduce((sum: number, p: any) => sum + (p.allocated_budget || p.budget || 0), 0),
          totalSpent: projectsData.reduce((sum: number, p: any) => sum + (p.spent_budget || 0), 0),
          remaining: projectsData.reduce((sum: number, p: any) => sum + (p.allocated_budget || p.budget || 0) - (p.spent_budget || 0), 0)
        }
      };

      return successResponse({ stats });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get dashboard statistics", 500);
    }
  }

  // GET /api/dashboard/project-status-chart
  if (req.method === "GET" && path === "/project-status-chart") {
    try {
      const { data: projects } = await supabase.from("projects").select("*");
      const projectsData = projects || [];

      const statusData: any = {};
      const categoryData: any = {};

      projectsData.forEach((p: any) => {
        statusData[p.status] = (statusData[p.status] || 0) + 1;
        categoryData[p.category] = (categoryData[p.category] || 0) + 1;
      });

      return successResponse({
        type: url.searchParams.get("type") || "bar",
        statusData,
        categoryData
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get chart data", 500);
    }
  }

  // GET /api/dashboard/budget-analysis
  if (req.method === "GET" && path === "/budget-analysis") {
    try {
      const { data: projects } = await supabase.from("projects").select("*");
      const projectsData = projects || [];

      const budgetAnalysis = {
        totalBudget: projectsData.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
        allocatedBudget: projectsData.reduce((sum: number, p: any) => sum + (p.allocated_budget || p.budget || 0), 0),
        spentBudget: projectsData.reduce((sum: number, p: any) => sum + (p.spent_budget || 0), 0),
        remainingBudget: projectsData.reduce((sum: number, p: any) => sum + (p.allocated_budget || p.budget || 0) - (p.spent_budget || 0), 0),
        byCategory: Array.from(new Set(projectsData.map((p: any) => p.category))).map((category: string) => {
          const categoryProjects = projectsData.filter((p: any) => p.category === category);
          return {
            category,
            totalBudget: categoryProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
            spentBudget: categoryProjects.reduce((sum: number, p: any) => sum + (p.spent_budget || 0), 0),
            projectCount: categoryProjects.length
          };
        }),
        byStatus: Array.from(new Set(projectsData.map((p: any) => p.status))).map((status: string) => {
          const statusProjects = projectsData.filter((p: any) => p.status === status);
          return {
            status,
            totalBudget: statusProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
            spentBudget: statusProjects.reduce((sum: number, p: any) => sum + (p.spent_budget || 0), 0),
            projectCount: statusProjects.length
          };
        })
      };

      return successResponse({ budgetAnalysis });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get budget analysis", 500);
    }
  }

  // GET /api/dashboard/lga-performance
  if (req.method === "GET" && path === "/lga-performance") {
    try {
      const { data: projects } = await supabase.from("projects").select("*");
      const projectsData = projects || [];

      const lgaData: any = {};
      projectsData.forEach((project: any) => {
        const lgas = Array.isArray(project.lga) ? project.lga : [project.lga];
        lgas.forEach((lga: string) => {
          if (!lgaData[lga]) {
            lgaData[lga] = {
              lga,
              totalProjects: 0,
              completedProjects: 0,
              activeProjects: 0,
              totalBudget: 0,
              spentBudget: 0,
              averageProgress: 0
            };
          }
          lgaData[lga].totalProjects++;
          lgaData[lga].totalBudget += project.budget || 0;
          lgaData[lga].spentBudget += project.spent_budget || 0;
          if (project.status === "COMPLETED") lgaData[lga].completedProjects++;
          if (project.status === "IN_PROGRESS") lgaData[lga].activeProjects++;
        });
      });

      // Calculate average progress
      Object.keys(lgaData).forEach(lga => {
        const lgaProjects = projectsData.filter((p: any) => {
          const projectLgas = Array.isArray(p.lga) ? p.lga : [p.lga];
          return projectLgas.includes(lga);
        });
        lgaData[lga].averageProgress = lgaProjects.length > 0
          ? lgaProjects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / lgaProjects.length
          : 0;
      });

      const lgaPerformance = Object.values(lgaData).sort((a: any, b: any) => b.completedProjects - a.completedProjects);
      return successResponse({ lgaPerformance });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get LGA performance", 500);
    }
  }

  // GET /api/dashboard/recent-activity
  if (req.method === "GET" && path === "/recent-activity") {
    try {
      const limit = parseInt(url.searchParams.get("limit") || "20");

      const [submissions, projects] = await Promise.all([
        supabase.from("submissions").select("*").order("submitted_at", { ascending: false }).limit(limit),
        supabase.from("projects").select("*").order("updated_at", { ascending: false }).limit(limit)
      ]);

      const activities: any[] = [];

      // Add submission activities
      for (const submission of submissions.data || []) {
        const [project, contractor] = await Promise.all([
          supabase.from("projects").select("id, name").eq("id", submission.project_id).single(),
          supabase.from("contractor_profiles").select("company_name").eq("id", submission.contractor_id).single()
        ]);

        activities.push({
          id: `submission-${submission.id}`,
          type: "submission",
          title: `New ${submission.type?.toLowerCase()} submission`,
          description: `${contractor.data?.company_name || "Contractor"} submitted: ${submission.title}`,
          project: project.data ? { id: project.data.id, name: project.data.name } : null,
          timestamp: submission.submitted_at,
          status: submission.status
        });
      }

      // Add project activities
      for (const project of projects.data || []) {
        activities.push({
          id: `project-${project.id}`,
          type: "project",
          title: "Project updated",
          description: `${project.name} - Status: ${project.status}`,
          project: { id: project.id, name: project.name },
          timestamp: project.updated_at,
          status: project.status
        });
      }

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const recentActivities = activities.slice(0, limit);

      return successResponse({ activities: recentActivities });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get recent activity", 500);
    }
  }

  return errorResponse("Route not found", 404);
}

// Public handlers (no auth required)
async function handlePublic(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = normalizePath(url.pathname).replace("/api/public", "").split("/").filter(p => p);
  const path = pathParts[0] || "";
  const id = pathParts[1];

  // GET /api/public/projects
  if (req.method === "GET" && path === "projects" && !id) {
    try {
      const params = url.searchParams;
      const category = params.get("category");
      const lga = params.get("lga");
      const status = params.get("status");
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "20");
      const search = params.get("search");

      let query = supabase.from("projects").select("*").eq("is_public", true);

      if (status) query = query.eq("status", status);
      if (category) query = query.eq("category", category);

      const { data: projects, error } = await query;
      if (error) throw error;

      let filtered = projects || [];

      // Filter by LGA
      if (lga) {
        const lgaFilter = Array.isArray(lga) ? lga : [lga];
        filtered = filtered.filter((p: any) => {
          const projectLga = Array.isArray(p.lga) ? p.lga : [p.lga];
          return projectLga.some((l: string) => lgaFilter.includes(l));
        });
      }

      // Search filter
      if (search) {
        const searchTerm = search.toLowerCase();
        filtered = filtered.filter((p: any) => {
          const lgaText = Array.isArray(p.lga) ? p.lga.join(" ") : p.lga;
          return p.name?.toLowerCase().includes(searchTerm) ||
                 p.description?.toLowerCase().includes(searchTerm) ||
                 lgaText?.toLowerCase().includes(searchTerm);
        });
      }

      // Get contractors
      const projectsWithContractors = await Promise.all(
        filtered.map(async (project: any) => {
          let contractor = null;
          if (project.contractor_id) {
            const { data: contractorData } = await supabase
              .from("contractor_profiles")
              .select("id, company_name")
              .eq("id", project.contractor_id)
              .single();
            contractor = contractorData;
          }
          return { ...project, contractor };
        })
      );

      const total = projectsWithContractors.length;
      const offset = (page - 1) * limit;
      const paginated = projectsWithContractors.slice(offset, offset + limit);

      return successResponse({
        projects: paginated,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get public projects", 500);
    }
  }

  // GET /api/public/projects/:id
  if (req.method === "GET" && path === "projects" && id) {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !project || !project.is_public) {
        return errorResponse("Project not found", 404);
      }

      // Get contractor
      let contractor = null;
      if (project.contractor_id) {
        const { data: contractorData } = await supabase
          .from("contractor_profiles")
          .select("id, company_name, rating")
          .eq("id", project.contractor_id)
          .single();
        contractor = contractorData;
      }

      // Get milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("id, name, description, due_date, status, progress")
        .eq("project_id", id)
        .order("order", { ascending: true });

      return successResponse({
        project: { ...project, contractor, milestones: milestones || [] }
      });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get project", 500);
    }
  }

  // GET /api/public/stats
  if (req.method === "GET" && path === "stats") {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("is_public", true);

      const projectsData = projects || [];

      const categoryCounts: any = {};
      projectsData.forEach((p: any) => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      });

      const stats = {
        totalProjects: projectsData.length,
        completedProjects: projectsData.filter((p: any) => p.status === "COMPLETED").length,
        activeProjects: projectsData.filter((p: any) => p.status === "IN_PROGRESS").length,
        totalBudget: projectsData.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
        averageProgress: projectsData.length > 0
          ? projectsData.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projectsData.length
          : 0,
        byCategory: categoryCounts
      };

      return successResponse({ stats });
    } catch (error: any) {
      return errorResponse(error.message || "Failed to get public stats", 500);
    }
  }

  return errorResponse("Route not found", 404);
}

// Health check
async function handleHealth(): Promise<Response> {
  return successResponse({ message: "API ready" });
}

// Main handler - wrapped in try-catch to ensure OPTIONS always works
serve(async (req: Request) => {
  // Handle CORS preflight FIRST - before ANY other processing
  // This must be the absolute first thing, even before URL parsing
  // Wrap in try-catch to ensure OPTIONS always returns 200 OK
  if (req.method === "OPTIONS") {
    try {
      // Return 'ok' string as per Supabase docs - ensures proper 200 OK status
      const origin = req.headers.get("origin") || "*";
      const allowedOrigins = [
        "https://abt-abia-tracker.web.app",
        "https://abt-abia-tracker.firebaseapp.com",
        "http://localhost:5173",
        "http://localhost:3000",
      ];
      
      const allowOrigin = origin !== "*" && allowedOrigins.includes(origin) ? origin : "*";
      
      return new Response("ok", { 
        status: 200,
        statusText: "OK",
        headers: {
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
          "Access-Control-Max-Age": "3600",
          "Access-Control-Allow-Credentials": "true",
        }
      });
    } catch (error) {
      // Even if there's an error, return a valid OPTIONS response
      console.error("OPTIONS handler error:", error);
      return new Response("ok", { 
        status: 200,
        statusText: "OK",
        headers: corsHeaders 
      });
    }
  }

  // Now handle the actual request - wrap everything in try-catch
  try {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Remove /functions/v1 prefix if present (Supabase Edge Function path structure)
    if (path.startsWith("/functions/v1")) {
      path = path.replace("/functions/v1", "");
    }
    
    // Debug logging
    console.log(`[DEBUG] Request: ${req.method} ${path} (original: ${url.pathname})`);
    
    // Health check
    if (path === "/health" || path === "/api/health") {
      return await handleHealth();
    }

    // Auth routes (no auth required)
    // Check for /api/auth with or without trailing slash
    if (path.startsWith("/api/auth") || path.startsWith("/api/auth/")) {
      console.log(`[DEBUG] Routing to handleAuth for path: ${path}`);
      return await handleAuth(req);
    }

    // Public routes (no auth required)
    if (path.startsWith("/api/public")) {
      return await handlePublic(req);
    }

    // Protected routes (require auth)
    let user = null;
    try {
      const authHeader = req.headers.get("authorization");
      console.log(`[DEBUG] Verifying token for protected route: ${path}`);
      console.log(`[DEBUG] Auth header present: ${!!authHeader}, starts with Bearer: ${authHeader?.startsWith("Bearer ")}`);
      user = await verifyToken(authHeader);
      console.log(`[DEBUG] Token verified successfully, user: ${user?.email || user?.userId}`);
    } catch (error: any) {
      console.error(`[DEBUG] Token verification failed for ${path}:`, error);
      const errorMsg = error instanceof Error ? error.message : (error?.message || String(error));
      return errorResponse(`Authorization required: ${errorMsg}`, 401);
    }

    // Projects routes
    if (path.startsWith("/api/projects")) {
      return await handleProjects(req, user);
    }

    // Contractors routes
    if (path.startsWith("/api/contractors")) {
      return await handleContractors(req, user);
    }

    // Submissions routes
    if (path.startsWith("/api/submissions")) {
      return await handleSubmissions(req, user);
    }

    // Dashboard routes
    if (path.startsWith("/api/dashboard")) {
      return await handleDashboard(req, user);
    }

    console.log(`[DEBUG] No route matched for path: ${path}`);
    return jsonResponse({ error: "Not Found", path }, 404);
  } catch (error: any) {
    console.error("Request handler error:", error);
    // Ensure error responses also have CORS headers
    const errorMsg = error instanceof Error ? error.message : (error?.message || String(error) || "Internal server error");
    console.error("Error details:", { error, type: typeof error, message: errorMsg });
    return new Response(JSON.stringify({ success: false, message: errorMsg }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      }
    });
  }
});

