export const paymentStatuses = [
  "Başarılı",
  "Bekliyor",
  "Başarısız",
  "İade Edildi",
  "Kısmi İade",
] as const;

export const invoiceStatuses = [
  "Fatura Oluşturuldu",
  "Fatura Bekliyor",
  "Fatura Hatası",
  "Fatura Gerekmiyor",
] as const;

export const paymentMethods = [
  "Kredi/banka kartı",
  "Havale/EFT",
  "Pazaryeri ödemesi",
  "B2B banka transferi",
] as const;

export const customerTypes = ["B2C", "B2B"] as const;
export const salesChannels = ["Web sitesi", "Pazaryeri", "E-ihracat"] as const;
export const paymentCurrencies = ["TRY", "USD", "EUR", "GBP"] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];
export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentCustomerType = (typeof customerTypes)[number];
export type PaymentSalesChannel = (typeof salesChannels)[number];
export type PaymentCurrency = (typeof paymentCurrencies)[number];

export type PaymentTimelineEntry = {
  title: string;
  date: string;
  description: string;
};

export type PaymentOrderItem = {
  name: string;
  sku: string;
  quantity: number;
};

export type AdminPayment = {
  id: number;
  transactionNumber: string;
  orderNumber: string;
  customerName: string;
  companyName?: string;
  customerType: PaymentCustomerType;
  salesChannel: PaymentSalesChannel;
  salesLocation: string;
  paymentDate: string;
  paymentDateLabel: string;
  paymentMethod: PaymentMethod;
  paymentProvider: string;
  currency: PaymentCurrency;
  subtotal: number;
  discount: number;
  shipping: number;
  amount: number;
  reportingAmountTry: number;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceType: "E-Arşiv" | "E-İhracat" | "Harici" | "Gerekmiyor";
  refundAmount?: number;
  refundReportingAmountTry?: number;
  refundDate?: string;
  orderItems: PaymentOrderItem[];
  timeline: PaymentTimelineEntry[];
};

export type PaymentModalView = "payment" | "order" | "invoice";
