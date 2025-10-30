import { fileUploadService } from '../../../services/fileUploadService';
import { storage } from '../../../config/firestore';

// Mock Firebase Storage
jest.mock('../../../config/firestore', () => ({
  storage: {
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        createWriteStream: jest.fn(() => ({
          on: jest.fn(),
          end: jest.fn()
        })),
        makePublic: jest.fn(),
        delete: jest.fn(),
        getMetadata: jest.fn(),
        getSignedUrl: jest.fn()
      }))
    }))
  }
}));

describe('FileUploadService', () => {
  const mockFile = {
    originalname: 'test-document.pdf',
    mimetype: 'application/pdf',
    size: 1024000,
    buffer: Buffer.from('test file content')
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate file successfully', () => {
      const result = fileUploadService.validateFile(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject file that is too large', () => {
      const largeFile = {
        ...mockFile,
        size: 20 * 1024 * 1024 // 20MB
      };

      const result = fileUploadService.validateFile(largeFile, 10485760); // 10MB limit
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum allowed size');
    });

    it('should reject unsupported file type', () => {
      const unsupportedFile = {
        ...mockFile,
        mimetype: 'application/x-executable'
      };

      const result = fileUploadService.validateFile(unsupportedFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File type not allowed');
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockBucket = {
        file: jest.fn(() => ({
          createWriteStream: jest.fn(() => ({
            on: jest.fn((event, callback) => {
              if (event === 'finish') {
                setTimeout(callback, 0);
              }
            }),
            end: jest.fn(() => {})
          })),
          makePublic: jest.fn().mockResolvedValue({})
        }))
      } as any;

      (storage.bucket as jest.Mock).mockReturnValue(mockBucket);

      const result = await fileUploadService.uploadFile(
        mockFile,
        'REPORT' as any,
        'user-123',
        'project-123'
      );

      expect(result.fileName).toMatch(/^[a-f0-9-]+\.pdf$/);
      expect(result.originalName).toBe('test-document.pdf');
      expect(result.fileSize).toBe(1024000);
      expect(result.mimeType).toBe('application/pdf');
      expect(result.downloadURL).toContain('storage.googleapis.com');
    });

    it('should handle upload error', async () => {
      const mockBucket = {
        file: jest.fn(() => ({
          createWriteStream: jest.fn(() => ({
            on: jest.fn((event, callback) => {
              if (event === 'error') {
                setTimeout(() => callback(new Error('Upload failed')), 0);
              }
            }),
            end: jest.fn(() => {})
          }))
        }))
      } as any;

      (storage.bucket as jest.Mock).mockReturnValue(mockBucket);

      await expect(
        fileUploadService.uploadFile(
          mockFile,
          'REPORT' as any,
          'user-123'
        )
      ).rejects.toThrow('Failed to upload file');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockBucket = {
        file: jest.fn(() => ({
          delete: jest.fn().mockResolvedValue({})
        }))
      } as any;

      (storage.bucket as jest.Mock).mockReturnValue(mockBucket);

      await expect(
        fileUploadService.deleteFile('documents/test-file.pdf')
      ).resolves.not.toThrow();
    });

    it('should handle delete error', async () => {
      const mockBucket = {
        file: jest.fn(() => ({
          delete: jest.fn().mockRejectedValue(new Error('Delete failed'))
        }))
      };

      (storage.bucket as jest.Mock).mockReturnValue(mockBucket);

      await expect(
        fileUploadService.deleteFile('documents/test-file.pdf')
      ).rejects.toThrow('Failed to delete file');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL successfully', async () => {
      const mockBucket = {
        file: jest.fn(() => ({
          getSignedUrl: jest.fn().mockResolvedValue(['https://signed-url.com'])
        }))
      } as any;

      (storage.bucket as jest.Mock).mockReturnValue(mockBucket);

      const result = await fileUploadService.getSignedUrl('documents/test-file.pdf');
      expect(result).toBe('https://signed-url.com');
    });

    it('should handle signed URL generation error', async () => {
      const mockBucket = {
        file: jest.fn(() => ({
          getSignedUrl: jest.fn().mockRejectedValue(new Error('URL generation failed'))
        }))
      } as any;

      (storage.bucket as jest.Mock).mockReturnValue(mockBucket);

      await expect(
        fileUploadService.getSignedUrl('documents/test-file.pdf')
      ).rejects.toThrow('Failed to generate signed URL');
    });
  });
});