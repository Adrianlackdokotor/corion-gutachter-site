# Figma Exports — Corion Gutachter

Acest folder este pregătit pentru imaginile și graficele exportate din Figma.

## Structura de destinație

```
assets/
  images/
    hero.webp          ← Hero principal (1920×1080px)
    hero.jpg           ← Fallback JPG pentru hero
    team.webp          ← Poza echipei (600×700px)
    team.jpg           ← Fallback
    services/
      unfallgutachten.webp   ← Card Schadengutachten (800×500px)
      unfallgutachten.jpg
      wertgutachten.webp     ← Card Wertgutachten
      wertgutachten.jpg
      ki-analyse.webp        ← Card KI-Analyse
      ki-analyse.jpg
      karosserie.webp        ← Card Karosserie & Lack
      karosserie.jpg
```

## Cum exportezi din Figma

### Imagini raster (JPG/PNG/WebP)

1. Selectează frame-ul sau componenta în Figma
2. În panoul din dreapta → **Export** → click `+`
3. Alege formatul: **JPG** (pentru foto) sau **PNG** (pentru grafice cu transparență)
4. Setează scale: `1x` (dacă frame-ul e deja la dimensiunea finală) sau `2x` pentru retina
5. Export → descarcă → pune în `assets/images/`

### Conversie WebP (recomandat pentru performanță)

Folosește unul din aceste tool-uri gratuite:
- **Squoosh** (browser): https://squoosh.app/ — drag & drop, setează WebP quality 82%
- **cwebp** (CLI): `cwebp -q 82 hero.jpg -o hero.webp`
- **ImageMagick**: `convert hero.jpg -quality 82 hero.webp`

### SVG Icons

1. Selectează iconița în Figma
2. Click dreapta → **Copy as SVG**
3. Paste în `assets/icons/numeicoana.svg`
4. Optimizează cu https://svgomg.net/ (reducere ~30-50%)

## Dimensiuni recomandate

| Imagine          | Lățime   | Înălțime | Utilizare                    |
|------------------|----------|----------|------------------------------|
| hero             | 1920px   | 1080px   | Hero full-width              |
| team             | 600px    | 700px    | Secțiunea Über Uns           |
| services/*       | 800px    | 500px    | Carduri servicii             |
| blog/*           | 600px    | 400px    | Carduri blog                 |
| og-image         | 1200px   | 630px    | Open Graph social share      |

## Notă importantă

Fișierele din acest folder (`design/figma-exports/`) sunt **temporare** — după ce le procesezi și le pui în `assets/images/`, poți șterge originalele din acest folder. Nu comite fișiere mari de imagine direct în repo — pune-le în `assets/` și folosește `.gitignore` dacă e necesar.
