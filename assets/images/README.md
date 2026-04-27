# Imagini Corion Gutachter — Structură SEO

Toate imaginile folosesc nume SEO-optimizate cu keyword-uri pentru Kfz Gutachter / Frankfurt / Hofheim.

## Imagini reale disponibile ✅

```
assets/images/
  hero/
    hero-kfz-gutachter-unfallgutachten-frankfurt-hofheim.jpg   ← 210KB  ✅ REAL
    hero-kfz-gutachter-unfallgutachten-frankfurt-hofheim.webp  ← 118KB  ✅ REAL

  team/
    team-kfz-gutachter-beratung-unfallschaden-deutschland.jpg  ← 70KB   ✅ REAL
    team-kfz-gutachter-beratung-unfallschaden-deutschland.webp ← 43KB   ✅ REAL
```

## Imagini necesare (placeholder activ) ⏳

```
  services/
    unfallgutachten-auto-schaden-bewertung.jpg/.webp    ← Card Schadengutachten (800×500px)
    wertgutachten-auto-bewertung-deutschland.jpg/.webp  ← Card Wertgutachten (800×500px)
    ki-analyse-fahrzeug-schaden-erkennung.jpg/.webp     ← Card KI-Analyse (800×500px)
    karosserie-lack-reparatur-smart-repair.jpg/.webp    ← Card Karosserie & Lack (800×500px)
    erstberatung-kfz-gutachter-kostenlos.jpg/.webp      ← Card Erstberatung (800×500px)
    kostenvoranschlag-auto-reparatur-gutachter.jpg/.webp← Card Kostenvoranschlag (800×500px)

  steps/
    step1-unfall-auto-fotos-hochladen-gutachter.jpg/.webp ← Pas 1 (400×300px)
    step2-beratung-kfz-gutachter-deutschland.jpg/.webp    ← Pas 2 (400×300px)
    step3-unfallgutachten-erstellen-bericht.jpg/.webp     ← Pas 3 (400×300px)

  blog/
    blog-kfz-gutachter-ratgeber-wissen-deutschland.jpg/.webp   ← Hero Blog (1920×600px)
    unfallgutachten-prozess-deutschland.jpg/.webp              ← Articol 1 (600×400px)
    ki-fahrzeugbewertung-auto-schaden.jpg/.webp                ← Articol 2 (600×400px)
    lackpflege-tipps-auto-schutz-deutschland.jpg/.webp         ← Articol 3 (600×400px)
```

## Pâna ce imaginile lipsă sunt disponibile

Fiecare `<picture>` element are `onerror` fallback la `placehold.co` — pagina funcționează complet.

## Format recomandat pentru imagini noi

1. Export din Figma/cameră ca **JPG** (quality 85%)
2. Convertește la **WebP**: `magick input.jpg -quality 78 -strip output.webp`
3. Pune ambele fișiere în folderul corespunzător cu numele exact din lista de mai sus

## Lazy Loading

- Hero: `loading="eager" fetchpriority="high"` (LCP optimization)
- Toate celelalte: `loading="lazy"` (performance)
- Toate au `width` + `height` setate explicit (elimină CLS)
