# Technical Specifications (Phase 1 MVP)

## Tech Stack
- **Framework**: React (initialized via Vite).
- **Styling**: Tailwind CSS (or structured Vanilla CSS) referencing `brand_rules.md` HEX codes.
- **Export Engine**: `html2canvas` (or equivalent DOM-to-image library).
- **Persistence**: Browser `localStorage` (Save/Load active story state).

## UI Architecture
1. **Sidebar Controls**: 
   - **Presets Tab**: Select active layout template.
   - **Design Tab**: Upload background image, adjust active text node sizing, toggle color themes.
2. **Main Canvas Area**:
   - The 1080x1920 scaled preview area.
   - Direct click-to-edit interactions on text nodes.

## MVP Layout Presets (Initial Set)
1. **The Hook**: Large title, subtle subtitle. Used for opening stories.
2. **The Data Point**: Huge number/statistic + short paragraph text.
3. **The List**: Title + 3 bullet points.
4. **The CTA**: Bold call to action + Pale Yellow highlight.

## Constraints
- **Media**: Only static PNG/JPG. No video/GIF support in Phase 1.
- **Backend**: No user auth, no cloud database. Everything is client-side.
## Phase 2 — AI Copilot and Agent Layer

The product must evolve beyond a manual editor and include an integrated AI Copilot layer.

The purpose of this layer is not only to assist with wording, but to actively help generate, improve, and multiply story output.

### AI Copilot Goals
The AI layer should help the user:
- generate story ideas from a topic
- generate strong title and hook options
- generate subtitle and body copy
- generate CTA options
- improve an existing story draft
- create multiple variants of the same story
- suggest the most suitable layout preset
- suggest the most suitable visual direction
- convert a story concept into an image prompt
- generate an image for the story

### AI Copilot Interface
The AI layer should be implemented as a dedicated side panel or modular assistant area inside the app, not mixed chaotically with manual controls.

Suggested AI actions:
- Generate Story Idea
- Generate 5 Hooks
- Write Full Story
- Improve Current Story
- Suggest CTA
- Suggest Best Layout
- Create 3 Variants
- Generate Image Prompt
- Generate Story Image

### AI Layers
The architecture should support 3 distinct AI layers:

#### 1. Copy AI
Used for:
- title generation
- subtitle generation
- body development
- CTA generation
- rewriting and improvement
- tone adaptation

#### 2. Layout AI
Used for:
- selecting best preset
- improving readability
- balancing text/image ratio
- adapting story density to available space

#### 3. Image AI
Used for:
- visual concept generation
- image prompt creation
- image generation from prompt
- optional future image generation based on real Riccardo references

### Agent Mode
A future-ready “Agent Mode” should be planned.

In Agent Mode, the user can input a theme, topic, or content objective, and the system generates multiple ready-to-edit stories automatically, including:
- hook
- structure
- body text
- CTA
- suggested layout
- suggested visual direction

This mode should work like a high-output creative assistant for story production.