import type {
  AdminRole,
  AdminUser,
  AuditEntry,
  PermissionLevel,
  SettingsState,
  SettingsTab,
} from "./settings-types";

export const settingsTabs: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "Genel" },
  { id: "operations", label: "Satış ve Operasyon" },
  { id: "notifications", label: "Bildirimler" },
  { id: "company", label: "Şirket ve Fatura" },
  { id: "users", label: "Kullanıcılar ve Roller" },
  { id: "security", label: "Güvenlik ve İşlem Geçmişi" },
];

export const roles: AdminRole[] = [
  "Süper Yönetici",
  "Operasyon Yöneticisi",
  "Satış Yöneticisi",
  "Finans Yetkilisi",
  "İçerik Yöneticisi",
  "Görüntüleyici",
];

const notificationLabels = [
  "Yeni sipariş",
  "Ödeme başarısız",
  "İade/iptal talebi",
  "Kritik stok",
  "Yeni B2B başvurusu",
  "Entegrasyon hatası",
  "Fatura hatası",
  "Yüksek öncelikli içgörü",
  "Günlük özet",
  "Haftalık rapor",
];

export const initialSettings: SettingsState = {
  general: {
    brandName: "Sofistike +XTRA",
    panelName: "+XTRA Yönetim Merkezi",
    supportEmail: "destek@sofistikextra.example",
    supportPhone: "+90 212 555 14 28",
    website: "https://www.sofistikextra.example",
    address: "Maslak Mahallesi, Sarıyer / İstanbul",
    language: "Türkçe",
    timezone: "Europe/Istanbul",
    currency: "TRY",
    dateFormat: "GG.AA.YYYY",
    maintenanceMode: false,
  },
  operations: {
    orderPrefix: "SOF",
    b2bOrderPrefix: "SOF-B2B",
    lowStockThreshold: 10,
    continueOutOfStock: false,
    freeShippingLimit: 1500,
    b2cReturnDays: 14,
    cancellationHours: 2,
    b2bMinimumOrder: 10000,
    taxIncluded: true,
    vatRate: 20,
    rewardsEnabled: true,
    pointsRate: 2,
    pointsValidityMonths: 12,
  },
  notifications: {
    events: notificationLabels.map((label, index) => ({
      id: `notification-${index + 1}`,
      label,
      panel: true,
      email: ![3, 8].includes(index),
      sms: [0, 1, 2, 5, 6].includes(index),
    })),
    dailyTime: "09:00",
    weeklyDay: "Pazartesi",
    weeklyTime: "09:30",
  },
  company: {
    legalName: "Sofistike Yaşam Ürünleri Anonim Şirketi",
    taxOffice: "Maslak",
    taxNumber: "1234567890",
    mersisNumber: "0123456789000016",
    invoiceAddress:
      "Maslak Mahallesi, Büyükdere Caddesi No: 101 Sarıyer / İstanbul",
    country: "Türkiye",
    city: "İstanbul",
    archivePrefix: "SFX",
    invoiceStart: 10001,
    invoiceNote: "Bizi tercih ettiğiniz için teşekkür ederiz.",
    exportInvoices: true,
    exportCurrency: "EUR",
    deliveryTerm: "DAP",
  },
  security: {
    sessionTimeout: 30,
    requireTwoFactor: false,
    minimumPasswordLength: 12,
    failedLoginLimit: 5,
    suspiciousLoginNotice: true,
  },
};

export const initialUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Ayşe Demir",
    email: "ayse.demir@sofistike.example",
    role: "Süper Yönetici",
    status: "Aktif",
    lastLogin: "Bugün, 10:42",
    twoFactor: true,
    isCurrent: true,
  },
  {
    id: "u2",
    name: "Mert Kaya",
    email: "mert.kaya@sofistike.example",
    role: "Operasyon Yöneticisi",
    status: "Aktif",
    lastLogin: "Bugün, 09:18",
    twoFactor: true,
  },
  {
    id: "u3",
    name: "Selin Aras",
    email: "selin.aras@sofistike.example",
    role: "Satış Yöneticisi",
    status: "Aktif",
    lastLogin: "Dün, 17:36",
    twoFactor: false,
  },
  {
    id: "u4",
    name: "Kerem Işık",
    email: "kerem.isik@sofistike.example",
    role: "Finans Yetkilisi",
    status: "Aktif",
    lastLogin: "14 Ağustos 2026",
    twoFactor: true,
  },
  {
    id: "u5",
    name: "Deniz Eren",
    email: "deniz.eren@sofistike.example",
    role: "İçerik Yöneticisi",
    status: "Devre Dışı",
    lastLogin: "2 Ağustos 2026",
    twoFactor: false,
  },
];

export const auditEntries: AuditEntry[] = Array.from(
  { length: 13 },
  (_, index) => ({
    id: `audit-${index + 1}`,
    occurredAt: `${16 - Math.floor(index / 3)} Ağustos 2026, ${String(10 + (index % 7)).padStart(2, "0")}:${index % 2 ? "35" : "10"}`,
    administrator: ["Ayşe Demir", "Mert Kaya", "Selin Aras"][index % 3],
    action: [
      "Ayar güncellendi",
      "Rol değiştirildi",
      "Oturum doğrulandı",
      "Rapor görüntülendi",
    ][index % 4],
    module: ["Genel", "Kullanıcılar", "Güvenlik", "Raporlar"][index % 4],
    target: ["Panel ayarları", "u-0003", "Yönetici oturumu", "Satış raporu"][
      index % 4
    ],
    result: index === 8 ? "Engellendi" : "Başarılı",
    description:
      index === 8
        ? "Yetki seviyesi işlem için yeterli değildi."
        : "İşlem yönetim paneli üzerinden tamamlandı.",
  }),
);

export const permissionAreas = [
  "Ürün ve stok",
  "Siparişler",
  "Ödemeler",
  "İade ve iptaller",
  "B2C müşteriler",
  "B2B yönetimi",
  "Entegrasyonlar",
  "İçgörüler",
  "Raporlar",
  "Ayarlar",
];

export const permissionMatrix: Record<AdminRole, PermissionLevel[]> = {
  "Süper Yönetici": permissionAreas.map(() => "Onaylama"),
  "Operasyon Yöneticisi": [
    "Düzenleme",
    "Onaylama",
    "Görüntüleme",
    "Onaylama",
    "Düzenleme",
    "Düzenleme",
    "Görüntüleme",
    "Görüntüleme",
    "Görüntüleme",
    "Erişim yok",
  ],
  "Satış Yöneticisi": [
    "Görüntüleme",
    "Düzenleme",
    "Görüntüleme",
    "Görüntüleme",
    "Düzenleme",
    "Onaylama",
    "Görüntüleme",
    "Görüntüleme",
    "Düzenleme",
    "Erişim yok",
  ],
  "Finans Yetkilisi": [
    "Görüntüleme",
    "Görüntüleme",
    "Onaylama",
    "Onaylama",
    "Erişim yok",
    "Görüntüleme",
    "Görüntüleme",
    "Görüntüleme",
    "Düzenleme",
    "Erişim yok",
  ],
  "İçerik Yöneticisi": [
    "Düzenleme",
    "Görüntüleme",
    "Erişim yok",
    "Erişim yok",
    "Görüntüleme",
    "Görüntüleme",
    "Erişim yok",
    "Görüntüleme",
    "Görüntüleme",
    "Erişim yok",
  ],
  Görüntüleyici: permissionAreas.map((_, index) =>
    index === 9 ? "Erişim yok" : "Görüntüleme",
  ),
};
