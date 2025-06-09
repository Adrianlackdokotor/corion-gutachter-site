# Corion Gutachter Webseite

Dies ist das Repository für die offizielle Webseite von Corion Gutachter, einem Kfz-Sachverständigenbüro im Rhein-Main-Gebiet. Die Seite ist als moderne, interaktive Single-Page-Application (SPA) konzipiert, um potenziellen Kunden alle notwendigen Informationen bereitzustellen und eine einfache Kontaktaufnahme zu ermöglichen.

## ✨ Hauptfunktionen

- **Dynamischer Hero-Bereich:** Ein Video-Hintergrund mit Text-Overlay sorgt für einen modernen ersten Eindruck.
- **Detaillierte Leistungsübersicht:** Klare Darstellung aller angebotenen Gutachten und Dienstleistungen.
- **KI-gestützter Kunden-Chat:** Ein schwebender Chat-Button öffnet ein Modal mit einem KI-Assistenten (basierend auf der Gemini API), der Kundenfragen in Echtzeit beantwortet.
- **KI-Unfall-Assistent:** Ein interaktives Tool, das Nutzern nach Eingabe einer Unfallbeschreibung eine allgemeine Checkliste mit Handlungsempfehlungen generiert.
- **Umfassendes Kontaktformular:** Inklusive der Möglichkeit, Fotos von Schäden direkt hochzuladen.
- **Blog-Struktur:** Eine separate `blog.html` Seite zur Präsentation von Fachartikeln und Ratgebern.
- **Responsives Design:** Optimiert für eine nahtlose Darstellung auf Desktops, Tablets und Mobilgeräten.
- **SEO-optimiert:** Implementierung von semantischem HTML, Meta-Tags und umfangreichen strukturierten Daten (Schema.org JSON-LD) zur Verbesserung der Sichtbarkeit in Suchmaschinen.

## 🛠️ Verwendete Technologien

- **Frontend:**
  - HTML5
  - **Tailwind CSS:** Für das Utility-First-Styling.
  - **JavaScript (Vanilla JS):** Für die gesamte Interaktivität, einschließlich Modal-Steuerung, Chat-Logik und API-Aufrufe.
  - **Font Awesome:** Für Icons.
- **Backend (für Formular- & Chat-Verarbeitung):**
  - **PHP:** Zur Verarbeitung der Formulardaten und zum Speichern der Chat-Verläufe.
- **Externe APIs:**
  - **Google Gemini API:** Dient als Grundlage für den KI-Kunden-Chat und den KI-Unfall-Assistenten.

## 📁 Dateistruktur


/
|-- index.html                # Die Hauptseite (SPA)
|-- blog.html                 # Die Blog-Übersichtsseite
|-- servicii.html             # Die detaillierte Leistungsseite (kann integriert werden)
|-- process-form.php          # Script zur Verarbeitung des Kontaktformulars
|-- save-chat.php             # Script zum Speichern der KI-Chat-Verläufe
|-- /uploads/                 # Verzeichnis für hochgeladene Dateien aus dem Formular (muss erstellt werden)
|-- /chat_logs/               # Verzeichnis für gespeicherte Chat-Protokolle (muss erstellt werden)
|-- /media/                   # Verzeichnis für lokale Bilder und Videos
|   |-- CorionGutachter_On_Transparent (High).jpg
|   |-- Corion Gutachter Background V1.jpeg
|   -- (weitere Bilder...) -- (weitere HTML/CSS/JS Dateien bei Bedarf)


## 🚀 Einrichtung und Konfiguration

Um die Webseite lokal oder auf einem Server zu betreiben, sind folgende Schritte notwendig:

1.  **Webserver mit PHP:** Stellen Sie sicher, dass Ihr Hosting-Umfeld PHP unterstützt. Dies ist für die Verarbeitung des Kontaktformulars und das Speichern der Chats unerlässlich.

2.  **Verzeichnisse erstellen:** Erstellen Sie auf dem Server im Hauptverzeichnis des Projekts zwei neue Ordner:
    - `uploads`
    - `chat_logs`

3.  **Permisiuni (Berechtigungen) setzen:** Geben Sie dem Webserver Schreibrechte für die neu erstellten Verzeichnisse (`uploads` und `chat_logs`). Übliche Permisiuni sind `755` oder `775`.

4.  **E-Mail-Adresse konfigurieren:** Öffnen Sie die Datei `process-form.php` und passen Sie die Variable `$recipient_email` an die gewünschte Empfänger-E-Mail-Adresse an.

5.  **Platzhalter-URLs ersetzen:**
    - Ersetzen Sie die Platzhalter-Videoquelle in der `index.html` durch die URL Ihres finalen Videos.
    - Ersetzen Sie den Platzhalter-Link für das "Gutachter-Portal" in der Navigation (`index.html`, `blog.html` etc.) durch die tatsächliche URL Ihrer Anwendung.
    - Füllen Sie die Platzhalter-Informationen im Impressum und in der Datenschutzerklärung aus.

## 🤖 KI-Integration (Gemini API)

Die Webseite nutzt die Gemini API für zwei Hauptfunktionen:

1.  **KI-Kunden-Chat:** Ein system-prompt (`initialChatPrompt` im JavaScript) weist die KI an, als Assistent für Corion Gutachter zu agieren. Der Chatverlauf wird zur Kontexterhaltung bei Folgefragen mitgesendet.
2.  **KI-Unfall-Assistent:** Ein spezifischer Prompt, der die Nutzerbeschreibung des Unfalls enthält, wird an die KI gesendet, um eine allgemeine Checkliste zu generieren.

Der API-Schlüssel wird im JavaScript-Code als `const apiKey = "";` erwartet und sollte in der Produktionsumgebung sicher verwaltet werden (z.B. über serverseitige Umgebungsvariablen). In der Canvas-Umgebung wird dieser zur Laufzeit bereitgestellt.

---
Dieses README bietet eine grundlegende Übersicht. Für eine detaillierte Dokumentation der einzelnen Funktionen verweisen wir auf die Kommentare im Quellcode.
