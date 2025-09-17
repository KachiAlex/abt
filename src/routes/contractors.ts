import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  getContractors,
  getContractor,
  getContractorStats,
  updateContractorProfile,
  getContractorPerformance,
  assignProjectToContractor,
} from '../controllers/contractorController';

const router = Router();

const contractorIdValidation = [
  param('id').isUUID().withMessage('Valid contractor ID is required'),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['companyName', 'createdAt', 'rating', 'yearsExperience']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

const updateContractorValidation = [
  param('id').isUUID().withMessage('Valid contractor ID is required'),
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('contactPerson').optional().trim().isLength({ min: 2 }).withMessage('Contact person name is required'),
  body('companyEmail').optional().isEmail().withMessage('Valid company email is required'),
  body('companyPhone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
  body('specialization').optional().isArray().withMessage('Specialization must be an array'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('isVerified').optional().isBoolean().withMessage('Verification status must be boolean'),
  body('isCertified').optional().isBoolean().withMessage('Certification status must be boolean'),
];

const assignProjectValidation = [
  body('projectId').isUUID().withMessage('Valid project ID is required'),
  body('contractorId').isUUID().withMessage('Valid contractor ID is required'),
];

// Routes
router.get('/', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN, UserRole.GOVERNMENT_OFFICER, UserRole.ME_OFFICER]),
  validate(queryValidation), 
  getContractors
);

router.get('/:id', 
  authenticate, 
  validate(contractorIdValidation), 
  getContractor
);

router.get('/:id/stats', 
  authenticate, 
  validate(contractorIdValidation), 
  getContractorStats
);

router.get('/:id/performance', 
  authenticate, 
  validate([
    ...contractorIdValidation,
    query('timeframe').optional().isIn(['1month', '3months', '6months', '1year']),
  ]), 
  getContractorPerformance
);

router.put('/:id', 
  authenticate, 
  validate(updateContractorValidation), 
  updateContractorProfile
);

router.post('/assign-project', 
  authenticate, 
  authorize([UserRole.GOVERNMENT_ADMIN]), 
  validate(assignProjectValidation), 
  assignProjectToContractor
);

export default router;
