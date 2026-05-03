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

This is a Next.js 15 portfolio website with a cyberpunk/Matrix aesthetic, featuring:

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
- **Theme**: Dark cyberpunk theme with green-on-black color scheme
- **shadcn/ui**: Component library for UI elements

### Mini Applications
Currently includes TextDelta app at `/text-delta` route - a sophisticated text diff viewer with multiple comparison modes.

## Important Configuration

### Biome Setup
- Linter and formatter configured with 100-character line width
- Double quotes enforced for JavaScript
- Targets `.js`, `.ts`, `.jsx`, `.tsx`, `.json` files in src/
- Must pass both lint and format checks for CI/CD deployment

### GitHub Pages Deployment
- Automatic deployment on main branch pushes
- Environment variable `GITHUB_PAGES=true` triggers basePath/assetPrefix configuration
- Static export builds to `out/` directory
- Deployment fails if lint/format checks don't pass

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

## Development Notes
- Uses TypeScript with strict mode enabled
- Images are unoptimized for static export compatibility
- Trailing slashes enabled for static hosting
- Audio files and assets stored in `public/` directory