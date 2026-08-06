import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { UploadService } from './upload.service';
import { UploadedFile } from './interfaces';
import { S3_CLIENT } from '../storage/storage.module';

describe('UploadService', () => {
  let service: UploadService;

  const mockConfig: Record<string, string> = {
    phpBackendUrl: 'http://backend-php:8000',
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockSend = jest.fn();

  const validFile: UploadedFile = {
    buffer: Buffer.from('fake-image-content'),
    mimetype: 'image/png',
    originalname: 'test.png',
    size: 1024,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSend.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        { provide: HttpService, useValue: mockHttpService },
        { provide: S3_CLIENT, useValue: { send: mockSend } },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('processUpload', () => {
    it('returns success with asset URL when PHP responds', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { objectKey: 'user-uploads/sess_test/abc.webp' } }),
      );

      const result = await service.processUpload(validFile, 'sess_test');

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('sess_test');
      expect(result.assetUrl).toBe('user-uploads/sess_test/abc.webp');
    });

    it('throws HttpException when PHP call fails', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => ({
          response: {
            status: 422,
            data: { message: 'Processing failed' },
          },
        })),
      );

      await expect(
        service.processUpload(validFile, 'sess_test'),
      ).rejects.toThrow(HttpException);
      await expect(
        service.processUpload(validFile, 'sess_test'),
      ).rejects.toMatchObject({
        response: {
          statusCode: 422,
          message: 'Processing failed',
        },
      });
    });

    it('throws 503 when PHP is unreachable', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      await expect(
        service.processUpload(validFile, 'sess_test'),
      ).rejects.toThrow(HttpException);
      await expect(
        service.processUpload(validFile, 'sess_test'),
      ).rejects.toMatchObject({
        response: {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message:
            'Downstream processing failure on image microservice container node.',
        },
      });
    });

    it('rejects invalid file type', async () => {
      const invalidFile: UploadedFile = {
        ...validFile,
        mimetype: 'text/plain',
      };

      await expect(
        service.processUpload(invalidFile, 'sess_test'),
      ).rejects.toThrow(HttpException);
      await expect(
        service.processUpload(invalidFile, 'sess_test'),
      ).rejects.toMatchObject({
        response: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: ['Invalid file type. Allowed types: jpg, png, webp, gif.'],
        },
      });
    });

    it('rejects file exceeding size limit', async () => {
      const oversizedFile: UploadedFile = {
        ...validFile,
        size: 11 * 1024 * 1024,
      };

      await expect(
        service.processUpload(oversizedFile, 'sess_test'),
      ).rejects.toThrow(HttpException);
      await expect(
        service.processUpload(oversizedFile, 'sess_test'),
      ).rejects.toMatchObject({
        response: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: ['File size exceeds maximum allowed limit of 10MB.'],
        },
      });
    });

    it('rejects null file', async () => {
      await expect(
        service.processUpload(null as unknown as UploadedFile, 'sess_test'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getImage', () => {
    it('returns the stream body and content type for a bucket/key path', async () => {
      const body = { pipe: jest.fn() };
      mockSend.mockResolvedValue({ Body: body, ContentType: 'image/png' });

      const result = await service.getImage('user-uploads/sess/abc.png');

      expect(result.contentType).toBe('image/png');
      expect(result.body).toBe(body);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Bucket: 'user-uploads', Key: 'sess/abc.png' },
        }),
      );
    });

    it('throws a 404 HttpException when the S3 read fails', async () => {
      mockSend.mockRejectedValue(new Error('boom'));

      await expect(
        service.getImage('user-uploads/sess/abc.png'),
      ).rejects.toThrow(HttpException);
      await expect(
        service.getImage('user-uploads/sess/abc.png'),
      ).rejects.toMatchObject({
        response: {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Image not found',
        },
      });
    });
  });
});
