import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { CanvasService } from './canvas.service';
import { ExportCanvasDto } from './dto/export-canvas.dto';

describe('CanvasService', () => {
  let service: CanvasService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockConfig = {
    phpBackendUrl: 'http://backend-php:8000',
    minioPublicUrl: 'http://localhost:9000',
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanvasService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<CanvasService>(CanvasService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('export', () => {
    const validDto: ExportCanvasDto = {
      canvas: { width: 1200, height: 630 },
      layers: [
        {
          id: 'l1',
          type: 'text',
          properties: {
            x: 10,
            y: 10,
            width: 100,
            height: 50,
            content: 'Hello',
          },
        },
      ],
    };

    it('returns success with download URL when PHP responds', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { objectKey: 'test.png' } }),
      );

      const result = await service.export(validDto);

      expect(result.success).toBe(true);
      expect(result.exportId).toMatch(/^canvas_job_\d+$/);
      expect(result.downloadUrl).toBe(
        'http://localhost:9000/production-exports/test.png',
      );
    });

    it('throws HttpException when PHP call fails', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => ({
          response: {
            status: 422,
            data: { message: 'Font not found' },
          },
        })),
      );

      await expect(service.export(validDto)).rejects.toThrow(HttpException);
      await expect(service.export(validDto)).rejects.toMatchObject({
        response: {
          statusCode: 422,
          message: 'Font not found',
        },
      });
    });

    it('throws 503 when PHP is unreachable', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      await expect(service.export(validDto)).rejects.toThrow(HttpException);
      await expect(service.export(validDto)).rejects.toMatchObject({
        response: {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message:
            'Downstream processing failure on image microservice container node.',
        },
      });
    });

    it('builds correct PHP payload for text layers', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { objectKey: 'out.png' } }),
      );

      await service.export(validDto);

      const callArg = mockHttpService.post.mock.calls[0];
      expect(callArg[0]).toBe('http://backend-php:8000/internal/render');
      expect(callArg[1].definition.dimensions).toEqual({ w: 1200, h: 630 });
      expect(callArg[1].definition.elements[0]).toMatchObject({
        action: 'render_html_text',
        params: {
          html: 'Hello',
          x: 10,
          y: 10,
        },
      });
    });

    it('extracts path from full asset URL for image layers', async () => {
      const dtoWithImage: ExportCanvasDto = {
        canvas: { width: 1200, height: 630 },
        layers: [
          {
            id: 'l1',
            type: 'image',
            properties: {
              x: 0,
              y: 0,
              width: 1200,
              height: 630,
              assetUrl: 'http://storage:9000/system-assets/background.png',
            },
          },
        ],
      };

      mockHttpService.post.mockReturnValue(
        of({ data: { objectKey: 'out.png' } }),
      );

      await service.export(dtoWithImage);

      const callArg = mockHttpService.post.mock.calls[0];
      expect(callArg[1].definition.elements[0]).toMatchObject({
        action: 'draw_image',
        params: { src: 'system-assets/background.png' },
      });
    });
  });
});
