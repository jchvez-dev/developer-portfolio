# API Specification (OpenAPI 3.0 Contract)
## Project: Core Engineering Portfolio & Polyglot Microservices Ecosystem
## 1. Global Configuration & Base URLs
- **Development Gateway URL:** `http://localhost:4000/api/v1`
- **Internal Microservice URL (Mesh):** `http://backend-php:8000`
- **Content-Type:** `application/json`

## 2. Endpoint Summary Matrix

|**Module**|**Method**|**Path**|**Access**|**Description**|
|---|---|---|---|---|
|**AI Assistant**|`POST`|`/chat`|Public|Initiates a token-streaming career consultation.|
|**Canvas Studio**|`POST`|`/canvas/export`|Public|Accepts layout JSON payload and triggers image composition.|
|**Canvas Engine**|`POST`|`/internal/render`|Internal|Private PHP pipeline that compiles layers into binary assets.|
|**System Core**|`POST`|`/contact`|Public|Submits verified contact forms to the engineering lead.|

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