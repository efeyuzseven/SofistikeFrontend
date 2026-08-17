export type OrderChannel = "B2C" | "B2B";
export type OrderStatus =
  | "Yeni"
  | "Onaylandı"
  | "Hazırlanıyor"
  | "Kargoya Verildi"
  | "Teslim Edildi"
  | "İptal Edildi";
export type PaymentStatus = "Ödendi" | "Ödeme Bekliyor" | "İade Edildi";

export type OrderLine = {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
};

export type OrderStatusHistory = {
  status: OrderStatus;
  date: string;
  note: string;
};

export type AdminOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  companyName?: string;
  channel: OrderChannel;
  phone: string;
  email: string;
  address: string;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  orderDate: string;
  orderDateLabel: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  status: OrderStatus;
  note: string;
  statusHistory: OrderStatusHistory[];
};

const history = (status: OrderStatus, date: string): OrderStatusHistory[] => [
  { status: "Yeni", date, note: "Sipariş sisteme alındı." },
  ...(status === "Yeni"
    ? []
    : [{ status, date, note: `Sipariş durumu ${status} olarak güncellendi.` }]),
];

export const orderStatuses: OrderStatus[] = [
  "Yeni",
  "Onaylandı",
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
];

export const initialOrders: AdminOrder[] = [
  {
    id: 1,
    orderNumber: "#SOF-2026-1284",
    customerName: "Ayşe Yılmaz",
    channel: "B2C",
    phone: "+90 532 444 18 24",
    email: "ayse.yilmaz@example.com",
    address: "Suadiye Mah. Bağdat Cad. No: 214/6 Kadıköy, İstanbul",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        quantity: 1,
        unitPrice: 2199.9,
      },
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        quantity: 1,
        unitPrice: 429.9,
      },
    ],
    subtotal: 2629.8,
    shipping: 0,
    discount: 179.8,
    total: 2450,
    orderDate: "2026-08-11",
    orderDateLabel: "11 Ağustos 2026, 12:18",
    paymentStatus: "Ödendi",
    paymentMethod: "Kredi Kartı ·•••• 4821",
    status: "Yeni",
    note: "Mümkünse hediye paketi yapılmasını rica ederim.",
    statusHistory: history("Yeni", "11 Ağustos 2026, 12:18"),
  },
  {
    id: 2,
    orderNumber: "#SOF-2026-1283",
    customerName: "Mehmet Demir",
    channel: "B2C",
    phone: "+90 535 218 44 61",
    email: "mehmet.demir@example.com",
    address: "Bahçelievler Mah. 52. Sok. No: 8 Çankaya, Ankara",
    items: [
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        quantity: 2,
        unitPrice: 749.9,
      },
      {
        name: "Seramik Sabunluk",
        sku: "SOF-BNY-1126",
        quantity: 1,
        unitPrice: 349.9,
      },
    ],
    subtotal: 1849.7,
    shipping: 40.3,
    discount: 0,
    total: 1890,
    orderDate: "2026-08-11",
    orderDateLabel: "11 Ağustos 2026, 10:36",
    paymentStatus: "Ödendi",
    paymentMethod: "Banka Kartı",
    status: "Hazırlanıyor",
    note: "Teslimattan önce aranmak istiyorum.",
    statusHistory: history("Hazırlanıyor", "11 Ağustos 2026, 10:36"),
  },
  {
    id: 3,
    orderNumber: "#SOF-B2B-0942",
    customerName: "Selin Aksoy",
    companyName: "Minoa Hotel & Spa A.Ş.",
    channel: "B2B",
    phone: "+90 212 555 09 42",
    email: "satinalma@minoahotel.com",
    address: "Gümüşsuyu Mah. İnönü Cad. No: 32 Beyoğlu, İstanbul",
    items: [
      {
        name: "Yüz Havlusu – Bej",
        sku: "SOF-BNY-1088",
        quantity: 24,
        unitPrice: 199.9,
      },
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        quantity: 6,
        unitPrice: 524.9,
      },
    ],
    subtotal: 7947,
    shipping: 0,
    discount: 397.35,
    total: 7549.65,
    orderDate: "2026-08-10",
    orderDateLabel: "10 Ağustos 2026, 16:22",
    paymentStatus: "Ödeme Bekliyor",
    paymentMethod: "Havale / EFT",
    status: "Onaylandı",
    note: "Sevkiyat otelin arka depo girişine yapılacaktır.",
    statusHistory: history("Onaylandı", "10 Ağustos 2026, 16:22"),
  },
  {
    id: 4,
    orderNumber: "#SOF-2026-1282",
    customerName: "Zeynep Kaya",
    channel: "B2C",
    phone: "+90 544 303 72 19",
    email: "zeynep.kaya@example.com",
    address: "Alsancak Mah. Kıbrıs Şehitleri Cad. No: 96 Konak, İzmir",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        quantity: 1,
        unitPrice: 2199.9,
      },
      {
        name: "Ahşap Servis Tepsisi",
        sku: "SOF-MTF-2097",
        quantity: 2,
        unitPrice: 679.9,
      },
    ],
    subtotal: 3559.7,
    shipping: 0,
    discount: 0,
    total: 3559.7,
    orderDate: "2026-08-10",
    orderDateLabel: "10 Ağustos 2026, 14:05",
    paymentStatus: "Ödendi",
    paymentMethod: "Kredi Kartı ·•••• 1097",
    status: "Kargoya Verildi",
    note: "Kapıya bırakılmasın.",
    statusHistory: history("Kargoya Verildi", "10 Ağustos 2026, 14:05"),
  },
  {
    id: 5,
    orderNumber: "#SOF-B2B-0941",
    customerName: "Burak Şen",
    companyName: "Natura Yaşam Mağazacılık Ltd.",
    channel: "B2B",
    phone: "+90 224 555 41 20",
    email: "operasyon@naturayasam.com",
    address: "Nilüfer Organize Sanayi Bölgesi 4. Cad. No: 18 Bursa",
    items: [
      {
        name: "Limon Bulaşık Deterjanı",
        sku: "SOF-MTF-2041",
        quantity: 36,
        unitPrice: 129.9,
      },
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        quantity: 20,
        unitPrice: 299.9,
      },
    ],
    subtotal: 10674.4,
    shipping: 0,
    discount: 674.4,
    total: 10000,
    orderDate: "2026-08-09",
    orderDateLabel: "9 Ağustos 2026, 11:48",
    paymentStatus: "Ödendi",
    paymentMethod: "Havale / EFT",
    status: "Teslim Edildi",
    note: "Paletli sevkiyat talep edildi.",
    statusHistory: history("Teslim Edildi", "9 Ağustos 2026, 11:48"),
  },
  {
    id: 6,
    orderNumber: "#SOF-2026-1279",
    customerName: "Emre Arslan",
    channel: "B2C",
    phone: "+90 538 444 20 61",
    email: "emre.arslan@example.com",
    address: "Atakum Mah. Atatürk Bulvarı No: 151 Samsun",
    items: [
      {
        name: "Evcil Dostlar Bakım Seti",
        sku: "SOF-EVC-4018",
        quantity: 1,
        unitPrice: 899.9,
      },
    ],
    subtotal: 899.9,
    shipping: 49.9,
    discount: 0,
    total: 949.8,
    orderDate: "2026-08-08",
    orderDateLabel: "8 Ağustos 2026, 17:32",
    paymentStatus: "İade Edildi",
    paymentMethod: "Kredi Kartı ·•••• 7734",
    status: "İptal Edildi",
    note: "Müşteri talebiyle iptal edildi.",
    statusHistory: history("İptal Edildi", "8 Ağustos 2026, 17:32"),
  },
  {
    id: 7,
    orderNumber: "#SOF-2026-1278",
    customerName: "Fatma Çelik",
    channel: "B2C",
    phone: "+90 533 581 08 14",
    email: "fatma.celik@example.com",
    address: "Yenişehir Mah. Lale Sok. No: 7 Merkez, Eskişehir",
    items: [
      {
        name: "Ahşap Servis Tepsisi",
        sku: "SOF-MTF-2097",
        quantity: 1,
        unitPrice: 679.9,
      },
      {
        name: "Limon Bulaşık Deterjanı",
        sku: "SOF-MTF-2041",
        quantity: 2,
        unitPrice: 189.9,
      },
    ],
    subtotal: 1059.7,
    shipping: 40,
    discount: 149.7,
    total: 950,
    orderDate: "2026-08-07",
    orderDateLabel: "7 Ağustos 2026, 13:10",
    paymentStatus: "Ödendi",
    paymentMethod: "Kredi Kartı ·•••• 2218",
    status: "Hazırlanıyor",
    note: "Kırılabilir ürün etiketi ekleyin.",
    statusHistory: history("Hazırlanıyor", "7 Ağustos 2026, 13:10"),
  },
  {
    id: 8,
    orderNumber: "#SOF-B2B-0938",
    customerName: "Ece Polat",
    companyName: "Luna Concept Stores A.Ş.",
    channel: "B2B",
    phone: "+90 216 555 38 10",
    email: "ece.polat@lunaconcept.com",
    address: "Kozyatağı Mah. Değirmen Sok. No: 12 Kadıköy, İstanbul",
    items: [
      {
        name: "Seramik Sabunluk",
        sku: "SOF-BNY-1126",
        quantity: 18,
        unitPrice: 239.9,
      },
    ],
    subtotal: 4318.2,
    shipping: 0,
    discount: 318.2,
    total: 4000,
    orderDate: "2026-08-06",
    orderDateLabel: "6 Ağustos 2026, 09:42",
    paymentStatus: "Ödeme Bekliyor",
    paymentMethod: "Vadeli Hesap · 15 gün",
    status: "Yeni",
    note: "Mağaza kodu LC-04 ile işleyin.",
    statusHistory: history("Yeni", "6 Ağustos 2026, 09:42"),
  },
  {
    id: 9,
    orderNumber: "#SOF-2026-1275",
    customerName: "Deniz Aydın",
    channel: "B2C",
    phone: "+90 555 228 16 90",
    email: "deniz.aydin@example.com",
    address: "Konyaaltı Mah. Akdeniz Bulvarı No: 72 Antalya",
    items: [
      {
        name: "Yüz Havlusu – Bej",
        sku: "SOF-BNY-1088",
        quantity: 4,
        unitPrice: 289.9,
      },
    ],
    subtotal: 1159.6,
    shipping: 0,
    discount: 59.6,
    total: 1100,
    orderDate: "2026-08-05",
    orderDateLabel: "5 Ağustos 2026, 15:26",
    paymentStatus: "Ödendi",
    paymentMethod: "Kredi Kartı ·•••• 8842",
    status: "Teslim Edildi",
    note: "Yok.",
    statusHistory: history("Teslim Edildi", "5 Ağustos 2026, 15:26"),
  },
  {
    id: 10,
    orderNumber: "#SOF-2026-1272",
    customerName: "Ceren Koç",
    channel: "B2C",
    phone: "+90 536 317 42 08",
    email: "ceren.koc@example.com",
    address: "Çayyolu Mah. 2432. Cad. No: 19 Çankaya, Ankara",
    items: [
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        quantity: 3,
        unitPrice: 429.9,
      },
    ],
    subtotal: 1289.7,
    shipping: 0,
    discount: 89.7,
    total: 1200,
    orderDate: "2026-08-04",
    orderDateLabel: "4 Ağustos 2026, 11:08",
    paymentStatus: "Ödendi",
    paymentMethod: "Kredi Kartı ·•••• 4305",
    status: "Onaylandı",
    note: "Fatura e-posta ile gönderilsin.",
    statusHistory: history("Onaylandı", "4 Ağustos 2026, 11:08"),
  },
  {
    id: 11,
    orderNumber: "#SOF-B2B-0935",
    customerName: "Tolga Erdem",
    companyName: "Arca Residence İşletmeleri",
    channel: "B2B",
    phone: "+90 232 555 64 22",
    email: "tedarik@arcaresidence.com",
    address: "Mavişehir Mah. 2040 Sok. No: 6 Karşıyaka, İzmir",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        quantity: 10,
        unitPrice: 1599.9,
      },
      {
        name: "Yüz Havlusu – Bej",
        sku: "SOF-BNY-1088",
        quantity: 30,
        unitPrice: 199.9,
      },
    ],
    subtotal: 21996,
    shipping: 0,
    discount: 1996,
    total: 20000,
    orderDate: "2026-08-03",
    orderDateLabel: "3 Ağustos 2026, 10:15",
    paymentStatus: "Ödendi",
    paymentMethod: "Havale / EFT",
    status: "Kargoya Verildi",
    note: "İki ayrı irsaliye hazırlanacak.",
    statusHistory: history("Kargoya Verildi", "3 Ağustos 2026, 10:15"),
  },
  {
    id: 12,
    orderNumber: "#SOF-2026-1268",
    customerName: "Gökçe Şahin",
    channel: "B2C",
    phone: "+90 541 667 12 30",
    email: "gokce.sahin@example.com",
    address: "Çarşı Mah. İskele Cad. No: 24 Bodrum, Muğla",
    items: [
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        quantity: 1,
        unitPrice: 749.9,
      },
    ],
    subtotal: 749.9,
    shipping: 49.9,
    discount: 0,
    total: 799.8,
    orderDate: "2026-08-01",
    orderDateLabel: "1 Ağustos 2026, 18:40",
    paymentStatus: "Ödeme Bekliyor",
    paymentMethod: "Kapıda Ödeme",
    status: "Yeni",
    note: "Akşam saatlerinde teslimat tercih edilir.",
    statusHistory: history("Yeni", "1 Ağustos 2026, 18:40"),
  },
];
