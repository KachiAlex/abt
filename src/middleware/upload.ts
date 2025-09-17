import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { AppError } from './errorHandler';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = 'general';
    
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype === 'application/pdf') {
      subDir = 'documents';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    }

    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images, documents, and videos are allowed.', 400));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize, // 10MB
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => 
  upload.array(fieldName, maxCount);

// Middleware for mixed file upload (different field names)
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  upload.fields(fields);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
      });
    }
  }
  
  next(error);
};

// Helper function to get file category based on mime type
export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'PHOTO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType === 'application/pdf') return 'REPORT';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'TECHNICAL';
  return 'OTHER';
};

// Helper function to clean up uploaded files
export const cleanupFiles = (files: Express.Multer.File[]) => {
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};
