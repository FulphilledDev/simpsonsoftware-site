"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import type { Redesign } from "@/lib/redesigns";

const STATUS_CHIP: Record<string, string> = {
  built: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  pitched: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "handed-off": "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
  declined: "bg-white/5 text-white/40 border-white/10",
  "no-reply": "bg-white/5 text-white/50 border-white/15",
};

// Chip text where the raw status isn't self-explanatory.
const STATUS_LABEL: Record<string, string> = {
  built: "built — in review",
};

function FeedbackBox({ issue, business }: { issue: number | undefined; business: string }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (issue == null) {
    return <p className="text-white/25 text-xs">No linked issue — feedback lands after the next publish adds it.</p>;
  }

  async function send() {
    if (!text.trim()) return;
    setState("sending");
    try {
      const r = await fetch("/api/admin/gh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumber: issue, comment: `**Feedback from Philip (dashboard)** on ${business}:\n\n${text.trim()}` }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "failed");
      setState("sent");
      setMsg(`Posted to issue #${issue} — the agent acts on it next run.`);
      setText("");
    } catch (e) {
      setState("error");
      setMsg(e instanceof Error ? e.message : "Failed to post");
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); if (state !== "idle") setState("idle"); }}
        placeholder="Design feedback — e.g. make the hero the climbing wall…"
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-neon-cyan/40 resize-y"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={send}
          disabled={state === "sending" || !text.trim()}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 disabled:opacity-40 transition-colors"
        >
          {state === "sending" ? "Posting…" : "Send to pipeline"}
        </button>
        {state === "sent" && <span className="text-emerald-400/80 text-xs">{msg}</span>}
        {state === "error" && <span className="text-red-400/80 text-xs">{msg}</span>}
      </div>
    </div>
  );
}

export default function BuildsBoard({ redesigns }: { redesigns: Redesign[] }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Redesigns · Builds</h1>
        <p className="text-white/40 text-sm mt-1">
          Every built demo — review it, then send feedback straight to its pipeline issue.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {redesigns.map((r) => (
          <GlassCard key={r.slug} padding="none" className="overflow-hidden">
            <a href={r.demoUrl} target="_blank" rel="noreferrer" className="block relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.afterImage || r.beforeImage} alt={`${r.business} redesign`} className="w-full aspect-[16/9] object-cover object-top group-hover:opacity-90 transition-opacity" />
              <span className="absolute bottom-2 right-2 text-[11px] px-2 py-0.5 rounded bg-black/60 text-white/80">open demo ↗</span>
            </a>
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-white font-semibold">{r.business}</h2>
                  <p className="text-white/35 text-xs">{r.city} · {r.price != null ? `${r.price}` : "not yet priced"}{r.pitchedAt ? ` · pitched ${r.pitchedAt}` : ""}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wider whitespace-nowrap ${STATUS_CHIP[r.status] ?? STATUS_CHIP.declined}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{r.whatChanged}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <a href={r.demoUrl} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Demo ↗</a>
                <a href={`/projects/${r.slug}-redesign`} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Case study ↗</a>
                {r.issue != null && <a href={`https://github.com/FulphilledDev/redesign-pipeline/issues/${r.issue}`} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Issue #{r.issue} ↗</a>}
              </div>
              <FeedbackBox issue={r.issue} business={r.business} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
