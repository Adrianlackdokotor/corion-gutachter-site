# Corion Gutachter — Full-Stack Platform

## Overview
Platforma web a firmei **Corion Gutachter** — un birou de expertiză auto (Kfz-Sachverständigenbüro) din Germania, activ în Frankfurt, Hofheim, Wiesbaden și Mainz. Site-ul este în limba germană, cu comentarii în cod în română.

## Current State
- **Phase:** Scaling & Integration (Multi-Agent System)
- **Stack:** React + TypeScript + Vite (frontend), Express (backend), PostgreSQL (database)
- **AI:** OpenAI via Replit AI Integrations (gpt-4o-mini)
- **Port:** 5000 (Express + Vite middleware)

## Architecture

### Frontend (client/)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + custom CSS variables
- **Icons:** Lucide React
- **Router:** React Router v7
- **Path alias:** `@/` → `client/src/`

### Backend (server/)
- **Framework:** Express.js with TypeScript (tsx runner)
- **Database:** PostgreSQL via `pg` pool (raw queries, no ORM)
- **AI:** OpenAI SDK via Replit AI Integrations

### Key Directories
```
client/
  src/
    pages/GutachterPage.tsx          # Main landing page
    components/gutachter/            # All UI components (12 files)
      CoraChat.tsx                   # CORA AI chat widget (NEW)
      Navbar.tsx, HeroSection.tsx, LeistungenSection.tsx,
      UeberUnsSection.tsx, UnfallAssistentSection.tsx,
      StandorteSection.tsx, BlogPreviewSection.tsx,
      KontaktSection.tsx, FooterSection.tsx,
      FloatingButtons.tsx, MobileStickyFooter.tsx,
      JsonLdSchema.tsx
    main.tsx                         # App entry point
    index.css                        # Global styles + CSS variables
server/
  index.ts                           # Express server setup
  routes.ts                          # API routes (contact, unfall-assistent, admin)
  db.ts                              # PostgreSQL pool + table init
  orchestrator/                      # CORA Multi-Agent Orchestrator (NEW)
    index.ts                         # Exports
    skills.ts                        # AI skill registry (4 skills)
    router.ts                        # API routes + intent classification + streaming
    storage.ts                       # PostgreSQL conversation storage
  replit_integrations/               # Replit AI Integration modules
    audio/, chat/, image/, batch/
```

### Database Tables
- `repair_requests` — Contact form submissions
- `orchestrator_conversations` — CORA chat sessions
- `orchestrator_messages` — CORA chat messages with skill tracking

### API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/api/gutachter/contact` | Contact form submission |
| POST | `/api/gutachter/unfall-assistent` | AI accident checklist |
| GET | `/api/repair-requests` | Admin: list submissions |
| POST | `/api/orchestrator/chat` | CORA: non-streaming chat |
| POST | `/api/orchestrator/chat/stream` | CORA: streaming chat (SSE) |
| GET | `/api/orchestrator/skills` | CORA: list available skills |
| DELETE | `/api/orchestrator/conversation/:sessionId` | CORA: delete conversation |

### CORA Orchestrator — Multi-Agent System
Central AI router that classifies user intent and routes to specialized skills:
1. **Kfz-Gutachter Experte** (`gutachter`) — Car appraisal, accident damage, insurance
2. **Vertrieb & Partnerschaft** (`sales`) — Partner programs, cooperation, business
3. **Corion Academy** (`academy`) — Training, courses, certifications
4. **Allgemeine Assistenz** (`general`) — General questions, fallback

Flow: User message → Intent Classification (gpt-4o-mini) → Skill Router → Skill-specific system prompt → Response + PostgreSQL logging

### Environment Variables (auto-configured)
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (Replit managed)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (Replit managed)

## Branding
- **Roșu Corion:** `#c00000` | **Hover:** `#a00000`
- **Background:** `#111827` | **Cards:** `#1f2937` | **Border:** `#374151`
- **Font:** Inter (Google Fonts)

## Contact Info
- Tel: 06192 / 95 32 108 | Mobil: 0176 / 83 45 82 74
- Email: info@corion-gutachter.de
- WhatsApp: wa.me/4917683458274
- Standorte: Frankfurt, Hofheim, Wiesbaden, Mainz

## Static HTML Pages (servite de Express la rădăcina proiectului)
| Pagină | Rută | Conținut |
|--------|------|---------|
| `index.html` | `/` | Landing page principal cu Hero, Trust Bar, Leistungen (6 carduri), 3 Schritte, Über Uns, KI-Assistent, Blog, Testimoniale, Kontakt |
| `servicii.html` | `/servicii.html` | Detalii leistungen: Unfallgutachten, Wertgutachten, KI-Analyse, Karosserie |
| `blog.html` | `/blog.html` | Blog 2 articole + sidebar CTA + categorii |
| `contact.html` | `/contact.html` | Kontakt cu carduri Telefon/WhatsApp/Email + formular |
| `formular.html` | `/formular.html` | Gutachten-Anfrage cu tip selectabil + upload foto |

## Assets System
```
assets/
  corion-shared.css            # CSS partajat: variabile, componente, butoane
  brand/brand-style-guide.md   # Ghid de stil complet
  icons/                       # SVG icons: shield, check, clock, map
  images/                      # Imagini (placeholder → real)
    hero.jpg/.webp, team.jpg/.webp
    services/*.jpg/.webp
    steps/*.jpg/.webp
    blog/*.jpg/.webp
design/figma-exports/README.md  # Instrucțiuni export Figma + conversie WebP
favicon.svg                     # Favicon SVG cu logo Corion
```

### Express Static Routes (server/index.ts)
- `/assets/*` → `assets/` folder
- `/favicon.svg` → `favicon.svg`
- `/*.html` → fișierele HTML din rădăcină
- `/` → `index.html`

### Componente CSS Reutilizabile (assets/corion-shared.css)
`.c-hero`, `.c-trust-bar`, `.c-trust-badge`, `.c-img-card`, `.c-step`, `.c-testimonial`, `.c-sticky-cta`, `.btn`, `.card`, `.form-input`

## Recent Changes
- 2026-04-27: Static HTML pages rewrite — trust bar, 3 Schritte, testimoniale, sticky mobile CTA, picture/WebP lazy loading
- 2026-04-27: Created `assets/corion-shared.css` (CSS partajat, variabile brand, componente)
- 2026-04-27: Created `assets/icons/` (shield, check, clock, map SVGs), `favicon.svg`
- 2026-04-27: Created `contact.html` și `formular.html` (pagini noi, complet populate)
- 2026-04-27: Updated `server/index.ts` — Express serve assets/ + HTML statice înainte de Vite
- 2026-02-07: Built CORA Multi-Agent Orchestrator with 4 skills, streaming SSE, PostgreSQL conversation storage
- 2026-02-07: Created CORA chat widget (CoraChat.tsx) with real-time streaming UI
- 2026-02-07: Integrated OpenAI via Replit AI Integrations (replaced raw fetch with SDK)
- 2026-02-07: Built complete Gutachter landing page with 9 sections
- 2026-02-07: Set up React + Express + PostgreSQL stack from scratch

## User Preferences
- Language: Romanian (code comments) + German (UI content)
- Style: Dark theme, professional, mobile-first
- Project management: BACKLOG.md with task tracking
