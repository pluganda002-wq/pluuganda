import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ASSISTANT_PROMPTS } from "@/data/plu";

type Message = { role: "user" | "assistant"; text: string };

function replyFor(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("register") || q.includes("member")) {
    return "Open Membership from Home or Services. Enter your name, phone and district. After registration you will receive a provisional PLU ID; verification syncs with the Secretariat database in the next release.";
  }
  if (q.includes("baraza") || q.includes("district")) {
    return "District Barazas are listed under Programmes. Your district mobiliser will publish dates in Social and via official PLU channels. You can register interest from the Youth hub for combined forums.";
  }
  if (q.includes("corruption") || q.includes("report")) {
    return "Go to Integrity → Submit secure report. You can track public case statuses on the case tracker. Never share sensitive evidence in open chats.";
  }
  if (q.includes("youth")) {
    return "Visit Youth leagues for upcoming forums and service days. The Youth programme page explains Listen → Organise → Act for young patriots.";
  }
  if (q.includes("endorse")) {
    return "Use Presidential endorsement on Home to add your message. Totals reflect national campaign statistics published on plu.org.ug.";
  }
  if (q.includes("ugo") || q.includes("tugende") || q.includes("ride")) {
    return "Tugende is live in the app: open Mobility or Home → Tugende. Sign in with Telegram, enable GPS, wallet top-up, UGX 1,000/km. UGo Ride is still onboarding.";
  }
  if (q.includes("tourism") || q.includes("travel") || q.includes("visit uganda")) {
    return "Open Tourism from Home or Services for wildlife, culture, adventure and city experiences, plus PLU travel packages. Link trips with Mobility when partners go live.";
  }
  if (q.includes("buy uganda") || q.includes("bubu") || q.includes("build uganda") || q.includes("local product")) {
    return "Buy Uganda, Build Uganda is under Services → Buy Uganda. Browse categories, featured suppliers, and submit your business for the BUBU directory.";
  }
  return "I'm PLU BOT — your guide to membership, programmes, integrity reporting, endorsements and services. Try a quick prompt below or ask in plain language.";
}

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Karibu! I coordinate PLU services in this Mini App. How can I help you serve Uganda today?",
    },
  ]);
  const [input, setInput] = useState("");

  function ask(text: string) {
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", text: replyFor(text) },
    ]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    ask(text);
  }

  return (
    <main className="page assistant">
      <PageHeader title="PLU Assistant" subtitle="Intelligent coordinator for programmes, membership and services." />

      <div className="assistant__prompts">
        {ASSISTANT_PROMPTS.map((p) => (
          <button key={p} type="button" className="assistant__chip" onClick={() => ask(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="assistant__thread">
        {messages.map((m, i) => (
          <div key={i} className={`assistant__bubble assistant__bubble--${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="assistant__form" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask PLU BOT..."
          aria-label="Message"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </main>
  );
}
