import { useState } from "react";
import { Bot, AlertTriangle, Send } from "lucide-react";

export default function UnfallAssistentSection() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Bitte geben Sie eine kurze Beschreibung des Unfalls ein.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/gutachter/unfall-assistent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setResult(data.advice);
      } else {
        setError(data.message || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setError("Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  // Simplu Markdown → HTML
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h4 class="text-lg font-semibold text-white mt-4 mb-2">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="text-xl font-semibold text-white mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-[#d1d5db]">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-[#d1d5db]">$2</li>')
      .replace(/\n/g, "<br>");
  };

  return (
    <section id="unfall-assistent" className="py-16 md:py-24 bg-[#0d1117]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Bot className="w-16 h-16 text-[#c00000] mx-auto mb-4" />
          <h2 className="section-title">KI-Unfall-Assistent</h2>
          <p className="section-subtitle">
            Beschreiben Sie Ihren Unfall und erhalten Sie eine individuelle Checkliste mit wichtigen
            Schritten.
          </p>
        </div>

        <div className="card p-6 md:p-8">
          <label htmlFor="accident-desc" className="block text-sm font-semibold text-white mb-2">
            Beschreiben Sie kurz Ihren Unfall:
          </label>
          <textarea
            id="accident-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="z.B. Auffahrunfall auf der A5, Schaden an der Stoßstange und Heckklappe..."
            className="w-full bg-[#374151] border border-[#4b5563] text-[#e5e7eb] rounded-lg px-4 py-3 focus:outline-none focus:border-[#c00000] focus:ring-2 focus:ring-[#c00000] placeholder:text-[#9ca3af] resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full py-3 bg-[#c00000] hover:bg-[#a00000] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="loader" />
                Wird generiert...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ratgeber erhalten
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-[#111827] border border-[#374151] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Ihre Unfall-Checkliste:</h3>
              <div
                className="text-sm leading-relaxed text-[#d1d5db]"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}
              />
            </div>
          )}

          <p className="mt-4 text-xs text-[#9ca3af] flex items-start gap-1">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Hinweis: Dies ist keine Rechtsberatung. Die generierten Informationen dienen nur zur
              allgemeinen Orientierung. Kontaktieren Sie uns für eine{" "}
              <a href="#kontakt" className="text-[#c00000] underline">
                professionelle Begutachtung
              </a>
              .
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
