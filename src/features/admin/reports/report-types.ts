export const reportTypes = [
  "Satış Raporu",
  "Sipariş Raporu",
  "Ürün ve Stok Raporu",
  "Müşteri Raporu",
  "İade ve İptal Raporu",
  "Ödeme Raporu",
  "B2B Raporu",
  "Kanal Performansı Raporu",
] as const;
export const reportPeriods = [
  "Bugün",
  "Son 7 Gün",
  "Son 30 Gün",
  "Son 90 Gün",
  "Özel Tarih",
] as const;
export const reportChannels = ["Web sitesi", "Pazaryeri", "E-ihracat"] as const;
export const customerTypes = ["B2C", "B2B"] as const;
export const productCategories = [
  "Banyo",
  "Mutfak",
  "Uyku",
  "Kurumsal",
] as const;
export const orderStatuses = [
  "Yeni",
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
] as const;
export const paymentStatuses = [
  "Başarılı",
  "Bekliyor",
  "Başarısız",
  "İade Edildi",
] as const;
export const currencies = ["TRY", "EUR", "USD"] as const;

export type ReportType = (typeof reportTypes)[number];
export type ReportPeriod = (typeof reportPeriods)[number];
export type ReportChannel = (typeof reportChannels)[number];
export type CustomerType = (typeof customerTypes)[number];
export type SortDirection = "asc" | "desc";
export type CellValue = string | number;
export type ReportRow = {
  id: string;
  date: string;
  channel: ReportChannel;
  customerType: CustomerType;
  category: string;
  orderStatus: string;
  paymentStatus: string;
  currency: string;
  location: string;
  values: Record<string, CellValue>;
};
export type ColumnType = "text" | "number" | "currency" | "date" | "status";
export type ReportColumn = {
  key: string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
};
export type TrendImpact = "positive" | "negative" | "neutral";
export type ReportKpi = {
  label: string;
  value: string;
  previous?: string;
  change?: number;
  impact: TrendImpact;
  unit: string;
};
export type ChartDatum = { label: string; value: number; previous?: number };
export type ReportDefinition = {
  type: ReportType;
  shortLabel: string;
  description: string;
  columns: ReportColumn[];
  rows: ReportRow[];
};
export type ReportFilters = {
  period: ReportPeriod;
  compare: boolean;
  channel: string;
  customerType: string;
  category: string;
  orderStatus: string;
  paymentStatus: string;
  currency: string;
  location: string;
  startDate: string;
  endDate: string;
};
