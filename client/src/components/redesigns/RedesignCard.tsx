import Link from "next/link";
import { type Redesign, REDESIGN_SUFFIX, fmtUsd } from "@/lib/redesigns";

const badge: Record<Redesign["status"], string | null> = {
  built: null, // pre-pitch — never listed publicly anyway
  pitched: "Demo live",
  paid: "Purchased",
  "handed-off": "Live",
  declined: null,
  "no-reply": null,
};

export default function RedesignCard({ r }: { r: Redesign }) {
  const label = badge[r.status];
  return (
    <Link href={`/projects/${r.slug}${REDESIGN_SUFFIX}`} className="block group h-full">
      <div className="glass glass-hover rounded-xl overflow-hidden h-full flex flex-col border border-white/[0.08]">
        <div className="relative w-full aspect-video overflow-hidden bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.afterImage}
            alt={`${r.business} — new website`}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {label && (
            <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-cyan backdrop-blur-sm">
              {label}
            </span>
          )}
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{r.city} · {r.vertical.replace(/-/g, " ")}</p>
          <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">{r.business}</h3>
          <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{r.whatChanged}</p>
          {r.status === "pitched" && (
            <p className="mt-auto pt-2 text-sm text-white/40">One-time {fmtUsd(r.price ?? 0)} · owner takes everything</p>
          )}
        </div>
      </div>
    </Link>
  );
}
