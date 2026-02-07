import { useState } from "react";

export default function FooterSection() {
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);

  return (
    <>
      <footer className="bg-[#0a0f1a] border-t border-[#374151] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#9ca3af] text-sm">
          <p>&copy; {new Date().getFullYear()} Corion Gutachter. Alle Rechte vorbehalten.</p>
          <p className="mt-2 space-x-4">
            <button onClick={() => setShowImpressum(true)} className="hover:text-[#c00000] transition-colors underline">
              Impressum
            </button>
            <button onClick={() => setShowDatenschutz(true)} className="hover:text-[#c00000] transition-colors underline">
              Datenschutz
            </button>
          </p>
        </div>
      </footer>

      {/* Impressum Modal */}
      {showImpressum && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowImpressum(false)}>
          <div className="bg-[#1f2937] border border-[#c00000] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Impressum</h2>
              <button onClick={() => setShowImpressum(false)} className="text-[#9ca3af] hover:text-white text-2xl">&times;</button>
            </div>
            <div className="text-[#d1d5db] space-y-3">
              <p><strong className="text-white">Corion Gutachter</strong></p>
              <p>Kfz-Sachverständigenbüro & Lackdoktor</p>
              <p>Rhein-Main-Gebiet, Deutschland</p>
              <p>Telefon: +49 176 83458274</p>
              <p>E-Mail: info@corion-gutachter.de</p>
              <p className="mt-4 text-sm text-[#9ca3af]">
                Inhaltlich Verantwortlicher gemäß § 55 Abs. 2 RStV: Corion Gutachter Team
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Datenschutz Modal */}
      {showDatenschutz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowDatenschutz(false)}>
          <div className="bg-[#1f2937] border border-[#c00000] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Datenschutzerklärung</h2>
              <button onClick={() => setShowDatenschutz(false)} className="text-[#9ca3af] hover:text-white text-2xl">&times;</button>
            </div>
            <div className="text-[#d1d5db] space-y-4 text-sm leading-relaxed">
              <h3 className="text-lg font-semibold text-white">1. Datenschutz auf einen Blick</h3>
              <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.</p>
              <h3 className="text-lg font-semibold text-white">2. Datenerfassung auf unserer Website</h3>
              <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>
              <h3 className="text-lg font-semibold text-white">3. Ihre Rechte</h3>
              <p>Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.</p>
              <h3 className="text-lg font-semibold text-white">4. Kontakt</h3>
              <p>Bei Fragen zum Datenschutz kontaktieren Sie uns unter: info@corion-gutachter.de</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
