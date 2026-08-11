import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  description: "Sofistike +XTRA yönetim paneli",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
