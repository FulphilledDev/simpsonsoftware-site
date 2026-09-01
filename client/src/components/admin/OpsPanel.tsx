"use client";

import { useCallback, useEffect, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

// Manual mission control. Every button enqueues a CMD on the ops-queue issue; the desktop
// listener (scripts/check-queue.mjs, every 15 min) or the nightly conductor executes it.
// The dashboard commands; the desktop does. Nothing here runs on Vercel.

type Pending = { id: number; command: string; at: string };

function useQueue() {
  const [pending, setPending] = useState<Pending[] | null>(null);
  const [err, setErr] = useState("");
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/gh", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "failed");
      setPending(d.pending); setErr("");
    } catch (e) { setErr(e instanceof Error ? e.message : "failed"); }
  }, []);
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, [refresh]);
  return { pending, err, refresh };
}

function CmdButton({ label, build, refresh, accent = "cyan" }: { label: string; build: () => string | null; refresh: () => void; accent?: "cyan" | "purple" }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function go() {
    const command = build();
    if (!command) return;
    setState("sending");
    try {
      const r = await fetch("/api/admin/gh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command }) });
      if (!r.ok) throw new Error((await r.json()).error ?? "failed");
      setState("sent"); refresh(); setTimeout(() => setState("idle"), 2500);
    } catch { setState("error"); setTimeout(() => setState("idle"), 4000); }
  }
  const cls = accent === "cyan" ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/25" : "bg-neon-purple/15 text-neon-purple border-neon-purple/30 hover:bg-neon-purple/25";
  return (
    <button onClick={go} disabled={state === "sending"} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-40 ${cls}`}>
      {state === "sending" ? "Queuing…" : state === "sent" ? "Queued ✓" : state === "error" ? "Failed — retry" : label}
    </button>
  );
}

export default function OpsPanel() {
  const { pending, err, refresh } = useQueue();
  const [buildLimit, setBuildLimit] = useState("1");
  const [city, setCity] = useState("las vegas");
  const [vertical, setVertical] = useState("gym-fitness");
  const [custom, setCustom] = useState("");

  const input = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-neon-cyan/40";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ops</h1>
        <p className="text-white/40 text-sm mt-1">
          Manual control. Buttons queue commands on the <code className="text-white/55">ops-queue</code> issue; your desktop listener executes
          them within ~15 minutes (or instantly if you run <code className="text-white/55">node scripts/check-queue.mjs</code> in a terminal).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard padding="lg" className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Night run</h2>
          <p className="text-white/40 text-xs">The full conductor: inbox → advance every lead → publish → summary.</p>
          <div className="flex items-center gap-3">
            <label className="text-white/40 text-xs">Build limit</label>
            <input value={buildLimit} onChange={(e) => setBuildLimit(e.target.value)} className={`${input} w-16 text-center`} />
            <CmdButton label="Run night now" refresh={refresh} build={() => `night ${parseInt(buildLimit) || 1}`} />
          </div>
        </GlassCard>

        <GlassCard padding="lg" className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Source leads</h2>
          <p className="text-white/40 text-xs">Runs /leads for a city + vertical, capped by scoreboard capacity.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <input value={city} onChange={(e) => setCity(e.target.value)} className={`${input} w-36`} placeholder="city" />
            <input value={vertical} onChange={(e) => setVertical(e.target.value)} className={`${input} w-36`} placeholder="vertical" />
            <CmdButton label="Run /leads" accent="purple" refresh={refresh} build={() => (city.trim() && vertical.trim() ? `leads "${city.trim()}" ${vertical.trim()}` : null)} />
          </div>
        </GlassCard>

        <GlassCard padding="lg" className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Publish</h2>
          <p className="text-white/40 text-xs">Regenerate both feeds, build the site, push both repos green.</p>
          <CmdButton label="Publish & deploy" refresh={refresh} build={() => "publish"} />
        </GlassCard>

        <GlassCard padding="lg" className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Custom command</h2>
          <p className="text-white/40 text-xs">Free-form instruction for the pipeline agent — e.g. <em>rebuild #2 with a lighter hero</em>.</p>
          <div className="flex gap-2">
            <input value={custom} onChange={(e) => setCustom(e.target.value)} className={`${input} flex-1`} placeholder="instruction…" />
            <CmdButton label="Queue it" accent="purple" refresh={refresh} build={() => { const c = custom.trim(); if (c) setCustom(""); return c || null; }} />
          </div>
        </GlassCard>
      </div>

      <GlassCard padding="lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Queued — awaiting the desktop</h2>
          <button onClick={refresh} className="text-xs text-white/40 hover:text-white/70">refresh</button>
        </div>
        {err ? <p className="text-red-400/80 text-sm">{err}</p>
          : pending === null ? <p className="text-white/30 text-sm">Loading…</p>
          : pending.length === 0 ? <p className="text-white/30 text-sm">Queue is empty — everything queued has been executed.</p>
          : (
            <ul className="space-y-2">
              {pending.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <code className="text-white/80">{p.command}</code>
                  <span className="text-white/30 text-xs tabular-nums">{new Date(p.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
      </GlassCard>
    </div>
  );
}
