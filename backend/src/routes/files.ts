import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { DocumentCategory } from '../types/firestore';
import { fileUploadService } from '../services/fileUploadService';
import { documentRepository } from '../repositories/documentRepository';
import { CreateDocumentInput, DbDocument } from '../types/models';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize
  }
});

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    [key: string]: any;
  };
}

type DocumentWithUrl = DbDocument & { downloadURL?: string };

// Middleware to verify JWT token
const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

const normalizeId = (value?: string): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const withSignedUrl = async (document: DbDocument): Promise<DocumentWithUrl> => {
  try {
    const downloadURL = await fileUploadService.getSignedUrl(document.filePath);
    return { ...document, downloadURL };
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return document;
  }
};

/**
 * POST /api/files/upload
 * Upload a single file
 */
router.post('/upload', verifyToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { category, projectId, submissionId } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'File category is required'
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user context'
      });
    }

    const normalizedProjectId = normalizeId(projectId);
    const normalizedSubmissionId = normalizeId(submissionId);

    // Validate file
    const validation = fileUploadService.validateFile(req.file, config.maxFileSize);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Upload file
    const uploadResult = await fileUploadService.uploadFile(
      req.file,
      category as DocumentCategory,
      req.user.userId,
      normalizedProjectId ?? undefined,
      normalizedSubmissionId ?? undefined
    );

    const documentData: CreateDocumentInput = {
      projectId: normalizedProjectId,
      submissionId: normalizedSubmissionId,
      fileName: uploadResult.fileName,
      originalName: uploadResult.originalName,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      category,
      uploadedBy: req.user.userId,
      isPublic: false,
    };

    const document = await documentRepository.create(documentData);

    return res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        document: {
          ...document,
          downloadURL: uploadResult.downloadURL
        }
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

/**
 * POST /api/files/upload-multiple
 * Upload multiple files
 */
router.post('/upload-multiple', verifyToken, upload.array('files', 10), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { category, projectId, submissionId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'File category is required'
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user context'
      });
    }

    const normalizedProjectId = normalizeId(projectId);
    const normalizedSubmissionId = normalizeId(submissionId);

    const uploadResults: DocumentWithUrl[] = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
        // Validate file
        const validation = fileUploadService.validateFile(file, config.maxFileSize);
        if (!validation.valid) {
          errors.push({
            fileName: file.originalname,
            error: validation.error
          });
          continue;
        }

        // Upload file
        const uploadResult = await fileUploadService.uploadFile(
          file,
          category as DocumentCategory,
          req.user.userId,
          normalizedProjectId ?? undefined,
          normalizedSubmissionId ?? undefined
        );

        const documentData: CreateDocumentInput = {
          projectId: normalizedProjectId,
          submissionId: normalizedSubmissionId,
          fileName: uploadResult.fileName,
          originalName: uploadResult.originalName,
          filePath: uploadResult.filePath,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          category,
          uploadedBy: req.user.userId,
          isPublic: false,
        };

        const document = await documentRepository.create(documentData);

        uploadResults.push({
          ...document,
          downloadURL: uploadResult.downloadURL
        });

      } catch (error: any) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    return res.json({
      success: true,
      message: `Uploaded ${uploadResults.length} files successfully`,
      data: {
        documents: uploadResults,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    console.error('Multiple file upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload files'
    });
  }
});

/**
 * GET /api/files/:id
 * Get file information
 */
router.get('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await documentRepository.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Generate signed URL for private access
    const signedDocument = await withSignedUrl(document);

    return res.json({
      success: true,
      data: {
        document: {
          ...signedDocument
        }
      }
    });

  } catch (error: any) {
    console.error('Get file error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get file information'
    });
  }
});

/**
 * DELETE /api/files/:id
 * Delete file
 */
router.delete('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await documentRepository.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user has permission to delete (uploader or admin)
    if (document.uploadedBy !== req.user?.userId && req.user?.role !== 'GOVERNMENT_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file from storage
    await fileUploadService.deleteFile(document.filePath);

    // Delete document record from Postgres
    await documentRepository.delete(id);

    return res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

/**
 * GET /api/files/project/:projectId
 * Get all files for a project
 */
router.get('/project/:projectId', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { category } = req.query;

    const categoryFilter = Array.isArray(category) ? category[0] : (category as string | undefined);
    const documents = await documentRepository.listByProject(projectId, categoryFilter);

    const documentsWithUrls = await Promise.all(documents.map(withSignedUrl));

    return res.json({
      success: true,
      data: {
        documents: documentsWithUrls
      }
    });

  } catch (error: any) {
    console.error('Get project files error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get project files'
    });
  }
});

/**
 * GET /api/files/submission/:submissionId
 * Get all files for a submission
 */
router.get('/submission/:submissionId', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { submissionId } = req.params;

    const documents = await documentRepository.listBySubmission(submissionId);

    const documentsWithUrls = await Promise.all(documents.map(withSignedUrl));

    return res.json({
      success: true,
      data: {
        documents: documentsWithUrls
      }
    });

  } catch (error: any) {
    console.error('Get submission files error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get submission files'
    });
  }
});

export default router;
