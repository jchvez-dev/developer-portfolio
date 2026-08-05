import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { S3_CLIENT } from '../storage/storage.module';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockSend = jest.fn();

  beforeEach(async () => {
    mockSend.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: S3_CLIENT,
          useValue: { send: mockSend },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('fetches profile.json from the system-assets bucket', async () => {
      mockSend.mockResolvedValue({
        Body: {
          transformToString: jest
            .fn()
            .mockResolvedValue(JSON.stringify({ name: 'Juan Chavez' })),
        },
      });

      const profile = await service.getProfile();

      expect(profile).toEqual({ name: 'Juan Chavez' });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Bucket: 'system-assets', Key: 'profile.json' },
        }),
      );
    });
  });
});
