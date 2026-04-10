# Master Build Prompt

## Architecture Principle
You are building a rapid, client-side Instagram Stories generator.
The core philosophy is: **Visual Clarity, Speed, and Zero Friction**.
NEVER build a bloated publishing tool. NEVER add server-side authentication or complex databases for Phase 1.

## Phase 1: Serious MVP (Current Focus)
- React (Vite) + Tailwind CSS (or Vanilla CSS).
- 1080x1920 static visual canvas.
- 1-click layout presets.
- Click-to-edit text fields.
- LocalStorage state saving.
- HTML-to-PNG export via browser.

## Phase 2: AI-Assisted Extension (Future Scope)
- Keep components modular to easily inject AI later.
- Future AI will prompt for: P.A.S.A./A.I.D.A. copy generation, magic layout variations, and context-aware backgrounds.
- The AI layer must sit *on top* of the robust manual Phase 1 builder, never replacing manual control.
## Phase 2 — AI Copilot Implementation Direction

After Phase 1 is stable, implement a structured AI Copilot layer inside the app.

Important:
Do not add random AI buttons without UX logic.
The AI layer must be organized, modular, and task-oriented.

### Required AI Copilot Modules

#### 1. Story Idea Generator
Input:
- theme
- audience
- tone
- objective

Output:
- multiple story ideas

#### 2. Story Draft Generator
Input:
- theme or short brief

Output:
- title
- subtitle
- body
- CTA
- suggested layout

#### 3. Story Improver
Input:
- current draft

Output:
- improved version
- stronger wording
- cleaner structure
- stronger hook

#### 4. Variant Generator
Input:
- existing story

Output:
- 3 alternative versions

#### 5. Layout Recommender
Input:
- current story copy

Output:
- recommended preset and explanation

#### 6. Image Prompt Builder
Input:
- story draft

Output:
- visual prompt aligned with brand and story objective

#### 7. Image Generator
Use a modular provider-based architecture for image generation.

The system should be ready to support:
- high-quality image generation provider
- faster high-volume image generation provider

### Agent Experience Goal
The tool should feel like it works for the user, not just waits for manual input.
The AI layer must help the user produce stories at high speed while preserving brand consistency and editorial quality.