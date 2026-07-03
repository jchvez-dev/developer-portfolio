import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('canvas')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @UploadedFile() file: any,
    @Body('sessionId') sessionId?: string,
  ) {
    const resolvedSessionId = sessionId ?? `sess_${crypto.randomUUID()}`;

    return this.uploadService.processUpload(file, resolvedSessionId);
  }
}
