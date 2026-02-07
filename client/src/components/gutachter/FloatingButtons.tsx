import { MessageCircle } from "lucide-react";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex-col gap-3 hidden md:flex">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/4917683458274?text=Hallo%20Corion%20Gutachter,%20ich%20habe%20eine%20Anfrage."
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1DAE52] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
        title="WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
