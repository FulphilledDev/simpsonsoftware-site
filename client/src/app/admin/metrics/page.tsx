"use client";

import GlassCard from "@/components/ui/GlassCard";
import { redesignMetrics as m, allRedesigns } from "@/lib/redesigns";

function Stat({ label, value, sub, accent = "cyan" }: { label: string; value: string; sub?: string; accent?: "cyan" | "purple" | "amber" }) {
  const color = accent === "cyan" ? "text-neon-cyan border-t-neon-cyan/40" : accent === "purple" ? "text-neon-purple border-t-neon-purple/40" : "text-amber-400 border-t-amber-500/40";
  return (
    <GlassCard padding="lg" className={`border-t-2 ${color.split(" ")[1]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color.split(" ")[0]}`}>{value}</p>
      {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Redesign pipeline</h1>
        <p className="text-white/40 text-sm mt-1">
          From <code className="text-white/60">redesign-pipeline</code> · published {m.generatedAt}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Built" value={String(c.total)} sub={`${open.length} awaiting an owner`} />
        <Stat label="Paid" value={String(closed)} sub={closeRate === null ? "no pitches resolved yet" : `${closeRate}% close rate`} accent="purple" />
        <Stat label="Revenue" value={`$${m.revenue.toLocaleString()}`} sub="one-time fees collected" accent="amber" />
        <Stat label="Avg build time" value={m.avgWallMinutes ? `${(m.avgWallMinutes / 60).toFixed(1)} h` : "—"} sub="wall-clock, all stages" />
      </div>

      <GlassCard padding="lg">
        <h2 className="text-sm font-semibold text-white mb-4">Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-white/30">
              <tr className="text-left">
                <th className="pb-2 pr-4 font-semibold">Business</th>
                <th className="pb-2 pr-4 font-semibold">Status</th>
                <th className="pb-2 pr-4 font-semibold">Price</th>
                <th className="pb-2 pr-4 font-semibold">Pitched</th>
                <th className="pb-2 pr-4 font-semibold">Hours</th>
                <th className="pb-2 pr-4 font-semibold">QA loops</th>
                <th className="pb-2 font-semibold">Demo leads</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {m.projects.map((p) => (
                <tr key={p.slug} className="border-t border-white/[0.06]">
                  <td className="py-2.5 pr-4 text-white">{p.business}</td>
                  <td className="py-2.5 pr-4">{p.status}</td>
                  <td className="py-2.5 pr-4">${p.price}</td>
                  <td className="py-2.5 pr-4">{p.pitchedAt ?? "—"}</td>
                  <td className="py-2.5 pr-4">{p.wallMinutes ? (p.wallMinutes / 60).toFixed(1) : "—"}</td>
                  <td className="py-2.5 pr-4">{p.qaLoops ?? "—"}</td>
                  <td className="py-2.5">{p.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
