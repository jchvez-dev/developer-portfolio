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
| `FRONTEND_PORT` | `3000` | Host port mapped to the React frontend (Vite dev server) |
| `BUCKET_API_PORT` | `9000` | Host port for the local MinIO S3 API (docker-compose only) |
| `BUCKET_CONSOLE_PORT` | `9001` | Host port for the local MinIO web console (docker-compose only) |
| `BUCKET_ENDPOINT` | `http://storage:9000` | Full S3 endpoint URL (MinIO local or Supabase `.../storage/v1/s3`) |
| `BUCKET_PUBLIC_URL` | `http://localhost:9000` | Public base URL for asset downloads (Supabase: `https://<ref>.supabase.co/storage/v1/object/public`) |
| `BUCKET_ACCESS_KEY_ID` | — | S3 access key ID (MinIO admin user or Supabase S3 key) |
| `BUCKET_SECRET_ACCESS_KEY` | — | S3 secret access key (MinIO admin password or Supabase S3 secret) |
| `BUCKET_REGION` | `us-east-1` | S3 region for SDK connections (Supabase: your project region) |
| `PHP_BACKEND_URL` | `http://backend-php:8000` | Internal URL for the PHP render engine |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed browser origins |
| `GROQ_API_KEY` | — | API key for Groq LLM provider (AI Career Assistant) |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Groq model for chat completions |
| `SMTP_HOST` | `mailpit` | SMTP server hostname (`mailpit` in dev, real SMTP in prod) |
| `SMTP_PORT` | `1025` | SMTP server port (587 for TLS in production) |
| `SMTP_USER` | — | SMTP username (leave empty for Mailpit) |
| `SMTP_PASS` | — | SMTP password (leave empty for Mailpit) |
| `CONTACT_EMAIL` | `juan@example.com` | Email address to receive contact form submissions |

### Using Supabase S3 Instead of Local MinIO

The codebase is provider-agnostic: it only needs a full endpoint URL and credentials. To switch from local MinIO to Supabase S3, update the storage variables in `.env` and provision the buckets there:

```dotenv
BUCKET_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
BUCKET_PUBLIC_URL=https://<project-ref>.supabase.co/storage/v1/object/public
BUCKET_ACCESS_KEY_ID=your-supabase-access-key
BUCKET_SECRET_ACCESS_KEY=your-supabase-secret-key
BUCKET_REGION=ca-central-1
```

Path-style requests are always used (required by both MinIO and Supabase).

The following buckets must exist in Supabase with the same names: `system-assets`, `user-uploads`, `production-exports`, `chat-history`, `contact-messages`. The font files in `backend-php/fonts/` must be uploaded to `system-assets/fonts/` (the `storage-init` container only provisions local MinIO). Make `production-exports` (and any bucket served via `BUCKET_PUBLIC_URL`) public.

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

### Makefile Commands

A `Makefile` is provided at the project root with shortcuts for common tasks:

| Command | Action |
|---|---|
| `make up` | Start all services (`docker compose up -d`) |
| `make down` | Stop all services |
| `make build` | Build all images |
| `make rebuild` | Stop, rebuild, and restart all services |
| `make logs` | Tail logs from all services |
| `make test` | Run tests across all 3 services (NestJS, PHP, frontend) |
| `make test-nest` | Run NestJS tests |
| `make test-php` | Run PHP tests |
| `make test-front` | Run frontend tests |
| `make lint` | Lint frontend and NestJS |
| `make shell-nest` | Open a shell in the NestJS container |
| `make shell-php` | Open a shell in the PHP container |
| `make shell-front` | Open a shell in the frontend container |

### Service Endpoints

Once running:

| Service | URL | Notes |
|---|---|---|---|
| **Frontend** | `http://localhost:3000` | React SPA with Tailwind CSS |
| **NestJS API** | `http://localhost:4000/api/v1` | Public API gateway |
| **Health check** | `http://localhost:4000/api/v1/health` | Smoke-test endpoint |
| **Profile** | `http://localhost:4000/api/v1/profile` | `GET` — CV data from MinIO (used by landing page) |
| **Canvas Export** | `http://localhost:4000/api/v1/canvas/export` | `POST` — Export canvas layout as image |
| **Canvas Upload** | `http://localhost:4000/api/v1/canvas/upload` | `POST` (multipart) — Upload user images, processed via PHP/Imagick |
| **AI Chat** | `http://localhost:4000/api/v1/chat` | `POST` — Chat with Groq LLM (SSE token streaming) |
| **AI Chat History** | `http://localhost:4000/api/v1/chat/:id` | `GET` — Retrieve conversation history |
| **Contact Form** | `http://localhost:4000/api/v1/contact` | `POST` — Submit contact form with anti-spam (honeypot + rate limiting) |
| **MinIO S3 API** | `http://localhost:9000` | Used by services to upload/download assets (local dev only) |
| **MinIO Console** | `http://localhost:9001` | Web UI; log in with `BUCKET_ACCESS_KEY_ID` / `BUCKET_SECRET_ACCESS_KEY` (local dev only) |
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

### Running Tests

Run tests for all services at once, or for a specific service:

```bash
make test         # all services
make test-nest    # NestJS API gateway
make test-php     # PHP render engine
make test-front   # React frontend
```
