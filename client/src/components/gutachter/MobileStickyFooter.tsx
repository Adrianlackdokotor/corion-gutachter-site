import { Phone, MessageCircle, ExternalLink } from "lucide-react";

export default function MobileStickyFooter() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111827] border-t border-[#374151] py-2 px-4">
      <div className="flex items-center justify-around">
        <a
          href="tel:+4917683458274"
          className="flex flex-col items-center gap-1 text-[#d1d5db] hover:text-[#c00000] transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="text-xs font-semibold">Anrufen</span>
        </a>
        <a
          href="https://wa.me/4917683458274?text=Hallo%20Corion%20Gutachter,%20ich%20habe%20eine%20Anfrage."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-[#25D366]"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>
        <a
          href="/partner"
          className="flex flex-col items-center gap-1 text-[#c00000]"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="text-xs font-semibold">Portal</span>
        </a>
      </div>
    </div>
  );
}
