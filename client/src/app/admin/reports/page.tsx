import type { Metadata } from "next";
import GlassCard from "@/components/ui/GlassCard";
import feed from "@/data/reports.json";

export const metadata: Metadata = { title: "Reports | Simpson Software", robots: { index: false } };

// Night-run summaries, newest first — published by the pipeline's publish step.
export default function ReportsPage() {
  const reports = (feed as { reports: { date: string; body: string }[] }).reports;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-white/40 text-sm mt-1">Every night run&apos;s summary, newest first. The <strong className="text-white/70">Needs Philip</strong> section of the top report is your morning queue.</p>
      </div>
      {reports.length === 0 ? (
        <GlassCard padding="lg"><p className="text-white/30 text-sm">No night runs yet. The first scheduled (or manual) /night writes its summary here via the publish step.</p></GlassCard>
      ) : reports.map((r) => (
        <GlassCard key={r.date} padding="lg">
          <h2 className="text-sm font-semibold text-neon-cyan mb-3">{r.date}</h2>
          <pre className="text-white/60 text-xs whitespace-pre-wrap font-mono leading-relaxed">{r.body}</pre>
        </GlassCard>
      ))}
    </div>
  );
}
