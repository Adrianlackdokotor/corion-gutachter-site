import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Trash2, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  skillName?: string;
}

const SKILL_COLORS: Record<string, string> = {
  gutachter: "#c00000",
  sales: "#2563eb",
  academy: "#059669",
  general: "#6b7280",
};

function getSkillColorKey(skillName?: string): string {
  if (!skillName) return "general";
  const lower = skillName.toLowerCase();
  if (lower.includes("gutachter")) return "gutachter";
  if (lower.includes("vertrieb") || lower.includes("partner")) return "sales";
  if (lower.includes("academy")) return "academy";
  return "general";
}

export default function CoraChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const streamChat = useCallback(async (text: string, currentSessionId: string | null) => {
    if (isLoading) return;
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = `assistant_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", skillName: "" },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/orchestrator/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: currentSessionId }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let skillName = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "meta") {
              skillName = data.skillName || "";
              if (data.sessionId) {
                setSessionId(data.sessionId);
                currentSessionId = data.sessionId;
              }
            } else if (data.type === "content") {
              assistantContent += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent, skillName }
                    : m
                )
              );
            } else if (data.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: data.message || "Fehler aufgetreten." }
                    : m
                )
              );
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      if (!assistantContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Entschuldigung, keine Antwort erhalten." }
              : m
          )
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Chat error:", error);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.id === assistantId && !last.content) {
          return prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Entschuldigung, es gab ein Problem. Bitte versuchen Sie es erneut." }
              : m
          );
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    streamChat(trimmed, sessionId);
  };

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    if (sessionId) {
      fetch(`/api/orchestrator/conversation/${sessionId}`, { method: "DELETE" }).catch(() => {});
    }
    setSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-[#c00000] hover:bg-[#a00000] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all md:bottom-6"
          title="CORA — KI-Assistent"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[400px] h-[100dvh] md:h-[560px] flex flex-col bg-[#111827] md:rounded-2xl shadow-2xl border border-[#374151] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#c00000] to-[#8b0000]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">CORA</h3>
                <p className="text-white/70 text-[10px]">Corion Intelligent Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Chat löschen"
                >
                  <Trash2 className="w-4 h-4 text-white/80" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Schließen"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[#c00000]/20 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-[#c00000]" />
                </div>
                <h4 className="text-white font-semibold mb-2">Hallo! Ich bin CORA.</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Ihre KI-Assistentin von Corion Gutachter. Fragen Sie mich alles rund um
                  Kfz-Gutachten, Unfallhilfe, Partnerschaften oder Weiterbildung.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                  {[
                    "Was tun nach einem Unfall?",
                    "Welche Gutachten bieten Sie an?",
                    "Wie werde ich Partner?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => streamChat(q, sessionId)}
                      disabled={isLoading}
                      className="text-left text-xs px-3 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 border border-[#374151] transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#c00000] text-white rounded-br-md"
                      : "bg-[#1f2937] text-gray-200 rounded-bl-md border border-[#374151]"
                  }`}
                >
                  {msg.role === "assistant" && msg.skillName && (
                    <span
                      className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1.5 opacity-80"
                      style={{
                        backgroundColor: `${SKILL_COLORS[getSkillColorKey(msg.skillName)]}20`,
                        color: SKILL_COLORS[getSkillColorKey(msg.skillName)],
                      }}
                    >
                      {msg.skillName}
                    </span>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-[#1f2937] rounded-2xl rounded-bl-md px-4 py-3 border border-[#374151]">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-[#374151] bg-[#0f1521]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben..."
                className="flex-1 bg-[#1f2937] text-white text-sm rounded-xl px-4 py-2.5 border border-[#374151] focus:border-[#c00000] focus:outline-none placeholder-gray-500 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-[#c00000] hover:bg-[#a00000] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
