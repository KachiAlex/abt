import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import userRepository from '../repositories/userRepository';
import { DbUser } from '../types/models';

const router = Router();

const sanitizeUser = (user: DbUser) => {
  const { password, ...rest } = user;
  return rest;
};

const getTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await userRepository.findByEmail((email as string).toLowerCase());

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    await userRepository.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        token
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: {
        user: sanitizeUser(user)
      }
    });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, department, jobTitle } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName, lastName, and role are required'
      });
    }

    const existingUser = await userRepository.findByEmail((email as string).toLowerCase());

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phone: phone || null,
      department: department || null,
      jobTitle: jobTitle || null,
      address: null,
      city: null,
      state: null,
      profileImage: null,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(user)
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const { firstName, lastName, phone, department, jobTitle, address, city, state, profileImage } = req.body;

    const user = await userRepository.update(decoded.userId, {
      firstName,
      lastName,
      phone,
      department,
      jobTitle,
      address,
      city,
      state,
      profileImage,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: sanitizeUser(user)
      }
    });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password', async (req: Request, res: Response) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updatePassword(user.id, hashedNewPassword);

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
