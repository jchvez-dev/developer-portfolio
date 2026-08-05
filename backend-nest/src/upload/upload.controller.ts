import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { UploadService } from './upload.service';
import type { UploadedFile as UploadedFileInfo } from './interfaces';

const IMAGES_PREFIX = '/api/v1/canvas/images/';

@Controller('canvas')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @UploadedFile() file: UploadedFileInfo,
    @Body('sessionId') sessionId?: string,
  ) {
    const resolvedSessionId = sessionId ?? `sess_${crypto.randomUUID()}`;

    return this.uploadService.processUpload(file, resolvedSessionId);
  }

  @Get('images/*path')
  async getImage(@Req() req: Request) {
    const path = req.path.slice(IMAGES_PREFIX.length);
    const { body, contentType } = await this.uploadService.getImage(path);
    return new StreamableFile(body, { type: contentType });
  }
}
