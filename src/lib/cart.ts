export type BackendCartProduct = {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  sku: string;
  category: string;
  imageUrl: string | null;
  unitPrice: number;
  currencyCode: string;
  availableQuantity: number;
};

export type BackendCartItem = {
  product: BackendCartProduct;
  quantity: number;
  lineTotal: number;
  addedAtUtc: string;
};

export type BackendCart = {
  items: BackendCartItem[];
  itemCount: number;
  subtotal: number;
  currencyCode: string;
  updatedAtUtc: string | null;
};

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  currencyCode: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export async function readApiMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as unknown;
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "İşlem şu anda tamamlanamadı. Lütfen tekrar deneyin.";
}
