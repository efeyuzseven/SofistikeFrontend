import type { Metadata } from "next";
import { B2BManagement } from "@/features/admin/b2b/b2b-management";

export const metadata: Metadata = {
  title: "B2B Yönetimi",
};

export default function B2BPage() {
  return <B2BManagement />;
}
