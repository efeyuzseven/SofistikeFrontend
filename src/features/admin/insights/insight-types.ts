export const insightSources = [
  "Satışlar",
  "Ürünler",
  "Stok",
  "Müşteriler",
  "İade ve iptaller",
  "B2B başvuruları",
  "Pazaryerleri",
  "Entegrasyonlar",
  "Müşteri yorumları/Review Lab",
] as const;
export const insightTypes = [
  "Risk",
  "Fırsat",
  "Anomali",
  "Müşteri Sorunu",
  "Operasyon Uyarısı",
  "Büyüme Önerisi",
] as const;
export const insightPriorities = ["Kritik", "Yüksek", "Orta", "Düşük"] as const;
export const insightStatuses = [
  "Yeni",
  "İnceleniyor",
  "Aksiyon Planlandı",
  "Çözüldü",
  "Göz Ardı Edildi",
] as const;
export const salesChannels = [
  "Web sitesi",
  "Pazaryeri",
  "B2B",
  "E-ihracat",
  "Tüm kanallar",
] as const;
export const periods = [
  "Son 7 gün",
  "Son 30 gün",
  "Son 90 gün",
  "Özel tarih aralığı",
] as const;
export const actionTeams = [
  "Tedarik ve Stok",
  "Ürün Geliştirme",
  "Müşteri Deneyimi",
  "Pazarlama",
  "B2B Satış",
  "Finans ve Operasyon",
] as const;

export type InsightSource = (typeof insightSources)[number];
export type InsightType = (typeof insightTypes)[number];
export type InsightPriority = (typeof insightPriorities)[number];
export type InsightStatus = (typeof insightStatuses)[number];
export type SalesChannel = (typeof salesChannels)[number];
export type Period = (typeof periods)[number];
export type ActionTeam = (typeof actionTeams)[number];
export type TrendImpact = "positive" | "negative" | "neutral";
export type InsightDetailTab = "overview" | "evidence" | "action" | "history";
export type InsightMenuAction =
  "detail" | "review" | "plan" | "solve" | "ignore" | "note";

export type EvidenceMetric = {
  label: string;
  previous: string;
  current: string;
  change: string;
};
export type InsightNote = {
  id: string;
  text: string;
  author: string;
  date: string;
};
export type InsightHistory = {
  title: string;
  description: string;
  date: string;
};
export type ActionPlan = {
  team: ActionTeam;
  targetDate: string;
  description: string;
};

export type Insight = {
  id: number;
  title: string;
  description: string;
  source: InsightSource;
  type: InsightType;
  priority: InsightPriority;
  status: InsightStatus;
  detectedAt: string;
  resolvedAt?: string;
  channel: SalesChannel;
  affectedArea: string;
  metricLabel: string;
  metricValue: string;
  changePercent: number;
  trendImpact: TrendImpact;
  financialImpact: number;
  periodComparison: string;
  recommendation: string;
  expectedImpact: string;
  suggestedTeam: ActionTeam;
  targetDuration: string;
  cautions: string[];
  evidence: EvidenceMetric[];
  rationale: string;
  notes: InsightNote[];
  history: InsightHistory[];
  actionPlan?: ActionPlan;
};

export type ReviewTheme = {
  id: number;
  title: string;
  area: string;
  reviewCount: number;
  sentiment: "Olumsuz" | "Olumlu";
  changePercent: number;
  summary: string;
  recommendation: string;
};
