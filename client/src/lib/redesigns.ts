// Redesign case studies + purchase data. The feed is published by the redesign-pipeline
// repo (`npm run publish-portfolio`) into src/data/redesigns.json; images land in
// public/redesigns/<slug>/. Slugs on the site are `<slug>-redesign`.
import redesigns from "@/data/redesigns.json";
import metrics from "@/data/redesign-metrics.json";

export type RedesignStatus = "pitched" | "paid" | "handed-off" | "declined" | "no-reply";

export interface Redesign {
  slug: string;
  business: string;
  city: string;
  vertical: string;
  beforeImage: string;
  afterImage: string;
  demoUrl: string;
  status: RedesignStatus;
  pitchedAt: string;
  price: number;
  priceLockedUntil: string;
  discountUntil: string;
  stripePaymentLink: string;
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
    price: number;
    wallMinutes: number | null;
    qaLoops: number | null;
    leads: number;
    pitchedAt: string | null;
  }>;
}

export const REDESIGN_SUFFIX = "-redesign";
export const DISCOUNT_PCT = 10;

export const allRedesigns = redesigns as Redesign[];
export const redesignMetrics = metrics as RedesignMetrics;

export function getRedesign(routeSlug: string): Redesign | null {
  const slug = routeSlug.endsWith(REDESIGN_SUFFIX)
    ? routeSlug.slice(0, -REDESIGN_SUFFIX.length)
    : routeSlug;
  return allRedesigns.find((r) => r.slug === slug) ?? null;
}

export function pricing(r: Redesign, now = new Date()) {
  const discountActive = now <= new Date(r.discountUntil + "T23:59:59");
  const lockActive = now <= new Date(r.priceLockedUntil + "T23:59:59");
  const discounted = Math.round(r.price * (1 - DISCOUNT_PCT / 100));
  return { discountActive, lockActive, discounted, full: r.price };
}

export const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export const fmtUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
