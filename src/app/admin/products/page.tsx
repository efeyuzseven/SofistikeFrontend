import type { Metadata } from "next";
import { ProductManagement } from "@/features/admin/products/product-management";

export const metadata: Metadata = {
  title: "Ürün Yönetimi",
  description:
    "Sofistike ürünlerini, fiyatlarını ve satış durumlarını yönetin.",
};

export default function ProductsPage() {
  return <ProductManagement />;
}
