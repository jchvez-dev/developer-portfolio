import { Test, TestingModule } from '@nestjs/testing';
import { CanvasController } from './canvas.controller';
import { CanvasService } from './canvas.service';

describe('CanvasController', () => {
  let controller: CanvasController;

  const mockCanvasService = {
    export: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CanvasController],
      providers: [{ provide: CanvasService, useValue: mockCanvasService }],
    }).compile();

    controller = module.get<CanvasController>(CanvasController);
  });

  it('calls service.export and returns the result', async () => {
    const dto = {
      canvas: { width: 1200, height: 630 },
      layers: [
        {
          id: 'l1',
          type: 'text',
          properties: { x: 10, y: 10, width: 100, height: 50, content: 'test' },
        },
      ],
    };

    const expected = {
      success: true,
      exportId: 'canvas_job_123',
      imagePath: 'production-exports/test.png',
    };

    mockCanvasService.export.mockResolvedValue(expected);

    const result = await controller.export(dto);

    expect(result).toEqual(expected);
    expect(mockCanvasService.export).toHaveBeenCalledWith(dto);
  });
});
