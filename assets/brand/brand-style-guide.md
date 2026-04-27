# Corion Gutachter — Brand Style Guide

## Paletă de culori

| Token           | Hex       | Utilizare                                      |
|-----------------|-----------|------------------------------------------------|
| `--clr-bg`      | `#111827` | Background principal (body, hero overlay)      |
| `--clr-surface` | `#1f2937` | Carduri, modals, input backgrounds             |
| `--clr-border`  | `#374151` | Borduri carduri, separatoare                   |
| `--clr-muted`   | `#4b5563` | Placeholder-uri, elemente inactive             |
| `--clr-text`    | `#e5e7eb` | Text principal                                 |
| `--clr-subtle`  | `#9ca3af` | Text secundar, descrieri                       |
| `--clr-accent`  | `#c00000` | Roșu Corion — CTA-uri, iconițe, accente        |
| `--clr-accent-dark` | `#a00000` | Hover pe roșu                              |
| `--clr-white`   | `#ffffff` | Text pe fundal roșu, titluri hero              |
| `--clr-success` | `#25D366` | WhatsApp green                                 |

## Tipografie

- **Font principal:** Inter (Google Fonts) — weights 300, 400, 600, 700
- **Fallback:** system-ui, -apple-system, sans-serif
- **H1 Hero:** 3.5–4.5rem, font-weight 800, tracking-tight
- **H2 Secțiuni:** 2rem–2.5rem, font-weight 700
- **H3 Carduri:** 1.25rem, font-weight 600
- **Body:** 1rem, line-height 1.625, color `--clr-text`
- **Small/Caption:** 0.875rem, color `--clr-subtle`

## Spacing System (bazat pe 8px grid)

| Token    | Valoare |
|----------|---------|
| `--sp-1` | 8px     |
| `--sp-2` | 16px    |
| `--sp-3` | 24px    |
| `--sp-4` | 32px    |
| `--sp-6` | 48px    |
| `--sp-8` | 64px    |
| `--sp-12`| 96px    |

## Componente reutilizabile

### `.c-hero` — Secțiunea hero
- Background: imagine + overlay `rgba(17,24,39,0.72)`
- Min-height: 75vh desktop, 60vh mobile
- Text centrat, H1 alb + roșu, 2 CTA-uri

### `.c-card` — Card standard
- Background: `#1f2937`, border: `#374151`, border-radius: 12px
- Hover: translateY(-4px) + box-shadow roșu

### `.c-trust-badge` — Badge trust (shield/check/clock/map)
- Icon SVG 40px, background `rgba(192,0,0,0.12)`, border `rgba(192,0,0,0.25)`
- Text bold alb, descriere `--clr-subtle`

### `.c-step` — Pașii procesului (3 pași)
- Număr circular roșu + titlu + descriere + imagine

### `.c-sticky-cta` — CTA sticky mobile
- Fix bottom, 3 butoane: Anruf / WhatsApp / Fotos hochladen
- Vizibil doar pe mobile (md:hidden)

## Imagini

Toate imaginile se stochează în `assets/images/`:
- `hero.jpg` / `hero.webp` — Hero principal (1920×1080, car damage scene)
- `team.jpg` / `team.webp` — Echipa Corion (600×700)
- `services/unfallgutachten.jpg` — Schadengutachten (800×500)
- `services/wertgutachten.jpg` — Wertgutachten (800×500)
- `services/ki-analyse.jpg` — KI Analyse (800×500)

**Format recomandat:** WebP cu fallback JPG via `<picture>` element.
**Alt text:** bilingv DE/RO pentru SEO (ex: `alt="Kfz-Schadengutachten Frankfurt | Gutachten auto Frankfurt"`)

## Icon System

SVG inline din `assets/icons/`: shield.svg, check.svg, clock.svg, map.svg
Culoare controlată via CSS `color` + `stroke="currentColor"`

## Tonul brandului

- **Profesional** și **de încredere** — Gerichtsfest, 25+ ani experiență
- **Rapid** și **accesibil** — kostenlose Erstberatung, WhatsApp direct
- **Modern** — KI-gestützt, digital, transparent
