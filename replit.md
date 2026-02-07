# Corion Gutachter Website

## Overview
Site-ul web al firmei **Corion Gutachter** — un birou de expertiză auto (Kfz-Sachverständigenbüro) din Germania, activ în Frankfurt, Hofheim, Wiesbaden și Mainz. Fondatorul are peste 25 de ani de experiență în caroserie și vopsitorie auto (marca „Lackdoktor") și 3 ani ca expert auto certificat. Site-ul este în limba germană, cu comentarii în cod în română.

## Structura fișierelor

| Fișier | Descriere |
|---|---|
| `index.html` | Pagina principală (single-page cu secțiuni ancorate). ~1410 linii. Conține totul: hero cu video, servicii, despre noi, KI-Unfall-Assistent, standorte (locații), blog preview, formular de contact, chat AI, modale Impressum/Datenschutz. |
| `blog.html` | Pagina de blog (~280 linii). Un singur articol demo despre „Wann ist ein Schadengutachten sinnvoll?" + sidebar cu „Neueste Beiträge" și „Kategorien". |
| `servicii.html` | Pagina de servicii detaliate (~293 linii). Trei secțiuni: Unfall- & Schadensgutachten, Restwert-/Marktwertgutachten, Digitale & KI-gestützte Analyse. |
| `contact.html` | Gol (0 linii). Nu conține nimic momentan. |
| `formular.html` | Gol (0 linii). Nu conține nimic momentan. |
| `process-form.php` | Backend PHP pentru formularul de contact. Primește POST cu câmpuri (name, email, phone, subject, message, privacy, carPhotos[]). Validează, salvează fișierele în `uploads/`, trimite email cu `mail()`. Returnează JSON. |
| `save-chat.php` | Backend PHP pentru salvarea conversațiilor de chat AI. Primește POST JSON cu istoricul chat-ului, îl formatează și îl salvează ca fișier `.txt` în `chat_logs/`. |
| `Corion Hub + 1` | Document HTML cu planul de lansare și scalare „Corion Hub + 1" — un concept de platformă mai mare (Next.js + Supabase + LangChain + smart contracts pe Base L2). Acesta este un document de viziune/planificare, NU face parte din site-ul live. |
| `README.md` | Fișier README standard. |

## Arhitectura tehnică

- **Limbaje**: HTML5, CSS (Tailwind CSS via CDN), JavaScript vanilla, PHP 8.2
- **Server**: PHP built-in development server pe portul 5000 (`php -S 0.0.0.0:5000`)
- **Framework CSS**: Tailwind CSS încărcat via CDN (`cdn.tailwindcss.com`)
- **Fonturi**: Google Fonts — Inter (300, 400, 600, 700)
- **Icoane**: Font Awesome 6.5.2 via CDN
- **Bază de date**: Nu există. Datele se salvează pe disc (fișiere în `uploads/` și `chat_logs/`)
- **Deployment**: Configurat ca „autoscale" cu `php -S 0.0.0.0:5000`

## Pagina principală (index.html) — Secțiuni detaliate

### 1. Navigare (sticky)
- Logo: imagine `uploaded:+1CorionGutachter_On_Transparent (High).jpg-...`
- Linkuri: Start, Leistungen, Über Uns, KI-Unfall-Assistent, Standorte, Blog, Kontakt
- Link extern: „Gutachter-Portal" → `https://app.beispiel-gutachter-domain.de` (placeholder)
- Meniu mobil cu hamburger (toggle)

### 2. Hero Section
- Video background (autoplay, muted, loop) cu poster fallback
- Overlay semi-transparent
- Titlu: „Corion Gutachter: Ihr Partner für Kfz-Gutachten im Rhein-Main-Gebiet"
- Două butoane CTA: „Unsere Leistungen" și „Direkt anfragen"

### 3. Leistungen (Servicii) — 6 carduri
1. Unfallgutachten (raport accidente)
2. Wertgutachten (evaluare valoare)
3. KI-Analyse (analiză cu inteligență artificială)
4. Karosserie & Lack (caroserie și vopsitorie)
5. Kostenlose Erstberatung (consultanță gratuită)
6. Kostenvoranschläge (devize de reparații)

### 4. Über Uns (Despre noi)
- Text descriptiv cu competențe cheie
- Imagine placeholder

### 5. KI-Unfall-Assistent
- Textarea pentru descrierea unui accident
- Buton „Unfall-Checkliste generieren" → apelează Google Gemini API
- Generează o checklist Markdown convertită în HTML
- Folosește funcția `callGeminiApi()` care apelează direct API-ul Gemini

### 6. Standorte (Locații)
- 4 locații: Frankfurt, Hofheim am Taunus, Wiesbaden, Mainz
- Carduri cu adrese și link WhatsApp
- Google Maps embed

### 7. Blog Preview
- Previzualizare a articolelor de blog cu linkuri către `blog.html`

### 8. Kontakt (Formular de contact)
- Câmpuri: Name, Email, Telefon, Betreff, Nachricht
- Upload fișiere (imagini vehicul): acceptă JPG, PNG, WEBP, GIF, PDF, max 25MB
- Checkbox acordul GDPR (Datenschutzerklärung)
- Submit → trimite datele (în demo doar consolă log, nu apelează process-form.php prin fetch)

### 9. Footer
- Copyright cu anul curent
- Linkuri modale: Impressum & Datenschutz

### 10. Chat Modal (floating button)
- Buton roșu fix în colțul din dreapta-jos
- Deschide un modal de chat cu asistent AI
- Folosește Google Gemini API (`generativelanguage.googleapis.com`)
- System prompt detaliat care definește asistentul ca reprezentant Corion Gutachter
- Istoricul chat-ului se trimite la `save-chat.php` pentru salvare

### 11. Modale (Impressum & Datenschutz)
- Impressum: date firmă placeholder
- Datenschutz: politică GDPR completă în limba germană

## Integrări externe

### Google Gemini API
- Folosită direct din frontend (JavaScript) prin funcția `callGeminiApi(promptText)`
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Cheia API este hardcodată în `index.html` (linia ~988): `GEMINI_API_KEY`
- Folosită pentru:
  - Chat-ul AI (floating chat modal)
  - KI-Unfall-Assistent (generare checklist după accident)

### WhatsApp
- Linkuri directe `wa.me/4917683458274` pentru contact rapid

### Google Maps
- Iframe embed cu harta locațiilor

## Culori și branding
- **Roșu Corion**: `#c00000` (primary)
- **Roșu hover**: `#a00000`
- **Background**: `#111827` (gray-900 foarte închis)
- **Carduri**: `#1f2937` (gray-800)
- **Border**: `#374151` (gray-700)
- **Text principal**: `#e5e7eb` (gray-200)
- **Text secundar**: `#d1d5db` (gray-300)
- **Text slab**: `#9ca3af` (gray-400)

## Date de contact (din site)
- **Telefon**: +49 176 83458274
- **Email**: info@corion-gutachter.de
- **Domeniu**: corion-gutachter.de
- **Zone deservite**: Frankfurt am Main, Hofheim am Taunus, Wiesbaden, Mainz (Rhein-Main-Gebiet)
- **Program**: Lu-Vi 08:00-18:00, Sâ 09:00-14:00

## Observații importante pentru alt agent
1. **Cheia Gemini API este hardcodată în frontend** (index.html) — ar trebui mutată într-un mecanism server-side pentru securitate.
2. **contact.html și formular.html sunt goale** — conțin 0 linii de cod.
3. **Formularul de contact din index.html nu trimite datele real** — face doar console.log și afișează un mesaj demo. Nu apelează `process-form.php` prin fetch.
4. **Imaginile folosesc URL-uri de tip `uploaded:...`** — acestea sunt referințe specifice unui alt mediu (probabil un constructor de site-uri anterior) și NU vor funcționa. Logo-ul și background-ul nu se încarcă.
5. **Video-ul hero folosește un placeholder** ca poster și nu are o sursă video reală configurată.
6. **Fișierul „Corion Hub + 1"** este un document de planificare pentru o platformă SaaS mai complexă (Next.js, Supabase, blockchain) — nu face parte din site-ul curent.
7. **CSS-ul este duplicat** între pagini (nav, floating chat, etc.) — ar putea fi extras într-un fișier CSS comun.
8. **Schema.org** structured data este implementată complet pe index.html (AutomotiveBusiness, WebSite, BreadcrumbList).
9. **PHP `FILTER_SANITIZE_STRING`** este deprecat din PHP 8.1 — va genera warnings în process-form.php.

## Recent Changes
- 2026-02-07: Initial Replit setup, configured PHP dev server on port 5000, created uploads/ and chat_logs/ directories
