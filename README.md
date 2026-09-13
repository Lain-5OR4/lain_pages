# Lain Pages

> **English** | [日本語](README.ja.md)

> 開発・CIの最新手順: [DEVELOPMENT.md](DEVELOPMENT.md)。CloudflareのGitHub連携で自動デプロイします。
A personal portfolio built with Next.js, automatically deployed to Cloudflare Pages through its GitHub integration.

## 🌟 Features

- **Personal Portfolio**: Modern dark-themed homepage with animated rain effects
- **Mini Applications**: Collection of interactive web tools
  - **TextDelta**: Advanced text diff viewer with character-level and line-level comparison modes

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Code Quality**: Biome (ESLint + Prettier alternative)
- **Deployment**: Cloudflare Pages via GitHub integration
- **Fonts**: Custom fonts including LoveLetter, Geist Sans, Geist Mono

## 📱 Mini Apps

### TextDelta
A sophisticated text comparison tool inspired by WinMerge, featuring:
- **Two display modes**: GitHub-style and Unified diff
- **Two comparison levels**: Line-level and character-level highlighting
- **Real-time comparison**: Instant diff calculation and visualization
- **Clean UI**: Modern, accessible interface with clear visual indicators

## 🔧 Development

### Prerequisites
- Node.js 22
- Bun 1.4.2

### CI/CD Pipeline
1. **Lint Check**: Biome linter validation
2. **Format Check**: Code formatting verification
3. **Tests**: Worker type checks and Vitest tests on pushes and PRs
4. **Build**: Next.js static export verification on PRs only
5. **Deploy**: Cloudflare GitHub integration handles deployment independently

CI validates pushes and pull requests. Configure required status checks in GitHub rulesets to enforce passing checks before merge; Cloudflare deployment settings are managed separately.

## 🎨 Design Features

- **Rain Effect**: Animated background rain effect on homepage (disabled on TextDelta)
- **Dark Theme**: Matrix-inspired green-on-black color scheme
- **Responsive Design**: Mobile-friendly layouts
- **Custom Typography**: Stylized fonts for enhanced visual appeal
- **Glitch Effects**: CSS animations for cyberpunk aesthetic

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── text-delta/         # TextDelta mini app
│   │   ├── fonts/              # Custom font files
│   │   └── styles/             # Global styles and animations
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── background/         # Rain effect and conditional rendering
│   │   ├── audio/              # Background music player
│   │   └── footer/             # Site footer
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
│   └── assets/                 # Images and logos
├── .github/workflows/          # CI/CD configuration
└── out/                        # Built static files (generated)
```

## 🔧 Configuration

### Biome Configuration
Code quality is enforced using Biome with:
- ESLint-style linting rules
- Prettier-style formatting
- TypeScript support
- File type filtering (js, ts, jsx, tsx, json)

## 🎯 Future Plans

- [ ] Additional mini applications
- [ ] Dark/light theme toggle
- [ ] More interactive animations
- [ ] Blog section
- [ ] Contact form
