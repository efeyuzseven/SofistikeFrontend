import type { Metadata } from "next";
import { ReportManagement } from "@/features/admin/reports/report-management";

export const metadata: Metadata = { title: "Raporlar" };

export default function ReportsPage() {
  return <ReportManagement />;
}
