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

  steps/
    step1-unfall-auto-fotos-hochladen-kfz-gutachter.jpg/.webp  ← 25KB/17KB ✅ REAL
      Pas 1: Benutzer fotografiert Unfallschaden mit Smartphone für Kfz Gutachter
    step2-beratung-kfz-gutachter-ersteinschaetzung-unfallschaden.jpg/.webp ← 19KB/11KB ✅ REAL
      Pas 2: Beratung / Ersteinschätzung, Gutachter verifică pozele și discută telefonic cu clientul
    step3-unfallgutachten-erhalten-kfz-gutachter-bericht-deutschland.jpg/.webp ← 25KB/16KB ✅ REAL
      Pas 3: Gutachten erhalten, clientul primește și înțelege raportul final de daună
```

  services/ — TOATE IMAGINILE REALE ✅
    unfallgutachten-schadengutachten-kfz-gutachter-frankfurt-hofheim.jpg/.webp ← 73KB/43KB ✅ REAL
    wertgutachten-fahrzeugbewertung-kfz-gutachter-deutschland.jpg/.webp        ← 79KB/50KB ✅ REAL
    ki-analyse-fahrzeug-schaden-erkennung-kfz-gutachter.jpg/.webp              ← 55KB/30KB ✅ REAL
    karosserie-lack-smart-repair-unfallschaden-reparatur.jpg/.webp             ← 58KB/31KB ✅ REAL
    erstberatung-kfz-gutachter-telefonische-beratung.jpg/.webp                 ← 56KB/29KB ✅ REAL
    kostenvoranschlag-auto-reparatur-kfz-gutachter.jpg/.webp                   ← 67KB/38KB ✅ REAL

## Imagini necesare (placeholder activ) ⏳

```


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
