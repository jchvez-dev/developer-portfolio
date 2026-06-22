# Developer Portfolio & Polyglot Microservices Ecosystem

Professional Full Stack Web Developer Portfolio built with React, NestJS, PHP-FPM, and MinIO. Designed to showcase production-grade microservice architecture, clean code standards, and DevOps best practices.

---

## Spec-Driven Development (SDD)

This repository follows a strict **Spec-Driven Development (SDD)** methodology. All architectural components, product goals, APIs, and rules are documented prior to writing code, serving as the absolute source of truth.

### Directory Structure & Specifications

The documentation is organized under the **`[.specs/](file:///home/jchavez/Projects/developer-portfolio/.specs/)`** folder in sequential reading order:

1. **[01-Product-Requirements-Document.md](file:///home/jchavez/Projects/developer-portfolio/.specs/01-Product-Requirements-Document.md)**: Product goals, functional requirements, personas, and Definition of Done (DoD).
2. **[02-Software-Architecture-Document.md](file:///home/jchavez/Projects/developer-portfolio/.specs/02-Software-Architecture-Document.md)**: Polyglot microservices layout, component specifications, S3 communication, and network perimeter isolation details.
3. **[03-Frontend-Architecture-Design-Document.md](file:///home/jchavez/Projects/developer-portfolio/.specs/03-Frontend-Architecture-Design-Document.md)**: Detailed React client design, 60 FPS graphics engine powered by JS Proxies/EventEmitters, CKEditor inline bindings, and SSE token streaming reader.
4. **[04-API-Specification.md](file:///home/jchavez/Projects/developer-portfolio/.specs/04-API-Specification.md)**: API contract detailing inputs/outputs, payloads, and the internal private gateway mesh.
5. **[05-Data-Model-Test-Plan.md](file:///home/jchavez/Projects/developer-portfolio/.specs/05-Data-Model-Test-Plan.md)**: MinIO bucket hierarchies, CKEditor HTML whitelist patterns, integration checks, and stress testing instructions.
6. **[06-Infrastructure-Specifications.md](file:///home/jchavez/Projects/developer-portfolio/.specs/06-Infrastructure-Specifications.md)**: DevOps rules, multi-stage Dockerfiles layout, volume hygiene, and docker-compose orchestration.

### AI Assistant Rules (`.agents/`)

The **`[.agents/AGENTS.md](file:///home/jchavez/Projects/developer-portfolio/.agents/AGENTS.md)`** file contains custom project guidelines loaded automatically by agentic systems (like Antigravity) to enforce:
* Always consulting `.specs/` as the single source of truth before any codebase change.
* Adhering to the isolated polyglot microservice boundaries.
* Maintaining Docker security (non-root execution, private container meshes).
* Bypassing empty placeholders or stub code in favor of production-ready implementations.

---

## Local Development Setup

The infrastructure uses Docker to orchestrate services. Currently, the localized storage cluster is configured and ready to run.

### Prerequisites

* Docker Engine and Docker Compose installed locally.
* A `.env` file configured in the root directory (based on `.env.example`).

### Launching the Storage Engine

The storage service runs a local MinIO S3-compliant instance. To start the storage engine and automatically provision the required buckets:

```bash
docker compose up -d storage storage-init
```

Once running:
* **S3 API Endpoint:** `http://localhost:9000` (used by applications to upload/download assets).
* **MinIO Web Console:** `http://localhost:9001` (accessible via web browser).
* **Credentials:** Log in to the Web Console using the `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` defined in your `.env` file.
