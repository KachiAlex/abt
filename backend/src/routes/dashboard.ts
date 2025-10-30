import { Router } from 'express';
import { db, Collections } from '../config/firestore';
import { Project, ProjectStatus, ProjectCategory, Submission, SubmissionStatus } from '../types/firestore';
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

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', verifyToken, async (_req, res) => {
  try {
    // Get all projects
    const projectsSnapshot = await db.collection(Collections.PROJECTS).get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    // Get all submissions
    const submissionsSnapshot = await db.collection(Collections.SUBMISSIONS).get();
    const submissions = submissionsSnapshot.docs.map(doc => doc.data() as Submission);

    // Get all contractors
    const contractorsSnapshot = await db.collection(Collections.CONTRACTOR_PROFILES).get();
    const contractors = contractorsSnapshot.docs.map(doc => doc.data());

    // Calculate statistics
    const stats = {
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
        completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        delayed: projects.filter(p => p.status === ProjectStatus.DELAYED).length,
        notStarted: projects.filter(p => p.status === ProjectStatus.NOT_STARTED).length
      },
      submissions: {
        total: submissions.length,
        pending: submissions.filter(s => s.status === SubmissionStatus.PENDING).length,
        underReview: submissions.filter(s => s.status === SubmissionStatus.UNDER_REVIEW).length,
        approved: submissions.filter(s => s.status === SubmissionStatus.APPROVED).length,
        rejected: submissions.filter(s => s.status === SubmissionStatus.REJECTED).length
      },
      contractors: {
        total: contractors.length,
        verified: contractors.filter(c => c.isVerified).length,
        certified: contractors.filter(c => c.isCertified).length
      },
      budget: {
        totalAllocated: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget), 0),
        totalSpent: projects.reduce((sum, p) => sum + p.spentBudget, 0),
        remaining: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget) - p.spentBudget, 0)
      },
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0
    };

    return res.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
});

/**
 * GET /api/dashboard/project-status-chart
 * Get project status chart data
 */
router.get('/project-status-chart', verifyToken, async (req, res) => {
  try {
    const { type = 'bar' } = req.query;

    const projectsSnapshot = await db.collection(Collections.PROJECTS).get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    const statusData = {
      [ProjectStatus.NOT_STARTED]: projects.filter(p => p.status === ProjectStatus.NOT_STARTED).length,
      [ProjectStatus.IN_PROGRESS]: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
      [ProjectStatus.NEAR_COMPLETION]: projects.filter(p => p.status === ProjectStatus.NEAR_COMPLETION).length,
      [ProjectStatus.COMPLETED]: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
      [ProjectStatus.DELAYED]: projects.filter(p => p.status === ProjectStatus.DELAYED).length,
      [ProjectStatus.ON_HOLD]: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
      [ProjectStatus.CANCELLED]: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
    };

    const categoryData = {
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
    };

    return res.json({
      success: true,
      data: {
        type,
        statusData,
        categoryData
      }
    });

  } catch (error: any) {
    console.error('Get project status chart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get project status chart data'
    });
  }
});

/**
 * GET /api/dashboard/budget-analysis
 * Get budget analysis data
 */
router.get('/budget-analysis', verifyToken, async (_req, res) => {
  try {
    const projectsSnapshot = await db.collection(Collections.PROJECTS).get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    const budgetAnalysis = {
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      allocatedBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget), 0),
      spentBudget: projects.reduce((sum, p) => sum + p.spentBudget, 0),
      remainingBudget: projects.reduce((sum, p) => sum + (p.allocatedBudget || p.budget) - p.spentBudget, 0),
      byCategory: Object.values(ProjectCategory).map(category => {
        const categoryProjects = projects.filter(p => p.category === category);
        return {
          category,
          totalBudget: categoryProjects.reduce((sum, p) => sum + p.budget, 0),
          spentBudget: categoryProjects.reduce((sum, p) => sum + p.spentBudget, 0),
          projectCount: categoryProjects.length
        };
      }),
      byStatus: Object.values(ProjectStatus).map(status => {
        const statusProjects = projects.filter(p => p.status === status);
        return {
          status,
          totalBudget: statusProjects.reduce((sum, p) => sum + p.budget, 0),
          spentBudget: statusProjects.reduce((sum, p) => sum + p.spentBudget, 0),
          projectCount: statusProjects.length
        };
      })
    };

    return res.json({
      success: true,
      data: { budgetAnalysis }
    });

  } catch (error: any) {
    console.error('Get budget analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get budget analysis data'
    });
  }
});

/**
 * GET /api/dashboard/lga-performance
 * Get LGA performance data
 */
router.get('/lga-performance', verifyToken, async (_req, res) => {
  try {
    const projectsSnapshot = await db.collection(Collections.PROJECTS).get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    // Group projects by LGA
    const lgaData = projects.reduce((acc, project) => {
      const lga = project.lga;
      if (!acc[lga]) {
        acc[lga] = {
          lga,
          totalProjects: 0,
          completedProjects: 0,
          activeProjects: 0,
          totalBudget: 0,
          spentBudget: 0,
          averageProgress: 0
        };
      }
      
      acc[lga].totalProjects++;
      acc[lga].totalBudget += project.budget;
      acc[lga].spentBudget += project.spentBudget;
      
      if (project.status === ProjectStatus.COMPLETED) {
        acc[lga].completedProjects++;
      } else if (project.status === ProjectStatus.IN_PROGRESS) {
        acc[lga].activeProjects++;
      }
      
      return acc;
    }, {} as any);

    // Calculate average progress for each LGA
    Object.keys(lgaData).forEach(lga => {
      const lgaProjects = projects.filter(p => p.lga === lga);
      lgaData[lga].averageProgress = lgaProjects.length > 0 
        ? lgaProjects.reduce((sum, p) => sum + p.progress, 0) / lgaProjects.length 
        : 0;
    });

    const lgaPerformance = Object.values(lgaData).sort((a: any, b: any) => b.completedProjects - a.completedProjects);

    return res.json({
      success: true,
      data: { lgaPerformance }
    });

  } catch (error: any) {
    console.error('Get LGA performance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get LGA performance data'
    });
  }
});

/**
 * GET /api/dashboard/recent-activity
 * Get recent activity feed
 */
router.get('/recent-activity', verifyToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit as string);

    // Get recent submissions
    const submissionsSnapshot = await db.collection(Collections.SUBMISSIONS)
      .orderBy('submittedAt', 'desc')
      .limit(limitNum)
      .get();
    const submissions = submissionsSnapshot.docs.map(doc => doc.data() as Submission);

    // Get recent projects
    const projectsSnapshot = await db.collection(Collections.PROJECTS)
      .orderBy('updatedAt', 'desc')
      .limit(limitNum)
      .get();
    const projects = projectsSnapshot.docs.map(doc => doc.data() as Project);

    // Combine and format activities
    const activities = [];

    // Add submission activities
    for (const submission of submissions) {
      const projectDoc = await db.collection(Collections.PROJECTS).doc(submission.projectId).get();
      const project = projectDoc.exists ? projectDoc.data() : null;

      const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(submission.contractorId).get();
      const contractor = contractorDoc.exists ? contractorDoc.data() : null;

      activities.push({
        id: `submission-${submission.id}`,
        type: 'submission',
        title: `New ${submission.type.toLowerCase()} submission`,
        description: `${contractor?.companyName || 'Contractor'} submitted: ${submission.title}`,
        project: project ? { id: project.id, name: project.name } : null,
        timestamp: submission.submittedAt,
        status: submission.status
      });
    }

    // Add project activities
    for (const project of projects) {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        title: 'Project updated',
        description: `${project.name} - Status: ${project.status}`,
        project: { id: project.id, name: project.name },
        timestamp: project.updatedAt,
        status: project.status
      });
    }

    // Sort by timestamp and limit
    const toMs = (t: any) => (typeof t?.toMillis === 'function' ? t.toMillis() : new Date(t).getTime());
    activities.sort((a, b) => toMs(b.timestamp) - toMs(a.timestamp));
    const recentActivities = activities.slice(0, limitNum);

    return res.json({
      success: true,
      data: { activities: recentActivities }
    });

  } catch (error: any) {
    console.error('Get recent activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get recent activity'
    });
  }
});

export default router;
