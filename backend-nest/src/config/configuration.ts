export default () => ({
  port: parseInt(process.env.NEST_PORT ?? '4000', 10),
  phpBackendUrl: process.env.PHP_BACKEND_URL ?? 'http://backend-php:8000',
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'storage',
    port: parseInt(process.env.MINIO_API_PORT ?? '9000', 10),
    accessKey: process.env.MINIO_ROOT_USER ?? '',
    secretKey: process.env.MINIO_ROOT_PASSWORD ?? '',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },
  minioPublicUrl:
    process.env.MINIO_PUBLIC_URL ??
    `http://localhost:${process.env.MINIO_API_PORT ?? '9000'}`,
  corsOrigins: (
    process.env.CORS_ORIGINS ??
    `http://localhost:${process.env.FRONTEND_PORT ?? '3000'}`
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});
