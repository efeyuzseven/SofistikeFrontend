import type { Metadata } from "next";
import { IntegrationManagement } from "@/features/admin/integrations/integration-management";

export const metadata: Metadata = { title: "Entegrasyonlar" };

export default function IntegrationsPage() {
  return <IntegrationManagement />;
}
