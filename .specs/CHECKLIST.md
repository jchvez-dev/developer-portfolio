# Project Checklist

> Current implementation status of the Developer Portfolio project.
> Last updated: 2026-08-22

---

## Infrastructure

- [x] `docker-compose.yml` with 6 services (frontend, nest, php, minio, storage-init, mailpit)
- [x] `frontend/Dockerfile` (multi-stage prod with nginx)
- [x] `frontend/Dockerfile.dev` (dev with Vite live-reload)
- [x] `backend-nest/Dockerfile` (multi-stage prod, node user)
- [x] `backend-nest/Dockerfile.dev` (dev with nest start --watch)
- [x] backend-nest Dockerfiles pin pnpm via corepack to match `packageManager` (apk pnpm 11.x broke frozen-lockfile with @pnpm/exe identity check)
- [x] `backend-php/Dockerfile` (multi-stage prod, PHP 8.4 + Imagick, www-data user)
- [x] `backend-php/Dockerfile.dev` (dev with PHP CLI + composer)
- [x] `portafolio-network` (bridge driver)
- [x] `minio-data` volume for persistence
- [x] MinIO buckets: `system-assets`, `user-uploads`, `production-exports`, `chat-history`, `contact-messages`
- [x] PHP container has no public ports (NFR-4.4)
- [x] Anonymous volume bindings for node_modules and vendor
- [x] `.env.example` with documented environment variables
- [x] Storage via `BUCKET_*` env vars (MinIO S3), path-style endpoint, shared `S3_CLIENT` provider and PHP `S3ClientFactory`
- [x] `.gitignore` global and per-service
- [x] Mailpit service (SMTP) for dev email notifications
- [x] backend-php prod image ships TTF fonts copied to `/app/fonts` and `/usr/share/fonts` (TextRenderer FONT_DIR) with `PHP_CLI_SERVER_WORKERS=4`
- [x] Northflank deploy for backend-php: Dockerfile path `./backend-php/Dockerfile`, build context `./backend-php/` (Dockerfile COPY paths are relative to the service folder)
- [x] backend-php prod CMD binds `[::]:8000` (wildcard) so service-to-service connections from backend-nest work on any container platform

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
- [x] `DELETE /api/v1/chat/:conversationId` - delete conversation
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
- [x] CKEditor 5 integration for rich text (inline editors with font-size support)
- [x] Toolbar (fixed toolbar with bold, italic, lists, font-size)
- [x] Add/remove text layers
- [x] Zustand store for canvas state (eliminate prop drilling)
- [x] Drag & drop: each TextLayer handles its own drag internally via pointer events (no React re-renders during drag)
- [x] Export to image via `POST /api/v1/canvas/export`
- [x] Layer panel (list, reorder, delete)
- [x] Rename layers
- [x] [BUG] Rich text rendering in PHP export (spans stripped by strip_tags)
- [x] [BUG] Clamp drag bounds within canvas area
- [x] [BUG] Sync default font size between editor and export
- [x] [BUG] Export layer height does not account for multi-line text (content clipped when text wraps)
- [x] [BUG] Image size not respected in PHP export (drawImage ignored width/height)
- [x] [BUG] Opacity not passed through export pipeline (frontend types, NestJS DTO, PHP renderer)
- [x] [BUG] zIndex ordering not respected in export (layers sent unsorted to PHP)
- [x] Layer properties panel (position, size, font, color)
- [x] Canvas background color picker
- [x] Layer background color picker
- [x] Image layers + asset upload
- [x] Canvas/artboard size picker
- [x] Custom font loading (Inter, Roboto, Montserrat with Regular/Bold/Italic/BoldItalic TTF variants)

### AI Career Assistant (FR-3.1, FR-3.2, FR-3.3)
- [x] Floating chat widget (persistent across pages)
- [x] SSE streaming UI with typing indicator
- [x] Real-time token rendering
- [x] Conversation management (new, history)
- [x] Error handling in UI

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
- [x] `config/configuration.spec.ts` (BUCKET env mapping)
- [x] `storage/storage.module.spec.ts` (S3Client factory, path-style)
- [x] Service specs assert S3 bucket/key operations (profile `system-assets`, chat/contact persistence, upload `getImage`)
- [x] `app.e2e-spec.ts`

### PHP
- [x] `RenderControllerTest.php`
- [x] `UploadControllerTest.php`
- [x] `ImageEngineTest.php`
- [x] `ImageProcessorTest.php`
- [x] `S3ClientFactoryTest.php` (env-driven S3 client, path-style)

### Frontend
- [x] Testing setup (Vitest + Testing Library)
- [x] Component tests (140 tests across 28 files)

---

## Improvements

- [x] Create Makefile with common commands (up, down, build, test, lint)
- [x] Add `typecheck` script to frontend (`tsc --noEmit`)
- [x] Review `deleteOutDir` in nest-cli.json (should be `true` for clean builds)
- [x] Verify GROQ_MODEL in `.env` matches the actual available model
- [x] SMTP env vars (SMTP_HOST, SMTP_PORT, CONTACT_EMAIL) documented in .env.example
- [x] Badge: add `variant` and `className` props
- [x] Card: add `variant` prop (default, elevated, bordered)
- [x] Replace raw `html` in features with components/ui (Section now uses Heading/Text)
- [x] 404 page (NotFound) for non-existent routes
- [x] Iconography: tech logos in badges, semantic icons in cards, arrow in CTA
- [x] Micro-interactions: hover elevation on badges (translate-y, border, bg, group opacity filter)
- [x] Live ping: "Available for hire" indicator with animation in Hero
- [x] Fix TypeScript build errors blocking `pnpm run build` (`tsc -b`) detected during Vercel deploy

## Backlog / Future Refactor (v2)

- [ ] Dropdown: add `size` prop to match toolbar buttons
- [ ] Box: create generic wrapper component
- [ ] Replace Imagick with browserless/chrome + Spatie Browsershot for 1:1 PNG export with CKEditor
- [ ] FR-1.1: Replace tech-badge list with comprehensive case studies for each project
- [ ] FR-2.4 (DoD-2): Pixel-perfect PNG export identical to UI viewport (blocked by CKEditor vs Imagick mismatch)
- [ ] FADD-5.2: Add HTML sanitization at NestJS gateway level (defense in depth, currently only in PHP)
- [ ] FADD-5.3: Add CSS aspect-ratio for responsive canvas scaling
- [ ] API Spec-4: Standardize error response format `{ statusCode, timestamp, path, message }`
- [ ] Data Model-3.1: Integration tests IT-1 (perimeter connectivity) and IT-2 (storage write)
- [ ] Data Model-3.2: Functional tests FT-1 (XSS blocking) and FT-2 (empty canvas fallback)
- [ ] Data Model-3.3: Non-functional test NFT-1 (50 concurrent renders + AI response benchmark)
- [ ] Data Model-3.4: Upload test suite UT-1 through UT-5
- [ ] Data Model-3.5: Chat test suite CT-1 through CT-5
- [ ] Infra Spec: Pin MinIO image version in docker-compose.yml
- [ ] Infra Spec: Document Mailpit web UI URL (http://localhost:8025) in .env.example

---

## Pre-existing Test Failures (unrelated)

- [x] [BUG PHP] `ImageProcessorTest::testProcessReturnsObjectKey` — WriteBlob Failed writing fixture PNG
- [x] [BUG Front] `Text.test.tsx` muted test — expects `text-gray-500` but component uses `text-gray-400` (fixed assertion)
