import type { Metadata } from "next";
import BuildsBoard from "@/components/admin/BuildsBoard";
import { allRedesigns } from "@/lib/redesigns";

export const metadata: Metadata = { title: "Builds | Simpson Software", robots: { index: false } };

export default function BuildsPage() {
  return <BuildsBoard redesigns={allRedesigns} />;
}
