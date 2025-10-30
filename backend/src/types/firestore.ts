import { Timestamp } from 'firebase-admin/firestore';

// Enums
export enum UserRole {
  GOVERNMENT_ADMIN = 'GOVERNMENT_ADMIN',
  GOVERNMENT_OFFICER = 'GOVERNMENT_OFFICER',
  CONTRACTOR = 'CONTRACTOR',
  ME_OFFICER = 'ME_OFFICER',
  PUBLIC = 'PUBLIC',
}

export enum ProjectCategory {
  TRANSPORTATION = 'TRANSPORTATION',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  WATER_SANITATION = 'WATER_SANITATION',
  HOUSING = 'HOUSING',
  AGRICULTURE = 'AGRICULTURE',
  ENERGY = 'ENERGY',
  ICT = 'ICT',
  TOURISM = 'TOURISM',
  ENVIRONMENT = 'ENVIRONMENT',
}

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  NEAR_COMPLETION = 'NEAR_COMPLETION',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

export enum SubmissionType {
  MILESTONE = 'MILESTONE',
  PROGRESS = 'PROGRESS',
  ISSUE = 'ISSUE',
  SAFETY = 'SAFETY',
  QUALITY = 'QUALITY',
  DELAY = 'DELAY',
  GENERAL = 'GENERAL',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  REQUIRES_CLARIFICATION = 'REQUIRES_CLARIFICATION',
}

export enum ApprovalAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  REQUEST_CLARIFICATION = 'REQUEST_CLARIFICATION',
}

export enum DocumentCategory {
  CONTRACT = 'CONTRACT',
  TECHNICAL = 'TECHNICAL',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  REPORT = 'REPORT',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER',
}

export enum InspectionType {
  QUALITY = 'QUALITY',
  SAFETY = 'SAFETY',
  PROGRESS = 'PROGRESS',
  FINAL = 'FINAL',
  COMPLIANCE = 'COMPLIANCE',
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export enum NotificationType {
  DEADLINE = 'DEADLINE',
  PAYMENT = 'PAYMENT',
  INSPECTION = 'INSPECTION',
  APPROVAL = 'APPROVAL',
  REJECTION = 'REJECTION',
  SYSTEM = 'SYSTEM',
  GENERAL = 'GENERAL',
}

export enum ReportType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  SPECIAL = 'SPECIAL',
  CUSTOM = 'CUSTOM',
}

// Document Interfaces
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
  department?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  state?: string;
  lastLogin?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  companyName: string;
  registrationNo: string;
  contactPerson: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  rating: number;
  isVerified: boolean;
  isCertified: boolean;
  yearsExperience?: number;
  specialization: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  lga: string;
  priority: Priority;
  status: ProjectStatus;
  progress: number;
  budget: number;
  allocatedBudget?: number;
  spentBudget: number;
  fundingSource: string;
  startDate: Timestamp;
  expectedEndDate: Timestamp;
  actualEndDate?: Timestamp;
  beneficiaries?: string;
  contractorId?: string;
  projectManagerId?: string;
  location?: {
    coordinates?: { lat: number; lng: number };
    address?: string;
  };
  isPublic: boolean;
  qualityScore: number;
  safetyCompliance: string;
  weatherDelay: number;
  safetyIncidents: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dueDate: Timestamp;
  completedDate?: Timestamp;
  status: MilestoneStatus;
  progress: number;
  budget?: number;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Submission {
  id: string;
  projectId: string;
  milestoneId?: string;
  contractorId: string;
  submittedBy: string;
  type: SubmissionType;
  title: string;
  description: string;
  progress?: number;
  estimatedValue?: number;
  priority: Priority;
  status: SubmissionStatus;
  qualityScore?: number;
  safetyCompliance?: string;
  weatherImpact?: string;
  mediaCount: number;
  dueDate?: Timestamp;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewComments?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Approval {
  id: string;
  submissionId: string;
  reviewerId: string;
  action: ApprovalAction;
  comments?: string;
  createdAt: Timestamp;
}

export interface Document {
  id: string;
  projectId?: string;
  submissionId?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  uploadedBy: string;
  isPublic: boolean;
  createdAt: Timestamp;
}

export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Inspection {
  id: string;
  projectId: string;
  inspectorId: string;
  type: InspectionType;
  scheduledAt: Timestamp;
  completedAt?: Timestamp;
  status: InspectionStatus;
  findings?: string;
  score?: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isUrgent: boolean;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  category: string;
  generatedBy: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  data: any;
  filePath?: string;
  fileSize?: number;
  isPublic: boolean;
  downloads: number;
  createdAt: Timestamp;
}

export interface AuditLog {
  id: string;
  userId: string;
  projectId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

