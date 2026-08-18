export type BackendCategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentSlug: string | null;
  displayOrder: number;
};

export type BackendProductCard = {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  isPopular: boolean;
  isXtra: boolean;
  primaryImage: {
    id: string;
    variantId: string | null;
    url: string;
    altText: string;
    isPrimary: boolean;
    displayOrder: number;
  } | null;
  price: {
    listPrice: number;
    campaignPrice: number | null;
    effectivePrice: number;
    currencyCode: string;
    discountPercentage: number | null;
  } | null;
  stock: {
    availableQuantity: number;
    status: "InStock" | "LowStock" | "OutOfStock";
  };
  categories: BackendCategorySummary[];
};

export type BackendFavoriteItem = {
  addedAtUtc: string;
  product: BackendProductCard;
};

export type BackendPagedFavorites = {
  items: BackendFavoriteItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type FavoriteApiError = {
  message: string;
};
