export type BackendReview = {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string | null;
  productName: string | null;
  type: "Product" | "Order";
  rating: number;
  comment: string;
  isAnonymous: boolean;
  status: "Pending" | "Published" | "Rejected";
  createdAtUtc: string;
};
