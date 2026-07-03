import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ExportCanvasDto } from './dto/export-canvas.dto';

@Injectable()
export class CanvasService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async export(dto: ExportCanvasDto) {
    const jobId = `canvas_job_${Date.now()}`;
    const phpUrl = this.configService.get<string>('phpBackendUrl')!;

    const phpPayload = this.toInternalFormat(jobId, dto);

    let phpResponse: { objectKey: string };
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${phpUrl}/internal/render`, phpPayload),
      );
      phpResponse = data;
    } catch (error: any) {
      const phpMessage = error.response?.data?.message;
      throw new HttpException(
        {
          statusCode: error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
          path: '/api/v1/canvas/export',
          message:
            phpMessage ??
            'Downstream processing failure on image microservice container node.',
        },
        error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const publicUrl = this.configService.get<string>('minioPublicUrl')!;
    const downloadUrl = `${publicUrl}/production-exports/${phpResponse.objectKey}`;

    return {
      success: true,
      exportId: jobId,
      downloadUrl,
    };
  }

  private toInternalFormat(jobId: string, dto: ExportCanvasDto) {
    return {
      jobId,
      meta: {
        sanitized: true,
        timestamp: Math.floor(Date.now() / 1000),
      },
      definition: {
        dimensions: { w: dto.canvas.width, h: dto.canvas.height },
        elements: dto.layers.map((layer) => {
          const action =
            layer.type === 'image' ? 'draw_image' : 'render_html_text';
          return {
            action,
            params: {
              ...(layer.properties.assetUrl
                ? {
                    src: layer.properties.assetUrl.startsWith('http')
                      ? new URL(layer.properties.assetUrl).pathname.slice(1)
                      : layer.properties.assetUrl,
                  }
                : {}),
              ...(layer.properties.content
                ? { html: layer.properties.content }
                : {}),
              ...(layer.properties.color
                ? { color: layer.properties.color }
                : {}),
              ...(layer.properties.fontSize
                ? { fontSize: layer.properties.fontSize }
                : {}),
              ...(layer.properties.fontFamily
                ? { fontFamily: layer.properties.fontFamily }
                : {}),
              x: layer.properties.x,
              y: layer.properties.y,
            },
          };
        }),
      },
    };
  }
}
