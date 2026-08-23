import type { Metadata } from "next";
import LeadsBoard, { type Lead } from "@/components/admin/LeadsBoard";
import feed from "@/data/leads.json";

export const metadata: Metadata = { title: "Leads | Simpson Software", robots: { index: false } };

// Server component on purpose: the queue (targets, scores, contacts) is serialized into
// the RSC payload behind the /admin middleware, not bundled into a public JS chunk.
export default function LeadsPage() {
  return <LeadsBoard generatedAt={feed.generatedAt} leads={feed.leads as unknown as Lead[]} />;
}
