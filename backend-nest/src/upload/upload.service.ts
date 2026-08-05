import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { UploadedFile, UploadResult } from './interfaces';
import { S3_CLIENT } from '../storage/storage.module';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(S3_CLIENT) private readonly s3: S3Client,
  ) {}

  async processUpload(
    file: UploadedFile,
    sessionId: string,
  ): Promise<UploadResult> {
    this.validateFile(file);

    const jobId = `upload_job_${Date.now()}`;
    const phpUrl = this.configService.get<string>('phpBackendUrl')!;

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([file.buffer as BlobPart], { type: file.mimetype }),
      file.originalname,
    );
    formData.append('jobId', jobId);
    formData.append('sessionId', sessionId);

    let phpResponse: { objectKey: string };
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<{ objectKey: string }>(
          `${phpUrl}/internal/process-upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        ),
      );
      phpResponse = data;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      throw new HttpException(
        {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: '/api/v1/canvas/upload',
          message:
            err.response?.data?.message ??
            'Downstream processing failure on image microservice container node.',
        },
        status,
      );
    }

    const assetUrl = phpResponse.objectKey;

    return {
      success: true,
      assetUrl,
      sessionId,
    };
  }

  async getImage(
    path: string,
  ): Promise<{ body: Readable; contentType: string }> {
    const parts = path.split('/');
    const bucket = parts[0];
    const key = parts.slice(1).join('/');

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await this.s3.send(command);
      return {
        body: response.Body as Readable,
        contentType: response.ContentType ?? 'image/webp',
      };
    } catch {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Image not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private validateFile(file: UploadedFile): void {
    if (!file) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          error: 'Unprocessable Entity',
          message: ['No file provided.'],
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          error: 'Unprocessable Entity',
          message: [`Invalid file type. Allowed types: jpg, png, webp, gif.`],
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          error: 'Unprocessable Entity',
          message: ['File size exceeds maximum allowed limit of 10MB.'],
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
