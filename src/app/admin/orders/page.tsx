import type { Metadata } from "next";
import { OrderManagement } from "@/features/admin/orders/order-management";

export const metadata: Metadata = {
  title: "Sipariş Yönetimi",
  description: "B2C ve B2B siparişlerini tek bir yerden takip edin ve yönetin.",
};

export default function OrdersPage() {
  return <OrderManagement />;
}
