import { mockPayments } from "../payments/payment-data";
import type { AdminPayment } from "../payments/payment-types";
import type { AdminRefundRequest } from "./refund-types";

type RequestInput = Omit<
  AdminRefundRequest,
  | "orderNumber"
  | "transactionNumber"
  | "customerName"
  | "companyName"
  | "customerType"
  | "salesChannel"
  | "salesLocation"
  | "currency"
>;

function getPayment(paymentId: number): AdminPayment {
  const payment = mockPayments.find((item) => item.id === paymentId);
  if (!payment) throw new Error(`Mock ödeme kaydı bulunamadı: ${paymentId}`);
  return payment;
}

function createRequest(input: RequestInput): AdminRefundRequest {
  const payment = getPayment(input.paymentId);
  return {
    ...input,
    orderNumber: payment.orderNumber,
    transactionNumber: payment.transactionNumber,
    customerName: payment.customerName,
    companyName: payment.companyName,
    customerType: payment.customerType,
    salesChannel: payment.salesChannel,
    salesLocation: payment.salesLocation,
    currency: payment.currency,
  };
}

export const mockRefundRequests: AdminRefundRequest[] = [
  createRequest({
    id: 1,
    paymentId: 1,
    requestNumber: "RET-2026-0328",
    requestType: "Kısmi iade",
    status: "İnceleniyor",
    reason: "Hasarlı ürün",
    requestDate: "2026-08-11T15:34:00",
    orderAmount: 2450,
    requestedAmount: 450,
    requestedAmountTry: 450,
    customerNote: "Oda kokusunun şişesi kutu içinde kırılmış olarak ulaştı.",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        orderedQuantity: 1,
        requestedQuantity: 0,
        unitPrice: 2000,
      },
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        orderedQuantity: 1,
        requestedQuantity: 1,
        unitPrice: 450,
      },
    ],
    timeline: [
      {
        title: "Talep oluşturuldu",
        description: "Müşteri hasarlı ürün için kısmi iade talebi iletti.",
        date: "11 Ağustos 2026, 15:34",
      },
      {
        title: "İnceleme sırasına alındı",
        description: "Talep yönetici değerlendirmesi bekliyor.",
        date: "11 Ağustos 2026, 15:36",
      },
    ],
  }),
  createRequest({
    id: 2,
    paymentId: 2,
    requestNumber: "CAN-2026-0186",
    requestType: "Sipariş iptali",
    status: "İnceleniyor",
    reason: "Müşteri vazgeçti",
    requestDate: "2026-08-11T11:20:00",
    orderAmount: 1890,
    requestedAmount: 1890,
    requestedAmountTry: 1890,
    customerNote: "Sipariş henüz hazırlanmadan iptal etmek istiyorum.",
    items: [
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        orderedQuantity: 2,
        requestedQuantity: 2,
        unitPrice: 745,
      },
      {
        name: "Seramik Sabunluk",
        sku: "SOF-BNY-1126",
        orderedQuantity: 1,
        requestedQuantity: 1,
        unitPrice: 400,
      },
    ],
    timeline: [
      {
        title: "İptal talebi alındı",
        description: "Sipariş iptal talebi web sitesi üzerinden iletildi.",
        date: "11 Ağustos 2026, 11:20",
      },
    ],
  }),
  createRequest({
    id: 3,
    paymentId: 4,
    requestNumber: "RET-2026-0322",
    requestType: "Tam iade",
    status: "Onaylandı",
    reason: "Yanlış ürün",
    requestDate: "2026-08-10T18:05:00",
    orderAmount: 3559.7,
    requestedAmount: 3559.7,
    requestedAmountTry: 3559.7,
    customerNote: "Pazaryerinde seçtiğim ürünlerden farklı ürünler gönderildi.",
    adminNote: "Ürün fotoğrafları kontrol edildi; tam iade uygun bulundu.",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        orderedQuantity: 1,
        requestedQuantity: 1,
        unitPrice: 2199.9,
      },
      {
        name: "Ahşap Servis Tepsisi",
        sku: "SOF-MTF-2097",
        orderedQuantity: 2,
        requestedQuantity: 2,
        unitPrice: 679.9,
      },
    ],
    timeline: [
      {
        title: "Talep oluşturuldu",
        description: "Pazaryeri tam iade talebi sisteme aktarıldı.",
        date: "10 Ağustos 2026, 18:05",
      },
      {
        title: "Talep onaylandı",
        description: "Yönetici talebi mock ortamda onayladı.",
        date: "11 Ağustos 2026, 09:12",
      },
    ],
  }),
  createRequest({
    id: 4,
    paymentId: 7,
    requestNumber: "RET-2026-0307",
    requestType: "Kısmi iade",
    status: "Tamamlandı",
    reason: "Beklentiyi karşılamadı",
    requestDate: "2026-08-08T10:15:00",
    orderAmount: 950,
    requestedAmount: 189.9,
    requestedAmountTry: 189.9,
    customerNote: "Deterjanın kokusu beklentimi karşılamadı.",
    adminNote: "Bir adet ürün için geçmiş mock iade kaydı tamamlandı.",
    items: [
      {
        name: "Ahşap Servis Tepsisi",
        sku: "SOF-MTF-2097",
        orderedQuantity: 1,
        requestedQuantity: 0,
        unitPrice: 570.2,
      },
      {
        name: "Limon Bulaşık Deterjanı",
        sku: "SOF-MTF-2041",
        orderedQuantity: 2,
        requestedQuantity: 1,
        unitPrice: 189.9,
      },
    ],
    timeline: [
      {
        title: "Kısmi iade talebi alındı",
        description: "Bir ürün için talep kaydedildi.",
        date: "8 Ağustos 2026, 10:15",
      },
      {
        title: "Talep tamamlandı",
        description: "Geçmiş mock finansal kayıt tamamlandı olarak işlendi.",
        date: "9 Ağustos 2026, 09:16",
      },
    ],
  }),
  createRequest({
    id: 5,
    paymentId: 6,
    requestNumber: "RET-2026-0299",
    requestType: "Tam iade",
    status: "Tamamlandı",
    reason: "Hasarlı ürün",
    requestDate: "2026-08-08T17:55:00",
    orderAmount: 949.8,
    requestedAmount: 949.8,
    requestedAmountTry: 949.8,
    customerNote: "Bakım setinin dış kutusu ve iki ürünü hasarlıydı.",
    adminNote: "Hasar kaydı doğrulandı.",
    items: [
      {
        name: "Evcil Dostlar Bakım Seti",
        sku: "SOF-EVC-4018",
        orderedQuantity: 1,
        requestedQuantity: 1,
        unitPrice: 949.8,
      },
    ],
    timeline: [
      {
        title: "Tam iade talebi alındı",
        description: "Hasarlı teslimat bildirildi.",
        date: "8 Ağustos 2026, 17:55",
      },
      {
        title: "Talep tamamlandı",
        description: "Geçmiş mock iade kaydı tamamlandı.",
        date: "8 Ağustos 2026, 18:12",
      },
    ],
  }),
  createRequest({
    id: 6,
    paymentId: 10,
    requestNumber: "CAN-2026-0172",
    requestType: "Sipariş iptali",
    status: "Onaylandı",
    reason: "Mükerrer sipariş",
    requestDate: "2026-08-02T09:28:00",
    orderAmount: 799.8,
    requestedAmount: 799.8,
    requestedAmountTry: 799.8,
    customerNote: "Aynı siparişi yanlışlıkla iki kez oluşturdum.",
    adminNote: "Hazırlık başlamadığı için iptal uygun bulundu.",
    items: [
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        orderedQuantity: 1,
        requestedQuantity: 1,
        unitPrice: 799.8,
      },
    ],
    timeline: [
      {
        title: "İptal talebi oluşturuldu",
        description: "Mükerrer sipariş bildirildi.",
        date: "2 Ağustos 2026, 09:28",
      },
      {
        title: "Talep onaylandı",
        description: "İptal talebi mock ortamda onaylandı.",
        date: "2 Ağustos 2026, 09:42",
      },
    ],
  }),
  createRequest({
    id: 7,
    paymentId: 13,
    requestNumber: "RET-2026-0264",
    requestType: "Tam iade",
    status: "Reddedildi",
    reason: "Beklentiyi karşılamadı",
    requestDate: "2026-07-24T14:10:00",
    orderAmount: 1200,
    requestedAmount: 1200,
    requestedAmountTry: 1200,
    customerNote: "Kokunun kalıcılığı beklediğim gibi değildi.",
    adminNote: "İade süresi aşıldığı için talep reddedildi.",
    items: [
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        orderedQuantity: 3,
        requestedQuantity: 3,
        unitPrice: 400,
      },
    ],
    timeline: [
      {
        title: "Talep oluşturuldu",
        description: "Tam iade talebi alındı.",
        date: "24 Temmuz 2026, 14:10",
      },
      {
        title: "Talep reddedildi",
        description: "İade süresi koşulu sağlanmadı.",
        date: "24 Temmuz 2026, 16:05",
      },
    ],
  }),
  createRequest({
    id: 8,
    paymentId: 14,
    requestNumber: "RET-2026-0248",
    requestType: "Kısmi iade",
    status: "İade İşleniyor",
    reason: "Hasarlı ürün",
    requestDate: "2026-07-20T09:45:00",
    orderAmount: 118,
    requestedAmount: 28,
    requestedAmountTry: 1156.4,
    customerNote: "Oda kokusunun kapağı taşıma sırasında kırılmış.",
    adminNote: "E-ihracat iade kaydı işleme sırasına alındı.",
    items: [
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        orderedQuantity: 1,
        requestedQuantity: 0,
        unitPrice: 90,
      },
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        orderedQuantity: 1,
        requestedQuantity: 1,
        unitPrice: 28,
      },
    ],
    timeline: [
      {
        title: "E-ihracat talebi alındı",
        description: "Kısmi iade talebi kaydedildi.",
        date: "20 Temmuz 2026, 09:45",
      },
      {
        title: "İade işleniyor",
        description: "Geçmiş mock kayıt işlem sırasında.",
        date: "21 Temmuz 2026, 10:08",
      },
    ],
  }),
  createRequest({
    id: 9,
    paymentId: 12,
    requestNumber: "CAN-2026-0158",
    requestType: "Sipariş iptali",
    status: "Tamamlandı",
    reason: "Stok yetersizliği",
    requestDate: "2026-07-26T16:08:00",
    orderAmount: 1100,
    requestedAmount: 1100,
    requestedAmountTry: 1100,
    customerNote: "Pazaryeri siparişi için bilgilendirme bekliyorum.",
    adminNote:
      "Stok eşleşmesi yapılamadığı için geçmiş iptal kaydı tamamlandı.",
    items: [
      {
        name: "Yüz Havlusu – Bej",
        sku: "SOF-BNY-1088",
        orderedQuantity: 4,
        requestedQuantity: 4,
        unitPrice: 275,
      },
    ],
    timeline: [
      {
        title: "Sistem iptal talebi oluşturdu",
        description: "Pazaryeri stok eşleşmesi başarısız oldu.",
        date: "26 Temmuz 2026, 16:08",
      },
      {
        title: "İptal tamamlandı",
        description: "Geçmiş mock iptal kaydı kapatıldı.",
        date: "26 Temmuz 2026, 16:24",
      },
    ],
  }),
  createRequest({
    id: 10,
    paymentId: 5,
    requestNumber: "RET-2026-0227",
    requestType: "Kısmi iade",
    status: "Reddedildi",
    reason: "Geç teslimat",
    requestDate: "2026-07-30T13:16:00",
    orderAmount: 135,
    requestedAmount: 60,
    requestedAmountTry: 2877,
    customerNote: "Gönderi planlanan tarihten sonra teslim edildi.",
    adminNote: "Taşıyıcı teslimat süresi taahhüt aralığında kaldı.",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        orderedQuantity: 1,
        requestedQuantity: 0,
        unitPrice: 105,
      },
      {
        name: "Lavanta Oda Kokusu",
        sku: "SOF-EVB-5033",
        orderedQuantity: 2,
        requestedQuantity: 2,
        unitPrice: 15,
      },
    ],
    timeline: [
      {
        title: "Kısmi iade talebi alındı",
        description: "E-ihracat talebi destek kanalıyla oluşturuldu.",
        date: "30 Temmuz 2026, 13:16",
      },
      {
        title: "Talep reddedildi",
        description: "Teslimat süreleri incelendi.",
        date: "30 Temmuz 2026, 16:52",
      },
    ],
  }),
  createRequest({
    id: 11,
    paymentId: 9,
    requestNumber: "RET-2026-0209",
    requestType: "Tam iade",
    status: "Onaylandı",
    reason: "Yanlış ürün",
    requestDate: "2026-07-29T10:42:00",
    orderAmount: 20000,
    requestedAmount: 20000,
    requestedAmountTry: 20000,
    customerNote: "Kurumsal siparişimizde farklı renk ürünler sevk edildi.",
    adminNote: "Kurumsal müşteri temsilcisi ürün farkını doğruladı.",
    items: [
      {
        name: "Pamuklu Nevresim Takımı",
        sku: "SOF-UYK-3014",
        orderedQuantity: 10,
        requestedQuantity: 10,
        unitPrice: 1500,
      },
      {
        name: "Yüz Havlusu – Bej",
        sku: "SOF-BNY-1088",
        orderedQuantity: 30,
        requestedQuantity: 30,
        unitPrice: 166.67,
      },
    ],
    timeline: [
      {
        title: "Kurumsal iade talebi alındı",
        description: "B2B tam iade talebi oluşturuldu.",
        date: "29 Temmuz 2026, 10:42",
      },
      {
        title: "Talep onaylandı",
        description: "Mock yönetici değerlendirmesi tamamlandı.",
        date: "29 Temmuz 2026, 12:10",
      },
    ],
  }),
  createRequest({
    id: 12,
    paymentId: 11,
    requestNumber: "CAN-2026-0139",
    requestType: "Sipariş iptali",
    status: "İnceleniyor",
    reason: "Müşteri vazgeçti",
    requestDate: "2026-07-29T12:05:00",
    orderAmount: 1420,
    requestedAmount: 1420,
    requestedAmountTry: 68082.2,
    customerNote:
      "Otel açılış tarihi ertelendiği için siparişi iptal etmek istiyoruz.",
    items: [
      {
        name: "Yüz Havlusu – Bej",
        sku: "SOF-BNY-1088",
        orderedQuantity: 40,
        requestedQuantity: 40,
        unitPrice: 17,
      },
      {
        name: "Banyo Kokusu Seti",
        sku: "SOF-BNY-1042",
        orderedQuantity: 12,
        requestedQuantity: 12,
        unitPrice: 61.67,
      },
    ],
    timeline: [
      {
        title: "B2B iptal talebi oluşturuldu",
        description: "E-ihracat kurumsal talebi sisteme kaydedildi.",
        date: "29 Temmuz 2026, 12:05",
      },
    ],
  }),
];
