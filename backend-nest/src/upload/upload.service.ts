import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UploadedFile, UploadResult } from './interfaces';

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
  ) {}

  async processUpload(
    file: UploadedFile,
    sessionId: string,
  ): Promise<UploadResult> {
    this.validateFile(file);

    const jobId = `upload_job_${Date.now()}`;
    const phpUrl = this.configService.get<string>('phpBackendUrl')!;
    const publicUrl = this.configService.get<string>('minioPublicUrl')!;

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
        this.httpService.post(`${phpUrl}/internal/process-upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      phpResponse = data;
    } catch (error: any) {
      throw new HttpException(
        {
          statusCode: error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
          path: '/api/v1/canvas/upload',
          message:
            error.response?.data?.message ??
            'Downstream processing failure on image microservice container node.',
        },
        error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const assetUrl = `${publicUrl}/${phpResponse.objectKey}`;

    return {
      success: true,
      assetUrl,
      sessionId,
    };
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
