import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export const S3_CLIENT = Symbol('S3_CLIENT');

interface BucketConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
}

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      useFactory: (configService: ConfigService): S3Client => {
        const bucket = configService.get<BucketConfig>('bucket')!;

        return new S3Client({
          region: bucket.region,
          endpoint: bucket.endpoint,
          forcePathStyle: true,
          credentials: {
            accessKeyId: bucket.accessKey,
            secretAccessKey: bucket.secretKey,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3_CLIENT],
})
export class StorageModule {}
