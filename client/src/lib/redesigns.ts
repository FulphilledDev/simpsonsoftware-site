// Redesign case studies + purchase data. The feed is published by the redesign-pipeline
// repo (`npm run publish-portfolio`) into src/data/redesigns.json; images land in
// public/redesigns/<slug>/. Slugs on the site are `<slug>-redesign`.
import redesigns from "@/data/redesigns.json";
import metrics from "@/data/redesign-metrics.json";

// "built" is pre-pitch: deployed and in review, not yet offered to the owner (no price, no dates).
export type RedesignStatus = "built" | "pitched" | "paid" | "handed-off" | "declined" | "no-reply";

/** Statuses the public site always shows. A built demo joins them once QA has passed
 * (`qaPassedAt`, published from the pipeline's metrics); only pitched entries are purchasable. */
export const PUBLIC_STATUSES: RedesignStatus[] = ["pitched", "paid", "handed-off"];
export const isPublic = (r: { status: RedesignStatus; qaPassedAt?: string }) =>
  PUBLIC_STATUSES.includes(r.status) || (r.status === "built" && !!r.qaPassedAt);

export interface Redesign {
  slug: string;
  business: string;
  city: string;
  vertical: string;
  beforeImage: string;
  afterImage: string;
  demoUrl: string;
  status: RedesignStatus;
  qaPassedAt?: string; // ISO date once the pipeline's QA passed — makes a built demo public
  pitchedAt: string;
  price: number | null; // null until pitched — consumers are gated on status === "pitched"
  priceLockedUntil: string;
  discountUntil: string;
  stripePaymentLink: string;
  issue?: number;
  whatChanged: string;
  leads: number;
}

export interface RedesignMetrics {
  generatedAt: string;
  counts: Record<RedesignStatus | "total", number>;
  revenue: number;
  closeRate: number | null;
  avgWallMinutes: number | null;
  projects: Array<{
    slug: string;
    business: string;
    status: string;
    price: number | null;
    wallMinutes: number | null;
    qaLoops: number | null;
    leads: number;
    pitchedAt: string | null;
  }>;
}

export const REDESIGN_SUFFIX = "-redesign";
export const DISCOUNT_PCT = 10;

export const allRedesigns = redesigns as unknown as Redesign[];
export const redesignMetrics = metrics as unknown as RedesignMetrics;

export function getRedesign(routeSlug: string): Redesign | null {
  const slug = routeSlug.endsWith(REDESIGN_SUFFIX)
    ? routeSlug.slice(0, -REDESIGN_SUFFIX.length)
    : routeSlug;
  return allRedesigns.find((r) => r.slug === slug) ?? null;
}

export function pricing(r: Redesign, now = new Date()) {
  const full = r.price ?? 0; // pre-pitch entries have no price; consumers gate on status === "pitched"
  const discountActive = now <= new Date(r.discountUntil + "T23:59:59");
  const lockActive = now <= new Date(r.priceLockedUntil + "T23:59:59");
  const discounted = Math.round(full * (1 - DISCOUNT_PCT / 100));
  return { discountActive, lockActive, discounted, full };
}

export const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export const fmtUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
