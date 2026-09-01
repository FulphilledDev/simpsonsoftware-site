"use client";

import GlassCard from "@/components/ui/GlassCard";
import { redesignMetrics as m, allRedesigns } from "@/lib/redesigns";

function Stat({ label, value, sub, accent = "cyan" }: { label: string; value: string; sub?: string; accent?: "cyan" | "purple" | "amber" }) {
  const color = accent === "cyan" ? "text-neon-cyan" : accent === "purple" ? "text-neon-purple" : "text-amber-400";
  return (
    <GlassCard padding="md">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-white/40 text-xs mt-1">{label}</p>
      {sub && <p className="text-white/25 text-[11px] mt-0.5">{sub}</p>}
    </GlassCard>
  );
}

export default function RedesignMetricsPage() {
  const c = m.counts;
  const pitched = c.pitched + c.paid + c["handed-off"] + c.declined + c["no-reply"];
  const closed = c.paid + c["handed-off"];
  const closeRate = pitched ? Math.round((closed / pitched) * 100) : null;
  const open = allRedesigns.filter((r) => r.status === "pitched");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Redesigns · Metrics</h1>
          <p className="text-white/40 text-sm mt-1">
            {c.total} built · from <code className="text-white/60">redesign-pipeline</code> · published {m.generatedAt}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Built" value={String(c.total)} sub={`${open.length} awaiting an owner`} />
        <Stat label="Paid" value={String(closed)} sub={closeRate === null ? "no pitches resolved yet" : `${closeRate}% close rate`} accent="purple" />
        <Stat label="Revenue" value={`$${m.revenue.toLocaleString()}`} sub="one-time fees collected" accent="amber" />
        <Stat label="Avg build time" value={m.avgWallMinutes ? `${(m.avgWallMinutes / 60).toFixed(1)} h` : "—"} sub="wall-clock, all stages" />
        <Stat label="Goal: $10k / mo" value={`${Math.min(100, Math.round((m.revenue / 10000) * 100))}%`} sub={`$${m.revenue.toLocaleString()} of $10,000 — tier 3 ladder: 4–5 sales/mo + retainers`} accent="amber" />
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Pitched</th>
                <th className="px-4 py-3 font-semibold">Hours</th>
                <th className="px-4 py-3 font-semibold">QA loops</th>
                <th className="px-4 py-3 font-semibold">Demo leads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-white/70">
              {m.projects.map((p) => (
                <tr key={p.slug} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white">{p.business}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">{p.price != null ? `$${p.price}` : "—"}</td>
                  <td className="px-4 py-3">{p.pitchedAt ?? "—"}</td>
                  <td className="px-4 py-3">{p.wallMinutes ? (p.wallMinutes / 60).toFixed(1) : "—"}</td>
                  <td className="px-4 py-3">{p.qaLoops ?? "—"}</td>
                  <td className="px-4 py-3">{p.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
