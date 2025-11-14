import { Router } from 'express';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../types/firestore';

const router = Router();

/**
 * POST /api/seed
 * Seed the database with initial data (one-time use)
 */
router.post('/', async (_req, res) => {
  try {
    const db = admin.firestore();
    
    // Always seed/update the admin user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const now = admin.firestore.Timestamp.now();

    const adminUser = {
      id: 'admin-001',
      email: 'admin@abia.gov.ng',
      password: hashedPassword,
      firstName: 'Government',
      lastName: 'Administrator',
      phone: '+234-801-234-5678',
      role: UserRole.GOVERNMENT_ADMIN,
      department: 'Ministry of Works',
      jobTitle: 'Director General',
      address: 'Government House, Umuahia',
      city: 'Umuahia',
      state: 'Abia',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('users').doc(adminUser.id).set(adminUser);

    return res.status(201).json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed database',
    });
  }
});

export default router;

