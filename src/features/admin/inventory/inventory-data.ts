import type { ProductCategory } from "../products/product-data";

export type StockItem = {
  id: number;
  name: string;
  sku: string;
  category: ProductCategory;
  stock: number;
  minimumStock: number;
  lastUpdated: string;
  pending: boolean;
  visual: string;
  visualTone: "sand" | "rose" | "mint" | "lavender" | "peach";
};

export type StockMovementType = "Stok Girişi" | "Stok Çıkışı";

export type StockMovement = {
  id: number;
  productId: number;
  productName: string;
  type: StockMovementType;
  amount: number;
  note: string;
  date: string;
  user: string;
};

export const initialStockItems: StockItem[] = [
  {
    id: 1,
    name: "Banyo Kokusu Seti",
    sku: "SOF-BNY-1042",
    category: "Banyo",
    stock: 5,
    minimumStock: 10,
    lastUpdated: "11 Ağustos 2026, 10:42",
    pending: true,
    visual: "BK",
    visualTone: "rose",
  },
  {
    id: 2,
    name: "Yüz Havlusu – Bej",
    sku: "SOF-BNY-1088",
    category: "Banyo",
    stock: 38,
    minimumStock: 15,
    lastUpdated: "11 Ağustos 2026, 09:18",
    pending: false,
    visual: "YH",
    visualTone: "sand",
  },
  {
    id: 3,
    name: "Seramik Sabunluk",
    sku: "SOF-BNY-1126",
    category: "Banyo",
    stock: 0,
    minimumStock: 8,
    lastUpdated: "10 Ağustos 2026, 17:05",
    pending: true,
    visual: "SS",
    visualTone: "lavender",
  },
  {
    id: 4,
    name: "Limon Bulaşık Deterjanı",
    sku: "SOF-MTF-2041",
    category: "Mutfak",
    stock: 64,
    minimumStock: 20,
    lastUpdated: "11 Ağustos 2026, 11:12",
    pending: false,
    visual: "LD",
    visualTone: "peach",
  },
  {
    id: 5,
    name: "Pamuklu Nevresim Takımı",
    sku: "SOF-UYK-3014",
    category: "Uyku",
    stock: 9,
    minimumStock: 12,
    lastUpdated: "10 Ağustos 2026, 15:36",
    pending: true,
    visual: "PN",
    visualTone: "lavender",
  },
  {
    id: 6,
    name: "Ahşap Servis Tepsisi",
    sku: "SOF-MTF-2097",
    category: "Mutfak",
    stock: 24,
    minimumStock: 10,
    lastUpdated: "9 Ağustos 2026, 13:24",
    pending: false,
    visual: "AT",
    visualTone: "sand",
  },
  {
    id: 7,
    name: "Evcil Dostlar Bakım Seti",
    sku: "SOF-EVC-4018",
    category: "Evcil Dostlar",
    stock: 7,
    minimumStock: 7,
    lastUpdated: "11 Ağustos 2026, 08:55",
    pending: false,
    visual: "EB",
    visualTone: "mint",
  },
  {
    id: 8,
    name: "Lavanta Oda Kokusu",
    sku: "SOF-EVB-5033",
    category: "Ev Bakımı",
    stock: 42,
    minimumStock: 14,
    lastUpdated: "10 Ağustos 2026, 16:48",
    pending: false,
    visual: "LO",
    visualTone: "rose",
  },
];

export const initialStockMovements: StockMovement[] = [
  {
    id: 1,
    productId: 4,
    productName: "Limon Bulaşık Deterjanı",
    type: "Stok Girişi",
    amount: 40,
    note: "Merkez depo teslimatı",
    date: "11 Ağustos 2026, 11:12",
    user: "Admin",
  },
  {
    id: 2,
    productId: 1,
    productName: "Banyo Kokusu Seti",
    type: "Stok Çıkışı",
    amount: 3,
    note: "Sofistike.com siparişleri",
    date: "11 Ağustos 2026, 10:42",
    user: "Admin",
  },
  {
    id: 3,
    productId: 2,
    productName: "Yüz Havlusu – Bej",
    type: "Stok Çıkışı",
    amount: 6,
    note: "Trendyol sipariş aktarımı",
    date: "11 Ağustos 2026, 09:18",
    user: "Zeynep K.",
  },
  {
    id: 4,
    productId: 3,
    productName: "Seramik Sabunluk",
    type: "Stok Çıkışı",
    amount: 2,
    note: "Son siparişler sevk edildi",
    date: "10 Ağustos 2026, 17:05",
    user: "Admin",
  },
  {
    id: 5,
    productId: 5,
    productName: "Pamuklu Nevresim Takımı",
    type: "Stok Girişi",
    amount: 8,
    note: "Üretimden kısmi teslimat",
    date: "10 Ağustos 2026, 15:36",
    user: "Mert A.",
  },
];
