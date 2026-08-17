import type {
  PaymentCurrency,
  PaymentCustomerType,
  PaymentSalesChannel,
} from "../payments/payment-types";

export const refundRequestTypes = [
  "Tam iade",
  "Kısmi iade",
  "Sipariş iptali",
] as const;

export const refundRequestStatuses = [
  "İnceleniyor",
  "Onaylandı",
  "Reddedildi",
  "İade İşleniyor",
  "Tamamlandı",
] as const;

export const refundReasons = [
  "Hasarlı ürün",
  "Yanlış ürün",
  "Beklentiyi karşılamadı",
  "Geç teslimat",
  "Mükerrer sipariş",
  "Müşteri vazgeçti",
  "Stok yetersizliği",
] as const;

export type RefundRequestType = (typeof refundRequestTypes)[number];
export type RefundRequestStatus = (typeof refundRequestStatuses)[number];
export type RefundReason = (typeof refundReasons)[number];
export type RefundTab = "all" | "refunds" | "cancellations";
export type ReviewDecision = "approve" | "reject";

export type RefundRequestItem = {
  name: string;
  sku: string;
  orderedQuantity: number;
  requestedQuantity: number;
  unitPrice: number;
};

export type RefundTimelineEntry = {
  title: string;
  description: string;
  date: string;
};

export type AdminRefundRequest = {
  id: number;
  paymentId: number;
  requestNumber: string;
  orderNumber: string;
  transactionNumber: string;
  customerName: string;
  companyName?: string;
  customerType: PaymentCustomerType;
  salesChannel: PaymentSalesChannel;
  salesLocation: string;
  currency: PaymentCurrency;
  requestType: RefundRequestType;
  status: RefundRequestStatus;
  reason: RefundReason;
  requestDate: string;
  orderAmount: number;
  requestedAmount: number;
  requestedAmountTry: number;
  customerNote: string;
  adminNote?: string;
  items: RefundRequestItem[];
  timeline: RefundTimelineEntry[];
};
