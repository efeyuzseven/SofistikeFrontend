import type {
  ReportColumn,
  ReportDefinition,
  ReportRow,
  ReportType,
} from "./report-types";

const channels = ["Web sitesi", "Pazaryeri", "E-ihracat"] as const;
const customers = ["B2C", "B2C", "B2B"] as const;
const categories = ["Banyo", "Mutfak", "Uyku", "Kurumsal"];
const orderStates = [
  "Teslim Edildi",
  "Hazırlanıyor",
  "Kargoya Verildi",
  "İptal Edildi",
  "Yeni",
];
const paymentStates = [
  "Başarılı",
  "Başarılı",
  "Bekliyor",
  "Başarısız",
  "İade Edildi",
];
const locations = [
  "İstanbul, Türkiye",
  "Ankara, Türkiye",
  "İzmir, Türkiye",
  "Berlin, Almanya",
  "Londra, Birleşik Krallık",
];
const dates = [
  "2026-08-16",
  "2026-08-15",
  "2026-08-14",
  "2026-08-13",
  "2026-08-12",
  "2026-08-11",
  "2026-08-10",
  "2026-08-09",
  "2026-08-08",
  "2026-08-07",
  "2026-08-06",
  "2026-08-05",
];

function row(
  index: number,
  values: ReportRow["values"],
  overrides: Partial<ReportRow> = {},
): ReportRow {
  return {
    id: `row-${index + 1}`,
    date: dates[index],
    channel: channels[index % channels.length],
    customerType: customers[index % customers.length],
    category: categories[index % categories.length],
    orderStatus: orderStates[index % orderStates.length],
    paymentStatus: paymentStates[index % paymentStates.length],
    currency: index % 5 === 3 ? "EUR" : index % 7 === 4 ? "USD" : "TRY",
    location: locations[index % locations.length],
    values,
    ...overrides,
  };
}
const column = (
  key: string,
  label: string,
  type: ReportColumn["type"] = "text",
): ReportColumn => ({ key, label, type, sortable: true });

const salesRows = dates.map((date, i) => {
  const gross = 42000 + i * 7850;
  const discount = 1800 + i * 310;
  return row(i, {
    date,
    channel: channels[i % 3],
    orders: 18 + i * 3,
    customerType: customers[i % 3],
    gross,
    discount,
    net: gross - discount,
  });
});
const orderRows = dates.map((date, i) =>
  row(i, {
    orderNo: `SFX-2026-${1840 + i}`,
    date,
    channel: channels[i % 3],
    customerType: customers[i % 3],
    status: orderStates[i % 5],
    preparation: `${12 + i * 1.5} saat`,
    amount: 980 + i * 425,
  }),
);
const products = [
  "Banyo Kokusu Seti",
  "Seramik Sabunluk",
  "Pamuklu Nevresim Takımı",
  "+XTRA Kurumsal Set",
  "Limon Bulaşık Deterjanı",
  "Yüz Havlusu – Bej",
];
const productRows = dates.map((_, i) =>
  row(i, {
    sku: `SOF-${String(1042 + i).padStart(4, "0")}`,
    product: products[i % products.length],
    category: categories[i % 4],
    sold: 22 + i * 7,
    stock: i % 4 === 0 ? 6 + i : 44 + i * 5,
    stockValue: 18500 + i * 6200,
  }),
);
const segments = [
  "Yeni Müşteri",
  "Aktif Müşteri",
  "Sadık Müşteri",
  "VIP Müşteri",
  "Risk Altında",
  "Pasif Müşteri",
];
const customerRows = dates.map((_, i) =>
  row(i, {
    segment: segments[i % segments.length],
    customerCount: 34 + i * 11,
    orderCount: 48 + i * 18,
    totalSpend: 52000 + i * 19500,
    averageSpend: 1120 + i * 145,
  }),
);
const reasons = [
  "Hasarlı ürün",
  "Yanlış ürün",
  "Geç teslimat",
  "Fikir değişikliği",
  "Eksik ürün",
];
const refundRows = dates.map((_, i) =>
  row(i, {
    requestNo: `RF-2026-${310 + i}`,
    orderNo: `SFX-2026-${1740 + i}`,
    type: i % 3 === 2 ? "Sipariş iptali" : i % 2 ? "Kısmi iade" : "Tam iade",
    reason: reasons[i % reasons.length],
    amount: 420 + i * 265,
    status:
      i % 4 === 0
        ? "İnceleniyor"
        : i % 4 === 1
          ? "Onaylandı"
          : i % 4 === 2
            ? "Tamamlandı"
            : "Reddedildi",
  }),
);
const methods = [
  "Kredi/banka kartı",
  "Havale/EFT",
  "Pazaryeri ödemesi",
  "B2B banka transferi",
];
const paymentRows = dates.map((_, i) =>
  row(i, {
    transactionNo: `PAY-2026-${7040 + i}`,
    method: methods[i % methods.length],
    channel: channels[i % 3],
    currency: i % 5 === 3 ? "EUR" : i % 7 === 4 ? "USD" : "TRY",
    amount: 1350 + i * 720,
    status: paymentStates[i % paymentStates.length],
  }),
);
const businessTypes = [
  "Otel",
  "Restoran",
  "Kafe",
  "Ofis",
  "Hastane",
  "Distribütör",
];
const companies = [
  "Luna Resort Collection",
  "Sera Mutfakları",
  "Urban Cup",
  "Mesa Workspaces",
  "MediNova",
  "Nova Dağıtım",
];
const b2bRows = dates.map((_, i) =>
  row(
    i,
    {
      company: companies[i % companies.length],
      businessType: businessTypes[i % businessTypes.length],
      projects: 1 + (i % 5),
      orders: 2 + i,
      revenue: 38000 + i * 27500,
      status: i % 5 === 0 ? "Pasif" : "Aktif",
    },
    { customerType: "B2B" },
  ),
);
const channelRows = dates.map((date, i) =>
  row(i, {
    date,
    channel: channels[i % 3],
    sessions: 8200 + i * 740,
    orders: 95 + i * 13,
    conversion: 1.8 + i * 0.14,
    revenue: 68000 + i * 18400,
  }),
);

export const reportDefinitions: Record<ReportType, ReportDefinition> = {
  "Satış Raporu": {
    type: "Satış Raporu",
    shortLabel: "Satış",
    description: "Brüt ve net satışların dönemsel kırılımı",
    columns: [
      column("date", "Tarih", "date"),
      column("channel", "Kanal"),
      column("orders", "Sipariş", "number"),
      column("customerType", "Müşteri Tipi"),
      column("gross", "Brüt Satış", "currency"),
      column("discount", "İndirim", "currency"),
      column("net", "Net Satış", "currency"),
    ],
    rows: salesRows,
  },
  "Sipariş Raporu": {
    type: "Sipariş Raporu",
    shortLabel: "Sipariş",
    description: "Sipariş hacmi, durumları ve hazırlama süreleri",
    columns: [
      column("orderNo", "Sipariş No"),
      column("date", "Tarih", "date"),
      column("channel", "Kanal"),
      column("customerType", "Müşteri Tipi"),
      column("status", "Durum", "status"),
      column("preparation", "Hazırlanma"),
      column("amount", "Tutar", "currency"),
    ],
    rows: orderRows,
  },
  "Ürün ve Stok Raporu": {
    type: "Ürün ve Stok Raporu",
    shortLabel: "Ürün & Stok",
    description: "Ürün satışları, stok seviyesi ve stok değeri",
    columns: [
      column("sku", "SKU"),
      column("product", "Ürün"),
      column("category", "Kategori"),
      column("sold", "Satılan", "number"),
      column("stock", "Mevcut Stok", "number"),
      column("stockValue", "Stok Değeri", "currency"),
    ],
    rows: productRows,
  },
  "Müşteri Raporu": {
    type: "Müşteri Raporu",
    shortLabel: "Müşteri",
    description: "Segment bazında müşteri ve harcama dağılımı",
    columns: [
      column("segment", "Segment"),
      column("customerCount", "Müşteri Sayısı", "number"),
      column("orderCount", "Sipariş Sayısı", "number"),
      column("totalSpend", "Toplam Harcama", "currency"),
      column("averageSpend", "Ort. Harcama", "currency"),
    ],
    rows: customerRows,
  },
  "İade ve İptal Raporu": {
    type: "İade ve İptal Raporu",
    shortLabel: "İade & İptal",
    description: "Talep türü, neden ve tutar kırılımları",
    columns: [
      column("requestNo", "Talep No"),
      column("orderNo", "Sipariş No"),
      column("type", "Tür"),
      column("reason", "Neden"),
      column("amount", "Tutar", "currency"),
      column("status", "Durum", "status"),
    ],
    rows: refundRows,
  },
  "Ödeme Raporu": {
    type: "Ödeme Raporu",
    shortLabel: "Ödeme",
    description: "Tahsilat, yöntem ve ödeme durumu dağılımı",
    columns: [
      column("transactionNo", "İşlem No"),
      column("method", "Yöntem"),
      column("channel", "Kanal"),
      column("currency", "Para Birimi"),
      column("amount", "Tutar", "currency"),
      column("status", "Durum", "status"),
    ],
    rows: paymentRows,
  },
  "B2B Raporu": {
    type: "B2B Raporu",
    shortLabel: "B2B",
    description: "Firma, proje, sipariş ve ciro performansı",
    columns: [
      column("company", "Firma"),
      column("businessType", "İşletme Türü"),
      column("projects", "Proje", "number"),
      column("orders", "Sipariş", "number"),
      column("revenue", "Ciro", "currency"),
      column("status", "Durum", "status"),
    ],
    rows: b2bRows,
  },
  "Kanal Performansı Raporu": {
    type: "Kanal Performansı Raporu",
    shortLabel: "Kanal",
    description: "Kanal bazında trafik, dönüşüm ve satış sonuçları",
    columns: [
      column("date", "Tarih", "date"),
      column("channel", "Kanal"),
      column("sessions", "Oturum", "number"),
      column("orders", "Sipariş", "number"),
      column("conversion", "Dönüşüm %", "number"),
      column("revenue", "Satış", "currency"),
    ],
    rows: channelRows,
  },
};
