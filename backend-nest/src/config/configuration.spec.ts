import configuration from './configuration';

const KEYS = [
  'BUCKET_ENDPOINT',
  'BUCKET_ACCESS_KEY_ID',
  'BUCKET_SECRET_ACCESS_KEY',
  'BUCKET_REGION',
];

function setEnv(overrides: Record<string, string | undefined>) {
  for (const key of KEYS) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => setEnv({}));

describe('configuration bucket settings', () => {
  it('uses MinIO defaults when bucket env vars are not set', () => {
    setEnv({});

    const config = configuration();

    expect(config.bucket.endpoint).toBe('http://storage:9000');
    expect(config.bucket.region).toBe('us-east-1');
    expect(config.bucket.accessKey).toBe('');
    expect(config.bucket.secretKey).toBe('');
  });

  it('trims trailing slashes from BUCKET_ENDPOINT', () => {
    setEnv({ BUCKET_ENDPOINT: 'http://storage:9000////' });

    const config = configuration();

    expect(config.bucket.endpoint).toBe('http://storage:9000');
  });

  it('keeps the full S3 endpoint URL untouched', () => {
    setEnv({
      BUCKET_ENDPOINT: 'https://s3.example.com/storage/v1/s3/',
    });

    const config = configuration();

    expect(config.bucket.endpoint).toBe(
      'https://s3.example.com/storage/v1/s3',
    );
  });

  it('reads credentials and region overrides from environment', () => {
    setEnv({
      BUCKET_REGION: 'ca-central-1',
      BUCKET_ACCESS_KEY_ID: 'my-access-key',
      BUCKET_SECRET_ACCESS_KEY: 'my-secret-key',
    });

    const config = configuration();

    expect(config.bucket.region).toBe('ca-central-1');
    expect(config.bucket.accessKey).toBe('my-access-key');
    expect(config.bucket.secretKey).toBe('my-secret-key');
  });
});
