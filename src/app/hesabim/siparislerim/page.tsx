import type { Metadata } from "next";
import { OrdersPage } from "@/features/account/orders-page";

export const metadata: Metadata = {
  title: "Siparişlerim",
  description: "Sofistike +XTRA sipariş takip tasarım önizlemesi.",
};

export default function OrdersRoute() {
  return <OrdersPage />;
}
