import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  getDashboardStats,
  getProjectStatusChart,
  getBudgetAnalysis,
  getLGAPerformance,
  getRecentActivity,
} from '../controllers/dashboardController';

const router = Router();

const timeframeValidation = [
  query('timeframe').optional().isIn(['1month', '3months', '6months', '1year']),
];

const limitValidation = [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

// Routes
router.get('/stats', 
  authenticate, 
  getDashboardStats
);

router.get('/project-status-chart', 
  authenticate, 
  validate(timeframeValidation), 
  getProjectStatusChart
);

router.get('/budget-analysis', 
  authenticate, 
  validate(timeframeValidation), 
  getBudgetAnalysis
);

router.get('/lga-performance', 
  authenticate, 
  getLGAPerformance
);

router.get('/recent-activity', 
  authenticate, 
  validate(limitValidation), 
  getRecentActivity
);

export default router;
