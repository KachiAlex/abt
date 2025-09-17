import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  contractorId?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  contractorId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  lga?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProjectFilters extends FilterParams {
  contractorId?: string;
  progress?: {
    min?: number;
    max?: number;
  };
}

export interface SubmissionFilters extends FilterParams {
  type?: string;
  projectId?: string;
  contractorId?: string;
  reviewerId?: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalBudget: number;
  spentBudget: number;
  avgProgress: number;
  totalContractors: number;
}

export interface ContractorStats {
  activeProjects: number;
  completedProjects: number;
  totalMilestones: number;
  completedMilestones: number;
  avgProgress: number;
  qualityScore: number;
  pendingApprovals: number;
}

export interface MEStats {
  pendingReviews: number;
  reviewsCompleted: number;
  approvalsGiven: number;
  issuesFlagged: number;
  siteVisits: number;
  avgReviewTime: number;
}

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
  isUrgent?: boolean;
}

export interface FileUploadResult {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}
