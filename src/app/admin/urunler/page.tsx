import type { Metadata } from "next";
import { AdminProductsPage } from "@/features/admin/admin-products-page";

export const metadata: Metadata = {
  title: "Ürün Yönetimi",
};

export default function Page() {
  return <AdminProductsPage />;
}
