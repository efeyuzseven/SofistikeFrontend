import type { Metadata } from "next";
import { RefundManagement } from "@/features/admin/refunds-cancellations/refund-management";

export const metadata: Metadata = {
  title: "İade ve İptaller",
  description: "İade ve iptal taleplerini yönetin.",
};

export default function RefundsCancellationsPage() {
  return <RefundManagement />;
}
