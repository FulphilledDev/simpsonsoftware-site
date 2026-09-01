import Link from "next/link";
import { type Redesign, pricing, fmtDate, fmtUsd, REDESIGN_SUFFIX } from "@/lib/redesigns";

const statusLabel: Record<Redesign["status"], string> = {
  built: "Demo live — built and QA-passed; not offered for purchase yet",
  pitched: "Demo live — awaiting the owner",
  paid: "Purchased",
  "handed-off": "Live on the owner's domain",
  declined: "Archived",
  "no-reply": "Archived",
};

export default function RedesignCaseStudy({ r }: { r: Redesign }) {
  const p = pricing(r); // price/dates are empty until pitched; only rendered when purchasable
  const purchasable = r.status === "pitched";
  const purchaseHref = `/projects/${r.slug}${REDESIGN_SUFFIX}/purchase`;

  return (
    <main className="bg-background min-h-screen">
      <div className="section-container pt-24 pb-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-white/40 hover:text-neon-cyan transition-colors duration-200 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          All Projects
        </Link>
      </div>

      <section className="section-container pb-12">
        <div className="space-y-3 max-w-3xl">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-cyan">
            Local business redesign · {r.city}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{r.business}</h1>
          <p className="text-white/55 text-lg leading-relaxed">{r.whatChanged}</p>
          <p className="text-white/35 text-sm">{statusLabel[r.status]}</p>
        </div>
      </section>

      {/* Before / after */}
      <section className="section-container pb-12">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Before", src: r.beforeImage, dim: true },
            { label: "After", src: r.afterImage, dim: false },
          ].map((s) => (
            <figure key={s.label} className={`glass rounded-2xl overflow-hidden border ${s.dim ? "border-white/[0.06]" : "border-neon-cyan/30"}`}>
              <figcaption className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/40 border-b border-white/[0.06]">
                {s.label}
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={`${r.business} website, ${s.label.toLowerCase()}`} className={`w-full h-auto ${s.dim ? "opacity-75" : ""}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      {/* What the rebuild does */}
      <section className="section-container pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ["Phone-first", "One tap to call, one to get directions, a sticky Call / Message bar on mobile."],
            ["A form that works", "Leads arrive as branded emails with the visitor's intent attached; the visitor gets a thank-you with hours and phone."],
            ["Owned, not rented", "The owner gets the code, the hosting, and the domain. No monthly fee to anyone."],
          ].map(([t, d]) => (
            <div key={t} className="glass rounded-xl p-5 border border-white/[0.06] space-y-2">
              <h2 className="text-white font-semibold">{t}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-container pb-28">
        <div className="glass rounded-2xl p-8 sm:p-12 text-center space-y-5 border-t-2 border-t-neon-purple/40">
          {purchasable ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Own this site — one-time {fmtUsd(p.full)}</h2>
              <p className="text-white/50 max-w-md mx-auto">
                {p.discountActive
                  ? `${fmtUsd(p.discounted)} if purchased by ${fmtDate(r.discountUntil)}. Price held until ${fmtDate(r.priceLockedUntil)}.`
                  : `Price held until ${fmtDate(r.priceLockedUntil)}.`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={r.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-cyan text-lg px-8 py-4 inline-block">
                  See the live demo
                </a>
                <Link href={purchaseHref} className="btn-glow-cyan text-lg px-8 py-4 inline-block">
                  Purchase & take ownership
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Want this for your business?</h2>
              <p className="text-white/50 max-w-md mx-auto">Same approach, your photos, your words, your domain.</p>
              <Link href="/book" className="inline-block btn-glow-cyan text-lg px-8 py-4">Book a Consultation</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
