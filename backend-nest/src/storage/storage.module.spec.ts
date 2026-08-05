import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT, StorageModule } from './storage.module';

describe('StorageModule', () => {
  let module: TestingModule;

  const mockBucketConfig = {
    endpoint: 'http://localhost:9000',
    accessKey: 'testkey',
    secretKey: 'testsecret',
    region: 'us-east-1',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), StorageModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) =>
          key === 'bucket' ? mockBucketConfig : undefined,
        ),
      })
      .compile();
  });

  it('provides a configured S3Client with path-style enabled', async () => {
    const client = module.get<S3Client>(S3_CLIENT);

    expect(client).toBeInstanceOf(S3Client);
    expect(client.config.forcePathStyle).toBe(true);
    await expect(client.config.region()).resolves.toBe('us-east-1');

    const endpoint = await client.config.endpoint!();
    expect(endpoint.hostname).toBe('localhost');
    expect(endpoint.port).toBe(9000);
  });

  it('uses the bucket credentials from config', async () => {
    const client = module.get<S3Client>(S3_CLIENT);

    const credentials = await client.config.credentials();
    expect(credentials.accessKeyId).toBe('testkey');
    expect(credentials.secretAccessKey).toBe('testsecret');
  });
});
