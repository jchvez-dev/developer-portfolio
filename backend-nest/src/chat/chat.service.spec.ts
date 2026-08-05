import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ChatService } from './chat.service';
import { S3_CLIENT } from '../storage/storage.module';

type S3Command = PutObjectCommand | GetObjectCommand | DeleteObjectCommand;

describe('ChatService', () => {
  let service: ChatService;

  const mockSend = jest.fn<Promise<unknown>, [S3Command]>();

  const mockConfig = {
    groqApiKey: 'test-key',
    groqModel: 'llama3-8b-8192',
  };

  beforeEach(async () => {
    mockSend.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
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

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveConversation', () => {
    it('persists a new conversation to the chat-history bucket', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('NoSuchKey'))
        .mockResolvedValueOnce({});

      await service.saveConversation('conv-1', 'hi', 'hello');

      const putInput = {
        Bucket: 'chat-history',
        Key: 'conversations/conv-1.json',
        ContentType: 'application/json',
      } as const;

      expect(mockSend).toHaveBeenCalledTimes(2);

      const putCommand = mockSend.mock.calls[1][0];
      expect(putCommand.input).toMatchObject(putInput);
    });
  });

  describe('getConversation', () => {
    it('returns the parsed conversation from the chat-history bucket', async () => {
      mockSend.mockResolvedValue({
        Body: {
          transformToString: jest.fn().mockResolvedValue(
            JSON.stringify({
              conversationId: 'conv-1',
              messages: [{ role: 'user', content: 'hi' }],
            }),
          ),
        },
      });

      const conversation = await service.getConversation('conv-1');

      expect(conversation).toMatchObject({ conversationId: 'conv-1' });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'chat-history',
            Key: 'conversations/conv-1.json',
          },
        }),
      );
    });

    it('returns null when the key does not exist', async () => {
      const error = new Error('key not found');
      error.name = 'NoSuchKey';
      mockSend.mockRejectedValue(error);

      const conversation = await service.getConversation('conv-1');

      expect(conversation).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('should be a function', () => {
      expect(typeof service.deleteConversation).toBe('function');
    });

    it('sends a DeleteObjectCommand to the chat-history bucket', async () => {
      mockSend.mockResolvedValue({});

      await service.deleteConversation('conv-1');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'chat-history',
            Key: 'conversations/conv-1.json',
          },
        }),
      );
    });
  });
});
