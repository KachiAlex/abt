import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { DashboardStats, ContractorStats, MEStats } from '../types';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  let where: any = {};
  
  // Role-based filtering
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
    contractorCount,
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
    user.role === UserRole.CONTRACTOR ? 1 : prisma.contractorProfile.count(),
  ]);

  const stats: DashboardStats = {
    totalProjects,
    activeProjects,
    completedProjects,
    delayedProjects,
    totalBudget: Number(budgetStats._sum.budget || 0),
    spentBudget: Number(budgetStats._sum.spentBudget || 0),
    avgProgress: Math.round(avgProgress._avg.progress || 0),
    totalContractors: contractorCount,
  };

  sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
});

export const getProjectStatusChart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
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

  let where: any = {
    createdAt: { gte: startDate },
  };

  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  // Group projects by month and status
  const projectsByMonth = await prisma.project.groupBy({
    by: ['status'],
    where,
    _count: { id: true },
  });

  // Get monthly data for the last 6 months
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthWhere = {
      ...where,
      createdAt: { gte: monthStart, lte: monthEnd },
    };

    const [completed, inProgress, delayed] = await Promise.all([
      prisma.project.count({ where: { ...monthWhere, status: 'COMPLETED' } }),
      prisma.project.count({ where: { ...monthWhere, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { ...monthWhere, status: 'DELAYED' } }),
    ]);

    monthlyData.push({
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      completed,
      inProgress,
      delayed,
    });
  }

  sendSuccess(res, {
    monthlyData,
    statusBreakdown: projectsByMonth,
    timeframe,
  }, 'Project status chart data retrieved successfully');
});

export const getBudgetAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { timeframe = '6months' } = req.query;

  let where: any = {};
  
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  // Get monthly budget data
  const monthlyBudgetData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthWhere = {
      ...where,
      createdAt: { gte: monthStart, lte: monthEnd },
    };

    const budgetData = await prisma.project.aggregate({
      where: monthWhere,
      _sum: {
        budget: true,
        allocatedBudget: true,
        spentBudget: true,
      },
    });

    monthlyBudgetData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      allocated: Number(budgetData._sum.allocatedBudget || 0) / 1000000000, // Convert to billions
      spent: Number(budgetData._sum.spentBudget || 0) / 1000000000,
      remaining: (Number(budgetData._sum.allocatedBudget || 0) - Number(budgetData._sum.spentBudget || 0)) / 1000000000,
    });
  }

  sendSuccess(res, {
    monthlyBudgetData,
    timeframe,
  }, 'Budget analysis data retrieved successfully');
});

export const getLGAPerformance = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  let where: any = {};
  
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  const lgaPerformance = await prisma.project.groupBy({
    by: ['lga'],
    where,
    _count: { id: true },
    _avg: {
      progress: true,
      qualityScore: true,
    },
    _sum: {
      budget: true,
    },
  });

  const formattedData = lgaPerformance.map(lga => ({
    name: lga.lga,
    projects: lga._count.id,
    completion: Math.round(lga._avg.progress || 0),
    budget: Number(lga._sum.budget || 0) / 1000000000, // Convert to billions
    qualityScore: Number((lga._avg.qualityScore || 0).toFixed(1)),
    performance: lga._avg.progress && lga._avg.progress >= 80 ? 'Excellent' :
                lga._avg.progress && lga._avg.progress >= 70 ? 'Good' : 'Needs Attention',
  }));

  sendSuccess(res, formattedData, 'LGA performance data retrieved successfully');
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { limit = 10 } = req.query;

  let where: any = {};
  
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.OR = [
      { projectId: { in: await getContractorProjectIds(user.contractorId) } },
      { userId: user.id },
    ];
  }

  const activities = await prisma.auditLog.findMany({
    where,
    take: parseInt(limit as string),
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    action: activity.action,
    user: `${activity.user.firstName} ${activity.user.lastName}`,
    item: activity.project?.name || activity.entity,
    date: activity.createdAt,
    description: formatActivityDescription(activity.action, activity.entity),
  }));

  sendSuccess(res, formattedActivities, 'Recent activity retrieved successfully');
});

// Helper function to get contractor project IDs
const getContractorProjectIds = async (contractorId: string): Promise<string[]> => {
  const projects = await prisma.project.findMany({
    where: { contractorId },
    select: { id: true },
  });
  return projects.map(p => p.id);
};

// Helper function to format activity descriptions
const formatActivityDescription = (action: string, entity: string): string => {
  const actionMap: { [key: string]: string } = {
    'CREATE': 'created',
    'UPDATE': 'updated',
    'DELETE': 'deleted',
    'ASSIGN_CONTRACTOR': 'assigned contractor to',
    'REVIEW_SUBMISSION_APPROVED': 'approved submission for',
    'REVIEW_SUBMISSION_REJECTED': 'rejected submission for',
    'REVIEW_SUBMISSION_FLAGGED': 'flagged submission for',
  };

  return actionMap[action] || action.toLowerCase();
};
