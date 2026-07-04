import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import { ContactDto } from './dto/contact.dto';
import { ContactMessage } from './interfaces';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class ContactService implements OnModuleInit {
  private s3: S3Client;
  private transporter: nodemailer.Transporter;
  private contactEmail: string;
  private readonly rateLimitMap = new Map<string, RateLimitEntry>();
  private readonly RATE_LIMIT_MAX = 5;
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.contactEmail = this.configService.get<string>('smtp.contactEmail')!;

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

    const smtpConfig = this.configService.get<{
      host: string;
      port: number;
      user: string;
      pass: string;
    }>('smtp')!;

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth:
        smtpConfig.user || smtpConfig.pass
          ? { user: smtpConfig.user, pass: smtpConfig.pass }
          : undefined,
    });
  }

  async submit(
    dto: ContactDto,
    ip: string,
  ): Promise<{ success: boolean; messageId: string }> {
    if (dto.honeypot) {
      const messageId = randomUUID();
      return { success: true, messageId };
    }

    this.checkRateLimit(ip);

    const messageId = randomUUID();
    const contactMessage: ContactMessage = {
      id: messageId,
      name: dto.name,
      email: dto.email,
      subject: dto.subject ?? '',
      message: dto.message,
      createdAt: new Date().toISOString(),
    };

    await Promise.all([
      this.saveToMinio(contactMessage),
      this.sendEmail(contactMessage),
    ]);

    return { success: true, messageId };
  }

  private checkRateLimit(ip: string): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(ip);

    if (entry && now < entry.resetAt) {
      if (entry.count >= this.RATE_LIMIT_MAX) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      entry.count++;
    } else {
      this.rateLimitMap.set(ip, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW_MS,
      });
    }
  }

  private async saveToMinio(message: ContactMessage): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: 'contact-messages',
      Key: `${message.id}.json`,
      Body: JSON.stringify(message),
      ContentType: 'application/json',
    });

    await this.s3.send(command);
  }

  private async sendEmail(message: ContactMessage): Promise<void> {
    if (!this.contactEmail) return;

    const subject = message.subject
      ? `[Portfolio Contact] ${message.subject}`
      : `[Portfolio Contact] Message from ${message.name}`;

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${message.name}</p>
      <p><strong>Email:</strong> ${message.email}</p>
      <p><strong>Subject:</strong> ${message.subject || '(no subject)'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Message ID: ${message.id}</small></p>
    `;

    await this.transporter.sendMail({
      from: `"Portfolio Contact" <${this.contactEmail}>`,
      to: this.contactEmail,
      subject,
      html,
    });
  }
}
