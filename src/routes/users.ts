import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingle, handleUploadError, getFileCategory } from '../middleware/upload';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get users (admin only)
const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role && role !== 'All Roles') {
    where.role = role as UserRole;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        department: true,
        jobTitle: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        contractorProfile: {
          select: {
            companyName: true,
            rating: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  sendPaginatedResponse(res, users, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  }, 'Users retrieved successfully');
});

// Upload profile image
const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const file = req.file;

  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  // Save file info to database
  const relativePath = path.relative(process.cwd(), file.path);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { profileImage: relativePath },
  });

  sendSuccess(res, {
    fileName: file.filename,
    originalName: file.originalname,
    filePath: relativePath,
    fileSize: file.size,
    mimeType: file.mimetype,
  }, 'Profile image uploaded successfully');
});

// Get user notifications
const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { limit = 20, unreadOnly = false } = req.query;

  const where: any = { userId: user.id };
  
  if (unreadOnly === 'true') {
    where.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    take: parseInt(limit as string),
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, notifications, 'Notifications retrieved successfully');
});

// Mark notification as read
const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  sendSuccess(res, null, 'Notification marked as read');
});

// Mark all notifications as read
const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  sendSuccess(res, null, 'All notifications marked as read');
});

// Validation schemas
const userIdValidation = [
  param('id').isUUID().withMessage('Valid user ID is required'),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['firstName', 'lastName', 'email', 'createdAt', 'lastLogin']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

const notificationValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean'),
];

// Routes
router.get('/', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN]), 
  validate(queryValidation), 
  getUsers
);

router.post('/upload-profile-image', 
  authenticate, 
  uploadSingle('profileImage'), 
  handleUploadError, 
  uploadProfileImage
);

router.get('/notifications', 
  authenticate, 
  validate(notificationValidation), 
  getNotifications
);

router.put('/notifications/:id/read', 
  authenticate, 
  validate(userIdValidation), 
  markNotificationRead
);

router.put('/notifications/read-all', 
  authenticate, 
  markAllNotificationsRead
);

export default router;
