import { storage } from '../config/firestore';
import { DocumentCategory } from '../types/firestore';

export interface UploadResult {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  downloadURL: string;
}

export class FileUploadService {
  private getBucket() {
    if (storage && typeof (storage as any).bucket === 'function') {
      return (storage as any).bucket();
    }
    // Minimal stub for tests if storage is not available
    return {
      file: (_path: string) => ({
        createWriteStream: () => ({ on: () => {}, end: () => {} }),
        makePublic: async () => {},
        delete: async () => {},
        getMetadata: async () => [{}],
        getSignedUrl: async () => ['']
      })
    };
  }

  private generateId(): string {
    try {
      // @ts-ignore
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        // @ts-ignore
        return crypto.randomUUID();
      }
    } catch (_) {}
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /**
   * Upload file to Firebase Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    category: DocumentCategory,
    uploadedBy: string,
    projectId?: string,
    submissionId?: string
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${this.generateId()}.${fileExtension}`;
      
      // Create file path based on category and context
      let filePath = `documents/${category.toLowerCase()}`;
      if (projectId) {
        filePath += `/projects/${projectId}`;
      }
      if (submissionId) {
        filePath += `/submissions/${submissionId}`;
      }
      filePath += `/${fileName}`;

      // Upload file to Firebase Storage
      const fileUpload = this.getBucket().file(filePath);
      
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy,
            category,
            projectId: projectId || '',
            submissionId: submissionId || '',
            uploadedAt: new Date().toISOString()
          }
        }
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error: any) => {
          console.error('File upload error:', error);
          reject(new Error('Failed to upload file'));
        });

        stream.on('finish', async () => {
          try {
            // Make file publicly accessible
            await fileUpload.makePublic();
            
            // Get download URL
            const downloadURL = `https://storage.googleapis.com/${(fileUpload as any).bucket.name}/${filePath}`;

            resolve({
              fileName,
              originalName: file.originalname,
              filePath,
              fileSize: file.size,
              mimeType: file.mimetype,
              downloadURL
            });
          } catch (error) {
            console.error('Error making file public:', error);
            reject(new Error('Failed to make file public'));
          }
        });

        stream.end(file.buffer);
      });

    } catch (error) {
      console.error('File upload service error:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const file = this.getBucket().file(filePath);
      await file.delete();
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string) {
    try {
      const file = this.getBucket().file(filePath);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Get file metadata error:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Generate signed URL for private file access
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const file = this.getBucket().file(filePath);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      });
      return signedUrl;
    } catch (error) {
      console.error('Generate signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File, maxSize: number = 10485760): { valid: boolean; error?: string } {
    // Check file size (default 10MB)
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      };
    }

    // Check file type
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
      'text/plain',
      'application/zip',
      'video/mp4',
      'video/avi',
      'video/quicktime'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'File type not allowed'
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
