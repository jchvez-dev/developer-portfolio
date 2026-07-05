import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  const mockChatService = {
    streamResponse: jest.fn(),
    saveConversation: jest.fn(),
    getConversation: jest.fn(),
    deleteConversation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: mockChatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteConversation', () => {
    it('deletes existing conversation', async () => {
      mockChatService.getConversation.mockResolvedValue({
        conversationId: 'abc',
        messages: [],
        createdAt: '',
        updatedAt: '',
      });

      const result = await controller.deleteConversation('abc');

      expect(mockChatService.deleteConversation).toHaveBeenCalledWith('abc');
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException if conversation does not exist', async () => {
      mockChatService.getConversation.mockResolvedValue(null);

      await expect(controller.deleteConversation('abc')).rejects.toThrow(
        'Conversation not found',
      );
    });
  });
});
