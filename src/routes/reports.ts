import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get reports
const getReports = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    category,
    isPublic,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { category: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (type && type !== 'All Types') {
    where.type = type;
  }

  if (category && category !== 'All Categories') {
    where.category = category;
  }

  if (isPublic !== undefined) {
    where.isPublic = isPublic === 'true';
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
    }),
    prisma.report.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  sendPaginatedResponse(res, reports, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  }, 'Reports retrieved successfully');
});

// Generate report
const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    title,
    type,
    category,
    startDate,
    endDate,
    includeProjects,
    includeFinancial,
    includePerformance,
    isPublic = false,
  } = req.body;

  // Build report data based on parameters
  const reportData: any = {
    generatedBy: `${user.firstName} ${user.lastName}`,
    generatedAt: new Date().toISOString(),
    parameters: {
      startDate,
      endDate,
      includeProjects,
      includeFinancial,
      includePerformance,
    },
  };

  // Get project data for the report
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const projectWhere: any = {};
  if (startDate || endDate) {
    projectWhere.createdAt = dateFilter;
  }

  const [projects, budgetStats, progressStats] = await Promise.all([
    includeProjects ? prisma.project.findMany({
      where: projectWhere,
      include: {
        contractor: {
          select: {
            companyName: true,
            rating: true,
          },
        },
        milestones: {
          select: {
            name: true,
            status: true,
            completedDate: true,
          },
        },
      },
    }) : [],
    includeFinancial ? prisma.project.aggregate({
      where: projectWhere,
      _sum: {
        budget: true,
        allocatedBudget: true,
        spentBudget: true,
      },
      _avg: {
        progress: true,
      },
    }) : null,
    includePerformance ? prisma.project.groupBy({
      by: ['status'],
      where: projectWhere,
      _count: { id: true },
    }) : [],
  ]);

  reportData.projects = projects;
  reportData.budgetStats = budgetStats;
  reportData.progressStats = progressStats;

  // Create report record
  const report = await prisma.report.create({
    data: {
      title,
      type,
      category,
      generatedBy: user.id,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      data: reportData,
      isPublic,
    },
  });

  sendSuccess(res, report, 'Report generated successfully', 201);
});

// Download report
const downloadReport = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Check access permissions
  if (!report.isPublic && user.role === UserRole.PUBLIC) {
    throw new AppError('Access denied', 403);
  }

  // Increment download count
  await prisma.report.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  // In a real implementation, you would generate and return the actual file
  // For now, return the report data
  sendSuccess(res, report, 'Report downloaded successfully');
});

// Validation schemas
const reportIdValidation = [
  param('id').isUUID().withMessage('Valid report ID is required'),
];

const generateReportValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('type').isIn(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'SPECIAL', 'CUSTOM']).withMessage('Valid report type required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required'),
  body('includeProjects').optional().isBoolean(),
  body('includeFinancial').optional().isBoolean(),
  body('includePerformance').optional().isBoolean(),
  body('isPublic').optional().isBoolean(),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['title', 'createdAt', 'type', 'downloads']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

// Routes
router.get('/', 
  authenticate, 
  validate(queryValidation), 
  getReports
);

router.post('/generate', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN, UserRole.GOVERNMENT_OFFICER, UserRole.ME_OFFICER]), 
  validate(generateReportValidation), 
  generateReport
);

router.get('/:id/download', 
  authenticate, 
  validate(reportIdValidation), 
  downloadReport
);

export default router;
