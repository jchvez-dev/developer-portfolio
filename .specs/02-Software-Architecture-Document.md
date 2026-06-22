# Software Architecture Document (SAD)

## Project: Core Engineering Portfolio & Polyglot Microservices Ecosystem

## 1. Architectural Representation and Overview
This system implements a **Polyglot Microservices Architecture** orchestrated entirely within an isolated **Docker Virtual Network Bridge**. The layout decomposes business logic into domain-specific, decoupled runtime environments optimized for their specific compute footprints:
1. **Frontend Shell (React / Native JS):** Client-side presentation layer and isolated reactive graphics workspace.
2. **API Gateway & AI Orchestrator (NestJS):** I/O-bound, high-concurrency node handling client ingress, input validation, and LLM text streaming tokens.
3. **Heavy Compute Engine (PHP-FPM + Imagick):** CPU-bound synchronous microservice isolated from external exposure, dedicated solely to graphic processing and rasterization.
4. **Object Storage (MinIO):** Local S3-compliant persistent layer for high-throughput asset distribution.

Plaintext

```
       [ Public Client Browser ]
                   │
         PORTS 3000 (UI) / 4000 (API)
                   │
  ┌────────────────VIRTUAL DOCKER NETWORK BRIDGE──────────┐
  │                                                        │
  │   ┌────────────────┐            ┌─────────────────┐    │
  │   │                │   HTTP     │                 │    │
  │   │  Frontend App  ├───────────►│   API Gateway   │    │
  │   │    (React)     │            │    (NestJS)     │    │
  │   └────────────────┘            └────┬────────┬───┘    │
  │                                      │        │        │
  │                         Internal HTTP│        │S3 SDK  │
  │                         (Port 8000)  │        │        │
  │                                      ▼        ▼        │
  │   ┌────────────────┐            ┌────┴────────┴───┐    │
  │   │ Image Engine   │   S3 SDK   │ Object Storage  │    │
  │   │   (PHP-FPM)    ├───────────►│     (MinIO)     │    │
  │   └────────────────┘            └─────────────────┘    │
  └────────────────────────────────────────────────────────┘
```

## 2. Component Design & Responsibilities

### 2.1 Frontend Container (`portafolio-front`)
- **Runtime:** Node.js (Development) / Nginx Alpine (Production Build).
- **Core Responsibilities:**
    - Serve the Single Page Application (SPA).
    - Provide a decoupled **Graphical Canvas Runtime** utilizing JavaScript `Proxies` and `EventEmitters` to track layout positioning natively at 60 FPS without triggering React framework reconciliation re-renders.
    - Embed **CKEditor instance nodes** into the absolute-positioned DOM element layers.

### 2.2 API Gateway & Orchestrator Container (`portafolio-nest`)
- **Runtime:** Node.js + NestJS (TypeScript).
- **Core Responsibilities:**
    - Ingress Control: Act as the single public entry-point for API transactions.
    - State Serialization: Validate Incoming JSON canvas layouts against class-validator schemas.
    - AI Conduit: Manage connections to external LLM providers via HTTP Token Streaming (`text/event-stream`), passing a secured system prompt embedded with the developer’s specific resume taxonomy.
    - Brokering: Proxy rendering actions downstream to the PHP engine via internal Docker network namespacing (`http://backend-php:8000`).

### 2.3 Image Processor Container (`portafolio-php`)
- **Runtime:** PHP 8.x-FPM + Nginx/Built-in server (Alpine Linux base for minimal footprint).
- **Extensions Required:** `imagick` via PECL, `system` binary utilities for fallback headless rendering.
- **Core Responsibilities:**
    - Consume standardized structural layout JSON strings passed down by NestJS.
    - Execute CPU-bound vector-to-raster conversions, asset compositing, rich-text rendering via Imagick text bounding calculations, and image optimization filters.
    - Stream compiled image binary footprints directly into Object Storage.

### 2.4 Object Storage Container (`portafolio-storage`)
- **Runtime:** MinIO Release Binary.
- **Core Responsibilities:**
    - Expose a fully S3-compliant API endpoint for localized development.
    - Isolate file assets into distinct access-controlled buckets: `system-assets`, `user-uploads`, and `production-exports`.

## 3. Core Architectural Patterns & Rationales
### 3.1 Separation of CPU-Bound vs. I/O-Bound Compute Nodes
Image processing (specifically layered rendering with Imagick or headless layout generation) is heavy **CPU-bound** work. AI chatbot token delivery, streaming HTTP chunks, and file uploading operations are primarily **I/O-bound**.
- _Rationale:_ If both architectures shared a single runtime (e.g., executing image processing within a Node.js worker thread or a monolithic structure), a sudden influx of graphic exports could stall the single-threaded Node event loop, causing the AI Chatbot responses to stutter or drop client connections entirely. Isolating the PHP-FPM process guarantees that heavy rendering processes run in completely separate OS threads.

### 3.2 Network Perimeter Isolation (Zero Ingress for Compute Node)
The `backend-php` container exposes no network mapping array under the `ports` block of the orchestration schema.
- _Rationale:_ Mitigates attack vectors (such as remote code execution via image metadata or asset exploitation) by denying direct client access to the file system or binaries of the rendering server. The container remains visible only to sister nodes attached to the internal bridge.
### 3.3 Parity and Local Environment Storage Virtualization
Instead of using public live cloud bucket services during local development phases, the topology forces the integration of MinIO.
- _Rationale:_ Guarantees the entire environment works 100% offline, requires zero configuration overhead upon initial git cloning, and ensures that the system interfaces with standard AWS S3 SDK integration layers, creating a seamless migration pathway to AWS or cloud vendors without altering a single line of backend logic.

## 4. Data Persistence & Data Flow Architecture
### 4.1 "Mini-Canva Studio" Image Generation Life Cycle
1. **Layout Compilation:** Client clicks "Export" ➔ Frontend extracts canvas states and maps layers to a strict structural JSON schema ➔ Payload posted to `NestJS:4000/api/canvas/export`.
2. **Schema Validation & Verification:** NestJS validates structure ➔ Forwards the verified layout map via internal network request to `http://backend-php:8000/internal/render`.
3. **Rasterization Phase:** PHP parsing engine receives JSON ➔ Reads resource assets from MinIO ➔ Imagick compiles vector paths, textures, and typography layouts into a physical image stream.
4. **Upload & Return:** PHP pushes the generated binary to `MinIO:9000/production-exports` ➔ Returns the tracking hash identifier back to NestJS ➔ NestJS returns an S3 presigned-download URL back to the React UI for client retrieval.