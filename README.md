# Developer Portfolio & Polyglot Microservices Ecosystem

Professional Full Stack Web Developer Portfolio built with React, NestJS, PHP-FPM, and MinIO. Designed to showcase production-grade microservice architecture, clean code standards, and DevOps best practices.

---

## Spec-Driven Development (SDD)

This repository follows a strict **Spec-Driven Development (SDD)** methodology. All architectural components, product goals, APIs, and rules are documented prior to writing code, serving as the absolute source of truth.

### Directory Structure & Specifications

The documentation is organized under the **[`.specs/`](.specs/)** folder in sequential reading order:

1. **[01-Product-Requirements-Document.md](.specs/01-Product-Requirements-Document.md)**: Product goals, functional requirements, personas, and Definition of Done (DoD).
2. **[02-Software-Architecture-Document.md](.specs/02-Software-Architecture-Document.md)**: Polyglot microservices layout, component specifications, S3 communication, and network perimeter isolation details.
3. **[03-Frontend-Architecture-Design-Document.md](.specs/03-Frontend-Architecture-Design-Document.md)**: Detailed React client design, 60 FPS graphics engine powered by JS Proxies/EventEmitters, CKEditor inline bindings, and SSE token streaming reader.
4. **[04-API-Specification.md](.specs/04-API-Specification.md)**: API contract detailing inputs/outputs, payloads, and the internal private gateway mesh.
5. **[05-Data-Model-Test-Plan.md](.specs/05-Data-Model-Test-Plan.md)**: MinIO bucket hierarchies, CKEditor HTML whitelist patterns, integration checks, and stress testing instructions.
6. **[06-Infrastructure-Specifications.md](.specs/06-Infrastructure-Specifications.md)**: DevOps rules, multi-stage Dockerfiles layout, volume hygiene, and docker-compose orchestration.

### AI Assistant Rules (`.agents/`)

The **[`.agents/AGENTS.md`](.agents/AGENTS.md)** file contains custom project guidelines loaded automatically by agentic systems (like Antigravity) to enforce:
* Always consulting `.specs/` as the single source of truth before any codebase change.
* Adhering to the isolated polyglot microservice boundaries.
* Maintaining Docker security (non-root execution, private container meshes).
* Bypassing empty placeholders or stub code in favor of production-ready implementations.

---

## Local Development Setup

The infrastructure uses Docker to orchestrate all services. The storage cluster, NestJS API gateway, PHP render engine, and Mailpit SMTP server are configured and ready to run.

### Prerequisites

* Docker Engine and Docker Compose installed locally.
* A `.env` file configured in the root directory (copy from `.env.example`).

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEST_PORT` | `4000` | Host port mapped to the NestJS API gateway |
| `FRONTEND_PORT` | `3000` | Host port reserved for the React frontend (not yet wired) |
| `MINIO_API_PORT` | `9000` | Host port for the MinIO S3 API |
| `MINIO_CONSOLE_PORT` | `9001` | Host port for the MinIO web console |
| `MINIO_ROOT_USER` | — | MinIO admin username (shared by storage and NestJS) |
| `MINIO_ROOT_PASSWORD` | — | MinIO admin password (shared by storage and NestJS) |
| `PHP_BACKEND_URL` | `http://backend-php:8000` | Internal URL for the PHP render engine |
| `MINIO_ENDPOINT` | `storage` | MinIO hostname (`storage` in Docker, `localhost` on host) |
| `MINIO_PORT` | `9000` | MinIO S3 port (internal container port) |
| `MINIO_USE_SSL` | `false` | Enable TLS for MinIO SDK connections |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | Public URL for MinIO downloads (change in production) |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed browser origins |
| `GROQ_API_KEY` | — | API key for Groq LLM provider (AI Career Assistant) |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Groq model for chat completions |
| `SMTP_HOST` | `mailpit` | SMTP server hostname (`mailpit` in dev, real SMTP in prod) |
| `SMTP_PORT` | `1025` | SMTP server port (587 for TLS in production) |
| `SMTP_USER` | — | SMTP username (leave empty for Mailpit) |
| `SMTP_PASS` | — | SMTP password (leave empty for Mailpit) |
| `CONTACT_EMAIL` | `juan@example.com` | Email address to receive contact form submissions |

### Launching Services

Start all services (storage, API gateway, and PHP render engine):

```bash
docker compose up -d
```

To start only the storage layer:

```bash
docker compose up -d storage storage-init
```

To start the frontend development server (requires the API gateway to be running):

```bash
docker compose up frontend
```

To start only the API gateway (requires storage to be running):

```bash
docker compose up -d backend-nest
```

To start only the PHP render engine (requires storage to be running):

```bash
docker compose up -d backend-php
```

### Service Endpoints

Once running:

| Service | URL | Notes |
|---|---|---|---|
| **Frontend** | `http://localhost:3000` | React SPA with Tailwind CSS |
| **NestJS API** | `http://localhost:4000/api/v1` | Public API gateway |
| **Health check** | `http://localhost:4000/api/v1/health` | Smoke-test endpoint |
| **Canvas Export** | `http://localhost:4000/api/v1/canvas/export` | `POST` — Export canvas layout as image |
| **Canvas Upload** | `http://localhost:4000/api/v1/canvas/upload` | `POST` (multipart) — Upload user images, processed via PHP/Imagick |
| **AI Chat** | `http://localhost:4000/api/v1/chat` | `POST` — Chat with Groq LLM (SSE token streaming) |
| **Contact Form** | `http://localhost:4000/api/v1/contact` | `POST` — Submit contact form with anti-spam (honeypot + rate limiting) |
| **MinIO S3 API** | `http://localhost:9000` | Used by services to upload/download assets |
| **MinIO Console** | `http://localhost:9001` | Web UI; log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` |
| **PHP Render** | `http://backend-php:8000` (internal network only) | `POST /internal/render`, no host port exposed |
| **Mailpit UI** | `http://localhost:8025` | Web UI for inspecting captured emails in dev |

Verify the API gateway is healthy:

```bash
curl http://localhost:4000/api/v1/health
```

Expected response:

```json
{"status":"ok","service":"portafolio-nest","timestamp":"..."}
```

Verify internal mesh connectivity from NestJS to the PHP render engine:

```bash
docker compose exec backend-nest curl -s http://backend-php:8000/internal/render \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"jobId":"mesh-test","definition":{"dimensions":{"w":1200,"h":630},"elements":[]}}'
```

Expected response:

```json
{"status":"completed","objectKey":"mesh-test-result.png","executionTimeMs":23}
```

### Project Structure

```
backend-nest/     NestJS API gateway (port 4000)
backend-php/     PHP-FPM + Imagick render engine (internal only)
frontend/        React SPA (port 3000)
docker-compose.yml
.env
```

### Running Tests (backend-nest)

From the host or inside the container:

```bash
cd backend-nest
npm test
npm run test:e2e
```

### Running Tests (backend-php)

Inside the running container:

```bash
docker compose exec backend-php vendor/bin/phpunit
```
