export default () => {
  const endpoint = (
    process.env.BUCKET_ENDPOINT ?? 'http://storage:9000'
  ).replace(/\/+$/, '');

  return {
    port: parseInt(process.env.NEST_PORT ?? '4000', 10),
    phpBackendUrl: process.env.PHP_BACKEND_URL ?? 'http://backend-php:8000',
    bucket: {
      endpoint,
      accessKey: process.env.BUCKET_ACCESS_KEY_ID ?? '',
      secretKey: process.env.BUCKET_SECRET_ACCESS_KEY ?? '',
      region: process.env.BUCKET_REGION ?? 'us-east-1',
    },
    corsOrigins: (
      process.env.CORS_ORIGINS ??
      `http://localhost:${process.env.FRONTEND_PORT ?? '3000'}`
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    groqApiKey: process.env.GROQ_API_KEY ?? '',
    groqModel: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
    smtp: {
      host: process.env.SMTP_HOST ?? 'mailpit',
      port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
      contactEmail: process.env.CONTACT_EMAIL ?? '',
    },
  };
};
