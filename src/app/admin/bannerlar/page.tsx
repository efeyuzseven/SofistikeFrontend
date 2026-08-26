import type { Metadata } from "next";
import { AdminBannersPage } from "@/features/admin/admin-banners-page";

export const metadata: Metadata = {
  title: "Banner Yönetimi",
};

export default function Page() {
  return <AdminBannersPage />;
}
