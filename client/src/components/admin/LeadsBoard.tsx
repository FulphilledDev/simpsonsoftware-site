"use client";

import { useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

// ── Types ──────────────────────────────────────────────────────────────────

type LeadStatus = "opened" | "held" | "dropped";

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
  status: LeadStatus;
  reason: string;
  screenedAt: string;
  issue: number | null;
  addr?: string;
  phone?: string;
  signal?: string;
  reach?: string;
};

type SortKey = "business" | "reviews" | "rating" | "lastReviewAt" | "prize";

const STATUS_META: Record<LeadStatus, { label: string; color: string; chip: string }> = {
  opened: { label: "In pipeline", color: "text-neon-cyan", chip: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" },
  held: { label: "Held", color: "text-amber-400", chip: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  dropped: { label: "Dropped", color: "text-white/40", chip: "bg-white/5 text-white/40 border-white/10" },
};

function PrizeBar({ prize }: { prize: Lead["prize"] }) {
  if (!prize) return <span className="text-white/20 text-xs">—</span>;
  return (
    <div className="flex items-center gap-2" title={Object.entries(prize.rows).map(([k, v]) => `${k}: ${v}/3`).join("\n")}>
      <div className="flex gap-[3px]">
        {Object.entries(prize.rows).map(([k, v]) => (
          <div key={k} className="w-2 h-4 rounded-[2px] bg-white/10 flex flex-col justify-end overflow-hidden">
            <div className={v >= 3 ? "bg-neon-cyan" : v === 2 ? "bg-neon-cyan/60" : v === 1 ? "bg-neon-cyan/30" : ""} style={{ height: `${(v / 3) * 100}%` }} />
          </div>
        ))}
      </div>
      <span className="text-white font-semibold tabular-nums">{prize.total}</span>
    </div>
  );
}

function DetailModal({ l, onClose }: { l: Lead; onClose: () => void }) {
  const m = STATUS_META[l.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
        <GlassCard padding="lg" className="space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{l.business}</h2>
              <p className="text-white/40 text-xs mt-0.5">{l.city} · {l.vertical}</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className={`px-2 py-0.5 rounded border font-semibold uppercase tracking-wider ${m.chip}`}>{m.label}</span>
            {l.noSite && <span className="px-2 py-0.5 rounded border font-semibold uppercase tracking-wider bg-neon-purple/10 text-neon-purple border-neon-purple/30">no site</span>}
            {l.issue != null && <span className="px-2 py-0.5 rounded border bg-white/5 text-white/50 border-white/10">issue #{l.issue}</span>}
          </div>
          <dl className="space-y-2.5 text-sm">
            <div><dt className="text-white/30 text-xs uppercase tracking-wider">Why it's here</dt><dd className="text-white/70 mt-0.5">{l.reason}</dd></div>
            {l.signal && <div><dt className="text-white/30 text-xs uppercase tracking-wider">Qualifying signal</dt><dd className="text-white/70 mt-0.5">{l.signal}</dd></div>}
            {l.reach && <div><dt className="text-white/30 text-xs uppercase tracking-wider">Reachability</dt><dd className="text-white/70 mt-0.5">{l.reach}</dd></div>}
            {l.prize && (
              <div>
                <dt className="text-white/30 text-xs uppercase tracking-wider">Prize {l.prize.total}/15</dt>
                <dd className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-1">
                  {Object.entries(l.prize.rows).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs"><span className="text-white/45">{k}</span><span className="text-white/80 tabular-nums">{v}/3</span></div>
                  ))}
                </dd>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs pt-1">
              <div className="flex justify-between"><span className="text-white/45">Rating</span><span className="text-white/80 tabular-nums">★ {l.rating} · {l.reviews}</span></div>
              <div className="flex justify-between"><span className="text-white/45">Last review</span><span className="text-white/80 tabular-nums">{l.lastReviewAt}</span></div>
              {l.phone && <div className="flex justify-between"><span className="text-white/45">Phone</span><span className="text-white/80">{l.phone}</span></div>}
              <div className="flex justify-between"><span className="text-white/45">Screened</span><span className="text-white/80 tabular-nums">{l.screenedAt}</span></div>
            </div>
            {l.addr && <p className="text-white/50 text-xs">{l.addr}</p>}
          </dl>
          <div className="flex flex-wrap gap-4 text-xs pt-1 border-t border-white/5">
            <a href={l.mapsUrl} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline pt-3">Maps ↗</a>
            {l.url && <a href={l.url} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline pt-3">Website ↗</a>}
            {l.issue != null && <a href={`https://github.com/FulphilledDev/redesign-pipeline/issues/${l.issue}`} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline pt-3">GitHub issue ↗</a>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Board ──────────────────────────────────────────────────────────────────

export default function LeadsBoard({ generatedAt, leads }: { generatedAt: string; leads: Lead[] }) {
  const cities = useMemo(() => [...new Set(leads.map((l) => l.city))].sort(), [leads]);
  const [city, setCity] = useState<string>(cities[0] ?? "");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "prize", dir: -1 });
  const [selected, setSelected] = useState<Lead | null>(null);

  const inCity = leads.filter((l) => l.city === city);
  const counts = {
    opened: inCity.filter((l) => l.status === "opened").length,
    held: inCity.filter((l) => l.status === "held").length,
    dropped: inCity.filter((l) => l.status === "dropped").length,
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const val = (l: Lead): string | number => {
      if (sort.key === "prize") return l.prize?.total ?? -1;
      if (sort.key === "business") return l.business.toLowerCase();
      return l[sort.key] ?? "";
    };
    return inCity
      .filter((l) => (statusFilter ? l.status === statusFilter : true))
      .filter((l) => (needle ? [l.business, l.signal, l.reason, l.reach].join(" ").toLowerCase().includes(needle) : true))
      .sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir);
  }, [inCity, statusFilter, q, sort]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "business" ? 1 : -1 }));
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");

  const COLS: { key: SortKey | null; label: string; hide?: string }[] = [
    { key: "business", label: "Business" },
    { key: "reviews", label: "Reviews", hide: "hidden sm:table-cell" },
    { key: "lastReviewAt", label: "Last review", hide: "hidden lg:table-cell" },
    { key: "prize", label: "Prize" },
    { key: null, label: "Status", hide: "hidden md:table-cell" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-1">
            {inCity.length} screened · published {generatedAt} · from <code className="text-white/55">redesign-pipeline</code>
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {cities.map((c) => (
            <button key={c} onClick={() => { setCity(c); setStatusFilter(null); }} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${c === city ? "bg-neon-cyan/15 text-neon-cyan font-semibold" : "text-white/50 hover:text-white"}`}>
              {c.replace(/, [A-Z]{2}$/, "")}
              <span className="ml-1.5 text-xs opacity-60 tabular-nums">{leads.filter((l) => l.city === c).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards double as status filters */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(counts) as LeadStatus[]).map((s) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} className="text-left">
            <GlassCard padding="md" className={statusFilter === s ? "ring-1 ring-neon-cyan/40" : ""}>
              <p className={`text-2xl font-bold ${STATUS_META[s].color}`}>{counts[s]}</p>
              <p className="text-white/40 text-xs mt-1">{STATUS_META[s].label}{statusFilter === s && <span className="text-neon-cyan/70"> · filtering</span>}</p>
            </GlassCard>
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search business, signal, reason…"
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-neon-cyan/40"
      />

      <GlassCard padding="none">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-white/30 text-sm">Nothing matches.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {COLS.map((c) => (
                    <th key={c.label} className={`px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider ${c.hide ?? ""}`}>
                      {c.key ? (
                        <button onClick={() => toggleSort(c.key!)} className="hover:text-white/60 uppercase tracking-wider font-semibold">{c.label}{arrow(c.key)}</button>
                      ) : c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((l) => (
                  <tr key={l.business} onClick={() => setSelected(l)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        {l.business}
                        {l.noSite && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-neon-purple bg-neon-purple/10 border border-neon-purple/30 rounded px-1.5 py-0.5">no site</span>}
                        {l.issue != null && <span className="ml-2 text-white/30 text-xs">#{l.issue}</span>}
                      </p>
                      <p className="text-white/35 text-xs truncate max-w-md mt-0.5">{l.signal ?? l.reason}</p>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs tabular-nums whitespace-nowrap hidden sm:table-cell">★ {l.rating} · {l.reviews}</td>
                    <td className="px-4 py-3 text-white/40 text-xs tabular-nums hidden lg:table-cell">{l.lastReviewAt}</td>
                    <td className="px-4 py-3"><PrizeBar prize={l.prize} /></td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wider ${STATUS_META[l.status].chip}`}>{STATUS_META[l.status].label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {selected && <DetailModal l={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
