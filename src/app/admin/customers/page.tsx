import type { Metadata } from "next";
import { CustomerManagement } from "@/features/admin/customers/customer-management";

export const metadata: Metadata = {
  title: "B2C Müşteriler",
  description: "B2C müşteri deneyimi, segment ve sadakat görünümü.",
};

export default function CustomersPage() {
  return <CustomerManagement />;
}
