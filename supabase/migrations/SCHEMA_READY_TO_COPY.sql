-- ============================================================
-- COPY THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================================
-- Go to: https://supabase.com/dashboard/project/lyxwslsckkbcpepxigdx/sql/new
-- Copy everything below this line and paste into SQL Editor
-- ============================================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  profile_image TEXT,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Contractor Profiles table
CREATE TABLE IF NOT EXISTS contractor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  registration_no TEXT UNIQUE NOT NULL,
  contact_person TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_phone TEXT NOT NULL,
  company_address TEXT NOT NULL,
  rating DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_certified BOOLEAN DEFAULT false,
  years_experience INTEGER,
  specialization TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  lga TEXT,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'NOT_STARTED',
  progress INTEGER DEFAULT 0,
  budget DECIMAL,
  allocated_budget DECIMAL,
  spent_budget DECIMAL DEFAULT 0,
  funding_source TEXT,
  start_date TIMESTAMP,
  expected_end_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  beneficiaries TEXT,
  contractor_id TEXT REFERENCES contractor_profiles(id) ON DELETE SET NULL,
  project_manager_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  location JSONB,
  is_public BOOLEAN DEFAULT true,
  quality_score DECIMAL DEFAULT 0,
  safety_compliance TEXT,
  weather_delay INTEGER DEFAULT 0,
  safety_incidents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  due_date TIMESTAMP,
  completed_date TIMESTAMP,
  status TEXT DEFAULT 'PENDING',
  progress INTEGER DEFAULT 0,
  budget DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
  contractor_id TEXT NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  submitted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  progress INTEGER,
  estimated_value DECIMAL,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'PENDING',
  quality_score DECIMAL,
  safety_compliance TEXT,
  weather_impact TEXT,
  media_count INTEGER DEFAULT 0,
  due_date TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  review_comments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Approvals table
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  category TEXT NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_registration_no ON contractor_profiles(registration_no);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);

CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contractor_id ON submissions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

CREATE INDEX IF NOT EXISTS idx_approvals_submission_id ON approvals(submission_id);
CREATE INDEX IF NOT EXISTS idx_approvals_reviewer_id ON approvals(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_submission_id ON documents(submission_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Add comments for documentation
COMMENT ON TABLE users IS 'System users including admins, officers, contractors, and M&E officers';
COMMENT ON TABLE contractor_profiles IS 'Contractor company profiles linked to user accounts';
COMMENT ON TABLE projects IS 'Government projects being tracked';
COMMENT ON TABLE milestones IS 'Project milestones and deliverables';
COMMENT ON TABLE submissions IS 'Contractor submissions for progress, issues, etc.';
COMMENT ON TABLE approvals IS 'Approval records for submissions';
COMMENT ON TABLE documents IS 'Files and documents uploaded to the system';

