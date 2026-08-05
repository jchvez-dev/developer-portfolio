import { Injectable, Inject } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Profile } from './interfaces';
import { S3_CLIENT } from '../storage/storage.module';

@Injectable()
export class ProfileService {
  constructor(@Inject(S3_CLIENT) private readonly s3: S3Client) {}

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
