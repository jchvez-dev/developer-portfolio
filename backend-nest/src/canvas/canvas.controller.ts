import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { ExportCanvasDto } from './dto/export-canvas.dto';

@Controller('canvas')
export class CanvasController {
  constructor(private readonly canvasService: CanvasService) {}

  @Post('export')
  @HttpCode(HttpStatus.CREATED)
  async export(@Body() dto: ExportCanvasDto) {
    return this.canvasService.export(dto);
  }
}
