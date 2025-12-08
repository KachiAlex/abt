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
 * GET /api/projects
 * Get all projects with filtering
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      category, 
      lga, 
      priority, 
      contractorId,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (priority) {
      conditions.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }
    if (contractorId) {
      conditions.push(`contractor_id = $${paramIndex++}`);
      params.push(contractorId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get all projects
    const result = await query(
      `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC`,
      params
    );

    let projects = result.rows.map(rowToCamelCase);

    // Apply LGA filter (can be array or string in database)
    if (lga) {
      const lgaFilter = Array.isArray(lga) ? lga : [lga];
      projects = projects.filter((project: any) => {
        if (Array.isArray(project.lga)) {
          return project.lga.some((pLga: string) => lgaFilter.includes(pLga));
        } else {
          return lgaFilter.includes(project.lga);
        }
      });
    }

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      projects = projects.filter((project: any) => {
        const lgaText = Array.isArray(project.lga) ? project.lga.join(' ') : project.lga;
        return project.name?.toLowerCase().includes(searchTerm) ||
               project.description?.toLowerCase().includes(searchTerm) ||
               lgaText?.toLowerCase().includes(searchTerm);
      });
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const total = projects.length;
    const offset = (pageNum - 1) * limitNum;
    projects = projects.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error: any) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get projects'
    });
  }
});

/**
 * GET /api/projects/:id
 * Get project by ID
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = rowToCamelCase(result.rows[0]);

    // Get contractor information if exists
    let contractor = null;
    if (project.contractorId) {
      const contractorResult = await query(
        'SELECT * FROM contractor_profiles WHERE id = $1',
        [project.contractorId]
      );
      if (contractorResult.rows.length > 0) {
        contractor = rowToCamelCase(contractorResult.rows[0]);
      }
    }

    // Get milestones
    const milestonesResult = await query(
      'SELECT * FROM milestones WHERE project_id = $1 ORDER BY "order" ASC',
      [id]
    );
    const milestones = milestonesResult.rows.map(rowToCamelCase);

    // Get recent submissions
    const submissionsResult = await query(
      'SELECT * FROM submissions WHERE project_id = $1 ORDER BY submitted_at DESC LIMIT 5',
      [id]
    );
    const recentSubmissions = submissionsResult.rows.map(rowToCamelCase);

    return res.json({
      success: true,
      data: {
        project: {
          ...project,
          contractor,
          milestones,
          recentSubmissions
        }
      }
    });

  } catch (error: any) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get project'
    });
  }
});

/**
 * POST /api/projects
 * Create new project (Admin only)
 */
router.post('/', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      lga,
      priority = 'MEDIUM',
      budget,
      allocatedBudget,
      fundingSource,
      startDate,
      expectedEndDate,
      beneficiaries,
      contractorId,
      projectManagerId,
      location
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !lga || !budget || !fundingSource || !startDate || !expectedEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, description, category, lga, budget, fundingSource, startDate, expectedEndDate'
      });
    }

    // Generate project ID
    const projectId = `project-${Date.now()}-${uuidv4().split('-')[0]}`;

    // Handle location as JSONB
    const locationJson = location ? JSON.stringify(location) : null;
    // Handle LGA as JSON if array, otherwise as text
    const lgaValue = Array.isArray(lga) ? JSON.stringify(lga) : lga;

    // Create project in PostgreSQL
    const result = await query(
      `INSERT INTO projects (
        id, name, description, category, lga, priority, status, progress,
        budget, allocated_budget, spent_budget, funding_source,
        start_date, expected_end_date, beneficiaries, contractor_id,
        project_manager_id, location, is_public, quality_score,
        safety_compliance, weather_delay, safety_incidents,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
      ) RETURNING *`,
      [
        projectId, name, description, category, lgaValue, priority, 'NOT_STARTED', 0,
        parseFloat(budget), allocatedBudget ? parseFloat(allocatedBudget) : parseFloat(budget), 0,
        fundingSource, new Date(startDate), new Date(expectedEndDate), beneficiaries,
        contractorId || null, projectManagerId || null, locationJson, true, 0,
        'Not Started', 0, 0
      ]
    );

    const project = rowToCamelCase(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });

  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if project exists
    const checkResult = await query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = rowToCamelCase(checkResult.rows[0]);

    // Check permissions
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isProjectManager = project.projectManagerId === req.user.userId;
    const isContractor = project.contractorId && req.user.role === 'CONTRACTOR';

    if (!isAdmin && !isProjectManager && !isContractor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;

    // Convert camelCase to snake_case and build update
    const snakeCaseData = objectToSnakeCase(updateData);
    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (key === 'location' && value) {
        updates.push(`location = $${paramIndex++}`);
        values.push(JSON.stringify(value));
      } else if (key === 'lga' && value) {
        updates.push(`lga = $${paramIndex++}`);
        values.push(Array.isArray(value) ? JSON.stringify(value) : value);
      } else if (value !== undefined && value !== null) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    // Update project
    await query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Get updated project
    const updatedResult = await query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    const updatedProject = rowToCamelCase(updatedResult.rows[0]);

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project (Admin only)
 */
router.delete('/:id', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const result = await query(
      'SELECT id FROM projects WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete project (cascade will handle related records)
    await query(
      'DELETE FROM projects WHERE id = $1',
      [id]
    );

    return res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

/**
 * GET /api/projects/stats
 * Get project statistics
 */
router.get('/stats/overview', verifyToken, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM projects');
    const projects = result.rows.map(rowToCamelCase);

    const stats = {
      total: projects.length,
      byStatus: {
        NOT_STARTED: projects.filter(p => p.status === 'NOT_STARTED').length,
        IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS').length,
        NEAR_COMPLETION: projects.filter(p => p.status === 'NEAR_COMPLETION').length,
        COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
        DELAYED: projects.filter(p => p.status === 'DELAYED').length,
        ON_HOLD: projects.filter(p => p.status === 'ON_HOLD').length,
        CANCELLED: projects.filter(p => p.status === 'CANCELLED').length,
      },
      byCategory: {
        TRANSPORTATION: projects.filter(p => p.category === 'TRANSPORTATION').length,
        HEALTHCARE: projects.filter(p => p.category === 'HEALTHCARE').length,
        EDUCATION: projects.filter(p => p.category === 'EDUCATION').length,
        WATER_SANITATION: projects.filter(p => p.category === 'WATER_SANITATION').length,
        HOUSING: projects.filter(p => p.category === 'HOUSING').length,
        AGRICULTURE: projects.filter(p => p.category === 'AGRICULTURE').length,
        ENERGY: projects.filter(p => p.category === 'ENERGY').length,
        ICT: projects.filter(p => p.category === 'ICT').length,
        TOURISM: projects.filter(p => p.category === 'TOURISM').length,
        ENVIRONMENT: projects.filter(p => p.category === 'ENVIRONMENT').length,
      },
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      allocatedBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget || 0), 0),
      spentBudget: projects.reduce((sum, p) => sum + (p.spentBudget || 0), 0),
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length : 0
    };

    return res.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('Get project stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get project statistics'
    });
  }
});

/**
 * GET /api/projects/stats
 * Alias to stats overview for frontend compatibility
 */
router.get('/stats', verifyToken, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM projects');
    const projects = result.rows.map(rowToCamelCase);

    const stats = {
      total: projects.length,
      byStatus: {
        NOT_STARTED: projects.filter(p => p.status === 'NOT_STARTED').length,
        IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS').length,
        NEAR_COMPLETION: projects.filter(p => p.status === 'NEAR_COMPLETION').length,
        COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
        DELAYED: projects.filter(p => p.status === 'DELAYED').length,
        ON_HOLD: projects.filter(p => p.status === 'ON_HOLD').length,
        CANCELLED: projects.filter(p => p.status === 'CANCELLED').length,
      },
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      allocatedBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget || 0), 0),
      spentBudget: projects.reduce((sum, p) => sum + (p.spentBudget || 0), 0),
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length : 0
    };

    return res.json({ success: true, data: { stats } });
  } catch (error: any) {
    console.error('Get project stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get project statistics' });
  }
});

export default router;
