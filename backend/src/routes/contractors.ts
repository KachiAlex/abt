import { Router } from 'express';
import { db, Collections } from '../config/firestore';
import { ContractorProfile, User, UserRole } from '../types/firestore';
import { config } from '../config';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
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
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'GOVERNMENT_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * GET /api/contractors
 * Get all contractors with filtering
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { 
      verified, 
      certified, 
      specialization,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(Collections.CONTRACTOR_PROFILES);

    // Apply filters
    if (verified !== undefined) {
      query = query.where('isVerified', '==', verified === 'true');
    }
    if (certified !== undefined) {
      query = query.where('isCertified', '==', certified === 'true');
    }
    if (specialization) {
      query = query.where('specialization', 'array-contains', specialization);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query = query.offset(offset).limit(limitNum);

    const snapshot = await query.get();
    let contractors = snapshot.docs.map(doc => doc.data() as ContractorProfile);

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      contractors = contractors.filter(contractor => 
        contractor.companyName.toLowerCase().includes(searchTerm) ||
        contractor.contactPerson.toLowerCase().includes(searchTerm) ||
        contractor.companyEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Get user information for each contractor
    const contractorsWithUsers = await Promise.all(
      contractors.map(async (contractor) => {
        const userDoc = await db.collection(Collections.USERS).doc(contractor.userId).get();
        const user = userDoc.exists ? userDoc.data() as User : null;
        
        return {
          ...contractor,
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive
          } : null
        };
      })
    );

    // Get total count for pagination
    const totalSnapshot = await db.collection(Collections.CONTRACTOR_PROFILES).get();
    const total = totalSnapshot.size;

    return res.json({
      success: true,
      data: {
        contractors: contractorsWithUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error: any) {
    console.error('Get contractors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get contractors'
    });
  }
});

/**
 * GET /api/contractors/:id
 * Get contractor by ID
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    const contractor = doc.data() as ContractorProfile;

    // Get user information
    const userDoc = await db.collection(Collections.USERS).doc(contractor.userId).get();
    const user = userDoc.exists ? userDoc.data() as User : null;

    // Get contractor's projects
    const projectsSnapshot = await db.collection(Collections.PROJECTS)
      .where('contractorId', '==', id)
      .get();
    const projects = projectsSnapshot.docs.map(doc => doc.data());

    // Get contractor's submissions
    const submissionsSnapshot = await db.collection(Collections.SUBMISSIONS)
      .where('contractorId', '==', id)
      .orderBy('submittedAt', 'desc')
      .limit(10)
      .get();
    const recentSubmissions = submissionsSnapshot.docs.map(doc => doc.data());

    return res.json({
      success: true,
      data: {
        contractor: {
          ...contractor,
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive
          } : null,
          projects,
          recentSubmissions
        }
      }
    });

  } catch (error: any) {
    console.error('Get contractor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get contractor'
    });
  }
});

/**
 * POST /api/contractors
 * Create new contractor (Admin only)
 */
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      userId,
      companyName,
      registrationNo,
      contactPerson,
      companyEmail,
      companyPhone,
      companyAddress,
      yearsExperience,
      specialization
    } = req.body;

    // Validate required fields
    if (!userId || !companyName || !registrationNo || !contactPerson || !companyEmail || !companyPhone || !companyAddress) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId, companyName, registrationNo, contactPerson, companyEmail, companyPhone, companyAddress'
      });
    }

    // Check if user exists and is a contractor
    const userDoc = await db.collection(Collections.USERS).doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userDoc.data() as User;
    if (user.role !== UserRole.CONTRACTOR) {
      return res.status(400).json({
        success: false,
        message: 'User must have contractor role'
      });
    }

    // Check if contractor profile already exists
    const existingProfileQuery = await db.collection(Collections.CONTRACTOR_PROFILES)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingProfileQuery.empty) {
      return res.status(409).json({
        success: false,
        message: 'Contractor profile already exists for this user'
      });
    }

    // Check if registration number is unique
    const existingRegQuery = await db.collection(Collections.CONTRACTOR_PROFILES)
      .where('registrationNo', '==', registrationNo)
      .limit(1)
      .get();

    if (!existingRegQuery.empty) {
      return res.status(409).json({
        success: false,
        message: 'Registration number already exists'
      });
    }

    // Generate contractor profile ID
    const contractorId = `contractor-${Date.now()}`;

    // Create contractor profile
    const contractor: ContractorProfile = {
      id: contractorId,
      userId,
      companyName,
      registrationNo,
      contactPerson,
      companyEmail,
      companyPhone,
      companyAddress,
      rating: 0,
      isVerified: false,
      isCertified: false,
      yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
      specialization: specialization || [],
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };

    // Save contractor profile to Firestore
    await db.collection(Collections.CONTRACTOR_PROFILES).doc(contractorId).set(contractor);

    return res.status(201).json({
      success: true,
      message: 'Contractor profile created successfully',
      data: { contractor }
    });

  } catch (error: any) {
    console.error('Create contractor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create contractor profile'
    });
  }
});

/**
 * PUT /api/contractors/:id
 * Update contractor profile
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if contractor exists
    const doc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    const contractor = doc.data() as ContractorProfile;

    // Check permissions
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isContractorOwner = contractor.userId === req.user.userId;

    if (!isAdmin && !isContractorOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contractor profile'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    // Update contractor profile
    await db.collection(Collections.CONTRACTOR_PROFILES).doc(id).update(updateData);

    // Get updated contractor
    const updatedDoc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(id).get();
    const updatedContractor = updatedDoc.data() as ContractorProfile;

    return res.json({
      success: true,
      message: 'Contractor profile updated successfully',
      data: { contractor: updatedContractor }
    });

  } catch (error: any) {
    console.error('Update contractor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contractor profile'
    });
  }
});

/**
 * GET /api/contractors/:id/stats
 * Get contractor statistics
 */
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contractor exists
    const doc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    // Get contractor's projects
    const projectsSnapshot = await db.collection(Collections.PROJECTS)
      .where('contractorId', '==', id)
      .get();
    const projects = projectsSnapshot.docs.map(doc => doc.data());

    // Get contractor's submissions
    const submissionsSnapshot = await db.collection(Collections.SUBMISSIONS)
      .where('contractorId', '==', id)
      .get();
    const submissions = submissionsSnapshot.docs.map(doc => doc.data());

    const stats = {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      totalSubmissions: submissions.length,
      approvedSubmissions: submissions.filter(s => s.status === 'APPROVED').length,
      pendingSubmissions: submissions.filter(s => s.status === 'PENDING').length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      spentBudget: projects.reduce((sum, p) => sum + p.spentBudget, 0),
      averageProjectProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0
    };

    return res.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('Get contractor stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get contractor statistics'
    });
  }
});

/**
 * POST /api/contractors/assign-project
 * Assign project to contractor (Admin only)
 */
router.post('/assign-project', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { contractorId, projectId } = req.body;

    if (!contractorId || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Contractor ID and Project ID are required'
      });
    }

    // Check if contractor exists
    const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(contractorId).get();
    if (!contractorDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    // Check if project exists
    const projectDoc = await db.collection(Collections.PROJECTS).doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project with contractor assignment
    await db.collection(Collections.PROJECTS).doc(projectId).update({
      contractorId,
      updatedAt: new Date()
    });

    return res.json({
      success: true,
      message: 'Project assigned to contractor successfully'
    });

  } catch (error: any) {
    console.error('Assign project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign project to contractor'
    });
  }
});

export default router;
