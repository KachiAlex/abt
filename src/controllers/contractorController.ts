import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { ContractorStats } from '../types';

export const getContractors = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    verified,
    certified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { companyName: { contains: search as string, mode: 'insensitive' } },
      { contactPerson: { contains: search as string, mode: 'insensitive' } },
      { registrationNo: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (verified !== undefined) {
    where.isVerified = verified === 'true';
  }

  if (certified !== undefined) {
    where.isCertified = certified === 'true';
  }

  const [contractors, total] = await Promise.all([
    prisma.contractorProfile.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
            budget: true,
          },
        },
        _count: {
          select: {
            projects: true,
            submissions: true,
          },
        },
      },
    }),
    prisma.contractorProfile.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  sendPaginatedResponse(res, contractors, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  }, 'Contractors retrieved successfully');
});

export const getContractor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const contractor = await prisma.contractorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      },
      projects: {
        include: {
          milestones: {
            select: {
              id: true,
              name: true,
              status: true,
              dueDate: true,
              completedDate: true,
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 10,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  sendSuccess(res, contractor, 'Contractor retrieved successfully');
});

export const getContractorStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  // For contractors, get their own stats; for others, get overall stats
  const contractorId = user.role === UserRole.CONTRACTOR ? user.contractorId : req.params.contractorId;

  if (!contractorId) {
    throw new AppError('Contractor ID is required', 400);
  }

  const [
    activeProjects,
    completedProjects,
    milestoneStats,
    avgProgress,
    totalSubmissions,
    pendingApprovals,
    avgQualityScore,
  ] = await Promise.all([
    prisma.project.count({
      where: { contractorId, status: 'IN_PROGRESS' },
    }),
    prisma.project.count({
      where: { contractorId, status: 'COMPLETED' },
    }),
    prisma.milestone.aggregate({
      where: { project: { contractorId } },
      _count: { id: true },
    }),
    prisma.project.aggregate({
      where: { contractorId },
      _avg: { progress: true },
    }),
    prisma.submission.count({
      where: { contractorId },
    }),
    prisma.submission.count({
      where: { contractorId, status: 'PENDING' },
    }),
    prisma.project.aggregate({
      where: { contractorId },
      _avg: { qualityScore: true },
    }),
  ]);

  const completedMilestones = await prisma.milestone.count({
    where: { 
      project: { contractorId },
      status: 'COMPLETED'
    },
  });

  const stats: ContractorStats = {
    activeProjects,
    completedProjects,
    totalMilestones: milestoneStats._count.id || 0,
    completedMilestones,
    avgProgress: Math.round(avgProgress._avg.progress || 0),
    qualityScore: Number((avgQualityScore._avg.qualityScore || 0).toFixed(1)),
    pendingApprovals,
  };

  sendSuccess(res, stats, 'Contractor statistics retrieved successfully');
});

export const updateContractorProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // Check permissions
  if (user.role !== UserRole.GOVERNMENT_ADMIN && user.contractorId !== id) {
    throw new AppError('Access denied', 403);
  }

  const {
    companyName,
    contactPerson,
    companyEmail,
    companyPhone,
    companyAddress,
    specialization,
    isVerified,
    isCertified,
    rating,
  } = req.body;

  const updateData: any = {
    companyName,
    contactPerson,
    companyEmail,
    companyPhone,
    companyAddress,
    specialization,
  };

  // Only government admins can update verification status and rating
  if (user.role === UserRole.GOVERNMENT_ADMIN) {
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isCertified !== undefined) updateData.isCertified = isCertified;
    if (rating !== undefined) updateData.rating = parseFloat(rating);
  }

  const contractor = await prisma.contractorProfile.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  });

  sendSuccess(res, contractor, 'Contractor profile updated successfully');
});

export const getContractorPerformance = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { timeframe = '6months' } = req.query;

  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  
  switch (timeframe) {
    case '1month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 6);
  }

  const [
    projectsOverTime,
    qualityTrend,
    milestoneCompletion,
    budgetPerformance,
  ] = await Promise.all([
    // Projects completed over time
    prisma.project.findMany({
      where: {
        contractorId: id,
        actualEndDate: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        actualEndDate: true,
        budget: true,
        progress: true,
      },
      orderBy: { actualEndDate: 'asc' },
    }),
    
    // Quality score trend
    prisma.project.findMany({
      where: {
        contractorId: id,
        updatedAt: { gte: startDate },
      },
      select: {
        qualityScore: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'asc' },
    }),
    
    // Milestone completion rate
    prisma.milestone.groupBy({
      by: ['status'],
      where: {
        project: { contractorId: id },
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    }),
    
    // Budget performance
    prisma.project.aggregate({
      where: {
        contractorId: id,
        createdAt: { gte: startDate },
      },
      _sum: {
        budget: true,
        spentBudget: true,
      },
      _avg: {
        progress: true,
      },
    }),
  ]);

  const performance = {
    projectsOverTime,
    qualityTrend,
    milestoneCompletion,
    budgetPerformance,
    timeframe,
  };

  sendSuccess(res, performance, 'Contractor performance data retrieved successfully');
});

export const assignProjectToContractor = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  if (user.role !== UserRole.GOVERNMENT_ADMIN) {
    throw new AppError('Only government administrators can assign projects', 403);
  }

  const { projectId, contractorId } = req.body;

  // Verify project and contractor exist
  const [project, contractor] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.contractorProfile.findUnique({ where: { id: contractorId } }),
  ]);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (!contractor) {
    throw new AppError('Contractor not found', 404);
  }

  // Update project with contractor assignment
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { contractorId },
    include: {
      contractor: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      projectId,
      action: 'ASSIGN_CONTRACTOR',
      entity: 'PROJECT',
      entityId: projectId,
      newData: { contractorId },
    },
  });

  sendSuccess(res, updatedProject, 'Project assigned to contractor successfully');
});
