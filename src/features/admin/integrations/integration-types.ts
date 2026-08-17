export const integrationCategories = [
  "Pazaryeri",
  "Ödeme",
  "Kargo",
  "Fatura",
  "E-ihracat",
  "Analitik",
  "Bildirim",
  "Sosyal medya",
] as const;

export const integrationStatuses = [
  "Bağlı",
  "Bağlantı Bekliyor",
  "Dikkat Gerekiyor",
  "Hata",
  "Devre Dışı",
  "Bakımda",
] as const;

export const syncFrequencies = [
  "15 dakikada bir",
  "Saatlik",
  "Günlük",
  "Manuel",
] as const;

export type IntegrationCategory = (typeof integrationCategories)[number];
export type IntegrationStatus = (typeof integrationStatuses)[number];
export type SyncFrequency = (typeof syncFrequencies)[number];
export type IntegrationEnvironment = "Test" | "Canlı";
export type IntegrationDetailTab = "overview" | "sync" | "logs" | "settings";
export type IntegrationMenuAction =
  "detail" | "test" | "sync" | "settings" | "toggle";

export type IntegrationLog = {
  id: string;
  date: string;
  operation: string;
  result: "Başarılı" | "Uyarı" | "Hata";
  description: string;
  affectedRecords: number;
};

export type Integration = {
  id: number;
  name: string;
  category: IntegrationCategory;
  description: string;
  status: IntegrationStatus;
  accountName: string;
  connectedAt?: string;
  lastSuccessfulConnection?: string;
  lastSync?: string;
  nextSync?: string;
  autoSync: boolean;
  frequency: SyncFrequency;
  pendingRecords: number;
  successfulOperations: number;
  failedOperations: number;
  errorMessage?: string;
  environment: IntegrationEnvironment;
  syncItems: string[];
  notificationsEnabled: boolean;
  lastConfiguredAt: string;
  logs: IntegrationLog[];
};
