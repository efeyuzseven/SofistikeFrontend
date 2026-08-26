import type { Metadata } from "next";
import { AdminCategoriesPage } from "@/features/admin/admin-categories-page";

export const metadata: Metadata = {
  title: "Kategori Yönetimi",
};

export default function Page() {
  return <AdminCategoriesPage />;
}
