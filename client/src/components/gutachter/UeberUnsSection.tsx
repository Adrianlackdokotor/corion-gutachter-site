import { Car, Award, Monitor, TrendingUp } from "lucide-react";

const competencies = [
  { icon: Car, title: "Karosserie- & Lackierarbeiten", text: "Modernste Techniken zur nachhaltigen Reparatur und Wiederherstellung des Originalzustands." },
  { icon: Award, title: "Zertifizierte KFZ-Gutachten", text: "Unfall- und Schadensbewertungen, die von Versicherungen und Gerichten anerkannt sind." },
  { icon: Monitor, title: "Digitale & KI-gestützte Analyse", text: "Erkennung versteckter Schäden mittels modernster Technologie und KI-Verfahren." },
  { icon: TrendingUp, title: "Restwert-/Marktwertgutachten", text: "Präzise und faire Bewertungen für Kauf, Verkauf oder Versicherungseinstufung." },
];

export default function UeberUnsSection() {
  return (
    <section id="ueber-uns" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-16 lg:items-center">
          <div className="lg:col-span-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Über <span className="text-[#c00000]">Corion Gutachter</span> & den Lackdoktor
            </h2>
            <p className="text-lg text-[#d1d5db] mb-8 leading-relaxed">
              Mit über 25 Jahren Erfahrung in der Karosserie- und Autolackierbranche und drei Jahren als
              zertifizierter KFZ-Gutachter (Marke „Lackdoktor") erstelle ich präzise Unfall- und
              Schadensgutachten, die selbst versteckte Schäden zuverlässig erkennen. Dank digitaler
              Dokumentation und KI-gestützter Analyseverfahren biete ich Ihnen faire Restwert- und
              Marktwertgutachten sowie eine transparente Schadensermittlung, die weit über den ersten
              Blick hinausgeht.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Unsere Kernkompetenzen:</h3>
            <ul className="space-y-4">
              {competencies.map((comp) => (
                <li key={comp.title} className="flex items-start gap-3">
                  <comp.icon className="w-5 h-5 text-[#c00000] mt-1 shrink-0" />
                  <span className="text-[#d1d5db]">
                    <strong className="text-white">{comp.title}:</strong> {comp.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 mt-10 lg:mt-0">
            <div className="bg-[#1f2937] border border-[#374151] rounded-xl p-8 text-center">
              <div className="w-32 h-32 bg-[#374151] rounded-full mx-auto mb-6 flex items-center justify-center">
                <Award className="w-16 h-16 text-[#c00000]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">25+ Jahre Erfahrung</h4>
              <p className="text-[#9ca3af]">Karosserie, Lack & Kfz-Gutachten</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-[#111827] rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#c00000]">500+</div>
                  <div className="text-xs text-[#9ca3af]">Gutachten erstellt</div>
                </div>
                <div className="bg-[#111827] rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#c00000]">4</div>
                  <div className="text-xs text-[#9ca3af]">Standorte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
