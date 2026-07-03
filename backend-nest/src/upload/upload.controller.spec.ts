import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    processUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: mockUploadService }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('calls service.processUpload and returns the result', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png' as const,
      originalname: 'test.png',
      size: 100,
    };
    const sessionId = 'sess_test123';

    const expected = {
      success: true,
      assetUrl: 'http://localhost:9000/user-uploads/sess_test123/uuid.webp',
      sessionId,
    };

    mockUploadService.processUpload.mockResolvedValue(expected);

    const result = await controller.upload(file, sessionId);

    expect(result).toEqual(expected);
    expect(service.processUpload).toHaveBeenCalledWith(file, sessionId);
  });

  it('generates sessionId when not provided', async () => {
    const file = {
      buffer: Buffer.from('test'),
      mimetype: 'image/png' as const,
      originalname: 'test.png',
      size: 100,
    };

    mockUploadService.processUpload.mockResolvedValue({
      success: true,
      assetUrl: 'http://localhost:9000/user-uploads/sess_abc/uuid.webp',
      sessionId: 'sess_abc',
    });

    await controller.upload(file, undefined);

    expect(service.processUpload).toHaveBeenCalledWith(
      file,
      expect.stringMatching(/^sess_[a-f0-9-]+$/),
    );
  });
});
