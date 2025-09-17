import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    lga,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    isPublic: true, // Only show public projects
  };

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (category && category !== 'All Categories') {
    where.category = category;
  }

  // LGA filter
  if (lga && lga !== 'All LGAs') {
    where.lga = lga;
  }

  // Status filter
  if (status && status !== 'All Status') {
    where.status = status;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        lga: true,
        status: true,
        progress: true,
        budget: true,
        startDate: true,
        expectedEndDate: true,
        beneficiaries: true,
        createdAt: true,
        updatedAt: true,
        contractor: {
          select: {
            companyName: true,
            rating: true,
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
  }, 'Public projects retrieved successfully');
});

export const getPublicProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { 
      id,
      isPublic: true, // Only allow access to public projects
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      lga: true,
      status: true,
      progress: true,
      budget: true,
      startDate: true,
      expectedEndDate: true,
      actualEndDate: true,
      beneficiaries: true,
      location: true,
      createdAt: true,
      updatedAt: true,
      contractor: {
        select: {
          companyName: true,
          contactPerson: true,
          rating: true,
          yearsExperience: true,
          specialization: true,
        },
      },
      milestones: {
        where: {
          // Only show completed milestones to public
          status: 'COMPLETED',
        },
        select: {
          name: true,
          completedDate: true,
          progress: true,
        },
        orderBy: { completedDate: 'asc' },
      },
      documents: {
        where: {
          isPublic: true,
        },
        select: {
          fileName: true,
          originalName: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  sendSuccess(res, project, 'Public project retrieved successfully');
});

export const getPublicStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalBudget,
    totalBeneficiaries,
    lgaCount,
    contractorCount,
  ] = await Promise.all([
    prisma.project.count({ where: { isPublic: true } }),
    prisma.project.count({ where: { isPublic: true, status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { isPublic: true, status: 'COMPLETED' } }),
    prisma.project.aggregate({
      where: { isPublic: true },
      _sum: { budget: true },
    }),
    // Calculate total beneficiaries (this is a simplified calculation)
    prisma.project.findMany({
      where: { isPublic: true, beneficiaries: { not: null } },
      select: { beneficiaries: true },
    }),
    prisma.project.groupBy({
      by: ['lga'],
      where: { isPublic: true },
    }),
    prisma.project.groupBy({
      by: ['contractorId'],
      where: { isPublic: true, contractorId: { not: null } },
    }),
  ]);

  // Calculate total beneficiaries from string values (simplified)
  let totalBeneficiariesCount = 0;
  totalBeneficiaries.forEach(project => {
    if (project.beneficiaries) {
      const match = project.beneficiaries.match(/(\d+(?:\.\d+)?)\s*([KM]?)/i);
      if (match) {
        let number = parseFloat(match[1]);
        const unit = match[2]?.toUpperCase();
        if (unit === 'K') number *= 1000;
        if (unit === 'M') number *= 1000000;
        totalBeneficiariesCount += number;
      }
    }
  });

  const stats = {
    totalProjects,
    activeProjects,
    completedProjects,
    totalBudget: Number(totalBudget._sum.budget || 0),
    totalBeneficiaries: totalBeneficiariesCount,
    lgasCovered: lgaCount.length,
    activeContractors: contractorCount.length,
  };

  sendSuccess(res, stats, 'Public statistics retrieved successfully');
});

export const getPublicProjectsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryStats = await prisma.project.groupBy({
    by: ['category'],
    where: { isPublic: true },
    _count: { id: true },
    _avg: { progress: true },
    _sum: { budget: true },
  });

  const formattedStats = categoryStats.map(stat => ({
    category: stat.category,
    projectCount: stat._count.id,
    avgProgress: Math.round(stat._avg.progress || 0),
    totalBudget: Number(stat._sum.budget || 0),
  }));

  sendSuccess(res, formattedStats, 'Public projects by category retrieved successfully');
});

export const getPublicProjectsByLGA = asyncHandler(async (req: Request, res: Response) => {
  const lgaStats = await prisma.project.groupBy({
    by: ['lga'],
    where: { isPublic: true },
    _count: { id: true },
    _avg: { progress: true },
    _sum: { budget: true },
  });

  const formattedStats = lgaStats.map(stat => ({
    lga: stat.lga,
    projectCount: stat._count.id,
    avgProgress: Math.round(stat._avg.progress || 0),
    totalBudget: Number(stat._sum.budget || 0),
  }));

  sendSuccess(res, formattedStats, 'Public projects by LGA retrieved successfully');
});

export const searchPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || (q as string).length < 2) {
    return sendSuccess(res, [], 'Search query too short');
  }

  const projects = await prisma.project.findMany({
    where: {
      isPublic: true,
      OR: [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { lga: { contains: q as string, mode: 'insensitive' } },
        { contractor: { companyName: { contains: q as string, mode: 'insensitive' } } },
      ],
    },
    take: 20,
    select: {
      id: true,
      name: true,
      lga: true,
      category: true,
      status: true,
      progress: true,
      contractor: {
        select: {
          companyName: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  sendSuccess(res, projects, 'Search results retrieved successfully');
});
