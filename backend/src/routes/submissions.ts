import { Router } from 'express';
import { db, Collections } from '../config/firestore';
import { Submission, SubmissionType, SubmissionStatus, Priority } from '../types/firestore';
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

// Middleware to check M&E officer role
const requireMEOfficer = (req: any, res: any, next: any) => {
  if (req.user.role !== 'ME_OFFICER' && req.user.role !== 'GOVERNMENT_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'M&E Officer access required'
    });
  }
  next();
};

/**
 * GET /api/submissions
 * Get all submissions with filtering
 */
router.get('/', verifyToken, async (req, res) => {
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

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(Collections.SUBMISSIONS);

    // Apply filters
    if (projectId) {
      query = query.where('projectId', '==', projectId);
    }
    if (contractorId) {
      query = query.where('contractorId', '==', contractorId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (priority) {
      query = query.where('priority', '==', priority);
    }

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query = query.orderBy('submittedAt', 'desc').offset(offset).limit(limitNum);

    const snapshot = await query.get();
    let submissions = snapshot.docs.map(doc => doc.data() as Submission);

    // Apply search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      submissions = submissions.filter(submission => 
        submission.title.toLowerCase().includes(searchTerm) ||
        submission.description.toLowerCase().includes(searchTerm)
      );
    }

    // Get additional information for each submission
    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        // Get project information
        const projectDoc = await db.collection(Collections.PROJECTS).doc(submission.projectId).get();
        const project = projectDoc.exists ? projectDoc.data() : null;

        // Get contractor information
        const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(submission.contractorId).get();
        const contractor = contractorDoc.exists ? contractorDoc.data() : null;

        // Get submitter information
        const submitterDoc = await db.collection(Collections.USERS).doc(submission.submittedBy).get();
        const submitter = submitterDoc.exists ? submitterDoc.data() : null;

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
    const totalSnapshot = await db.collection(Collections.SUBMISSIONS).get();
    const total = totalSnapshot.size;

    return res.json({
      success: true,
      data: {
        submissions: submissionsWithDetails,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
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
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(Collections.SUBMISSIONS).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = doc.data() as Submission;

    // Get project information
    const projectDoc = await db.collection(Collections.PROJECTS).doc(submission.projectId).get();
    const project = projectDoc.exists ? projectDoc.data() : null;

    // Get contractor information
    const contractorDoc = await db.collection(Collections.CONTRACTOR_PROFILES).doc(submission.contractorId).get();
    const contractor = contractorDoc.exists ? contractorDoc.data() : null;

    // Get submitter information
    const submitterDoc = await db.collection(Collections.USERS).doc(submission.submittedBy).get();
    const submitter = submitterDoc.exists ? submitterDoc.data() : null;

    // Get milestone information if exists
    let milestone = null;
    if (submission.milestoneId) {
      const milestoneDoc = await db.collection(Collections.MILESTONES).doc(submission.milestoneId).get();
      milestone = milestoneDoc.exists ? milestoneDoc.data() : null;
    }

    // Get documents
    const documentsSnapshot = await db.collection(Collections.DOCUMENTS)
      .where('submissionId', '==', id)
      .get();
    const documents = documentsSnapshot.docs.map(doc => doc.data());

    // Get approvals
    const approvalsSnapshot = await db.collection(Collections.APPROVALS)
      .where('submissionId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();
    const approvals = approvalsSnapshot.docs.map(doc => doc.data());

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
router.post('/', verifyToken, async (req, res) => {
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

    // Check if user is a contractor
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only contractors can create submissions'
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

    const project: any = projectDoc.data();

    // Check if contractor is assigned to this project
    if (project.contractorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit for this project'
      });
    }

    // Generate submission ID
    const submissionId = `submission-${Date.now()}`;

    // Create submission object
    const submission: Submission = {
      id: submissionId,
      projectId,
      milestoneId: milestoneId || null,
      contractorId: req.user.userId,
      submittedBy: req.user.userId,
      type: type as SubmissionType,
      title,
      description,
      progress: progress ? parseInt(progress) : undefined,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      priority: priority as Priority,
      status: SubmissionStatus.PENDING,
      qualityScore: qualityScore ? parseFloat(qualityScore) : undefined,
      safetyCompliance,
      weatherImpact,
      mediaCount: 0,
      dueDate: dueDate ? new Date(dueDate) as any : undefined,
      submittedAt: new Date() as any,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };

    // Save submission to Firestore
    await db.collection(Collections.SUBMISSIONS).doc(submissionId).set(submission);

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
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if submission exists
    const doc = await db.collection(Collections.SUBMISSIONS).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = doc.data() as Submission;

    // Check permissions
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
    if (isContractorOwner && submission.status !== SubmissionStatus.PENDING) {
      return res.status(403).json({
        success: false,
        message: 'Can only update pending submissions'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.projectId;
    delete updateData.contractorId;
    delete updateData.submittedBy;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    // Update submission
    await db.collection(Collections.SUBMISSIONS).doc(id).update(updateData);

    // Get updated submission
    const updatedDoc = await db.collection(Collections.SUBMISSIONS).doc(id).get();
    const updatedSubmission = updatedDoc.data() as Submission;

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
router.put('/:id/review', verifyToken, requireMEOfficer, async (req, res) => {
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
    const doc = await db.collection(Collections.SUBMISSIONS).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    

    // Update submission status
    const updateData: any = {
      status: action === 'APPROVED' ? SubmissionStatus.APPROVED : 
              action === 'REJECTED' ? SubmissionStatus.REJECTED :
              action === 'FLAGGED' ? SubmissionStatus.FLAGGED :
              SubmissionStatus.REQUIRES_CLARIFICATION,
      reviewedAt: new Date(),
      reviewedBy: req.user.userId,
      reviewComments: comments,
      updatedAt: new Date()
    };

    if (qualityScore) updateData.qualityScore = parseFloat(qualityScore);
    if (safetyCompliance) updateData.safetyCompliance = safetyCompliance;

    await db.collection(Collections.SUBMISSIONS).doc(id).update(updateData);

    // Create approval record
    const approvalId = `approval-${Date.now()}`;
    await db.collection(Collections.APPROVALS).doc(approvalId).set({
      id: approvalId,
      submissionId: id,
      reviewerId: req.user.userId,
      action,
      comments,
      createdAt: new Date()
    });

    // Get updated submission
    const updatedDoc = await db.collection(Collections.SUBMISSIONS).doc(id).get();
    const updatedSubmission = updatedDoc.data() as Submission;

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
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if submission exists
    const doc = await db.collection(Collections.SUBMISSIONS).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = doc.data() as Submission;

    // Check permissions
    const isAdmin = req.user.role === 'GOVERNMENT_ADMIN';
    const isContractorOwner = submission.contractorId === req.user.userId;

    if (!isAdmin && !isContractorOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    // Delete submission
    await db.collection(Collections.SUBMISSIONS).doc(id).delete();

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
router.get('/stats/overview', verifyToken, async (_req, res) => {
  try {
    const snapshot = await db.collection(Collections.SUBMISSIONS).get();
    const submissions = snapshot.docs.map(doc => doc.data() as Submission);

    const stats = {
      total: submissions.length,
      byStatus: {
        [SubmissionStatus.PENDING]: submissions.filter(s => s.status === SubmissionStatus.PENDING).length,
        [SubmissionStatus.UNDER_REVIEW]: submissions.filter(s => s.status === SubmissionStatus.UNDER_REVIEW).length,
        [SubmissionStatus.APPROVED]: submissions.filter(s => s.status === SubmissionStatus.APPROVED).length,
        [SubmissionStatus.REJECTED]: submissions.filter(s => s.status === SubmissionStatus.REJECTED).length,
        [SubmissionStatus.FLAGGED]: submissions.filter(s => s.status === SubmissionStatus.FLAGGED).length,
        [SubmissionStatus.REQUIRES_CLARIFICATION]: submissions.filter(s => s.status === SubmissionStatus.REQUIRES_CLARIFICATION).length,
      },
      byType: {
        [SubmissionType.MILESTONE]: submissions.filter(s => s.type === SubmissionType.MILESTONE).length,
        [SubmissionType.PROGRESS]: submissions.filter(s => s.type === SubmissionType.PROGRESS).length,
        [SubmissionType.ISSUE]: submissions.filter(s => s.type === SubmissionType.ISSUE).length,
        [SubmissionType.SAFETY]: submissions.filter(s => s.type === SubmissionType.SAFETY).length,
        [SubmissionType.QUALITY]: submissions.filter(s => s.type === SubmissionType.QUALITY).length,
        [SubmissionType.DELAY]: submissions.filter(s => s.type === SubmissionType.DELAY).length,
        [SubmissionType.GENERAL]: submissions.filter(s => s.type === SubmissionType.GENERAL).length,
      },
      averageQualityScore: submissions.filter(s => s.qualityScore).length > 0 
        ? submissions.filter(s => s.qualityScore).reduce((sum, s) => sum + s.qualityScore!, 0) / submissions.filter(s => s.qualityScore).length 
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
