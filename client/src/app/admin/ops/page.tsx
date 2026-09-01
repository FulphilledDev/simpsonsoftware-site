import type { Metadata } from "next";
import OpsPanel from "@/components/admin/OpsPanel";

export const metadata: Metadata = { title: "Ops | Simpson Software", robots: { index: false } };

export default function OpsPage() {
  return <OpsPanel />;
}
