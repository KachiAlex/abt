import { Router, Request, Response } from 'express';
import { query, rowToCamelCase, objectToSnakeCase } from '../config/database';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: () => void): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: () => void): void => {
  if (!req.user || req.user.role !== 'GOVERNMENT_ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
    return;
  }
  next();
};

/**
 * GET /api/contractors
 * Get all contractors with filtering
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { 
      verified, 
      certified, 
      specialization,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (verified !== undefined) {
      conditions.push(`is_verified = $${paramIndex++}`);
      params.push(verified === 'true');
    }
    if (certified !== undefined) {
      conditions.push(`is_certified = $${paramIndex++}`);
      params.push(certified === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get contractors
    const result = await query(
      `SELECT * FROM contractor_profiles ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit as string), (parseInt(page as string) - 1) * parseInt(limit as string)]
    );

    let contractors = result.rows.map(rowToCamelCase);

    // Filter by specialization (array contains)
    if (specialization) {
      contractors = contractors.filter((contractor: any) => {
        return contractor.specialization && contractor.specialization.includes(specialization);
      });
    }

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      contractors = contractors.filter((contractor: any) => 
        contractor.companyName?.toLowerCase().includes(searchTerm) ||
        contractor.contactPerson?.toLowerCase().includes(searchTerm) ||
        contractor.companyEmail?.toLowerCase().includes(searchTerm)
      );
    }

    // Get user information for each contractor
    const contractorsWithUsers = await Promise.all(
      contractors.map(async (contractor: any) => {
        const userResult = await query(
          'SELECT id, first_name, last_name, email, phone, is_active FROM users WHERE id = $1',
          [contractor.userId]
        );
        const user = userResult.rows.length > 0 ? rowToCamelCase(userResult.rows[0]) : null;
        
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
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM contractor_profiles ${whereClause}`,
      params
    );
    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      success: true,
      data: {
        contractors: contractorsWithUsers,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
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
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM contractor_profiles WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    const contractor = rowToCamelCase(result.rows[0]);

    // Get user information
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [contractor.userId]
    );
    const user = userResult.rows.length > 0 ? rowToCamelCase(userResult.rows[0]) : null;

    // Get contractor's projects
    const projectsResult = await query(
      'SELECT * FROM projects WHERE contractor_id = $1',
      [id]
    );
    const projects = projectsResult.rows.map(rowToCamelCase);

    // Get contractor's submissions
    const submissionsResult = await query(
      'SELECT * FROM submissions WHERE contractor_id = $1 ORDER BY submitted_at DESC LIMIT 10',
      [id]
    );
    const recentSubmissions = submissionsResult.rows.map(rowToCamelCase);

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
router.post('/', verifyToken, requireAdmin, async (req: Request, res: Response) => {
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
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rowToCamelCase(userResult.rows[0]);
    if (user.role !== 'CONTRACTOR') {
      return res.status(400).json({
        success: false,
        message: 'User must have contractor role'
      });
    }

    // Check if contractor profile already exists
    const existingProfileResult = await query(
      'SELECT id FROM contractor_profiles WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (existingProfileResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Contractor profile already exists for this user'
      });
    }

    // Check if registration number is unique
    const existingRegResult = await query(
      'SELECT id FROM contractor_profiles WHERE registration_no = $1 LIMIT 1',
      [registrationNo]
    );

    if (existingRegResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Registration number already exists'
      });
    }

    // Generate contractor profile ID
    const contractorId = `contractor-${Date.now()}-${uuidv4().split('-')[0]}`;

    // Handle specialization array
    const specializationArray = Array.isArray(specialization) ? specialization : (specialization ? [specialization] : []);

    // Create contractor profile
    const insertResult = await query(
      `INSERT INTO contractor_profiles (
        id, user_id, company_name, registration_no, contact_person,
        company_email, company_phone, company_address, rating,
        is_verified, is_certified, years_experience, specialization,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        contractorId, userId, companyName, registrationNo, contactPerson,
        companyEmail, companyPhone, companyAddress, 0,
        false, false, yearsExperience ? parseInt(yearsExperience) : null,
        specializationArray
      ]
    );

    const contractor = rowToCamelCase(insertResult.rows[0]);

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
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if contractor exists
    const checkResult = await query(
      'SELECT * FROM contractor_profiles WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    const contractor = rowToCamelCase(checkResult.rows[0]);

    // Check permissions
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isContractorOwner = contractor.userId === req.user.userId;

    if (!isAdmin && !isContractorOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contractor profile'
      });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    // Convert camelCase to snake_case and build update
    const snakeCaseData = objectToSnakeCase(updateData);
    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (key === 'specialization' && value) {
        updates.push(`specialization = $${paramIndex++}`);
        values.push(Array.isArray(value) ? value : [value]);
      } else if (value !== undefined && value !== null) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    // Update contractor profile
    await query(
      `UPDATE contractor_profiles SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Get updated contractor
    const updatedResult = await query(
      'SELECT * FROM contractor_profiles WHERE id = $1',
      [id]
    );
    const updatedContractor = rowToCamelCase(updatedResult.rows[0]);

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
router.get('/:id/stats', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if contractor exists
    const checkResult = await query(
      'SELECT id FROM contractor_profiles WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    // Get contractor's projects
    const projectsResult = await query(
      'SELECT * FROM projects WHERE contractor_id = $1',
      [id]
    );
    const projects = projectsResult.rows.map(rowToCamelCase);

    // Get contractor's submissions
    const submissionsResult = await query(
      'SELECT * FROM submissions WHERE contractor_id = $1',
      [id]
    );
    const submissions = submissionsResult.rows.map(rowToCamelCase);

    const stats = {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      totalSubmissions: submissions.length,
      approvedSubmissions: submissions.filter(s => s.status === 'APPROVED').length,
      pendingSubmissions: submissions.filter(s => s.status === 'PENDING').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      spentBudget: projects.reduce((sum, p) => sum + (p.spentBudget || 0), 0),
      averageProjectProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length : 0
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
router.post('/assign-project', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { contractorId, projectId } = req.body;

    if (!contractorId || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Contractor ID and Project ID are required'
      });
    }

    // Check if contractor exists
    const contractorResult = await query(
      'SELECT id FROM contractor_profiles WHERE id = $1',
      [contractorId]
    );
    
    if (contractorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }

    // Check if project exists
    const projectResult = await query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project with contractor assignment
    await query(
      'UPDATE projects SET contractor_id = $1, updated_at = NOW() WHERE id = $2',
      [contractorId, projectId]
    );

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
