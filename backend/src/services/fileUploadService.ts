import { v2 as cloudinary } from 'cloudinary';
import { DocumentCategory } from '../types/domain';
import { config } from '../config';

const configureCloudinary = (): boolean => {
  try {
    if (config.cloudinary.url) {
      cloudinary.config({ secure: true, cloudinary_url: config.cloudinary.url });
      return true;
    }

    if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
      cloudinary.config({
        secure: true,
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
      });
      return true;
    }
  } catch (error) {
    console.error('Cloudinary configuration error:', error);
  }

  console.warn('Cloudinary credentials are not fully configured. File uploads will fail.');
  return false;
};

const cloudinaryConfigured = configureCloudinary();

export interface UploadResult {
  fileName: string;
  originalName: string;
  filePath: string; // Cloudinary public_id
  fileSize: number;
  mimeType: string;
  downloadURL: string;
}

export class FileUploadService {
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

  private ensureConfigured() {
    if (!cloudinaryConfigured) {
      throw new Error('Cloudinary is not configured');
    }
  }

  private sanitizeSegment(segment: string): string {
    return segment
      .toString()
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  private buildFolder(
    category: DocumentCategory,
    projectId?: string,
    submissionId?: string
  ): string {
    const parts = [config.cloudinary.folderPrefix || 'abt', 'documents', category.toLowerCase()];

    if (projectId) {
      parts.push('projects', this.sanitizeSegment(projectId));
    }

    if (submissionId) {
      parts.push('submissions', this.sanitizeSegment(submissionId));
    }

    return parts.join('/');
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    category: DocumentCategory,
    uploadedBy: string,
    projectId?: string,
    submissionId?: string
  ): Promise<UploadResult> {
    try {
      this.ensureConfigured();

      // Generate unique filename
      const originalExtension = file.originalname.includes('.')
        ? `.${file.originalname.split('.').pop()}`
        : '';
      const fileName = `${this.generateId()}${originalExtension}`;
      
      const folder = this.buildFolder(category, projectId, submissionId);
      const publicId = `${folder}/${this.sanitizeSegment(fileName.replace('.', '-'))}`;

      return await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: 'auto',
            overwrite: true,
            context: {
              original_name: file.originalname,
              uploaded_by: uploadedBy,
              category,
              project_id: projectId || '',
              submission_id: submissionId || '',
            },
          },
          (error, result) => {
            if (error || !result) {
              console.error('Cloudinary upload error:', error);
              reject(new Error('Failed to upload file'));
              return;
            }

            resolve({
              fileName,
              originalName: file.originalname,
              filePath: result.public_id,
              fileSize: file.size,
              mimeType: file.mimetype,
              downloadURL: result.secure_url || result.url,
            });
          }
        );

        uploadStream.end(file.buffer);
      });

    } catch (error) {
      console.error('File upload service error:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      this.ensureConfigured();
      await cloudinary.uploader.destroy(filePath, {
        invalidate: true,
        resource_type: 'auto',
      });
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
      this.ensureConfigured();
      const resource = await cloudinary.api.resource(filePath, {
        resource_type: 'auto',
      });
      return resource;
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
      this.ensureConfigured();
      const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
      const signUrl = (cloudinary.utils as any).sign_url || ((cloudinary.utils as any).private_download_url ?? null);
      if (typeof signUrl !== 'function') {
        throw new Error('Cloudinary signed URL utility is unavailable');
      }
      return signUrl(filePath, {
        secure: true,
        resource_type: 'auto',
        expires_at: expiresAt,
      });
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
