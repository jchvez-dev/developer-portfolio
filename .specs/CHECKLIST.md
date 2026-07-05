# Project Checklist

> Current implementation status of the Developer Portfolio project.
> Last updated: 2026-07-04 (contact endpoint + Mailpit)

---

## Infrastructure

- [x] `docker-compose.yml` with 6 services (frontend, nest, php, minio, storage-init, mailpit)
- [x] `frontend/Dockerfile` (multi-stage prod with nginx)
- [x] `frontend/Dockerfile.dev` (dev with Vite live-reload)
- [x] `backend-nest/Dockerfile` (multi-stage prod, node user)
- [x] `backend-nest/Dockerfile.dev` (dev with nest start --watch)
- [x] `backend-php/Dockerfile` (multi-stage prod, PHP 8.4 + Imagick, www-data user)
- [x] `backend-php/Dockerfile.dev` (dev with PHP CLI + composer)
- [x] `portafolio-network` (bridge driver)
- [x] `minio-data` volume for persistence
- [x] MinIO buckets: `system-assets`, `user-uploads`, `production-exports`, `chat-history`, `contact-messages`
- [x] PHP container has no public ports (NFR-4.4)
- [x] Anonymous volume bindings for node_modules and vendor
- [x] `.env.example` with documented environment variables
- [x] `.gitignore` global and per-service
- [x] Mailpit service (SMTP) for dev email notifications

---

## NestJS API Gateway (backend-nest)

### Core
- [x] Bootstrap with CORS, global prefix `api/v1`, ValidationPipe
- [x] ConfigModule loading environment variables

### Profile (CV-based)
- [x] `GET /api/v1/profile` - reads profile.json from MinIO, returns structured JSON

### Health
- [x] `GET /api/v1/health` - readiness check

### Canvas Export (FR-2.4)
- [x] `POST /api/v1/canvas/export` - receives layout, forwards to PHP, returns download URL
- [x] `ExportCanvasDto` with validation (dimensions 1-3840x2160, layer properties)
- [x] Internal format transformation for PHP
- [x] Error handling with downstream PHP failures

### Upload (FR-2.4)
- [x] `POST /api/v1/canvas/upload` - multipart, forwards to PHP, returns asset URL
- [x] MIME type validation (jpeg, png, webp, gif)
- [x] Max file size validation (10MB)

### Chatbot (FR-3.1, FR-3.2, FR-3.3)
- [x] `POST /api/v1/chat` - SSE streaming from Groq LLM
- [x] `GET /api/v1/chat/:conversationId` - load conversation history from MinIO
- [x] CV loaded from MinIO as system prompt
- [x] Conversation persistence in MinIO (`chat-history/conversations/`)
- [x] Contextual restriction: only answers based on CV
- [x] Error handling with SSE error message

### Contact (FR-1.2)
- [x] `POST /api/v1/contact` - contact form with anti-spam (honeypot + rate limiting)
- [x] Contact messages persistence in MinIO (`contact-messages/`)
- [x] Email notification via Mailpit SMTP (nodemailer)
- [x] `ContactDto` with validation (name, email, subject, message, honeypot)

---

## PHP Compute Engine (backend-php)

### Render (FR-2.4)
- [x] `POST /internal/render` - creates canvas with Imagick
- [x] `ImageEngine::drawImage()` - image compositing from S3 or HTTP
- [x] `ImageEngine::renderText()` - text rendering with ImagickDraw
- [x] Uploads result PNG to MinIO `production-exports/`

### Process Upload
- [x] `POST /internal/process-upload` - processes multipart file
- [x] `ImageProcessor::resizeIfNeeded()` - resizes to max 1920px
- [x] Converts to WebP quality 80
- [x] Uploads to MinIO `user-uploads/{sessionId}/{uuid}.webp`

### Routing
- [x] `public/index.php` - basic router for internal endpoints

---

## Frontend React (frontend/)

### Core
- [x] Vite + React 19 + TypeScript configured
- [x] Tailwind CSS v4 configured
- [x] Routing system (React Router)
- [x] Main layout (header, footer, navigation)
- [x] Context providers (theme, session, etc.)

### Landing Page (FR-1.1)
- [x] Value proposition display
- [x] "About me" section with CV summary
- [x] Projects/technologies section
- [x] Contact form (FR-1.2)
- [x] Call-to-action towards Studio or Chat

### Canvas Studio (FR-2.1, FR-2.2, FR-2.3)
- [ ] Canvas area with Proxy + EventEmitter (60 FPS)
- [ ] Layer drag & drop
- [ ] Layer panel (list, reorder, delete)
- [ ] Toolbar (select, text, image, zoom, etc.)
- [ ] CKEditor 5 integration for rich text
- [ ] Layer properties (position, size, color, font)
- [ ] Export to image via `POST /api/v1/canvas/export`
- [ ] Asset upload via `POST /api/v1/canvas/upload`

### AI Career Assistant (FR-3.1, FR-3.2, FR-3.3)
- [ ] Floating chat widget (persistent across pages)
- [ ] SSE streaming UI with typing indicator
- [ ] Real-time token rendering
- [ ] Conversation management (new, history)
- [ ] Error handling in UI

---

## Assets

- [x] `cv-juan-chavez.md` uploaded to MinIO bucket `system-assets` (manual)

---

## Testing

### NestJS
- [x] `health.controller.spec.ts`
- [x] `canvas.controller.spec.ts`, `canvas.service.spec.ts`
- [x] `upload.controller.spec.ts`, `upload.service.spec.ts`
- [x] `chat.controller.spec.ts`, `chat.service.spec.ts`
- [x] `contact.controller.spec.ts`, `contact.service.spec.ts`
- [x] `app.e2e-spec.ts`

### PHP
- [x] `RenderControllerTest.php`
- [x] `UploadControllerTest.php`
- [x] `ImageEngineTest.php`
- [x] `ImageProcessorTest.php`

### Frontend
- [x] Testing setup (Vitest + Testing Library)
- [x] Component tests (59 tests across 18 files)

---

## Tech Debt / Improvements

- [ ] Create Makefile with common commands (up, down, build, test, lint)
- [x] Add `typecheck` script to frontend (`tsc --noEmit`)
- [ ] Review `deleteOutDir` in nest-cli.json (should be `true` for clean builds)
- [ ] Verify GROQ_MODEL in `.env` matches the actual available model
- [x] SMTP env vars (SMTP_HOST, SMTP_PORT, CONTACT_EMAIL) documented in .env.example

---

## UI Refinements (Pendiente)

- [ ] Pagina 404 (NotFound) para rutas inexistentes
- [ ] Barril en `components/` (ademas de `components/ui/`)
- [ ] Iconografia: logos tech en badges, iconos semanticos en cards, flecha en CTA
- [ ] Microinteracciones: hover elevation en cards, scale en badges/buttons, focus transition en inputs
- [ ] Live Ping: indicador "Available for hire" con animacion en Hero
