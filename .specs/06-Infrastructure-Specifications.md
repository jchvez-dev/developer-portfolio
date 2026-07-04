# Infrastructure & DevOps Specification

## Services Overview

|Service|Container Name|Image / Build|Ports|Network|
|---|---|---|---|---|---|
|Frontend|portafolio-frontend|Build: `./frontend/Dockerfile.dev`|3000|portafolio-network|
|API Gateway|portafolio-nest|Build: `./backend-nest/Dockerfile.dev`|4000|portafolio-network|
|Compute Engine|portafolio-php|Build: `./backend-php/Dockerfile.dev`|None (internal only)|portafolio-network|
|Object Storage|portafolio-storage|`minio/minio:RELEASE.2024-01-28T22-35-53Z`|9000 (API), 9001 (Console)|portafolio-network|
|Storage Init|portafolio-storage-init|`minio/mc:latest`|None|portafolio-network|
|Mailpit|portafolio-mailpit|`axllent/mailpit:latest`|1025 (SMTP), 8025 (Web UI)|portafolio-network|

### Mailpit (Dev Email Capture)
- **Purpose:** Captures all outgoing SMTP emails during development so no real emails are sent.
- **Web UI:** Accessible at `http://localhost:8025` to inspect subjects, bodies, and headers.
- **SMTP Credentials:** No authentication required in dev. For production, replace with a real SMTP provider (SendGrid, Gmail, etc.) via environment variables.

---

## Containerization Strategy
* **Environments:** Every microservice must strictly separate environments using two independent Dockerfiles.
  * `Dockerfile.dev`: Configured for local development with live-reload, dev-dependencies, and rootless permissions.
  * `Dockerfile`: Multi-stage build optimized for production (isolated static assets/binaries, zero dev-dependencies, lightweight alpine images).
* **Volume Hygiene:** Local workspace volumes must use anonymous volume bindings for generated artifacts (`/app/node_modules`, `/app/dist`, vendor folders) to prevent container build pollution on the Ubuntu host filesystem.

## Service Architecture
* **Gateway:** NestJS API acts as the single entry point for orchestration, authentication, and pre-signed URL generation.
* **Storage:** Decoupled object storage using local MinIO, automated via startup lifecycle scripts (`storage-init`).
* **Email (Dev):** Local Mailpit SMTP server captures outgoing emails for inspection via web UI.
* **Processing:** Microservices (PHP + Imagick) communicate asynchronously or via internal HTTP routing within the `portafolio-network`.

## Environment Variables

### SMTP Configuration
|Variable|Default|Description|
|---|---|---|
|`SMTP_HOST`|`mailpit`|SMTP server hostname (use `mailpit` in dev)|
|`SMTP_PORT`|`1025`|SMTP server port (587 for TLS in production)|
|`SMTP_USER`|`(empty)`|SMTP username (not needed for Mailpit)|
|`SMTP_PASS`|`(empty)`|SMTP password (not needed for Mailpit)|
|`CONTACT_EMAIL`|`juan@example.com`|Email address to receive contact form submissions|

## MinIO Buckets
|Bucket|Purpose|
|---|---|
|`system-assets`|Static system assets (CV, templates)|
|`user-uploads`|User-uploaded images processed by PHP|
|`production-exports`|Rendered canvas exports (PNG)|
|`chat-history`|Conversation history from AI Assistant|
|`contact-messages`|Contact form submissions persisted for record-keeping|