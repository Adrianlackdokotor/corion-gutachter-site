# Imagini Corion Gutachter

Pune imaginile reale (din Figma sau fotografii) în subdirectoarele de mai jos.

## Structura

```
assets/images/
  hero.jpg / hero.webp          ← Hero principal (1920×1080px)
  team.jpg / team.webp          ← Poza echipei (600×700px)

  services/
    unfallgutachten.jpg/.webp   ← Card Schadengutachten (800×500px)
    wertgutachten.jpg/.webp     ← Card Wertgutachten (800×500px)
    ki-analyse.jpg/.webp        ← Card KI-Analyse (800×500px)
    karosserie.jpg/.webp        ← Card Karosserie & Lack (800×500px)
    erstberatung.jpg/.webp      ← Card Erstberatung (800×500px)
    kostenvoranschlag.jpg/.webp ← Card Kostenvoranschlag (800×500px)
    hero-services.jpg/.webp     ← Hero pagina Servicii (1920×600px)

  steps/
    step1-fotos.jpg/.webp       ← Pas 1: Fotos hochladen (400×300px)
    step2-beratung.jpg/.webp    ← Pas 2: Beratung (400×300px)
    step3-gutachten.jpg/.webp   ← Pas 3: Gutachten erhalten (400×300px)

  blog/
    hero-blog.jpg/.webp         ← Hero pagina Blog (1920×600px)
    unfallgutachten-prozess.jpg/.webp ← Articol 1 (800×400px)
    ki-fahrzeugbewertung.jpg/.webp    ← Articol 2 (800×400px)
    lackpflege-tipps.jpg/.webp        ← Articol 3 (600×400px)
```

## Pâna ce imaginile reale sunt disponibile

Fiecare `<picture>` element are `onerror` fallback la `placehold.co` — pagina funcționează complet și fără imagini reale.

## Format recomandat

1. Exportă din Figma ca **JPG** (quality 85%)
2. Convertește la **WebP** cu [Squoosh](https://squoosh.app/) (quality 82%)
3. Pune ambele fișiere (.jpg și .webp) în folderul corespunzător

## Lazy Loading

Toate imaginile de mai jos hero au `loading="lazy"` — se încarcă automat.
Hero-ul principal are `loading="eager" fetchpriority="high"` pentru performanță LCP.
