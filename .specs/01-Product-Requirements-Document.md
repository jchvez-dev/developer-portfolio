## Project: Core Engineering Portfolio & Polyglot Microservices Ecosystem

## 1. Introduction & Product Objectives

### 1.1 Product Summary

The product is a highly interactive web platform that serves as a high-tier, Senior-level engineering portfolio. Instead of acting as a static resume, the system is a live ecosystem comprised of two primary business modules:
1. **Mini-Canva Studio:** A web-based graphical editor that enables users to design layouts, input rich text, and export production-ready, high-definition images generated directly at the server level.
2. **AI Career Assistant:** A contextualized interactive chatbot engineered with the developer’s specific professional trajectory to automate recruiter screening and handle technical inquiries 24/7.

### 1.2 Business Objectives / Value Proposition
- **Empirical Skill Validation:** Provide concrete proof of expertise in polyglot microservices architecture, DevOps infrastructure, Spec-Driven Development (SDD), and complex server-side data/image manipulation.
- **Recruiter Retention:** Replace passive PDF resume reading with an immersive, hands-on engineering lab that drastically increases time-on-site and engagement from engineering managers and talent acquisition.
    
## 2. Personas & Target Audience

### 2.1 Technical Recruiter / Talent Acquisition

- **Profile:** Fast-paced professionals scanning dozens of profiles a day looking for specific tech-stack keywords. Average time spent per profile is under 2 minutes.
- **Core Need:** Quickly validate if the candidate has actual hands-on experience with core enterprise patterns (Docker, React, Backend architectures, Global Platforms).
- **Behavior in App:** Will heavily interact with the **AI Career Assistant** to ask direct questions (e.g., _"Does Juan have experience working with US-based clients?"_, _"Is he familiar with legacy migrations?"_).
### 2.2 Engineering Manager / Tech Lead

- **Profile:** Deeply technical engineers responsible for deep-dive candidate vetting.
- **Core Need:** Evaluate code quality, architecture patterns, system performance under heavy workloads, and infrastructure/DevOps best practices.
- **Behavior in App:** Will intentionally test the **Mini-Canva Studio** looking for performance bottlenecks (UI lag during element dragging, re-render cascading), inspect the browser console network payloads, and analyze the system's repository documentation.

## 3. Functional Requirements (FR)
### 3.1 Module 1: Core Portfolio Shell & UI
- **FR-1.1:** The system must clearly display the core value proposition, mastered technical stacks, and comprehensive case studies of past high-impact professional projects.
- **FR-1.2:** The system must provide a standard contact form protected against automated spam and abusing.

### 3.2 Module 2: Mini-Canva Studio (Graphical Editor)
- **FR-2.1 - Interactive Canvas:** Users must be able to drag, drop, and absolute-position design layers (background image templates, bounding text boxes) inside a relative coordinate system canvas.
- **FR-2.2 - Rich Text Editing:** Text blocks inside the canvas must seamlessly integrate with an advanced editor (CKEditor) to support inline formatting (bold, italics, specific typography, alignments).
- **FR-2.3 - Real-Time Reactivity:** Canvas state modifications (text inputs, object dragging coordinates) must update instantly in the UI at a native rate without blocking the main browser thread.
- **FR-2.4 - Asset Server Export:** Upon clicking "Export", the system must compile the layout configuration and deliver a high-fidelity image asset (PNG/JPG) compiled entirely on the backend.

### 3.3 Module 3: AI Career Assistant (Chatbot)
- **FR-3.1 - Persistent Floating UI:** A clean chat widget that remains available across the application shell but can be collapsed at will.
- **FR-3.2 - Strict Contextual Inquiries:** The chatbot LLM integration must strictly answer queries using the developer’s work history, education, methodology preferences (SDD), and engineering background.
- **FR-3.3 - Token Streaming:** The LLM responses must stream back to the UI token-by-token (typewriter effect) to eliminate perceived network latency and optimize UX.
## 4. Non-Functional Requirements (NFR)
- **NFR-4.1 - Main-Thread Performance:** Drag-and-drop operations and high-frequency state updates inside the canvas layer must consistently lock at **60 FPS**, bypassing the general framework UI lifecycle to avoid continuous re-renders.
- **NFR-4.2 - Isolated Resource Footprint (Polyglot Microservices):** Heavy CPU-bound server-side image processing must be strictly isolated from I/O-bound AI Chatbot operations to prevent request queuing or server timeouts.
- **NFR-4.3 - Deterministic Environment Portability (DevOps):** The entire system environment must be spin-up reproducible on any machine (natively targeted for Ubuntu Linux) via a single command: `docker-compose up`.
- **NFR-4.4 - API Perimeter Security:** The internal microservice running system binary execution and layout rendering must not expose public-facing network ports. All external ingress traffic must be securely brokered via the API Gateway.

## 5. Acceptance Criteria (Definition of Done - DoD)
1. A recruiter can send any career-related prompt to the AI Assistant and receive an accurate, contextualized text stream in under 3 seconds.
2. A user can create a customized design on the canvas layer using CKEditor and download a high-res PNG file identical to the UI viewport version.
3. The codebase boots correctly from scratch—handling dependency trees, volume allocations for object storage, and internal isolated bridges—using solely docker orchestration.