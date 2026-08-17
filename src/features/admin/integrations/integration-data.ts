import type { Integration, IntegrationCategory } from "./integration-types";

const syncItems: Record<IntegrationCategory, string[]> = {
  Pazaryeri: ["Ürün", "Fiyat", "Stok", "Sipariş"],
  Ödeme: ["Ödeme", "İşlem durumu"],
  Kargo: ["Gönderi", "Takip durumu"],
  Fatura: ["Fatura", "E-arşiv durumu"],
  "E-ihracat": ["Sipariş", "Ülke", "Gümrük durumu"],
  Analitik: ["Görüntülenme", "Dönüşüm", "Satış olayı"],
  Bildirim: ["E-posta teslimi", "SMS teslimi"],
  "Sosyal medya": ["İçerik", "Bağlantı durumu"],
};

function record(
  id: number,
  name: string,
  category: IntegrationCategory,
  partial: Partial<Integration>,
): Integration {
  return {
    id,
    name,
    category,
    description: `${name} veri akışını merkezi yönetim ekranına bağlar.`,
    status: "Bağlı",
    accountName: "Sofistike +XTRA Ana Hesap",
    connectedAt: "2026-05-12T09:30:00+03:00",
    lastSuccessfulConnection: "2026-08-16T08:45:00+03:00",
    lastSync: "2026-08-16T08:40:00+03:00",
    nextSync: "2026-08-16T09:40:00+03:00",
    autoSync: true,
    frequency: "Saatlik",
    pendingRecords: 0,
    successfulOperations: 1248 + id * 41,
    failedOperations: 0,
    environment: "Canlı",
    syncItems: syncItems[category],
    notificationsEnabled: true,
    lastConfiguredAt: "2026-08-10T14:20:00+03:00",
    logs: [
      {
        id: `${id}-1`,
        date: "2026-08-16T08:40:00+03:00",
        operation: "Planlı senkronizasyon",
        result: "Başarılı",
        description: "Kayıtlar planlanan zamanda güncellendi.",
        affectedRecords: 36 + id,
      },
      {
        id: `${id}-2`,
        date: "2026-08-15T18:00:00+03:00",
        operation: "Bağlantı kontrolü",
        result: "Başarılı",
        description: "Bağlantı ayarları doğrulandı.",
        affectedRecords: 0,
      },
    ],
    ...partial,
  };
}

export const initialIntegrations: Integration[] = [
  record(1, "Trendyol", "Pazaryeri", {
    pendingRecords: 18,
    frequency: "15 dakikada bir",
  }),
  record(2, "Hepsiburada", "Pazaryeri", {
    status: "Dikkat Gerekiyor",
    pendingRecords: 7,
    failedOperations: 3,
    errorMessage: "Bazı stok kayıtları eşleştirilemedi.",
  }),
  record(3, "Amazon", "Pazaryeri", {
    status: "Bağlantı Bekliyor",
    autoSync: false,
    frequency: "Manuel",
    connectedAt: undefined,
    lastSync: undefined,
    nextSync: undefined,
    accountName: "Mağaza bağlantısı bekleniyor",
  }),
  record(4, "Genel Ödeme Altyapısı", "Ödeme", {
    pendingRecords: 2,
    frequency: "15 dakikada bir",
  }),
  record(5, "Genel Kargo Altyapısı", "Kargo", {
    status: "Bakımda",
    pendingRecords: 11,
    autoSync: false,
    nextSync: undefined,
  }),
  record(6, "E-Arşiv Fatura Altyapısı", "Fatura", {
    status: "Hata",
    pendingRecords: 24,
    failedOperations: 8,
    errorMessage: "Fatura durumları geçici olarak güncellenemiyor.",
  }),
  record(7, "E-İhracat Altyapısı", "E-ihracat", {
    status: "Dikkat Gerekiyor",
    pendingRecords: 5,
    failedOperations: 2,
    errorMessage: "Bazı ülke kodları kontrol bekliyor.",
    frequency: "Günlük",
  }),
  record(8, "Google Analytics 4", "Analitik", {
    accountName: "Sofistike +XTRA Web Veri Akışı",
    pendingRecords: 0,
    frequency: "Günlük",
  }),
  record(9, "E-posta ve SMS Altyapısı", "Bildirim", {
    pendingRecords: 9,
    frequency: "15 dakikada bir",
  }),
  record(10, "Instagram", "Sosyal medya", {
    accountName: "@sofistikextra",
    frequency: "Günlük",
  }),
  record(11, "TikTok", "Sosyal medya", {
    status: "Devre Dışı",
    accountName: "@sofistikextra",
    autoSync: false,
    frequency: "Manuel",
    nextSync: undefined,
  }),
];
