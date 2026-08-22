import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRedesign, pricing, fmtDate, fmtUsd, REDESIGN_SUFFIX, DISCOUNT_PCT } from "@/lib/redesigns";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRedesign(slug);
  return { title: r ? `Purchase — ${r.business} website | Simpson Software` : "Not found | Simpson Software", robots: { index: false } };
}

export default async function PurchasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRedesign(slug);
  if (!r || r.status !== "pitched") notFound();

  const p = pricing(r);
  const payHref = r.stripePaymentLink || "";
  const mailto = `mailto:philip@simpsonsoftware.site?subject=${encodeURIComponent(`${r.business} website — purchase`)}`;

  const options = [
    {
      key: "own",
      title: "Own it",
      price: p.discountActive ? p.discounted : p.full,
      blurb: "Everything transfers to you: the code (GitHub), the hosting, the domain in your name, and a 30-minute walkthrough. Nothing recurring.",
      points: ["Site, code, hosting and domain transferred", "Domain registered in your name", "30-minute walkthrough, in person or by phone", "Free hosting; domain ≈ $12/yr"],
      accent: "cyan",
    },
    {
      key: "keep",
      title: "Own it, we keep the lights on",
      price: p.discountActive ? p.discounted : p.full,
      blurb: "Same transfer, and Philip stays on as technical contact for changes — billed hourly only when you ask for something. No retainer.",
      points: ["Everything in Own it", "Philip as technical contact", "Edits and updates billed hourly, only on request", "Transfer to you any time you ask"],
      accent: "purple",
    },
  ] as const;

  return (
    <main className="bg-background min-h-screen">
      <div className="section-container pt-24 pb-6">
        <Link href={`/projects/${r.slug}${REDESIGN_SUFFIX}`} className="inline-flex items-center gap-2 text-white/40 hover:text-neon-cyan transition-colors duration-200 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to the case study
        </Link>
      </div>

      <section className="section-container pb-10">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Take ownership of the {r.business} website</h1>
          <p className="text-white/55 text-lg">
            One-time {fmtUsd(p.full)}.
            {p.discountActive && (
              <>
                {" "}<span className="text-neon-cyan font-semibold">{DISCOUNT_PCT}% off — {fmtUsd(p.discounted)}</span> through {fmtDate(r.discountUntil)}.
              </>
            )}{" "}
            Price held until {fmtDate(r.priceLockedUntil)}. Refer another business that buys and get {DISCOUNT_PCT}% back.
          </p>
        </div>
      </section>

      <section className="section-container pb-12">
        <div className="grid md:grid-cols-2 gap-4">
          {options.map((o) => (
            <div key={o.key} className={`glass rounded-2xl p-6 sm:p-8 border-t-2 ${o.accent === "cyan" ? "border-t-neon-cyan/50" : "border-t-neon-purple/50"} flex flex-col gap-4`}>
              <div>
                <h2 className="text-xl font-bold text-white">{o.title}</h2>
                <p className="text-3xl font-bold text-white mt-1">
                  {fmtUsd(o.price)} <span className="text-sm font-normal text-white/40">one-time</span>
                </p>
              </div>
              <p className="text-white/55 text-sm leading-relaxed">{o.blurb}</p>
              <ul className="space-y-2 text-sm text-white/70">
                {o.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <span className="text-neon-cyan">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                {payHref ? (
                  <a href={`${payHref}?client_reference_id=${encodeURIComponent(`${r.slug}:${o.key}`)}`} className={`${o.accent === "cyan" ? "btn-glow-cyan" : "btn-glow-purple"} inline-flex w-full justify-center px-6 py-3`}>
                    Pay {fmtUsd(o.price)} securely
                  </a>
                ) : (
                  <a href={mailto} className={`${o.accent === "cyan" ? "btn-glow-cyan" : "btn-glow-purple"} inline-flex w-full justify-center px-6 py-3`}>
                    Choose this — email Philip
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/35 text-xs mt-4">
          Payments are handled by Stripe. Not sure which option fits? Call Philip at (209) 814-1996 — happy to walk you through it in ten minutes.
        </p>
      </section>
    </main>
  );
}
