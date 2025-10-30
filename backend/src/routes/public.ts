import { Router } from 'express';
import { db, Collections } from '../config/firestore';
import { Project, ProjectStatus, ProjectCategory } from '../types/firestore';

const router = Router();

/**
 * GET /api/public/projects
 * Get public projects (no authentication required)
 */
router.get('/projects', async (req, res) => {
  try {
    const { 
      category, 
      lga, 
      status,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    let query = db.collection(Collections.PROJECTS)
      .where('isPublic', '==', true);

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('category', '==', category);
    }
    if (lga) {
      query = query.where('lga', '==', lga);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query = query.offset(offset).limit(limitNum);

    const snapshot = await query.get();
    let projects = snapshot.docs.map(doc => doc.data() as Project);

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      projects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.lga.toLowerCase().includes(searchTerm)
      );
    }

    // Get contractor information for each project
    const projectsWithContractors = await Promise.all(
      projects.map(async (project) => {
        let contractor = null;
        if (project.contractorId) {
          const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES)
            .doc(project.contractorId).get();
          if (contractorDoc.exists) {
            contractor = {
              id: contractorDoc.data()?.id,
              companyName: contractorDoc.data()?.companyName
            };
          }
        }

        return {
          ...project,
          contractor
        };
      })
    );

    // Get total count for pagination
    const totalSnapshot = await db.collection(Collections.PROJECTS)
      .where('isPublic', '==', true)
      .get();
    const total = totalSnapshot.size;

    return res.json({
      success: true,
      data: {
        projects: projectsWithContractors,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error: any) {
    console.error('Get public projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get public projects'
    });
  }
});

/**
 * GET /api/public/projects/:id
 * Get public project details
 */
router.get('/projects/:id', async (req, res) => {
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

    // Check if project is public
    if (!project.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get contractor information
    let contractor = null;
    if (project.contractorId) {
      const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES)
        .doc(project.contractorId).get();
      if (contractorDoc.exists) {
        contractor = {
          id: contractorDoc.data()?.id,
          companyName: contractorDoc.data()?.companyName,
          rating: contractorDoc.data()?.rating
        };
      }
    }

    // Get milestones (public information only)
    const milestonesSnapshot = await db.collection(Collections.MILESTONES)
      .where('projectId', '==', id)
      .orderBy('order', 'asc')
      .get();
    const milestones = milestonesSnapshot.docs.map(doc => {
      const milestone = doc.data();
      return {
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        dueDate: milestone.dueDate,
        status: milestone.status,
        progress: milestone.progress
      };
    });

    return res.json({
      success: true,
      data: {
        project: {
          ...project,
          contractor,
          milestones
        }
      }
    });

  } catch (error: any) {
    console.error('Get public project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get project details'
    });
  }
});

/**
 * GET /api/public/stats
 * Get public statistics
 */
router.get('/stats', async (_req, res) => {
  try {
    const projectsSnapshot = await db.collection(Collections.PROJECTS)
      .where('isPublic', '==', true)
      .get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    const stats = {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
      activeProjects: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0,
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
      }
    };

    return res.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('Get public stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get public statistics'
    });
  }
});

/**
 * GET /api/public/projects-by-category
 * Get projects grouped by category
 */
router.get('/projects-by-category', async (_req, res) => {
  try {
    const projectsSnapshot = await db.collection(Collections.PROJECTS)
      .where('isPublic', '==', true)
      .get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    const projectsByCategory = Object.values(ProjectCategory).map(category => {
      const categoryProjects = projects.filter(p => p.category === category);
      return {
        category,
        count: categoryProjects.length,
        totalBudget: categoryProjects.reduce((sum, p) => sum + p.budget, 0),
        averageProgress: categoryProjects.length > 0 
          ? categoryProjects.reduce((sum, p) => sum + p.progress, 0) / categoryProjects.length 
          : 0,
        projects: categoryProjects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          lga: p.lga,
          status: p.status,
          progress: p.progress,
          budget: p.budget,
          startDate: p.startDate,
          expectedEndDate: p.expectedEndDate
        }))
      };
    }).filter(category => category.count > 0);

    return res.json({
      success: true,
      data: { projectsByCategory }
    });

  } catch (error: any) {
    console.error('Get projects by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get projects by category'
    });
  }
});

/**
 * GET /api/public/projects-by-lga
 * Get projects grouped by LGA
 */
router.get('/projects-by-lga', async (_req, res) => {
  try {
    const projectsSnapshot = await db.collection(Collections.PROJECTS)
      .where('isPublic', '==', true)
      .get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    // Group projects by LGA
    const projectsByLGA = projects.reduce((acc, project) => {
      const lga = project.lga;
      if (!acc[lga]) {
        acc[lga] = {
          lga,
          count: 0,
          totalBudget: 0,
          completedCount: 0,
          activeCount: 0,
          projects: []
        };
      }
      
      acc[lga].count++;
      acc[lga].totalBudget += project.budget;
      
      if (project.status === ProjectStatus.COMPLETED) {
        acc[lga].completedCount++;
      } else if (project.status === ProjectStatus.IN_PROGRESS) {
        acc[lga].activeCount++;
      }
      
      acc[lga].projects.push({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        budget: project.budget,
        startDate: project.startDate,
        expectedEndDate: project.expectedEndDate
      });
      
      return acc;
    }, {} as any);

    const lgaData = Object.values(projectsByLGA).map((lga: any) => ({
      ...lga,
      averageProgress: lga.projects.length > 0 
        ? lga.projects.reduce((sum: number, p: any) => sum + p.progress, 0) / lga.projects.length 
        : 0
    })).sort((a: any, b: any) => b.count - a.count);

    return res.json({
      success: true,
      data: { projectsByLGA: lgaData }
    });

  } catch (error: any) {
    console.error('Get projects by LGA error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get projects by LGA'
    });
  }
});

/**
 * GET /api/public/projects/search
 * Search public projects
 */
router.get('/projects/search', async (req, res) => {
  try {
    const { q, category, lga, status, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = db.collection(Collections.PROJECTS)
      .where('isPublic', '==', true);

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (lga) {
      query = query.where('lga', '==', lga);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    const limitNum = parseInt(limit as string);
    query = query.limit(limitNum);

    const snapshot = await query.get();
    const projects = snapshot.docs.map(doc => doc.data() as Project);

    // Apply search filter
    const searchTerm = (q as string).toLowerCase();
    const searchResults = projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.lga.toLowerCase().includes(searchTerm) ||
      project.beneficiaries?.toLowerCase().includes(searchTerm)
    );

    return res.json({
      success: true,
      data: {
        projects: searchResults,
        query: q,
        total: searchResults.length
      }
    });

  } catch (error: any) {
    console.error('Search public projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search projects'
    });
  }
});

export default router;
