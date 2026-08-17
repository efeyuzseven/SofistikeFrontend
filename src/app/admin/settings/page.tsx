import type { Metadata } from "next";
import { SettingsManagement } from "@/features/admin/settings/settings-management";

export const metadata: Metadata = { title: "Ayarlar" };

export default function SettingsPage() {
  return <SettingsManagement />;
}
