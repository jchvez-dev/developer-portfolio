# Infrastructure & DevOps Specification

## Containerization Strategy
* **Environments:** Every microservice must strictly separate environments using two independent Dockerfiles.
  * `Dockerfile.dev`: Configured for local development with live-reload, dev-dependencies, and rootless permissions.
  * `Dockerfile`: Multi-stage build optimized for production (isolated static assets/binaries, zero dev-dependencies, lightweight alpine images).
* **Volume Hygiene:** Local workspace volumes must use anonymous volume bindings for generated artifacts (`/app/node_modules`, `/app/dist`, vendor folders) to prevent container build pollution on the Ubuntu host filesystem.

## Service Architecture
* **Gateway:** NestJS API acts as the single entry point for orchestration, authentication, and pre-signed URL generation.
* **Storage:** Decoupled object storage using local MinIO, automated via startup lifecycle scripts (`storage-init`).
* **Processing:** Microservices (PHP + Imagick) communicate asynchronously or via internal HTTP routing within the `portafolio-network`.