import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto, @Res() res: Response) {
    res.flushHeaders();

    let fullResponse = '';

    try {
      const stream = await this.chatService.streamResponse(dto);

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token, done: false })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ token: '', done: true })}\n\n`);
      res.end();

      if (dto.conversationId) {
        this.chatService
          .saveConversation(dto.conversationId, dto.message, fullResponse)
          .catch((err) => console.error('Failed to save conversation:', err));
      }
    } catch (error: any) {
      const errorMessage = error.message ?? 'Error processing chat request.';
      res.write(
        `data: ${JSON.stringify({ token: '', done: true, error: errorMessage })}\n\n`,
      );
      res.end();
    }
  }
}
