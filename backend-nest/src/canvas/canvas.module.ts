import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CanvasController } from './canvas.controller';
import { CanvasService } from './canvas.service';

@Module({
  imports: [HttpModule],
  controllers: [CanvasController],
  providers: [CanvasService],
})
export class CanvasModule {}
