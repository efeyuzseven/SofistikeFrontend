import type { Metadata } from "next";
import { InsightManagement } from "@/features/admin/insights/insight-management";

export const metadata: Metadata = { title: "+XTRA İçgörüleri" };

export default function InsightsPage() {
  return <InsightManagement />;
}
