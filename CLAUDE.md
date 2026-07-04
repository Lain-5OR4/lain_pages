# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run build:github` - Build for GitHub Pages deployment (sets GITHUB_PAGES=true)
- `npm start` - Start production server

### Code Quality
- `npm run lint` - Run Biome linter on src/ directory
- `npm run format` - Run Biome formatter and auto-fix issues
- `npx @biomejs/biome check ./src` - Check formatting without fixing

## Architecture Overview

This repo contains two independent deployable units:

1. **`src/`** — Next.js 15 frontend (portfolio + diary viewer), deployed to GitHub Pages
2. **`workers/photo-diary/`** — Cloudflare Worker backend API, deployed to `api.mizora.dev`

---

## Frontend (`src/`)

### Core Structure
- **App Router**: Uses Next.js app directory structure
- **Static Export**: Configured for GitHub Pages deployment via `output: "export"`
- **Conditional Deployment**: Handles both local development and GitHub Pages with different base paths

### Key Components Architecture
- **ConditionalBackground**: Renders animated rain effect on homepage only (disabled on `/text-delta`)
- **BackgroundMusicPlayer**: Global audio player with user interaction requirement
- **WalkingCharacter**: Animated character component on homepage
- **Footer**: Persistent footer across all pages

### Styling System
- **Tailwind CSS**: Primary styling framework
- **Custom Fonts**: LoveLetter (primary), Geist Sans/Mono (secondary)
- **Theme**: Dark cyberpunk theme with green-on-black color scheme; diary pages use a warm cork-board brown theme
- **shadcn/ui**: Component library for UI elements

### Pages
- `/` — Homepage with Matrix rain + walking character
- `/diary` — Photo diary (corkboard aesthetic)
- `/blog` — "mizora journal" blog (editorial paper theme, microCMS-backed)
- `/text-delta` — Text diff viewer mini-app
- `/fragments` — Fragment pages

### Diary Feature Architecture
The diary page (`src/app/diary/page.tsx`) fetches from `NEXT_PUBLIC_DIARY_API/api/diary` (default `https://api.mizora.dev`).

**Dev vs prod data**: In `NODE_ENV === "development"`, `mockEntries` from `src/data/diary.ts` is used instead of the API (mock photos are picsum URLs and have no real EXIF). The `DiaryEntry` type is defined in `src/data/diary.ts` and must match what `/api/diary` returns.

**Diary components** (`src/components/diary/`):
- `DiaryCard` — Entry card with photos; uses `PolaroidPhoto`, `DescriptionNote`, `TitleTicket`, `DateSticker`
- `DescriptionNote` — Sticky-note with masking tape, positioned bottom-right of the photo area
- `PhotoLightbox` — Full-screen photo viewer with title/date/description overlay
- `constants.ts` — Shared values like `ZIGZAG_TAPE_EDGES` clip-path, color palettes

### Blog Feature Architecture
Content lives in microCMS (`blogs` endpoint, rich editor). Posts are written as markdown inside the rich editor; `src/data/blog-posts.ts` strips the HTML wrapper and re-parses with `marked`.

**Build-time fetch**: `src/lib/microcms.ts` wraps the official SDK and reads `MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` (server-side only, never `NEXT_PUBLIC_*`). Because of `output: "export"`, all posts are fetched at build time — the API key never ships to the client. Set these env vars in `.env.local` locally and in the deployment platform's build environment.

**Fallback behavior** (`src/data/blog-posts.ts`): when microCMS env vars are missing, dev builds use a local seed post; production builds render an empty blog (never the seed).

**Pages**: `/blog` (index) and `/blog/[slug]` (detail, `generateStaticParams` from all posts). The detail body is rendered via `dangerouslySetInnerHTML` with scoped `.rich-content` styles.

---

## Worker (`workers/photo-diary/`)

Hono-based Cloudflare Worker deployed to `api.mizora.dev`. Uses **Drizzle ORM** with Cloudflare **D1** (SQLite) and **R2** for image storage.

### Commands (run from `workers/photo-diary/`)
- `npm run dev` — Local worker dev server
- `npm run deploy` — Deploy to Cloudflare
- `npm test` — Run vitest (Cloudflare Workers pool)
- `npm run cf-typegen` — Regenerate `worker-configuration.d.ts` from wrangler bindings

### Routes
| Route | Description |
|---|---|
| `GET /api/diary` | Returns `DiaryEntry[]` formatted for the frontend |
| `GET /api/posts` | Returns raw post data |
| `GET /api/blog` | Proxies the microCMS post list (no `content` field, 60s/300s cache) |
| `GET /api/blog/:id` | Proxies a single microCMS post; `?draftKey=` for previews (no-store) |
| `GET /images/:key` | Serves images from R2 (1-year immutable cache) |
| `GET /admin/new` | Upload form (protected by Cloudflare Access) |
| `POST /admin/posts` | Create post with images |

### Schema (`src/schema.ts`)
- `posts`: `id, title, caption, posted_on, created_at`
- `post_images`: `id, post_id, r2_key, sort_order, taken_at, width, height`
  - `taken_at` stores EXIF `DateTimeOriginal` as naive `YYYY-MM-DDTHH:MM:SS` (camera local time)

### Data Flow
1. Admin uploads via browser form → client-side resize to 2048px JPEG via Canvas (EXIF is stripped here) → `exifr` extracts `DateTimeOriginal` before resize and sends as `taken_at` field
2. Worker stores image in R2, inserts row in D1
3. `/api/diary` transforms DB rows into `DiaryEntry[]`: maps `title/caption/posted_on` fields, builds absolute image URLs, formats `taken_at` into `stamp` via `formatStamp()`
4. CORS is restricted to `https://mizora.dev` and `http://localhost:3000` only

### Important Notes
- Canvas `toBlob()` strips all EXIF including GPS — no GPS data survives in stored images
- `taken_at` naive timestamps are rendered as-is (camera local time); UTC timestamps are shifted to JST
- The `DiaryEntry` type is defined in both `workers/photo-diary/src/types.ts` and `src/data/diary.ts` — keep in sync
- Worker secrets `MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` are set via `wrangler secret put`; local dev reads `.dev.vars` (copy from `.dev.vars.example`). Vitest overrides them with dummy values in `vitest.config.mts`

---

## Important Configuration

### Biome Setup
- Linter and formatter configured with 100-character line width
- Double quotes enforced for JavaScript
- Targets `.js`, `.ts`, `.jsx`, `.tsx`, `.json` files in src/
- Must pass both lint and format checks for CI/CD deployment

### Deployment
- Push-driven deployment is handled by Cloudflare Pages; the GitHub Pages workflow (`nextjs.yml`) is manual-only (`workflow_dispatch`)
- Environment variable `GITHUB_PAGES=true` triggers basePath/assetPrefix configuration
- Static export builds to `out/` directory
- Deployment fails if lint/format checks don't pass

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

## Development Notes
- Images are unoptimized for static export compatibility
- Trailing slashes enabled for static hosting
- Audio files and assets stored in `public/` directory
- Worker dev server (`wrangler dev`) does not enforce Cloudflare Access — admin routes are open locally