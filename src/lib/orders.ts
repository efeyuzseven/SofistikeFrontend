export type BackendOrderLine = {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  currencyCode: string;
};

export type BackendOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  contactEmail: string;
  recipientName: string;
  city: string;
  district: string;
  addressLine: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  currencyCode: string;
  createdAtUtc: string;
  items: BackendOrderLine[];
};
