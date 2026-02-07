import { useEffect } from "react";
import Navbar from "@/components/gutachter/Navbar";
import HeroSection from "@/components/gutachter/HeroSection";
import LeistungenSection from "@/components/gutachter/LeistungenSection";
import UeberUnsSection from "@/components/gutachter/UeberUnsSection";
import UnfallAssistentSection from "@/components/gutachter/UnfallAssistentSection";
import StandorteSection from "@/components/gutachter/StandorteSection";
import BlogPreviewSection from "@/components/gutachter/BlogPreviewSection";
import KontaktSection from "@/components/gutachter/KontaktSection";
import FooterSection from "@/components/gutachter/FooterSection";
import FloatingButtons from "@/components/gutachter/FloatingButtons";
import MobileStickyFooter from "@/components/gutachter/MobileStickyFooter";
import JsonLdSchema from "@/components/gutachter/JsonLdSchema";
import CoraChat from "@/components/gutachter/CoraChat";

export default function GutachterPage() {
  useEffect(() => {
    // Scroll la secțiunea din hash la încărcarea paginii
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#111827]">
      <JsonLdSchema />
      <Navbar />
      <main>
        <HeroSection />
        <LeistungenSection />
        <UeberUnsSection />
        <UnfallAssistentSection />
        <StandorteSection />
        <BlogPreviewSection />
        <KontaktSection />
      </main>
      <FooterSection />
      <FloatingButtons />
      <CoraChat />
      <MobileStickyFooter />
    </div>
  );
}
