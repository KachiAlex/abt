import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

const router = Router();

// Registration validation
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('role').isIn(['GOVERNMENT_ADMIN', 'GOVERNMENT_OFFICER', 'CONTRACTOR', 'ME_OFFICER'])
    .withMessage('Valid role is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
];

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Profile update validation
const profileUpdateValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
];

// Password change validation
const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain uppercase, lowercase, number and special character'),
];

// Routes - Registration restricted to admin only
router.post('/register', authenticate, authorize([UserRole.GOVERNMENT_ADMIN]), validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(profileUpdateValidation), updateProfile);
router.put('/change-password', authenticate, validate(passwordChangeValidation), changePassword);
router.post('/forgot-password', validate([body('email').isEmail().normalizeEmail()]), forgotPassword);
router.post('/reset-password', validate([
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]), resetPassword);

export default router;
