import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [HttpModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
