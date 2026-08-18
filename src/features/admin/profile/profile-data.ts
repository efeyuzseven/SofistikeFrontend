import type {
  ActiveSession,
  NotificationPreferenceKey,
  NotificationPreferences,
  ProfileData,
  ProfileTab,
} from "./profile-types";

export const defaultProfile: ProfileData = {
  firstName: "Ayşe",
  lastName: "Yılmaz",
  email: "ayse.yilmaz@sofistike.com",
  phone: "+90 532 555 01 24",
  position: "E-Ticaret Direktörü",
  department: "Dijital Ticaret",
  timezone: "Europe/Istanbul",
  language: "Türkçe",
  role: "Süper Yönetici",
  permissionLevel: "Tam erişim",
  lastLogin: "17 Ağustos 2026, 09:42",
  photoDataUrl: null,
};

export const defaultNotifications: NotificationPreferences = {
  newOrders: true,
  criticalStock: true,
  refundRequests: true,
  failedPayments: true,
  integrationErrors: true,
  b2bApplications: false,
  weeklySummary: true,
  emailNotifications: true,
  inAppNotifications: true,
};

export const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "personal", label: "Kişisel Bilgiler" },
  { id: "security", label: "Güvenlik" },
  { id: "notifications", label: "Bildirim Tercihleri" },
];

export const notificationOptions: {
  key: NotificationPreferenceKey;
  label: string;
  description: string;
}[] = [
  {
    key: "newOrders",
    label: "Yeni sipariş bildirimleri",
    description: "Yeni B2C ve B2B siparişleri oluşturulduğunda bildir.",
  },
  {
    key: "criticalStock",
    label: "Stok kritik seviye uyarıları",
    description: "Ürün stoğu kritik eşiğin altına düştüğünde bildir.",
  },
  {
    key: "refundRequests",
    label: "İade ve iptal talepleri",
    description: "Yeni bir talep değerlendirme beklediğinde bildir.",
  },
  {
    key: "failedPayments",
    label: "Başarısız ödeme bildirimleri",
    description: "Tahsilat işlemi tamamlanamadığında bildir.",
  },
  {
    key: "integrationErrors",
    label: "Entegrasyon hata bildirimleri",
    description:
      "Bağlı satış veya lojistik kanallarında hata oluştuğunda bildir.",
  },
  {
    key: "b2bApplications",
    label: "B2B başvuru bildirimleri",
    description: "Yeni kurumsal başvurular geldiğinde bildir.",
  },
  {
    key: "weeklySummary",
    label: "Haftalık performans özeti",
    description: "Haftalık satış ve operasyon özetini gönder.",
  },
  {
    key: "emailNotifications",
    label: "E-posta bildirimleri",
    description: "Etkin bildirimleri kayıtlı e-posta adresine de gönder.",
  },
  {
    key: "inAppNotifications",
    label: "Panel içi bildirimler",
    description: "Etkin bildirimleri yönetim panelinde göster.",
  },
];

export const initialSessions: ActiveSession[] = [
  {
    id: "current-desktop",
    device: "Chrome · Windows 11",
    location: "İstanbul, Türkiye",
    lastActivity: "Şu anda aktif",
    current: true,
  },
  {
    id: "mobile-safari",
    device: "Safari · iPhone",
    location: "İstanbul, Türkiye",
    lastActivity: "Bugün, 08:16",
    current: false,
  },
  {
    id: "office-edge",
    device: "Edge · Windows 11",
    location: "Ankara, Türkiye",
    lastActivity: "15 Ağustos 2026, 17:44",
    current: false,
  },
];
