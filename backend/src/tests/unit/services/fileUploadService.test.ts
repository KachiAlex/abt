jest.mock('../../../config', () => ({
  config: {
    cloudinary: {
      url: 'cloudinary://key:secret@test',
      folderPrefix: 'test',
    },
  },
}));

jest.mock('cloudinary', () => ({
  __esModule: true,
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
    api: {
      resource: jest.fn(),
    },
    utils: {
      sign_url: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';
import { fileUploadService } from '../../../services/fileUploadService';

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
      const uploadStreamMock = cloudinary.uploader.upload_stream as jest.Mock;
      uploadStreamMock.mockImplementation((_options, callback) => {
        setTimeout(() => callback(null, {
          public_id: 'test/documents/p1/file',
          secure_url: 'https://cloudinary.com/file.pdf',
          url: 'http://cloudinary.com/file.pdf'
        }), 0);
        return { end: jest.fn() };
      });

      const result = await fileUploadService.uploadFile(
        mockFile,
        'REPORT' as any,
        'user-123',
        'project-123'
      );

      expect(result.originalName).toBe('test-document.pdf');
      expect(result.fileSize).toBe(mockFile.size);
      expect(result.mimeType).toBe(mockFile.mimetype);
      expect(result.downloadURL).toBe('https://cloudinary.com/file.pdf');
      expect(uploadStreamMock).toHaveBeenCalled();
    });

    it('should handle upload error', async () => {
      const uploadStreamMock = cloudinary.uploader.upload_stream as jest.Mock;
      uploadStreamMock.mockImplementation((_options, callback) => {
        setTimeout(() => callback(new Error('Upload failed')), 0);
        return { end: jest.fn() };
      });

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
      const destroyMock = cloudinary.uploader.destroy as jest.Mock;
      destroyMock.mockResolvedValue({});

      await expect(
        fileUploadService.deleteFile('documents/test-file.pdf')
      ).resolves.not.toThrow();
      expect(destroyMock).toHaveBeenCalledWith('documents/test-file.pdf', expect.any(Object));
    });

    it('should handle delete error', async () => {
      const destroyMock = cloudinary.uploader.destroy as jest.Mock;
      destroyMock.mockRejectedValue(new Error('Delete failed'));

      await expect(
        fileUploadService.deleteFile('documents/test-file.pdf')
      ).rejects.toThrow('Failed to delete file');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL successfully', async () => {
      const signUrlMock = (cloudinary.utils as any).sign_url as jest.Mock;
      signUrlMock.mockReturnValue('https://signed-url.com');

      const result = await fileUploadService.getSignedUrl('documents/test-file.pdf');
      expect(result).toBe('https://signed-url.com');
    });

    it('should handle signed URL generation error', async () => {
      const signUrlMock = (cloudinary.utils as any).sign_url as jest.Mock;
      signUrlMock.mockImplementation(() => { throw new Error('URL generation failed'); });

      await expect(
        fileUploadService.getSignedUrl('documents/test-file.pdf')
      ).rejects.toThrow('Failed to generate signed URL');
    });
  });

  describe('getFileMetadata', () => {
    it('should return file metadata', async () => {
      const resourceMock = cloudinary.api.resource as jest.Mock;
      resourceMock.mockResolvedValue({ id: 'resource-123' });

      const result = await fileUploadService.getFileMetadata('documents/test-file.pdf');
      expect(result).toEqual({ id: 'resource-123' });
    });

    it('should handle metadata errors', async () => {
      const resourceMock = cloudinary.api.resource as jest.Mock;
      resourceMock.mockRejectedValue(new Error('metadata failed'));

      await expect(
        fileUploadService.getFileMetadata('documents/test-file.pdf')
      ).rejects.toThrow('Failed to get file metadata');
    });
  });
});