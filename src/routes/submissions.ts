import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  createSubmission,
  getSubmissions,
  getSubmission,
  reviewSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionStats,
  getSubmissionsByProject,
} from '../controllers/submissionController';

const router = Router();

const createSubmissionValidation = [
  body('projectId').isUUID().withMessage('Valid project ID is required'),
  body('type').isIn(['MILESTONE', 'PROGRESS', 'ISSUE', 'SAFETY', 'QUALITY', 'DELAY', 'GENERAL'])
    .withMessage('Valid submission type is required'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('milestoneId').optional().isUUID().withMessage('Valid milestone ID required'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('estimatedValue').optional().isNumeric().withMessage('Valid estimated value required'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('qualityScore').optional().isFloat({ min: 0, max: 5 }).withMessage('Quality score must be between 0 and 5'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date required'),
];

const reviewSubmissionValidation = [
  param('id').isUUID().withMessage('Valid submission ID is required'),
  body('action').isIn(['APPROVED', 'REJECTED', 'FLAGGED', 'REQUEST_CLARIFICATION'])
    .withMessage('Valid action is required'),
  body('comments').optional().trim().isLength({ max: 1000 }).withMessage('Comments must be less than 1000 characters'),
];

const updateSubmissionValidation = [
  param('id').isUUID().withMessage('Valid submission ID is required'),
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('estimatedValue').optional().isNumeric().withMessage('Valid estimated value required'),
  body('qualityScore').optional().isFloat({ min: 0, max: 5 }).withMessage('Quality score must be between 0 and 5'),
];

const submissionIdValidation = [
  param('id').isUUID().withMessage('Valid submission ID is required'),
];

const projectIdValidation = [
  param('projectId').isUUID().withMessage('Valid project ID is required'),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['submittedAt', 'reviewedAt', 'title', 'type', 'priority']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

// Routes
router.get('/', 
  authenticate, 
  validate(queryValidation), 
  getSubmissions
);

router.get('/stats', 
  authenticate, 
  getSubmissionStats
);

router.get('/project/:projectId', 
  authenticate, 
  validate(projectIdValidation), 
  getSubmissionsByProject
);

router.get('/:id', 
  authenticate, 
  validate(submissionIdValidation), 
  getSubmission
);

router.post('/', 
  authenticate, 
  authorize([UserRole.CONTRACTOR]), 
  validate(createSubmissionValidation), 
  createSubmission
);

router.put('/:id', 
  authenticate, 
  authorize([UserRole.CONTRACTOR]), 
  validate(updateSubmissionValidation), 
  updateSubmission
);

router.put('/:id/review', 
  authenticate, 
  authorize([UserRole.ME_OFFICER, UserRole.GOVERNMENT_ADMIN]), 
  validate(reviewSubmissionValidation), 
  reviewSubmission
);

router.delete('/:id', 
  authenticate, 
  authorize([UserRole.CONTRACTOR]), 
  validate(submissionIdValidation), 
  deleteSubmission
);

export default router;
