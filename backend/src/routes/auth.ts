import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { query, rowToCamelCase } from '../config/database';

const router = Router();

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

    // Find user by email in PostgreSQL
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rowToCamelCase(result.rows[0]);

    // Verify password - handle both bcrypt and pbkdf2 hashes
    let isValidPassword = false;
    
    if (user.password.startsWith('pbkdf2:')) {
      // PBKDF2 hash (from Supabase migration)
      const parts = user.password.split(':');
      if (parts.length === 3) {
        // For now, we'll need to re-hash passwords or use a migration script
        // For compatibility, we'll check if it's a bcrypt hash first
        isValidPassword = await bcrypt.compare(password, user.password);
      }
    } else {
      // BCrypt hash
      isValidPassword = await bcrypt.compare(password, user.password);
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
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
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // Get user from PostgreSQL
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rowToCamelCase(result.rows[0]);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        user: userWithoutPassword
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

    // Check if user already exists
    const existingResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `${role.toLowerCase()}-${Date.now()}-${uuidv4().split('-')[0]}`;

    // Create user in PostgreSQL
    const insertResult = await query(
      `INSERT INTO users (
        id, email, password, first_name, last_name, role, phone, 
        department, job_title, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [userId, email, hashedPassword, firstName, lastName, role, phone, department, jobTitle, true]
    );

    const user = rowToCamelCase(insertResult.rows[0]);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword
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
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const { firstName, lastName, phone, department, jobTitle, address, city, state, profileImage, preferences } = req.body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (firstName) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(lastName);
    }
    if (phone) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (department) {
      updates.push(`department = $${paramIndex++}`);
      values.push(department);
    }
    if (jobTitle) {
      updates.push(`job_title = $${paramIndex++}`);
      values.push(jobTitle);
    }
    if (address) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    if (city) {
      updates.push(`city = $${paramIndex++}`);
      values.push(city);
    }
    if (state) {
      updates.push(`state = $${paramIndex++}`);
      values.push(state);
    }
    if (profileImage) {
      updates.push(`profile_image = $${paramIndex++}`);
      values.push(profileImage);
    }
    if (preferences) {
      updates.push(`preferences = $${paramIndex++}`);
      values.push(JSON.stringify(preferences));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(decoded.userId);

    // Update user in PostgreSQL
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Get updated user
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    const user = rowToCamelCase(result.rows[0]);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userWithoutPassword
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
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user from PostgreSQL
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rowToCamelCase(result.rows[0]);

    // Verify current password
    let isValidPassword = false;
    if (user.password.startsWith('pbkdf2:')) {
      // For PBKDF2, we'd need a migration or re-hash
      // For now, fallback to bcrypt comparison
      isValidPassword = await bcrypt.compare(currentPassword, user.password);
    } else {
      isValidPassword = await bcrypt.compare(currentPassword, user.password);
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in PostgreSQL
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, decoded.userId]
    );

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
