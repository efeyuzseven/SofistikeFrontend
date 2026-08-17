export type SettingsTab =
  "general" | "operations" | "notifications" | "company" | "users" | "security";

export type AdminRole =
  | "Süper Yönetici"
  | "Operasyon Yöneticisi"
  | "Satış Yöneticisi"
  | "Finans Yetkilisi"
  | "İçerik Yöneticisi"
  | "Görüntüleyici";

export type AdminStatus = "Aktif" | "Devre Dışı" | "Davet Bekliyor";
export type PermissionLevel =
  "Görüntüleme" | "Düzenleme" | "Onaylama" | "Erişim yok";

export type GeneralSettings = {
  brandName: string;
  panelName: string;
  supportEmail: string;
  supportPhone: string;
  website: string;
  address: string;
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  maintenanceMode: boolean;
};

export type OperationSettings = {
  orderPrefix: string;
  b2bOrderPrefix: string;
  lowStockThreshold: number;
  continueOutOfStock: boolean;
  freeShippingLimit: number;
  b2cReturnDays: number;
  cancellationHours: number;
  b2bMinimumOrder: number;
  taxIncluded: boolean;
  vatRate: number;
  rewardsEnabled: boolean;
  pointsRate: number;
  pointsValidityMonths: number;
};

export type NotificationEvent = {
  id: string;
  label: string;
  panel: boolean;
  email: boolean;
  sms: boolean;
};

export type NotificationSettings = {
  events: NotificationEvent[];
  dailyTime: string;
  weeklyDay: string;
  weeklyTime: string;
};

export type CompanySettings = {
  legalName: string;
  taxOffice: string;
  taxNumber: string;
  mersisNumber: string;
  invoiceAddress: string;
  country: string;
  city: string;
  archivePrefix: string;
  invoiceStart: number;
  invoiceNote: string;
  exportInvoices: boolean;
  exportCurrency: string;
  deliveryTerm: string;
};

export type SecuritySettings = {
  sessionTimeout: number;
  requireTwoFactor: boolean;
  minimumPasswordLength: number;
  failedLoginLimit: number;
  suspiciousLoginNotice: boolean;
};

export type SettingsState = {
  general: GeneralSettings;
  operations: OperationSettings;
  notifications: NotificationSettings;
  company: CompanySettings;
  security: SecuritySettings;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin: string;
  twoFactor: boolean;
  isCurrent?: boolean;
};

export type AuditEntry = {
  id: string;
  occurredAt: string;
  administrator: string;
  action: string;
  module: string;
  target: string;
  result: "Başarılı" | "Engellendi";
  description: string;
};

export type SettingsModal =
  | { kind: "maintenance" }
  | { kind: "twoFactor" }
  | { kind: "defaults" }
  | { kind: "leave"; target: SettingsTab }
  | { kind: "invite" }
  | { kind: "detail"; userId: string }
  | { kind: "role"; userId: string }
  | { kind: "toggle"; userId: string };
