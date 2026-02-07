import { Calendar, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "Wann ist ein Schadengutachten nach einem Unfall sinnvoll?",
    excerpt: "Nach einem Verkehrsunfall stellt sich oft die Frage: Brauche ich ein Gutachten? Die Antwort lautet in den meisten Fällen: Ja!",
    date: "10. Juni 2024",
    category: "Ratgeber",
  },
  {
    title: "Die Bedeutung der KI in der modernen Fahrzeugbewertung",
    excerpt: "Künstliche Intelligenz revolutioniert die Art, wie wir Fahrzeugschäden erkennen und bewerten. Erfahren Sie mehr über unsere KI-gestützten Verfahren.",
    date: "25. Mai 2024",
    category: "Technologie",
  },
  {
    title: "Tipps vom Lackdoktor: Lackpflege und Werterhalt",
    excerpt: "Mit der richtigen Pflege bleibt Ihr Fahrzeuglack lange schön und der Wiederverkaufswert hoch. Unsere besten Tipps für Sie.",
    date: "12. Mai 2024",
    category: "Tipps",
  },
];

export default function BlogPreviewSection() {
  return (
    <section id="blog" className="py-16 md:py-24 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">
          Aktuelles & <span className="text-[#c00000]">Wissenswertes</span>
        </h2>
        <p className="section-subtitle">
          Nützliche Tipps und aktuelle Informationen rund um Kfz-Gutachten.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article key={post.title} className="card overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#374151] to-[#1f2937] flex items-center justify-center">
                <span className="text-[#9ca3af] text-sm">{post.category}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-[#9ca3af] mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> Corion Gutachter
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c00000] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[#9ca3af] mb-4 leading-relaxed">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#c00000] hover:text-[#a00000] transition-colors cursor-pointer">
                  Weiterlesen <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
