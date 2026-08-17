import type { Metadata } from "next";
import { PaymentManagement } from "@/features/admin/payments/payment-management";

export const metadata: Metadata = {
  title: "Ödemeler",
  description: "B2C, B2B, pazaryeri ve e-ihracat ödeme işlemlerini takip edin.",
};

export default function PaymentsPage() {
  return <PaymentManagement />;
}
