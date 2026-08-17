export const businessTypes = [
  "Otel",
  "Restoran",
  "Kafe",
  "Ofis",
  "Hastane",
  "Klinik",
  "Okul",
  "Perakende zinciri",
  "İç mimarlık şirketi",
  "Site/mülk yönetimi",
  "Distribütör",
  "İhracat iş ortağı",
] as const;

export const b2bSolutions = [
  "Hotel Collection",
  "Office Collection",
  "Healthcare",
  "Restaurant & Cafe",
  "Employee Welcome Kits",
  "Corporate Gifts",
  "Private Label/OEM",
  "Toplu Sipariş",
  "Proje Satışı",
  "İhracat",
  "Distribütörlük",
  "Franchise/Bayilik",
] as const;

export const applicationStatuses = [
  "Yeni Başvuru",
  "İnceleniyor",
  "Belge Bekleniyor",
  "Onaylandı",
  "Reddedildi",
] as const;
export const companyStatuses = ["Aktif", "Pasif", "Askıda"] as const;
export const projectStatuses = [
  "Yeni Talep",
  "Görüşme Planlandı",
  "Teklif Hazırlanıyor",
  "Teklif Gönderildi",
  "Onaylandı",
  "Tamamlandı",
  "İptal Edildi",
] as const;
export const documentStatuses = [
  "Yüklendi",
  "Eksik",
  "İnceleniyor",
  "Onaylandı",
] as const;
export const b2bMarkets = ["Türkiye", "İhracat"] as const;
export const mockManagers = [
  "Elif Karaca",
  "Mert Akın",
  "Selin Yüce",
  "Can Erdem",
] as const;

export type BusinessType = (typeof businessTypes)[number];
export type B2BSolution = (typeof b2bSolutions)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type CompanyStatus = (typeof companyStatuses)[number];
export type ProjectStatus = (typeof projectStatuses)[number];
export type DocumentStatus = (typeof documentStatuses)[number];
export type B2BMarket = (typeof b2bMarkets)[number];
export type B2BManager = (typeof mockManagers)[number];
export type B2BTab = "applications" | "companies" | "projects";
export type B2BDetailTab =
  "company" | "needs" | "work" | "documents" | "history";
export type ApplicationDecision = "approve" | "reject" | "request-documents";

export type B2BCompanyProfile = {
  id: number;
  companyName: string;
  legalName: string;
  taxNumber: string;
  taxOffice: string;
  businessType: BusinessType;
  scaleLabel: string;
  website: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  contactName: string;
  contactRole: string;
  market: B2BMarket;
};

export type B2BDocument = {
  name:
    | "Vergi levhası"
    | "Faaliyet belgesi"
    | "İmza sirküleri"
    | "Yetki belgesi"
    | "İhracat evrakı";
  status: DocumentStatus;
};

export type B2BNote = {
  id: string;
  text: string;
  adminName: string;
  date: string;
};

export type B2BHistoryEntry = {
  title: string;
  description: string;
  date: string;
};

export type B2BWorkItem = {
  number: string;
  type: string;
  createdAt: string;
  amount: number;
  status: string;
};

export type B2BApplication = {
  id: number;
  applicationNumber: string;
  profile: B2BCompanyProfile;
  requestedSolutions: B2BSolution[];
  estimatedQuantity: string;
  estimatedBudget: number;
  description: string;
  targetDate: string;
  applicationDate: string;
  approvalDate?: string;
  manager: B2BManager;
  status: ApplicationStatus;
  documents: B2BDocument[];
  notes: B2BNote[];
  history: B2BHistoryEntry[];
  relatedWork: B2BWorkItem[];
};

export type B2BCompany = {
  id: number;
  companyNumber: string;
  sourceApplicationNumber?: string;
  profile: B2BCompanyProfile;
  activeSolutions: B2BSolution[];
  totalOrdersProjects: number;
  totalRevenue: number;
  lastActivityDate: string;
  approvedAt: string;
  manager: B2BManager;
  status: CompanyStatus;
  documents: B2BDocument[];
  notes: B2BNote[];
  history: B2BHistoryEntry[];
  relatedWork: B2BWorkItem[];
};

export type B2BProject = {
  id: number;
  projectNumber: string;
  companyNumber?: string;
  profile: B2BCompanyProfile;
  solution: B2BSolution;
  summary: string;
  estimatedBudget: number;
  createdAt: string;
  targetDate: string;
  manager: B2BManager;
  status: ProjectStatus;
  documents: B2BDocument[];
  notes: B2BNote[];
  history: B2BHistoryEntry[];
  relatedWork: B2BWorkItem[];
};

export type B2BRecord =
  | { kind: "application"; data: B2BApplication }
  | { kind: "company"; data: B2BCompany }
  | { kind: "project"; data: B2BProject };
