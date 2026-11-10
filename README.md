# 🚀 PitchCraft AI — Intelligent Pitch Deck Studio

> **Transform startup concepts into investor-ready pitch decks in seconds.**  
> Autonomous multi-agent slide generation, bespoke AI visuals, interactive carousel presentation, and native PowerPoint (`.pptx`) export.

---

## ✨ Features

- **🤖 Autonomous AI Deck Generation**: Provide a simple business idea, and an autonomous agent synthesizes an executive narrative structure, compelling slide copy, and targeted visual art directions.
- **🎨 AI-Generated Visual Artwork**: Generates custom slide visuals tailored to each concept, hosted and delivered via ImageKit CDN.
- **📊 Real PowerPoint (`.pptx`) Export**: Download native Microsoft PowerPoint decks formatted in 16:9 widescreen with embedded visual assets, executive title cards, and styled concept breakdowns.
- **🎠 Interactive Presentation Stage**: Built with `embla-carousel-react` featuring fluid slide animations, keyboard navigation (`←` / `→` / `Space` / `F`), 6-second auto-play slideshow mode, and artwork lightbox zoom.
- **🌓 Multi-Style Themes & Dark Mode**:
  - Global site Light/Dark mode with zero-flicker hydration.
  - In-deck presentation style switcher: **Executive Light**, **Obsidian Studio (Dark)**, and **Corporate Navy**.
- **📋 Markdown & PDF Handouts**: One-click Markdown copy for executive notes and print/export formatting.
- **⚡ Resilient Async Queue**: Orchestrated background jobs using **Inngest** with automatic direct fallback execution.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), `@base-ui/react`, [Lucide Icons](https://lucide.dev/) |
| **Theming** | `next-themes` (System, Dark, Light) |
| **Database & ORM**| [Prisma ORM 7](https://www.prisma.io/) with `@prisma/adapter-pg` & PostgreSQL ([Neon](https://neon.tech/)) |
| **AI & Agent** | OpenAI SDK / OpenRouter API |
| **Image CDN** | [ImageKit](https://imagekit.io/) |
| **Presentation** | [Embla Carousel React](https://www.embla-carousel.com/), [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) |
| **Job Queue** | [Inngest](https://www.inngest.com/) |

---

## 🏗️ Architecture Flow

```mermaid
flowchart LR
    A[User Idea] --> B[POST /api/decks]
    B --> C[Inngest Job Queue]
    C --> D[OpenAI Agent]
    D -->|Generates Structure & Prompts| E[Image Generation]
    E -->|Uploads to| F[ImageKit CDN]
    F --> G[(PostgreSQL via Prisma)]
    G --> H[Deck Carousel Viewer]
    H --> I[PowerPoint .pptx Export]
    H --> J[Fullscreen Presentation]
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (Node.js 20+ recommended)
- **PostgreSQL Database** (e.g., [Neon](https://neon.tech/))
- **OpenAI or OpenRouter API Key**
- **ImageKit Account** (for visual asset hosting)

### 2. Clone and Install

```bash
git clone https://github.com/your-username/ai-pitch-deck.git
cd ai-pitch-deck
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# AI Provider (OpenAI or OpenRouter)
OPENROUTER_API_KEY="your-openrouter-or-openai-api-key"

# ImageKit (Image hosting & CDN)
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

# Optional: set to "true" to skip AI image generation during local dev
USE_PLACEHOLDER_IMAGES="false"

# Inngest (Optional in local development)
INNGEST_DEV="1"
```

### 4. Database Setup

Push the Prisma schema to your database:

```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Optional)* Run the Inngest local dev server in a separate terminal:
```bash
npx inngest-cli@latest dev
```

---

## ⌨️ Presentation Keyboard Shortcuts

When presenting or inspecting a deck:

| Key | Action |
| :---: | :--- |
| `→` or `Space` | Next slide |
| `←` | Previous slide |
| `F` | Toggle Fullscreen mode |
| `Esc` | Close artwork zoom / Exit presentation |

---

## 📦 Available Scripts

- `npm run dev` — Starts the local Next.js development server.
- `npm run build` — Generates Prisma Client and creates an optimized production build.
- `npm run start` — Runs the compiled Next.js production server.
- `npm run lint` — Runs ESLint checks.

---

## 🌐 Deployment (Vercel)

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Configure the environment variables (`DATABASE_URL`, `OPENROUTER_API_KEY`, `IMAGEKIT_*`).
4. Vercel automatically runs `postinstall: prisma generate` and `build: prisma generate && next build` before compilation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
