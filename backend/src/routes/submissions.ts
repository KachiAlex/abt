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

// Middleware to check M&E officer role
const requireMEOfficer = (req: Request, res: Response, next: () => void): void => {
  if (!req.user || (req.user.role !== 'ME_OFFICER' && req.user.role !== 'GOVERNMENT_ADMIN')) {
    res.status(403).json({
      success: false,
      message: 'M&E Officer access required'
    });
    return;
  }
  next();
};

/**
 * GET /api/submissions
 * Get all submissions with filtering
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { 
      projectId,
      contractorId,
      status, 
      type,
      priority,
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (projectId) {
      conditions.push(`project_id = $${paramIndex++}`);
      params.push(projectId);
    }
    if (contractorId) {
      conditions.push(`contractor_id = $${paramIndex++}`);
      params.push(contractorId);
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (priority) {
      conditions.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get submissions with pagination
    const result = await query(
      `SELECT * FROM submissions ${whereClause} ORDER BY submitted_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit as string), (parseInt(page as string) - 1) * parseInt(limit as string)]
    );

    let submissions = result.rows.map(rowToCamelCase);

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      submissions = submissions.filter((submission: any) => 
        submission.title?.toLowerCase().includes(searchTerm) ||
        submission.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Get additional information for each submission
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission: any) => {
        // Get project information
        const projectResult = await query(
          'SELECT id, name, lga FROM projects WHERE id = $1',
          [submission.projectId]
        );
        const project = projectResult.rows.length > 0 ? rowToCamelCase(projectResult.rows[0]) : null;

        // Get contractor information
        const contractorResult = await query(
          'SELECT id, company_name FROM contractor_profiles WHERE id = $1',
          [submission.contractorId]
        );
        const contractor = contractorResult.rows.length > 0 ? rowToCamelCase(contractorResult.rows[0]) : null;

        // Get submitter information
        const submitterResult = await query(
          'SELECT id, first_name, last_name FROM users WHERE id = $1',
          [submission.submittedBy]
        );
        const submitter = submitterResult.rows.length > 0 ? rowToCamelCase(submitterResult.rows[0]) : null;

        return {
          ...submission,
          project: project ? {
            id: project.id,
            name: project.name,
            lga: project.lga
          } : null,
          contractor: contractor ? {
            id: contractor.id,
            companyName: contractor.companyName
          } : null,
          submitter: submitter ? {
            id: submitter.id,
            firstName: submitter.firstName,
            lastName: submitter.lastName
          } : null
        };
      })
    );

    // Get total count for pagination
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM submissions ${whereClause}`,
      params
    );
    const total = parseInt(totalResult.rows[0].count);

    return res.json({
      success: true,
      data: {
        submissions: submissionsWithDetails,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });

  } catch (error: any) {
    console.error('Get submissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get submissions'
    });
  }
});

/**
 * GET /api/submissions/:id
 * Get submission by ID
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = rowToCamelCase(result.rows[0]);

    // Get project information
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1',
      [submission.projectId]
    );
    const project = projectResult.rows.length > 0 ? rowToCamelCase(projectResult.rows[0]) : null;

    // Get contractor information
    const contractorResult = await query(
      'SELECT * FROM contractor_profiles WHERE id = $1',
      [submission.contractorId]
    );
    const contractor = contractorResult.rows.length > 0 ? rowToCamelCase(contractorResult.rows[0]) : null;

    // Get submitter information
    const submitterResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [submission.submittedBy]
    );
    const submitter = submitterResult.rows.length > 0 ? rowToCamelCase(submitterResult.rows[0]) : null;

    // Get milestone information if exists
    let milestone = null;
    if (submission.milestoneId) {
      const milestoneResult = await query(
        'SELECT * FROM milestones WHERE id = $1',
        [submission.milestoneId]
      );
      milestone = milestoneResult.rows.length > 0 ? rowToCamelCase(milestoneResult.rows[0]) : null;
    }

    // Get documents
    const documentsResult = await query(
      'SELECT * FROM documents WHERE submission_id = $1',
      [id]
    );
    const documents = documentsResult.rows.map(rowToCamelCase);

    // Get approvals
    const approvalsResult = await query(
      'SELECT * FROM approvals WHERE submission_id = $1 ORDER BY created_at DESC',
      [id]
    );
    const approvals = approvalsResult.rows.map(rowToCamelCase);

    return res.json({
      success: true,
      data: {
        submission: {
          ...submission,
          project,
          contractor,
          submitter,
          milestone,
          documents,
          approvals
        }
      }
    });

  } catch (error: any) {
    console.error('Get submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get submission'
    });
  }
});

/**
 * POST /api/submissions
 * Create new submission (Contractor only)
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      milestoneId,
      type,
      title,
      description,
      progress,
      estimatedValue,
      priority = 'MEDIUM',
      qualityScore,
      safetyCompliance,
      weatherImpact,
      dueDate
    } = req.body;

    // Validate required fields
    if (!projectId || !type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: projectId, type, title, description'
      });
    }

    // Check if user is authenticated and is a contractor
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only contractors can create submissions'
      });
    }

    // Get contractor profile for this user
    const contractorResult = await query(
      'SELECT id FROM contractor_profiles WHERE user_id = $1 LIMIT 1',
      [req.user.userId]
    );

    if (contractorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contractor profile not found'
      });
    }

    const contractorId = contractorResult.rows[0].id;

    // Check if project exists
    const projectResult = await query(
      'SELECT contractor_id FROM projects WHERE id = $1',
      [projectId]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = rowToCamelCase(projectResult.rows[0]);

    // Check if contractor is assigned to this project
    if (project.contractorId !== contractorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit for this project'
      });
    }

    // Generate submission ID
    const submissionId = `submission-${Date.now()}-${uuidv4().split('-')[0]}`;

    // Create submission
    const insertResult = await query(
      `INSERT INTO submissions (
        id, project_id, milestone_id, contractor_id, submitted_by,
        type, title, description, progress, estimated_value,
        priority, status, quality_score, safety_compliance,
        weather_impact, media_count, due_date, submitted_at,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW(), NOW())
      RETURNING *`,
      [
        submissionId, projectId, milestoneId || null, contractorId, req.user.userId,
        type, title, description, progress ? parseInt(progress) : null,
        estimatedValue ? parseFloat(estimatedValue) : null,
        priority, 'PENDING', qualityScore ? parseFloat(qualityScore) : null,
        safetyCompliance || null, weatherImpact || null, 0,
        dueDate ? new Date(dueDate) : null
      ]
    );

    const submission = rowToCamelCase(insertResult.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: { submission }
    });

  } catch (error: any) {
    console.error('Create submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create submission'
    });
  }
});

/**
 * PUT /api/submissions/:id
 * Update submission
 */
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if submission exists
    const checkResult = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = rowToCamelCase(checkResult.rows[0]);

    // Check permissions
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isMEOfficer = req.user.role === 'ME_OFFICER';
    const isContractorOwner = submission.contractorId === req.user.userId;

    if (!isAdmin && !isMEOfficer && !isContractorOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this submission'
      });
    }

    // Contractors can only update pending submissions
    if (isContractorOwner && submission.status !== 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Can only update pending submissions'
      });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.projectId;
    delete updateData.contractorId;
    delete updateData.submittedBy;
    delete updateData.createdAt;

    // Convert camelCase to snake_case and build update
    const snakeCaseData = objectToSnakeCase(updateData);
    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined && value !== null) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    // Update submission
    await query(
      `UPDATE submissions SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Get updated submission
    const updatedResult = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );
    const updatedSubmission = rowToCamelCase(updatedResult.rows[0]);

    return res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission: updatedSubmission }
    });

  } catch (error: any) {
    console.error('Update submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
});

/**
 * PUT /api/submissions/:id/review
 * Review submission (M&E Officer only)
 */
router.put('/:id/review', verifyToken, requireMEOfficer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, comments, qualityScore, safetyCompliance } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    // Check if submission exists
    const checkResult = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Determine status based on action
    let status = 'PENDING';
    if (action === 'APPROVED') status = 'APPROVED';
    else if (action === 'REJECTED') status = 'REJECTED';
    else if (action === 'FLAGGED') status = 'FLAGGED';
    else if (action === 'REQUIRES_CLARIFICATION') status = 'REQUIRES_CLARIFICATION';

    // Update submission
    const updateParams: any[] = [];
    let paramIndex = 1;
    const updates: string[] = [];

    updates.push(`status = $${paramIndex++}`);
    updateParams.push(status);
    
    updates.push(`reviewed_at = NOW()`);
    updates.push(`reviewed_by = $${paramIndex++}`);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    updateParams.push(req.user.userId);
    
    if (comments) {
      updates.push(`review_comments = $${paramIndex++}`);
      updateParams.push(comments);
    }
    if (qualityScore) {
      updates.push(`quality_score = $${paramIndex++}`);
      updateParams.push(parseFloat(qualityScore));
    }
    if (safetyCompliance) {
      updates.push(`safety_compliance = $${paramIndex++}`);
      updateParams.push(safetyCompliance);
    }
    
    updates.push(`updated_at = NOW()`);
    updateParams.push(id);

    await query(
      `UPDATE submissions SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      updateParams
    );

    // Create approval record
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const approvalId = `approval-${Date.now()}-${uuidv4().split('-')[0]}`;
    await query(
      `INSERT INTO approvals (id, submission_id, reviewer_id, action, comments, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [approvalId, id, req.user.userId, action, comments || null]
    );

    // Get updated submission
    const updatedResult = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );
    const updatedSubmission = rowToCamelCase(updatedResult.rows[0]);

    return res.json({
      success: true,
      message: 'Submission reviewed successfully',
      data: { submission: updatedSubmission }
    });

  } catch (error: any) {
    console.error('Review submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review submission'
    });
  }
});

/**
 * DELETE /api/submissions/:id
 * Delete submission
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if submission exists
    const checkResult = await query(
      'SELECT * FROM submissions WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = rowToCamelCase(checkResult.rows[0]);

    // Check permissions
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isContractorOwner = submission.contractorId === req.user.userId;

    if (!isAdmin && !isContractorOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    // Delete submission (cascade will handle related records)
    await query(
      'DELETE FROM submissions WHERE id = $1',
      [id]
    );

    return res.json({
      success: true,
      message: 'Submission deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete submission'
    });
  }
});

/**
 * GET /api/submissions/stats
 * Get submission statistics
 */
router.get('/stats/overview', verifyToken, async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM submissions');
    const submissions = result.rows.map(rowToCamelCase);

    const stats = {
      total: submissions.length,
      byStatus: {
        PENDING: submissions.filter(s => s.status === 'PENDING').length,
        UNDER_REVIEW: submissions.filter(s => s.status === 'UNDER_REVIEW').length,
        APPROVED: submissions.filter(s => s.status === 'APPROVED').length,
        REJECTED: submissions.filter(s => s.status === 'REJECTED').length,
        FLAGGED: submissions.filter(s => s.status === 'FLAGGED').length,
        REQUIRES_CLARIFICATION: submissions.filter(s => s.status === 'REQUIRES_CLARIFICATION').length,
      },
      byType: {
        MILESTONE: submissions.filter(s => s.type === 'MILESTONE').length,
        PROGRESS: submissions.filter(s => s.type === 'PROGRESS').length,
        ISSUE: submissions.filter(s => s.type === 'ISSUE').length,
        SAFETY: submissions.filter(s => s.type === 'SAFETY').length,
        QUALITY: submissions.filter(s => s.type === 'QUALITY').length,
        DELAY: submissions.filter(s => s.type === 'DELAY').length,
        GENERAL: submissions.filter(s => s.type === 'GENERAL').length,
      },
      averageQualityScore: submissions.filter(s => s.qualityScore).length > 0 
        ? submissions.filter(s => s.qualityScore).reduce((sum, s) => sum + (s.qualityScore || 0), 0) / submissions.filter(s => s.qualityScore).length 
        : 0
    };

    return res.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('Get submission stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get submission statistics'
    });
  }
});

export default router;
