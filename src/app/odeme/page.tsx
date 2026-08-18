import type { Metadata } from "next";
import { CheckoutPage } from "@/features/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Güvenli Ödeme",
  description: "Sofistike +XTRA teslimat ve ödeme tasarım önizlemesi.",
};

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
