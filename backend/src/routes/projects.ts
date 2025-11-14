import { Router } from 'express';
import { db, Collections } from '../config/firestore';
import { Project, ProjectCategory, ProjectStatus, Priority } from '../types/firestore';
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
 * GET /api/projects
 * Get all projects with filtering
 */
router.get('/', verifyToken, async (req, res) => {
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

    let query: any = db.collection(Collections.PROJECTS);

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('category', '==', category);
    }
    // Note: LGA filter removed from query since it can be array or string
    if (priority) {
      query = query.where('priority', '==', priority);
    }
    if (contractorId) {
      query = query.where('contractorId', '==', contractorId);
    }

    // Get all projects (we'll filter LGA and apply pagination in-memory)
    const snapshot = await query.get();
    let projects = snapshot.docs.map((doc: any) => doc.data() as Project);

    // Apply LGA filter (support both single and array LGAs)
    if (lga) {
      const lgaFilter = Array.isArray(lga) ? lga : [lga];
      projects = projects.filter((project: any) => {
        if (Array.isArray(project.lga)) {
          // If project has multiple LGAs, check if any match
          return project.lga.some((pLga: string) => lgaFilter.includes(pLga));
        } else {
          // If project has single LGA, check if it matches
          return lgaFilter.includes(project.lga);
        }
      });
    }

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      projects = projects.filter((project: any) => {
        const lgaText = Array.isArray(project.lga) ? project.lga.join(' ') : project.lga;
        return project.name.toLowerCase().includes(searchTerm) ||
               project.description.toLowerCase().includes(searchTerm) ||
               lgaText.toLowerCase().includes(searchTerm);
      });
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const total = projects.length; // Total after filtering
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
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(Collections.PROJECTS).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = doc.data() as Project;

    // Get contractor information if exists
    let contractor = null;
    if (project.contractorId) {
      const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES)
        .doc(project.contractorId).get();
      if (contractorDoc.exists) {
        contractor = contractorDoc.data();
      }
    }

    // Get milestones
    const milestonesSnapshot = await db.collection(Collections.MILESTONES)
      .where('projectId', '==', id)
      .orderBy('order', 'asc')
      .get();
    const milestones = milestonesSnapshot.docs.map(doc => doc.data());

    // Get recent submissions
    const submissionsSnapshot = await db.collection(Collections.SUBMISSIONS)
      .where('projectId', '==', id)
      .orderBy('submittedAt', 'desc')
      .limit(5)
      .get();
    const recentSubmissions = submissionsSnapshot.docs.map(doc => doc.data());

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
router.post('/', verifyToken, requireAdmin, async (req, res) => {
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
    const projectId = `project-${Date.now()}`;

    // Create project object
    const project: Project = {
      id: projectId,
      name,
      description,
      category: category as ProjectCategory,
      lga,
      priority: priority as Priority,
      status: ProjectStatus.NOT_STARTED,
      progress: 0,
      budget: parseFloat(budget),
      allocatedBudget: allocatedBudget ? parseFloat(allocatedBudget) : parseFloat(budget),
      spentBudget: 0,
      fundingSource,
      startDate: new Date(startDate) as any,
      expectedEndDate: new Date(expectedEndDate) as any,
      beneficiaries,
      contractorId,
      projectManagerId,
      location,
      isPublic: true,
      qualityScore: 0,
      safetyCompliance: 'Not Started',
      weatherDelay: 0,
      safetyIncidents: 0,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };

    // Save project to Firestore
    await db.collection(Collections.PROJECTS).doc(projectId).set(project);

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
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if project exists
    const doc = await db.collection(Collections.PROJECTS).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const project = doc.data() as Project;
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isProjectManager = project.projectManagerId === req.user.userId;
    const isContractor = project.contractorId && req.user.role === 'CONTRACTOR';

    if (!isAdmin && !isProjectManager && !isContractor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    // Update project
    await db.collection(Collections.PROJECTS).doc(id).update(updateData);

    // Get updated project
    const updatedDoc = await db.collection(Collections.PROJECTS).doc(id).get();
    const updatedProject = updatedDoc.data() as Project;

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
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const doc = await db.collection(Collections.PROJECTS).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete project
    await db.collection(Collections.PROJECTS).doc(id).delete();

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
router.get('/stats/overview', verifyToken, async (_req, res) => {
  try {
    const snapshot = await db.collection(Collections.PROJECTS).get();
    const projects = snapshot.docs.map(doc => doc.data() as Project);

    const stats = {
      total: projects.length,
      byStatus: {
        [ProjectStatus.NOT_STARTED]: projects.filter(p => p.status === ProjectStatus.NOT_STARTED).length,
        [ProjectStatus.IN_PROGRESS]: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
        [ProjectStatus.NEAR_COMPLETION]: projects.filter(p => p.status === ProjectStatus.NEAR_COMPLETION).length,
        [ProjectStatus.COMPLETED]: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        [ProjectStatus.DELAYED]: projects.filter(p => p.status === ProjectStatus.DELAYED).length,
        [ProjectStatus.ON_HOLD]: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
        [ProjectStatus.CANCELLED]: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
      },
      byCategory: {
        [ProjectCategory.TRANSPORTATION]: projects.filter(p => p.category === ProjectCategory.TRANSPORTATION).length,
        [ProjectCategory.HEALTHCARE]: projects.filter(p => p.category === ProjectCategory.HEALTHCARE).length,
        [ProjectCategory.EDUCATION]: projects.filter(p => p.category === ProjectCategory.EDUCATION).length,
        [ProjectCategory.WATER_SANITATION]: projects.filter(p => p.category === ProjectCategory.WATER_SANITATION).length,
        [ProjectCategory.HOUSING]: projects.filter(p => p.category === ProjectCategory.HOUSING).length,
        [ProjectCategory.AGRICULTURE]: projects.filter(p => p.category === ProjectCategory.AGRICULTURE).length,
        [ProjectCategory.ENERGY]: projects.filter(p => p.category === ProjectCategory.ENERGY).length,
        [ProjectCategory.ICT]: projects.filter(p => p.category === ProjectCategory.ICT).length,
        [ProjectCategory.TOURISM]: projects.filter(p => p.category === ProjectCategory.TOURISM).length,
        [ProjectCategory.ENVIRONMENT]: projects.filter(p => p.category === ProjectCategory.ENVIRONMENT).length,
      },
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      allocatedBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget), 0),
      spentBudget: projects.reduce((sum, p) => sum + p.spentBudget, 0),
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0
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
router.get('/stats', verifyToken, async (_req, res) => {
  try {
    const snapshot = await db.collection(Collections.PROJECTS).get();
    const projects = snapshot.docs.map(doc => doc.data() as Project);

    const stats = {
      total: projects.length,
      byStatus: {
        [ProjectStatus.NOT_STARTED]: projects.filter(p => p.status === ProjectStatus.NOT_STARTED).length,
        [ProjectStatus.IN_PROGRESS]: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
        [ProjectStatus.NEAR_COMPLETION]: projects.filter(p => p.status === ProjectStatus.NEAR_COMPLETION).length,
        [ProjectStatus.COMPLETED]: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        [ProjectStatus.DELAYED]: projects.filter(p => p.status === ProjectStatus.DELAYED).length,
        [ProjectStatus.ON_HOLD]: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
        [ProjectStatus.CANCELLED]: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
      },
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      allocatedBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget), 0),
      spentBudget: projects.reduce((sum, p) => sum + p.spentBudget, 0),
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0
    };

    return res.json({ success: true, data: { stats } });
  } catch (error: any) {
    console.error('Get project stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get project statistics' });
  }
});

export default router;
