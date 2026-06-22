# Custom Agent Rules for Developer Portfolio Project

These rules guide the AI coding assistant (Antigravity) on coding style, architecture constraints, and workflows for this workspace.

---

## Core Engineering Principles

### 1. Spec-Driven Development (SDD)
* **Precedence:** Always treat files under the `.specs/` folder as the source of truth for features, architecture, and testing.
* **Review:** Before starting any code changes, read the corresponding spec file (e.g., `01-Product-Requirements-Document.md`, `02-Software-Architecture-Document.md`, etc.).

### 2. Polyglot Microservices Topology
* **Separation of Concerns:** Keep the frontend (`frontend`), API gateway (`backend-nest`), and heavy compute render engine (`backend-php`) decoupled.
* **Resource Isolation:** CPU-bound processing (PHP-FPM + Imagick) must run in isolated containers separate from I/O-bound operations (NestJS).

### 3. Containerization & DevOps
* **Two Dockerfiles per Service:**
  * `Dockerfile.dev`: Dev environment with live-reload, node_modules/composer vendors, running as rootless user (`node` or `www-data`).
  * `Dockerfile`: Multi-stage build optimized for production (isolated static assets/binaries, zero dev-dependencies, lightweight Alpine image).
* **Volume Hygiene:** Local workspace mounts in `docker-compose.yml` must use anonymous volume bindings (e.g., `/app/node_modules`, `/app/vendor`) to prevent container files from polluting the host filesystem.
* **Perimeter Security:** The `backend-php` container must not expose public-facing network ports. Only expose `frontend` (port 3000) and `backend-nest` (port 4000).

### 4. Technical Conventions
* **NestJS App:** Always prefix REST controllers with `api/v1` and enable CORS in `src/main.ts`.
* **Frontend Canvas:** Keep high-frequency UI mutations (such as layer dragging/resizing) outside the React lifecycle using vanilla JS `Proxy` listeners and EventEmitters to preserve 60 FPS performance.
* **No Placeholders:** Avoid implementing empty code stubs or placeholders. All routes, validation schemas (using `class-validator`), and image rasterization algorithms must be fully implemented.
