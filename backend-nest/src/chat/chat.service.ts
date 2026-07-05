import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ChatDto } from './dto/chat.dto';
import { ChatMessage, Conversation } from './interfaces';

@Injectable()
export class ChatService implements OnModuleInit {
  private systemPrompt = '';
  private groq: OpenAI;
  private s3: S3Client;
  private model: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.model = this.configService.get<string>('groqModel')!;

    this.groq = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: this.configService.get<string>('groqApiKey'),
    });

    const minioConfig = this.configService.get<{
      endpoint: string;
      port: number;
      accessKey: string;
      secretKey: string;
      useSSL: boolean;
      region: string;
    }>('minio')!;

    this.s3 = new S3Client({
      region: minioConfig.region,
      endpoint: `http://${minioConfig.endpoint}:${minioConfig.port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: minioConfig.accessKey,
        secretAccessKey: minioConfig.secretKey,
      },
    });

    await this.loadSystemPrompt();
  }

  private async loadSystemPrompt() {
    let cvContent = '';
    try {
      const command = new GetObjectCommand({
        Bucket: 'system-assets',
        Key: 'cv-juan-chavez.md',
      });
      const response = await this.s3.send(command);
      cvContent = await response.Body!.transformToString();
    } catch {
      cvContent = 'No CV available.';
      console.error('Failed to load CV from MinIO, using fallback prompt.');
    }

    this.systemPrompt = `You are an AI assistant representing Juan Chavez, a senior full stack web developer.
You answer questions from recruiters and engineering managers.
Follow these rules strictly:

1. Answer ONLY based on the CV information provided below.
2. If a question cannot be answered from the CV, say: "That information is not available in Juan's profile."
3. Do NOT make up experiences, technologies, achievements, or data not present in the CV.
4. Keep responses professional, concise, and in the same language as the question.
5. If asked about technologies not mentioned, answer based on the CV context or state it is not specified.
6. Do NOT answer questions unrelated to Juan's professional profile.

--- JUAN CHAVEZ CV ---
${cvContent}`;
  }

  async streamResponse(
    dto: ChatDto,
  ): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
    ];

    if (dto.conversationId) {
      try {
        const history = await this.loadConversation(dto.conversationId);
        messages.push(...history.messages);
      } catch {
        // conversation not found, start fresh
      }
    }

    messages.push({ role: 'user', content: dto.message });

    const stream = await this.groq.chat.completions.create({
      model: this.model,
      messages: messages,
      stream: true,
    });

    return stream;
  }

  async saveConversation(
    conversationId: string,
    userMessage: string,
    fullResponse: string,
  ) {
    let conversation: Conversation;

    try {
      conversation = await this.loadConversation(conversationId);
    } catch {
      conversation = {
        conversationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
    }

    conversation.messages.push(
      { role: 'user' as const, content: userMessage },
      { role: 'assistant' as const, content: fullResponse },
    );
    conversation.updatedAt = new Date().toISOString();

    const command = new PutObjectCommand({
      Bucket: 'chat-history',
      Key: `conversations/${conversationId}.json`,
      Body: JSON.stringify(conversation),
      ContentType: 'application/json',
    });

    await this.s3.send(command);
  }

  private async loadConversation(
    conversationId: string,
  ): Promise<Conversation> {
    const command = new GetObjectCommand({
      Bucket: 'chat-history',
      Key: `conversations/${conversationId}.json`,
    });
    const response = await this.s3.send(command);
    const body = await response.Body!.transformToString();
    return JSON.parse(body) as Conversation;
  }

  async getConversation(
    conversationId: string,
  ): Promise<Conversation | null> {
    try {
      return await this.loadConversation(conversationId);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: 'chat-history',
      Key: `conversations/${conversationId}.json`,
    });

    try {
      await this.s3.send(command);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return;
      }
      throw error;
    }
  }
}
