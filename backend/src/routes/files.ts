import { Router } from 'express';
import multer from 'multer';
import { fileUploadService } from '../services/fileUploadService';
import { db, Collections } from '../config/firestore';
import { Document, DocumentCategory } from '../types/firestore';
import { config } from '../config';
import jwt from 'jsonwebtoken';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize
  }
});

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
 * POST /api/files/upload
 * Upload a single file
 */
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
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
      projectId,
      submissionId
    );

    // Save document record to Firestore
    const documentId = `doc-${Date.now()}`;
    const document: Document = {
      id: documentId,
      projectId: projectId || null,
      submissionId: submissionId || null,
      fileName: uploadResult.fileName,
      originalName: uploadResult.originalName,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      category: category as DocumentCategory,
      uploadedBy: req.user.userId,
      isPublic: false,
      createdAt: new Date() as any
    };

    await db.collection(Collections.DOCUMENTS).doc(documentId).set(document);

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
router.post('/upload-multiple', verifyToken, upload.array('files', 10), async (req, res) => {
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

    const uploadResults = [];
    const errors = [];

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
          projectId,
          submissionId
        );

        // Save document record to Firestore
        const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const document: Document = {
          id: documentId,
          projectId: projectId || null,
          submissionId: submissionId || null,
          fileName: uploadResult.fileName,
          originalName: uploadResult.originalName,
          filePath: uploadResult.filePath,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          category: category as DocumentCategory,
          uploadedBy: req.user.userId,
          isPublic: false,
          createdAt: new Date() as any
        };

        await db.collection(Collections.DOCUMENTS).doc(documentId).set(document);

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
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(Collections.DOCUMENTS).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const document = doc.data() as Document;

    // Generate signed URL for private access
    const signedUrl = await fileUploadService.getSignedUrl(document.filePath);

    return res.json({
      success: true,
      data: {
        document: {
          ...document,
          downloadURL: signedUrl
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
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(Collections.DOCUMENTS).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const document = doc.data() as Document;

    // Check if user has permission to delete (uploader or admin)
    if (document.uploadedBy !== req.user.userId && req.user.role !== 'GOVERNMENT_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file from storage
    await fileUploadService.deleteFile(document.filePath);

    // Delete document record from Firestore
    await db.collection(Collections.DOCUMENTS).doc(id).delete();

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
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category } = req.query;

    let query = db.collection(Collections.DOCUMENTS)
      .where('projectId', '==', projectId);

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => doc.data() as Document);

    // Generate signed URLs for all files
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          const signedUrl = await fileUploadService.getSignedUrl(doc.filePath);
          return {
            ...doc,
            downloadURL: signedUrl
          };
        } catch (error) {
          return doc;
        }
      })
    );

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
router.get('/submission/:submissionId', verifyToken, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const snapshot = await db.collection(Collections.DOCUMENTS)
      .where('submissionId', '==', submissionId)
      .get();

    const documents = snapshot.docs.map(doc => doc.data() as Document);

    // Generate signed URLs for all files
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          const signedUrl = await fileUploadService.getSignedUrl(doc.filePath);
          return {
            ...doc,
            downloadURL: signedUrl
          };
        } catch (error) {
          return doc;
        }
      })
    );

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
