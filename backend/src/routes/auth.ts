import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { db, Collections } from '../config/firestore';
import { User, UserRole } from '../types/firestore';

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email in Firestore
    const userQuery = await db.collection(Collections.USERS)
      .where('email', '==', email)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data() as User;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await db.collection(Collections.USERS).doc(user.id).update({
      lastLogin: new Date(),
      updatedAt: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
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
router.get('/profile', async (req, res) => {
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

    // Get user from Firestore
    const userDoc = await db.collection(Collections.USERS).doc(decoded.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userDoc.data() as User;
    
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
router.post('/register', async (req, res) => {
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
    const existingUserQuery = await db.collection(Collections.USERS)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUserQuery.empty) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userData: Omit<User, 'id'> = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role as UserRole,
      isActive: true,
      department,
      jobTitle,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    // Generate user ID
    const userId = `${role.toLowerCase()}-${Date.now()}`;

    // Save user to Firestore
    await db.collection(Collections.USERS).doc(userId).set({
      id: userId,
      ...userData
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = { id: userId, ...userData };

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
router.put('/profile', async (req, res) => {
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

    const { firstName, lastName, phone, department, jobTitle, address, city, state } = req.body;

    // Update user in Firestore
    const updateData: any = {
      updatedAt: new Date()
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;

    await db.collection(Collections.USERS).doc(decoded.userId).update(updateData);

    // Get updated user
    const userDoc = await db.collection(Collections.USERS).doc(decoded.userId).get();
    const user = userDoc.data() as User;
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
router.put('/change-password', async (req, res) => {
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

    // Get user from Firestore
    const userDoc = await db.collection(Collections.USERS).doc(decoded.userId).get();
    const user = userDoc.data() as User;

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

    // Update password in Firestore
    await db.collection(Collections.USERS).doc(decoded.userId).update({
      password: hashedNewPassword,
      updatedAt: new Date()
    });

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
router.post('/logout', (_req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;