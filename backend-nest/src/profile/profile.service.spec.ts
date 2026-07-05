import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockConfig = {
    minio: {
      endpoint: 'storage',
      port: 9000,
      accessKey: 'test',
      secretKey: 'test',
      useSSL: false,
      region: 'us-east-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              (key: string) => mockConfig[key as keyof typeof mockConfig],
            ),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
