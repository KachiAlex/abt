import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { optionalAuth } from '../middleware/auth';
import {
  getPublicProjects,
  getPublicProject,
  getPublicStats,
  getPublicProjectsByCategory,
  getPublicProjectsByLGA,
  searchPublicProjects,
} from '../controllers/publicController';

const router = Router();

const projectIdValidation = [
  param('id').isUUID().withMessage('Valid project ID is required'),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt', 'progress', 'budget']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

const searchValidation = [
  query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
];

// Public routes (no authentication required)
router.get('/projects', 
  optionalAuth, 
  validate(queryValidation), 
  getPublicProjects
);

router.get('/projects/search', 
  optionalAuth, 
  validate(searchValidation), 
  searchPublicProjects
);

router.get('/projects/:id', 
  optionalAuth, 
  validate(projectIdValidation), 
  getPublicProject
);

router.get('/stats', 
  optionalAuth, 
  getPublicStats
);

router.get('/projects-by-category', 
  optionalAuth, 
  getPublicProjectsByCategory
);

router.get('/projects-by-lga', 
  optionalAuth, 
  getPublicProjectsByLGA
);

export default router;
