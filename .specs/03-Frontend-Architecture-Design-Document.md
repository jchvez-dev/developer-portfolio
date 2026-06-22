# Frontend Architecture & Design Document (FADD)

## Project: Core Engineering Portfolio & Polyglot Microservices Ecosystem

## 1. Application Shell Architecture (React Layer)
The frontend application is structured as a component-driven Single Page Application (SPA) powered by **React** (with Vite for hyper-fast compilation). React governs the high-level application shell, routing, global state synchronization, and standard UI blocks.

```Plaintext
┌────────────────────────────────────────────────────────┐
│               REACT UI APPLICATION SHELL               │
│                                                        │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │ Portfolio Sections│  │  AI Chatbot Floating Node  │  │
│  │  (Hero, Projects)│  │   (SSE Token Streaming)    │  │
│  └──────────────────┘  └────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         MINI-CANVA STUDIO WORKSPACE              │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      DECOUPLED JS VANILLA CANVAS LAYER     │  │  │
│  │  │     (JS Proxy State ➔ 60 FPS Tracking)     │  │  │
│  │  │  ┌──────────────┐        ┌──────────────┐  │  │  │
│  │  │  │ Image Node   │        │ CKEditor Node│  │  │  │
│  │  │  └──────────────┘        └──────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```
### 1.1 Directory Structure Layout

```Plaintext
frontend/
├── src/
│   ├── components/       # Reusable UI Blocks (Buttons, Modals, ChatBubble)
│   ├── context/          # App Global States (Theme, Notification Hub)
│   ├── features/
│   │   ├── studio/       # Mini-Canva Module
│   │   │   ├── canvas/   # JS Vanilla Engine (Proxies, Events)
│   │   │   └── UI/       # Control sidebars, layer selectors
│   │   └── chatbot/      # AI Assistant UI & Stream handlers
│   └── main.jsx
├── Dockerfile
└── package.json
```

## 2. Decoupled Canvas Rendering Engine (The Hybrid Strategy)

To achieve strict compliance with **NFR-4.1 (60 FPS Performance during drag/drop operations)**, the actual graphic workspace completely detaches its internal mutations from the standard React Virtual DOM reconciliation cycles.

### 2.1 Proxy-Driven Reactive State Design

When the Canvas component mounts, it initializes a native JavaScript `Proxy` that intercepts layer mutations (bounds, positions, content alterations) and fires isolated updates directly to the real DOM nodes.

```javascript
// Structural Blueprint of the Canvas Proxy Interceptor
const createTrackedCanvasState = (initialLayers, eventEmitter) => {
  return new Proxy(initialLayers, {
    set(target, property, value, receiver) {
      const success = Reflect.set(target, property, value, receiver);
      if (success) {
        // Emit high-frequency mutations targeting specific DOM Nodes directly
        eventEmitter.emit(`layer_mutation:${property}`, value);
      }
      return success;
    }
  });
};
```

### 2.2 Event-Driven DOM Mutator
- **Dragging Actions:** Mouse/Touch interactions track real-time position coordinates (`x`, `y`). Instead of calling a React `setState` (which would trigger full-viewport re-renders), mutations are bound directly to the target element's CSS hardware acceleration properties (`transform: translate3d(x, y, 0)`).
- **State Flush:** React is only notified when an interaction finishes (e.g., `onMouseUp` or clicking "Save/Export"), updating the high-level application state container downstream.

## 3. CKEditor 5 Component Lifecycle Integration
Rich text capabilities inside absolute-positioned layers are backed by customized structural instances of **CKEditor 5**.
### 3.1 Inline Mounting Protocol
1. When a user creates a text layer, a relative bounding container `<div>` is attached to the Canvas.
2. The JS engine programmatically initializes a decoupled CKEditor instance attached to that specific DOM node.
3. An event listener monitors `editor.model.document.on('change:data')` loops.
4. The output text buffer mutates the tracked JavaScript `Proxy` schema in real time, locking formatting properties inline without clashing with the outer drag-and-drop boundary rules.

## 4. SSE (Server-Sent Events) AI Assistant Token Stream Handler
The Chatbot module relies on chunked data streaming to display instantaneous, low-latency career consulting feedback to technical recruiters.
### 4.2 Stream Consumption Engine
Instead of utilizing standard AJAX blocking routines, the interface initiates an active asynchronous chunk consumer pipeline using the browser's native **Fetch API ReadableStream reader interface**:
```javascript
const handleChatStream = async (promptMessage) => {
  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    body: JSON.stringify({ message: promptMessage })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Parse the data token and flush it instantly into the chat UI message buffer
    appendChatToken(chunk);
  }
};
```

## 5. Frontend Client Verification Matrix (DoD)
1. **Framework Isolation Verification:** Modifying coordinates or typing within CKEditor must prove zero execution logs inside the root React component tracker inspector.
2. **Input Sanitation Safety:** Any input attempt pasting text strings containing hardware-facing tags (`<script>`, `<iframe>`) into CKEditor must execute without DOM scripting reflection.
3. **Layout Scaling Uniformity:** Canvas coordinate models must remain abstract integers (e.g., base $1200 \times 630$) and map perfectly to viewports using CSS Aspect Ratio rules to scale dynamically on mobile or desktop layout setups.