import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectsByLGA,
} from '../controllers/projectController';

const router = Router();

// Project validation schemas
const createProjectValidation = [
  body('name').trim().isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn([
    'TRANSPORTATION', 'HEALTHCARE', 'EDUCATION', 'WATER_SANITATION', 
    'HOUSING', 'AGRICULTURE', 'ENERGY', 'ICT', 'TOURISM', 'ENVIRONMENT'
  ]).withMessage('Valid category is required'),
  body('lga').trim().notEmpty().withMessage('LGA is required'),
  body('budget').isNumeric().withMessage('Valid budget amount is required'),
  body('fundingSource').trim().notEmpty().withMessage('Funding source is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('expectedEndDate').isISO8601().withMessage('Valid end date is required'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
];

const updateProjectValidation = [
  param('id').isUUID().withMessage('Valid project ID is required'),
  body('name').optional().trim().isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').optional().isIn([
    'TRANSPORTATION', 'HEALTHCARE', 'EDUCATION', 'WATER_SANITATION', 
    'HOUSING', 'AGRICULTURE', 'ENERGY', 'ICT', 'TOURISM', 'ENVIRONMENT'
  ]),
  body('budget').optional().isNumeric().withMessage('Valid budget amount is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('expectedEndDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('status').optional().isIn(['NOT_STARTED', 'IN_PROGRESS', 'NEAR_COMPLETION', 'COMPLETED', 'DELAYED', 'ON_HOLD', 'CANCELLED']),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
];

const projectIdValidation = [
  param('id').isUUID().withMessage('Valid project ID is required'),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt', 'progress', 'budget', 'dueDate']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

// Routes
router.get('/', 
  authenticate, 
  validate(queryValidation), 
  getProjects
);

router.get('/stats', 
  authenticate, 
  getProjectStats
);

router.get('/lga-stats', 
  authenticate, 
  getProjectsByLGA
);

router.get('/:id', 
  authenticate, 
  validate(projectIdValidation), 
  getProject
);

router.post('/', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN]), 
  validate(createProjectValidation), 
  createProject
);

router.put('/:id', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN, UserRole.GOVERNMENT_OFFICER]), 
  validate(updateProjectValidation), 
  updateProject
);

router.delete('/:id', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN]), 
  validate(projectIdValidation), 
  deleteProject
);

export default router;
