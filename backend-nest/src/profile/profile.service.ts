import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Profile } from './interfaces';

@Injectable()
export class ProfileService implements OnModuleInit {
  private s3: S3Client;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
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
  }

  async getProfile(): Promise<Profile> {
    const command = new GetObjectCommand({
      Bucket: 'system-assets',
      Key: 'profile.json',
    });

    const response = await this.s3.send(command);
    const body = await response.Body!.transformToString();
    return JSON.parse(body) as Profile;
  }
}
