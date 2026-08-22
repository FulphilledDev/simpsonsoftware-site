"use client";

import { useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

type Lead = {
  business: string;
  city: string;
  vertical: string;
  url: string | null;
  mapsUrl: string;
  reviews: number;
  rating: number;
  lastReviewAt: string;
  prize: { rows: Record<string, number>; total: number } | null;
  noSite: boolean;
  status: "opened" | "held" | "dropped";
  reason: string;
  screenedAt: string;
  issue: number | null;
  addr?: string;
  phone?: string;
  signal?: string;
  reach?: string;
};

const STATUS_META = {
  opened: { label: "In the pipeline", tone: "text-neon-cyan", ring: "border-t-neon-cyan/50" },
  held: { label: "Held for next month", tone: "text-amber-400", ring: "border-t-amber-500/40" },
  dropped: { label: "Dropped at pre-screen", tone: "text-white/35", ring: "border-t-white/10" },
} as const;

function PrizeBar({ prize }: { prize: Lead["prize"] }) {
  if (!prize) return <span className="text-white/25 text-xs">not scored</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[3px]" title={Object.entries(prize.rows).map(([k, v]) => `${k}: ${v}/3`).join("\n")}>
        {Object.entries(prize.rows).map(([k, v]) => (
          <div key={k} className="w-2.5 h-5 rounded-sm bg-white/10 flex flex-col justify-end overflow-hidden">
            <div className={v >= 3 ? "bg-neon-cyan" : v === 2 ? "bg-neon-cyan/60" : v === 1 ? "bg-neon-cyan/30" : "bg-transparent"} style={{ height: `${(v / 3) * 100}%` }} />
          </div>
        ))}
      </div>
      <span className="text-white font-semibold text-sm tabular-nums">{prize.total}</span>
      <span className="text-white/30 text-xs">/15</span>
    </div>
  );
}

function LeadRow({ l }: { l: Lead }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full text-left py-3 px-1 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 items-center hover:bg-white/[0.03] rounded transition-colors">
        <div className="min-w-0">
          <span className="text-white font-medium text-sm">{l.business}</span>
          {l.noSite && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-neon-purple bg-neon-purple/10 border border-neon-purple/30 rounded px-1.5 py-0.5">no site</span>}
          {l.issue != null && <span className="ml-2 text-white/30 text-xs">#{l.issue}</span>}
          <p className="text-white/40 text-xs truncate mt-0.5">{l.signal ?? l.reason}</p>
        </div>
        <div className="hidden sm:block text-white/40 text-xs tabular-nums whitespace-nowrap">★ {l.rating} · {l.reviews} reviews</div>
        <PrizeBar prize={l.prize} />
      </button>
      {open && (
        <div className="px-1 pb-4 text-xs text-white/50 space-y-1.5">
          <p><span className="text-white/30">Why here:</span> {l.reason}</p>
          {l.reach && <p><span className="text-white/30">Reach:</span> {l.reach}</p>}
          {l.addr && <p><span className="text-white/30">Address:</span> {l.addr}</p>}
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            {l.phone && <span>{l.phone}</span>}
            <span>last review {l.lastReviewAt}</span>
            <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Maps ↗</a>
            {l.url && <a href={l.url} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Site ↗</a>}
            {l.issue != null && <a href={`https://github.com/FulphilledDev/redesign-pipeline/issues/${l.issue}`} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Issue #{l.issue} ↗</a>}
          </p>
        </div>
      )}
    </div>
  );
}

export default function LeadsBoard({ generatedAt, leads }: { generatedAt: string; leads: Lead[] }) {
  const cities = useMemo(() => [...new Set(leads.map((l) => l.city))].sort(), [leads]);
  const [city, setCity] = useState<string>(cities[0] ?? "");
  const inCity = leads.filter((l) => l.city === city);
  const sections = (["opened", "held", "dropped"] as const).map((s) => ({
    key: s,
    ...STATUS_META[s],
    rows: inCity.filter((l) => l.status === s).sort((a, b) => (b.prize?.total ?? -1) - (a.prize?.total ?? -1)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-1">
            From <code className="text-white/60">redesign-pipeline</code> · published {generatedAt} · read-only — approve/deny lives on the GitHub issue for now
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {cities.map((c) => (
            <button key={c} onClick={() => setCity(c)} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${c === city ? "bg-neon-cyan/15 text-neon-cyan font-semibold" : "text-white/50 hover:text-white"}`}>
              {c.replace(/, [A-Z]{2}$/, "")}
              <span className="ml-1.5 text-xs opacity-60 tabular-nums">{leads.filter((l) => l.city === c).length}</span>
            </button>
          ))}
        </div>
      </div>

      {sections.map((s) => (
        <GlassCard key={s.key} padding="lg" className={`border-t-2 ${s.ring}`}>
          <h2 className={`text-sm font-semibold mb-2 ${s.tone}`}>
            {s.label} <span className="opacity-50 tabular-nums">({s.rows.length})</span>
          </h2>
          {s.rows.length === 0 ? (
            <p className="text-white/25 text-sm py-2">none</p>
          ) : (
            s.rows.map((l) => <LeadRow key={l.business} l={l} />)
          )}
        </GlassCard>
      ))}
    </div>
  );
}
