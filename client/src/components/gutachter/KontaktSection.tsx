import { useState, type FormEvent } from "react";
import { Phone, Mail, MessageCircle, Clock, Send, CheckCircle, AlertTriangle } from "lucide-react";

export default function KontaktSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    privacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError("Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return;
    }
    if (!formData.privacy) {
      setError("Bitte stimmen Sie der Datenschutzerklärung zu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gutachter/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "", privacy: false });
      } else {
        setError(data.message || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#374151] border border-[#4b5563] text-[#e5e7eb] rounded-lg px-4 py-3 focus:outline-none focus:border-[#c00000] focus:ring-2 focus:ring-[#c00000] placeholder:text-[#9ca3af]";

  return (
    <section id="kontakt" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">
          <span className="text-[#c00000]">Kontakt</span> aufnehmen
        </h2>
        <p className="section-subtitle">
          Senden Sie uns Ihre Anfrage und wir melden uns schnellstmöglich bei Ihnen.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formular */}
          <div className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nachricht gesendet!</h3>
                  <p className="text-[#d1d5db]">
                    Vielen Dank! Wir melden uns schnellstmöglich bei Ihnen.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 px-6 py-2 bg-[#c00000] hover:bg-[#a00000] text-white rounded-lg"
                  >
                    Neue Anfrage
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Ihr Name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-1">E-Mail *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="ihre@email.de"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+49..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-1">Betreff</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                        placeholder="Gutachten-Anfrage"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Nachricht</label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Beschreiben Sie Ihr Anliegen..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={formData.privacy}
                      onChange={(e) => setFormData((p) => ({ ...p, privacy: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-[#c00000]"
                    />
                    <label htmlFor="privacy" className="text-sm text-[#9ca3af]">
                      Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Daten zu. *
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-400 text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#c00000] hover:bg-[#a00000] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loader" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Nachricht senden
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Info contact lateral */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Direkt erreichen</h3>
              <div className="space-y-4">
                <a href="tel:+4917683458274" className="flex items-center gap-3 text-[#d1d5db] hover:text-[#c00000] transition-colors">
                  <Phone className="w-5 h-5 text-[#c00000]" />
                  <span>+49 176 83458274</span>
                </a>
                <a href="mailto:info@corion-gutachter.de" className="flex items-center gap-3 text-[#d1d5db] hover:text-[#c00000] transition-colors">
                  <Mail className="w-5 h-5 text-[#c00000]" />
                  <span>info@corion-gutachter.de</span>
                </a>
                <div className="flex items-center gap-3 text-[#d1d5db]">
                  <Clock className="w-5 h-5 text-[#c00000]" />
                  <div>
                    <p>Mo–Fr: 08:00–18:00</p>
                    <p>Sa: 09:00–14:00</p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/4917683458274?text=Hallo%20Corion%20Gutachter,%20ich%20habe%20eine%20Anfrage."
              target="_blank"
              rel="noopener noreferrer"
              className="card p-6 flex items-center gap-3 bg-[#25D366] hover:bg-[#1DAE52] border-none text-white font-semibold transition-colors"
              style={{ transform: "none", boxShadow: "none" }}
            >
              <MessageCircle className="w-6 h-6" />
              Direkt per WhatsApp kontaktieren
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
