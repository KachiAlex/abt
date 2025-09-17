import { Request, Response } from 'express';
import { ProjectCategory, ProjectStatus, Priority, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { ProjectFilters, PaginationParams } from '../types';
import { canAccessProject, canModifyProject } from '../utils/auth';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    search,
    status,
    category,
    lga,
    priority,
    contractorId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause based on user role and filters
  const where: any = {};

  // Role-based filtering
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { id: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (status && status !== 'All Statuses') {
    where.status = status as ProjectStatus;
  }

  // Category filter
  if (category && category !== 'All Categories') {
    where.category = category as ProjectCategory;
  }

  // LGA filter
  if (lga && lga !== 'All LGAs') {
    where.lga = lga as string;
  }

  // Priority filter
  if (priority && priority !== 'All Priorities') {
    where.priority = priority as Priority;
  }

  // Contractor filter (for government users)
  if (contractorId && (user.role === UserRole.GOVERNMENT_ADMIN || user.role === UserRole.ME_OFFICER)) {
    where.contractorId = contractorId as string;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        contractor: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            rating: true,
          },
        },
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
            documents: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  sendPaginatedResponse(res, projects, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  }, 'Projects retrieved successfully');
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      contractor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      milestones: {
        orderBy: { order: 'asc' },
        include: {
          submissions: {
            where: { status: 'APPROVED' },
            orderBy: { submittedAt: 'desc' },
            take: 1,
          },
        },
      },
      teamMembers: true,
      documents: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 10,
        include: {
          submitter: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      inspections: {
        orderBy: { scheduledAt: 'desc' },
        take: 5,
        include: {
          inspector: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check access permissions
  if (!canAccessProject(user.role, user.id, user.contractorId, project.contractorId)) {
    throw new AppError('Access denied', 403);
  }

  sendSuccess(res, project, 'Project retrieved successfully');
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  // Only government admins can create projects
  if (user.role !== UserRole.GOVERNMENT_ADMIN) {
    throw new AppError('Only government administrators can create projects', 403);
  }

  const {
    name,
    description,
    category,
    lga,
    priority = 'MEDIUM',
    budget,
    fundingSource,
    startDate,
    expectedEndDate,
    beneficiaries,
    contractorId,
    projectManagerId,
    location,
    objectives = [],
    milestones = [],
  } = req.body;

  // Create project with milestones
  const project = await prisma.project.create({
    data: {
      name,
      description,
      category: category as ProjectCategory,
      lga,
      priority: priority as Priority,
      budget: parseFloat(budget),
      fundingSource,
      startDate: new Date(startDate),
      expectedEndDate: new Date(expectedEndDate),
      beneficiaries,
      contractorId,
      projectManagerId,
      location,
      milestones: {
        create: milestones.map((milestone: any, index: number) => ({
          name: milestone.name,
          description: milestone.description,
          dueDate: new Date(milestone.dueDate),
          budget: milestone.budget ? parseFloat(milestone.budget) : null,
          order: index + 1,
        })),
      },
    },
    include: {
      contractor: true,
      milestones: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      projectId: project.id,
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: project.id,
      newData: project,
    },
  });

  sendSuccess(res, project, 'Project created successfully', 201);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    throw new AppError('Project not found', 404);
  }

  if (!canModifyProject(user.role, user.id, user.contractorId, existingProject.contractorId)) {
    throw new AppError('Access denied', 403);
  }

  const {
    name,
    description,
    category,
    lga,
    priority,
    budget,
    fundingSource,
    startDate,
    expectedEndDate,
    beneficiaries,
    contractorId,
    status,
    progress,
  } = req.body;

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category: category as ProjectCategory }),
      ...(lga && { lga }),
      ...(priority && { priority: priority as Priority }),
      ...(budget && { budget: parseFloat(budget) }),
      ...(fundingSource && { fundingSource }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(expectedEndDate && { expectedEndDate: new Date(expectedEndDate) }),
      ...(beneficiaries && { beneficiaries }),
      ...(contractorId && { contractorId }),
      ...(status && { status: status as ProjectStatus }),
      ...(progress !== undefined && { progress: parseInt(progress) }),
    },
    include: {
      contractor: true,
      milestones: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      projectId: id,
      action: 'UPDATE',
      entity: 'PROJECT',
      entityId: id,
      oldData: existingProject,
      newData: updatedProject,
    },
  });

  sendSuccess(res, updatedProject, 'Project updated successfully');
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // Only government admins can delete projects
  if (user.role !== UserRole.GOVERNMENT_ADMIN) {
    throw new AppError('Only government administrators can delete projects', 403);
  }

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await prisma.project.delete({
    where: { id },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      projectId: id,
      action: 'DELETE',
      entity: 'PROJECT',
      entityId: id,
      oldData: project,
    },
  });

  sendSuccess(res, null, 'Project deleted successfully');
});

export const getProjectStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  // Build where clause based on user role
  const where: any = {};
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    delayedProjects,
    budgetStats,
    avgProgress,
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.project.count({ where: { ...where, status: 'DELAYED' } }),
    prisma.project.aggregate({
      where,
      _sum: {
        budget: true,
        spentBudget: true,
      },
    }),
    prisma.project.aggregate({
      where,
      _avg: {
        progress: true,
      },
    }),
  ]);

  const stats = {
    totalProjects,
    activeProjects,
    completedProjects,
    delayedProjects,
    totalBudget: budgetStats._sum.budget || 0,
    spentBudget: budgetStats._sum.spentBudget || 0,
    avgProgress: Math.round(avgProgress._avg.progress || 0),
  };

  sendSuccess(res, stats, 'Project statistics retrieved successfully');
});

export const getProjectsByLGA = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const where: any = {};
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  const lgaStats = await prisma.project.groupBy({
    by: ['lga'],
    where,
    _count: {
      id: true,
    },
    _avg: {
      progress: true,
    },
    _sum: {
      budget: true,
    },
  });

  const formattedStats = lgaStats.map(stat => ({
    lga: stat.lga,
    projectCount: stat._count.id,
    avgProgress: Math.round(stat._avg.progress || 0),
    totalBudget: stat._sum.budget || 0,
  }));

  sendSuccess(res, formattedStats, 'LGA statistics retrieved successfully');
});
