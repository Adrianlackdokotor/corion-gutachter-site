import { MapPin, Phone, MessageCircle, Navigation } from "lucide-react";

const locations = [
  { city: "Frankfurt am Main", region: "Hessen" },
  { city: "Hofheim am Taunus", region: "Main-Taunus-Kreis" },
  { city: "Wiesbaden", region: "Hessen" },
  { city: "Mainz", region: "Rheinland-Pfalz" },
];

export default function StandorteSection() {
  return (
    <section id="standorte" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">
          Unsere <span className="text-[#c00000]">Standorte</span>
        </h2>
        <p className="section-subtitle">
          Wir sind im gesamten Rhein-Main-Gebiet für Sie im Einsatz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((loc) => (
            <div key={loc.city} className="card p-6 text-center">
              <MapPin className="w-10 h-10 text-[#c00000] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">{loc.city}</h3>
              <p className="text-sm text-[#9ca3af] mb-5">{loc.region}</p>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/4917683458274?text=Hallo%20Corion%20Gutachter,%20ich%20habe%20eine%20Anfrage%20aus%20${encodeURIComponent(loc.city)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#25D366] hover:bg-[#1DAE52] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href="tel:+4917683458274"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#374151] hover:bg-[#4b5563] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Anrufen
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.city + " Corion Gutachter")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-[#374151] hover:border-[#c00000] text-[#d1d5db] hover:text-[#c00000] text-sm font-semibold rounded-lg transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Route planen
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
