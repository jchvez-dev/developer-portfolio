import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;

  const mockConfig = {
    smtp: {
      host: 'mailpit',
      port: 1025,
      user: '',
      pass: '',
      contactEmail: 'juan@example.com',
    },
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
        ContactService,
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

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
