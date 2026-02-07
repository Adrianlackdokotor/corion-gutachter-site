import { Shield, BarChart3, Cpu, Paintbrush, MessageCircle, FileText } from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Unfall- & Schadensgutachten",
    description: "Präzise Gutachten zur Beweissicherung und Schadensregulierung, auch bei versteckten Schäden dank KI-Analyse. Von Versicherungen anerkannt.",
  },
  {
    icon: BarChart3,
    title: "Restwert-/Marktwertgutachten",
    description: "Marktgerechte Wertermittlung für Gebrauchtwagen, Unfallwagen und Oldtimer. Fundierte Basis für Kauf, Verkauf oder Versicherung.",
  },
  {
    icon: Cpu,
    title: "Digitale & KI-Analyse",
    description: "Aufspüren von Rahmenverziehungen, Strukturschäden und Lackmängeln durch modernste digitale Dokumentation und KI-gestützte Verfahren.",
  },
  {
    icon: Paintbrush,
    title: "Karosserie & Lack",
    description: "Expertise aus über 25 Jahren Erfahrung in Karosserie- & Lackierarbeiten für eine umfassende Schadensbeurteilung und Werterhaltung.",
  },
  {
    icon: MessageCircle,
    title: "Kostenlose Erstberatung",
    description: "Unverbindliche und kostenfreie Erstberatung zu Ihrem Schadenfall oder Bewertungsanliegen. Wir klären Ihre Fragen und zeigen Lösungswege auf.",
  },
  {
    icon: FileText,
    title: "Kostenvoranschläge",
    description: "Erstellung qualifizierter Kostenvoranschläge für Reparaturen, ideal auch zur Abrechnung von Bagatellschäden direkt mit der Versicherung.",
  },
];

export default function LeistungenSection() {
  return (
    <section id="leistungen" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">
          Unsere <span className="text-[#c00000]">Leistungen</span>
        </h2>
        <p className="section-subtitle">
          Professionelle Kfz-Gutachten und Dienstleistungen für Ihre Sicherheit und Ihr Recht.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <article key={service.title} className="card p-6 cursor-default">
              <div className="mb-4 text-center">
                <service.icon className="w-12 h-12 text-[#c00000] mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 text-center">
                {service.title}
              </h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed text-center">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
