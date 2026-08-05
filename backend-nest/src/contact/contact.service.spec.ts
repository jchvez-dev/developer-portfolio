import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { S3_CLIENT } from '../storage/storage.module';

describe('ContactService', () => {
  let service: ContactService;

  const mockSend = jest.fn<Promise<unknown>, [PutObjectCommand]>();

  const mockConfig = {
    smtp: {
      host: 'mailpit',
      port: 1025,
      user: '',
      pass: '',
      contactEmail: 'juan@example.com',
    },
  };

  const validDto: ContactDto = {
    name: 'Juan',
    email: 'juan@example.com',
    message: 'Hello, this is a message',
  };

  beforeEach(async () => {
    mockSend.mockReset();

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
        {
          provide: S3_CLIENT,
          useValue: { send: mockSend },
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submit', () => {
    it('returns success without storing when honeypot is set', async () => {
      const result = await service.submit(
        { ...validDto, honeypot: 'bot' },
        '1.1.1.1',
      );

      expect(result.success).toBe(true);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('persists the contact message to the contact-messages bucket', async () => {
      mockSend.mockResolvedValue({});

      const { messageId } = await service.submit(validDto, '2.2.2.2');

      expect(messageId).toBeDefined();

      const putInput = {
        Bucket: 'contact-messages',
        Key: `${messageId}.json`,
        ContentType: 'application/json',
      } as const;

      expect(mockSend).toHaveBeenCalledTimes(1);

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input).toMatchObject(putInput);
    });
  });
});
