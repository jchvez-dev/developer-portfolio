# API Specification (OpenAPI 3.0 Contract)
## Project: Core Engineering Portfolio & Polyglot Microservices Ecosystem
## 1. Global Configuration & Base URLs
- **Development Gateway URL:** `http://localhost:4000/api/v1`
- **Internal Microservice URL (Mesh):** `http://backend-php:8000`
- **Content-Type:** `application/json`

## 2. Endpoint Summary Matrix

|**Module**|**Method**|**Path**|**Access**|**Description**|
|---|---|---|---|---|---|
|**AI Assistant**|`POST`|`/chat`|Public|Initiates a token-streaming career consultation.|
|**Canvas Studio**|`POST`|`/canvas/export`|Public|Accepts layout JSON payload and triggers image composition.|
|**Canvas Studio**|`POST`|`/canvas/upload`|Public|Uploads a user image asset for use in canvas layers.|
|**Canvas Engine**|`POST`|`/internal/render`|Internal|Private PHP pipeline that compiles layers into binary assets.|
|**Canvas Engine**|`POST`|`/internal/process-upload`|Internal|Private PHP pipeline that processes and stores uploaded images.|
|**System Core**|`POST`|`/contact`|Public|Submits verified contact forms with anti-spam protection to the engineering lead.|
|**System Core**|`GET`|`/profile`|Public|Returns structured CV data (name, skills, experience, education) from MinIO.|

## 3. Detailed Endpoint Specifications
### 3.1 AI Career Assistant
- **Path:** `/chat`
- **Method:** `POST`
- **Headers:** `Accept: text/event-stream`    

#### Request Payload (`application/json`)
```json
{
  "message": "Does Juan have experience migrating legacy codebases to React?",
  "conversationId": "uuid-v4-string-token-identifier"
}
```

#### Expected Response (`200 OK` - Server-Sent Events / Stream)
- **Content-Type:** `text/event-stream`
- **Payload Chunk Format:** Data chunks are emitted sequentially using standard SSE format.

```plaintext
data: {"token": "Yes", "done": false}
data: {"token": ", Juan", "done": false}
data: {"token": " spent", "done": false}
data: {"token": " 4+ years", "done": false}
data: {"token": " optimizing...", "done": false}
data: {"token": "", "done": true}
```

### 3.2 Canvas Studio: Public Export Trigger
- **Path:** `/canvas/export`
- **Method:** `POST`
#### Request Payload (`application/json`)

Defines the absolute-positioned layers, tracking coordinate maps, dimensions, and rich text generated inside the UI shell.

```JSON
{
  "canvas": {
    "width": 1200,
    "height": 630,
    "backgroundColor": "#ffffff"
  },
  "layers": [
    {
      "id": "layer_01",
      "type": "image",
      "properties": {
        "x": 0,
        "y": 0,
        "width": 1200,
        "height": 630,
        "assetUrl": "http://localhost:9000/system-assets/background-template.png"
      }
    },
    {
      "id": "layer_02",
      "type": "text",
      "properties": {
        "x": 150,
        "y": 200,
        "width": 900,
        "height": 150,
        "content": "<strong>Senior Developer</strong> Profile Verified.",
        "fontFamily": "Inter",
        "fontSize": 42,
        "color": "#111827"
      }
    }
  ]
}
```

#### Expected Success Response (`201 Created`)
Returns an S3 secure presigned URL fetched from MinIO, decoupling download bandwidth from the compute servers.

```JSON
{
  "success": true,
  "exportId": "canvas_job_8973129",
  "downloadUrl": "http://localhost:9000/production-exports/verified-postcard-xyz.png?AWSAccessKeyId=rootjuan&Expires=1718911200&Signature=abcdef..."
}
```

#### Error Response (`422 Unprocessable Entity`)

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": [
    "layers.1.properties.content must contain valid HTML strings bounded by allowed tag sets.",
    "canvas.width cannot exceed a maximum threshold of 3840px."
  ]
}
```

### 3.3 Microservice Private Mesh: Internal Render Pipeline
- **Path:** `/internal/render`
- **Method:** `POST`
- **Access Control:** Isolated inside Docker network. External requests hit connection drop rules.
#### Request Payload (`application/json`)
NestJS acts as the secure API proxy, appending internal tracking IDs and sanitizing input tags before hitting the PHP engine.

```json
{
  "jobId": "canvas_job_8973129",
  "meta": {
    "sanitized": true,
    "timestamp": 1782036400
  },
  "definition": {
    "dimensions": { "w": 1200, "h": 630 },
    "elements": [
      {
        "action": "draw_image",
        "params": { "src": "background-template.png", "x": 0, "y": 0 }
      },
      {
        "action": "render_html_text",
        "params": { "html": "<strong>Senior Developer</strong>...", "x": 150, "y": 200 }
      }
    ]
  }
}
```

#### Expected Success Response (`200 OK`)

```json
{
  "status": "completed",
  "objectKey": "production-exports/verified-postcard-xyz.png",
  "executionTimeMs": 245
}
```

### 3.5 User Asset Upload
- **Path:** `/canvas/upload`
- **Method:** `POST`
- **Headers:** `Content-Type: multipart/form-data`

#### Request Payload (`multipart/form-data`)

|Field|Type|Description|
|---|---|---|
|`image`|`file`|Archivo de imagen (max 10MB, tipos permitidos: jpg, png, webp, gif)|
|`sessionId`|`string`|Identificador de sesion (opcional, se genera UUID si no se provee)|

#### Expected Success Response (`201 Created`)

```json
{
  "success": true,
  "assetUrl": "http://localhost:9000/user-uploads/sess_abc123/a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6.webp",
  "sessionId": "sess_abc123"
}
```

#### Error Response (`422 Unprocessable Entity`)

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": [
    "File size exceeds maximum allowed limit of 10MB.",
    "Invalid file type. Allowed types: jpg, png, webp, gif."
  ]
}
```

### 3.6 Microservice Private Mesh: Internal Process Upload
- **Path:** `/internal/process-upload`
- **Method:** `POST`
- **Access Control:** Isolated inside Docker network. External requests hit connection drop rules.
- **Content-Type:** `multipart/form-data`

#### Request Payload (`multipart/form-data`)

|Field|Type|Description|
|---|---|---|
|`file`|`file`|Binary original de la imagen|
|`jobId`|`string`|Tracking ID generado por NestJS|

#### Processing Pipeline
1. PHP receives binary image via FormData.
2. Opens with Imagick.
3. Resizes the image so the longest side does not exceed 1920px, maintaining aspect ratio.
4. Converts to WebP format at quality 80.
5. Uploads processed image to MinIO bucket `user-uploads/{sessionId}/{uuid}.webp`.

#### Expected Success Response (`200 OK`)

```json
{
  "status": "completed",
  "objectKey": "user-uploads/sess_abc123/a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6.webp",
  "executionTimeMs": 120
}
```

### 3.7 Contact Form Submission
- **Path:** `/contact`
- **Method:** `POST`
- **Access:** Public

#### Anti-Spam Protection
- **Honeypot:** A hidden field `honeypot` is included in the form. If it contains a value, the submission is silently accepted (HTTP 201) but not processed or persisted.
- **Rate Limiting:** Maximum 5 requests per IP address per hour. Exceeding this returns HTTP 429.

#### Request Payload (`application/json`)
```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "subject": "Collaboration Inquiry",
  "message": "Hi Juan, I would like to discuss a potential collaboration.",
  "honeypot": ""
}
```

|Field|Type|Required|Validation|
|---|---|---|---|
|`name`|`string`|Yes|1-100 characters, not empty|
|`email`|`string`|Yes|Valid email format|
|`subject`|`string`|No|Max 200 characters|
|`message`|`string`|Yes|10-5000 characters|
|`honeypot`|`string`|No|If non-empty, submission is silently discarded|

#### Expected Success Response (`201 Created`)
```json
{
  "success": true,
  "messageId": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6"
}
```

#### Error Responses

**422 Unprocessable Entity** (validation failure)
```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": [
    "name must be a string",
    "email must be a valid email address",
    "message must be between 10 and 5000 characters"
  ]
}
```

**429 Too Many Requests** (rate limit exceeded)
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## 4. Standard Error Definitions
The gateway uniformly structures error responses to prevent client handling breakdowns.
```json
{
  "statusCode": 500,
  "timestamp": "2026-06-21T16:06:40Z",
  "path": "/api/v1/canvas/export",
  "message": "Downstream processing failure on image microservice container node."
}
```