import type { Metadata } from "next";
import { InventoryManagement } from "@/features/admin/inventory/inventory-management";

export const metadata: Metadata = {
  title: "Stok Yönetimi",
  description:
    "Ürün stoklarını, kritik seviyeleri ve stok hareketlerini takip edin.",
};

export default function InventoryPage() {
  return <InventoryManagement />;
}
