import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Video background placeholder cu gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#1a1a2e] to-[#16213e]">
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(17, 24, 39, 0.75)" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-24">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Corion Gutachter: Ihr Partner für{" "}
          <span className="text-[#c00000]">Kfz-Gutachten im Rhein-Main-Gebiet</span>
        </h1>
        <p className="text-lg md:text-xl text-[#d1d5db] mb-10 max-w-2xl mx-auto">
          Schnell, professionell und unabhängig. Wir erstellen Schadengutachten und
          Wertgutachten für Ihr Fahrzeug in Frankfurt, Hofheim, Wiesbaden & Mainz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo("#leistungen")}
            className="px-8 py-4 bg-[#c00000] hover:bg-[#a00000] text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Unsere Leistungen
          </button>
          <button
            onClick={() => scrollTo("#kontakt")}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-[#c00000] font-semibold rounded-lg transition-colors text-lg"
          >
            Direkt anfragen
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-[#9ca3af]" />
      </div>
    </section>
  );
}
