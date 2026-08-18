import type { Metadata } from "next";
import { ProfileManagement } from "@/features/admin/profile/profile-management";

export const metadata: Metadata = { title: "Profilim" };

export default function ProfilePage() {
  return <ProfileManagement />;
}
