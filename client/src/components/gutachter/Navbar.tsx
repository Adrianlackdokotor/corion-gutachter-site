import { useState } from "react";
import { Menu, X, ExternalLink } from "lucide-react";

const navLinks = [
  { label: "Start", href: "#hero" },
  { label: "Leistungen", href: "#leistungen" },
  { label: "Über Uns", href: "#ueber-uns" },
  { label: "KI-Unfall-Assistent", href: "#unfall-assistent" },
  { label: "Standorte", href: "#standorte" },
  { label: "Blog", href: "#blog" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#374151]" style={{ backgroundColor: "rgba(17, 24, 39, 0.95)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo("#hero"); }} className="text-2xl font-bold text-white">
            <span className="text-[#c00000]">Corion</span> Gutachter
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                className="px-3 py-2 text-sm font-semibold text-[#d1d5db] hover:text-[#c00000] transition-colors rounded-md"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/partner"
              className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-[#c00000] hover:bg-[#a00000] rounded-md transition-colors inline-flex items-center gap-1"
            >
              Gutachter-Portal <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Menü öffnen"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#374151]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                className="block px-3 py-2 text-base font-semibold text-[#d1d5db] hover:text-[#c00000] rounded-md"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/partner"
              className="block px-3 py-2 text-base font-semibold text-[#c00000]"
            >
              Gutachter-Portal <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
