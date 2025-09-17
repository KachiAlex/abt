import { Request, Response } from 'express';
import { SubmissionType, SubmissionStatus, ApprovalAction, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { io } from '../server';

export const createSubmission = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  if (user.role !== UserRole.CONTRACTOR) {
    throw new AppError('Only contractors can create submissions', 403);
  }

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
    dueDate,
  } = req.body;

  // Verify project belongs to contractor
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      contractorId: user.contractorId,
    },
  });

  if (!project) {
    throw new AppError('Project not found or access denied', 404);
  }

  // If milestone specified, verify it belongs to the project
  if (milestoneId) {
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        projectId,
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }
  }

  const submission = await prisma.submission.create({
    data: {
      projectId,
      milestoneId,
      contractorId: user.contractorId!,
      submittedBy: user.id,
      type: type as SubmissionType,
      title,
      description,
      progress: progress ? parseInt(progress) : null,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      priority,
      qualityScore: qualityScore ? parseFloat(qualityScore) : null,
      safetyCompliance,
      weatherImpact,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      milestone: {
        select: {
          id: true,
          name: true,
        },
      },
      contractor: {
        select: {
          companyName: true,
        },
      },
    },
  });

  // Send real-time notification to M&E officers
  const meOfficers = await prisma.user.findMany({
    where: { role: UserRole.ME_OFFICER, isActive: true },
    select: { id: true },
  });

  meOfficers.forEach(officer => {
    io.to(`user-${officer.id}`).emit('new-submission', {
      type: 'NEW_SUBMISSION',
      title: 'New Submission Received',
      message: `${submission.contractor.companyName} submitted: ${submission.title}`,
      data: submission,
    });
  });

  sendSuccess(res, submission, 'Submission created successfully', 201);
});

export const getSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    search,
    type,
    status,
    priority,
    projectId,
    contractorId,
    sortBy = 'submittedAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  // Role-based filtering
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  // Search filter
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { project: { name: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  // Type filter
  if (type && type !== 'All Types') {
    where.type = type as SubmissionType;
  }

  // Status filter
  if (status && status !== 'All Status') {
    where.status = status as SubmissionStatus;
  }

  // Priority filter
  if (priority && priority !== 'All Priorities') {
    where.priority = priority;
  }

  // Project filter
  if (projectId) {
    where.projectId = projectId;
  }

  // Contractor filter (for M&E officers and government)
  if (contractorId && user.role !== UserRole.CONTRACTOR) {
    where.contractorId = contractorId;
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            lga: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
        contractor: {
          select: {
            id: true,
            companyName: true,
          },
        },
        submitter: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
          },
        },
        approvals: {
          include: {
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  sendPaginatedResponse(res, submissions, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  }, 'Submissions retrieved successfully');
});

export const getSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          lga: true,
          contractorId: true,
        },
      },
      milestone: true,
      contractor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      submitter: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      documents: true,
      approvals: {
        include: {
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Check access permissions
  const canAccess = 
    user.role === UserRole.ME_OFFICER ||
    user.role === UserRole.GOVERNMENT_ADMIN ||
    user.role === UserRole.GOVERNMENT_OFFICER ||
    (user.role === UserRole.CONTRACTOR && user.contractorId === submission.contractorId);

  if (!canAccess) {
    throw new AppError('Access denied', 403);
  }

  sendSuccess(res, submission, 'Submission retrieved successfully');
});

export const reviewSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  if (user.role !== UserRole.ME_OFFICER && user.role !== UserRole.GOVERNMENT_ADMIN) {
    throw new AppError('Only M&E officers and government admins can review submissions', 403);
  }

  const { action, comments } = req.body;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      project: true,
      contractor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Update submission status based on action
  let newStatus: SubmissionStatus;
  switch (action as ApprovalAction) {
    case 'APPROVED':
      newStatus = 'APPROVED';
      break;
    case 'REJECTED':
      newStatus = 'REJECTED';
      break;
    case 'FLAGGED':
      newStatus = 'FLAGGED';
      break;
    case 'REQUEST_CLARIFICATION':
      newStatus = 'REQUIRES_CLARIFICATION';
      break;
    default:
      throw new AppError('Invalid action', 400);
  }

  // Update submission
  const updatedSubmission = await prisma.submission.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedAt: new Date(),
      reviewedBy: user.id,
      reviewComments: comments,
    },
  });

  // Create approval record
  await prisma.approval.create({
    data: {
      submissionId: id,
      reviewerId: user.id,
      action: action as ApprovalAction,
      comments,
    },
  });

  // If milestone submission is approved, update milestone status
  if (action === 'APPROVED' && submission.type === 'MILESTONE' && submission.milestoneId) {
    await prisma.milestone.update({
      where: { id: submission.milestoneId },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        progress: submission.progress || 100,
      },
    });

    // Update project progress
    const milestones = await prisma.milestone.findMany({
      where: { projectId: submission.projectId },
    });

    const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;
    const projectProgress = Math.round((completedMilestones / milestones.length) * 100);

    await prisma.project.update({
      where: { id: submission.projectId },
      data: { 
        progress: projectProgress,
        status: projectProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });
  }

  // Send real-time notification to contractor
  io.to(`user-${submission.contractor.user.id}`).emit('submission-reviewed', {
    type: 'SUBMISSION_REVIEWED',
    title: `Submission ${action.toLowerCase()}`,
    message: `Your submission "${submission.title}" has been ${action.toLowerCase()}`,
    data: {
      submissionId: id,
      action,
      comments,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      projectId: submission.projectId,
      action: `REVIEW_SUBMISSION_${action}`,
      entity: 'SUBMISSION',
      entityId: id,
      newData: { action, comments },
    },
  });

  sendSuccess(res, updatedSubmission, `Submission ${action.toLowerCase()} successfully`);
});

export const updateSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Only the submitting contractor can update (and only if not yet reviewed)
  if (user.contractorId !== submission.contractorId || submission.status !== 'PENDING') {
    throw new AppError('Cannot update this submission', 403);
  }

  const {
    title,
    description,
    progress,
    estimatedValue,
    qualityScore,
    safetyCompliance,
    weatherImpact,
  } = req.body;

  const updatedSubmission = await prisma.submission.update({
    where: { id },
    data: {
      title,
      description,
      progress: progress ? parseInt(progress) : submission.progress,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : submission.estimatedValue,
      qualityScore: qualityScore ? parseFloat(qualityScore) : submission.qualityScore,
      safetyCompliance,
      weatherImpact,
    },
    include: {
      project: {
        select: {
          name: true,
        },
      },
      documents: true,
    },
  });

  sendSuccess(res, updatedSubmission, 'Submission updated successfully');
});

export const deleteSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Only the submitting contractor can delete (and only if not yet reviewed)
  if (user.contractorId !== submission.contractorId || submission.status !== 'PENDING') {
    throw new AppError('Cannot delete this submission', 403);
  }

  await prisma.submission.delete({
    where: { id },
  });

  sendSuccess(res, null, 'Submission deleted successfully');
});

export const getSubmissionStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const where: any = {};

  // Role-based filtering
  if (user.role === UserRole.CONTRACTOR && user.contractorId) {
    where.contractorId = user.contractorId;
  }

  const [
    totalSubmissions,
    pendingSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    flaggedSubmissions,
    avgReviewTime,
  ] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.count({ where: { ...where, status: 'PENDING' } }),
    prisma.submission.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.submission.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.submission.count({ where: { ...where, status: 'FLAGGED' } }),
    prisma.submission.aggregate({
      where: {
        ...where,
        reviewedAt: { not: null },
      },
      _avg: {
        // Calculate average review time (this would need a computed field in real implementation)
      },
    }),
  ]);

  const stats = {
    totalSubmissions,
    pendingSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    flaggedSubmissions,
    approvalRate: totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0,
  };

  sendSuccess(res, stats, 'Submission statistics retrieved successfully');
});

export const getSubmissionsByProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const user = req.user!;

  // Verify access to project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const canAccess = 
    user.role === UserRole.ME_OFFICER ||
    user.role === UserRole.GOVERNMENT_ADMIN ||
    user.role === UserRole.GOVERNMENT_OFFICER ||
    (user.role === UserRole.CONTRACTOR && user.contractorId === project.contractorId);

  if (!canAccess) {
    throw new AppError('Access denied', 403);
  }

  const submissions = await prisma.submission.findMany({
    where: { projectId },
    orderBy: { submittedAt: 'desc' },
    include: {
      milestone: {
        select: {
          name: true,
        },
      },
      submitter: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      documents: {
        select: {
          id: true,
          fileName: true,
          originalName: true,
          mimeType: true,
        },
      },
      approvals: {
        include: {
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  sendSuccess(res, submissions, 'Project submissions retrieved successfully');
});
