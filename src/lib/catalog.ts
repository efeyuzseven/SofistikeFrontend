export type CategoryMenuGroup = "Solution" | "Room" | "Category";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentSlug: string | null;
  menuGroup: CategoryMenuGroup;
  displayOrder: number;
};

export type ManagedCatalogCategory = Omit<CatalogCategory, "parentSlug"> & {
  isActive: boolean;
  productCount: number;
  updatedAtUtc: string;
};

export type CatalogProductImage = {
  id: string;
  variantId: string | null;
  url: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type CatalogProductPrice = {
  listPrice: number;
  campaignPrice: number | null;
  effectivePrice: number;
  currencyCode: string;
  discountPercentage: number | null;
};

export type CatalogStock = {
  availableQuantity: number;
  status: "InStock" | "LowStock" | "OutOfStock";
};

export type CatalogProduct = {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  isPopular: boolean;
  isXtra: boolean;
  primaryImage: CatalogProductImage | null;
  price: CatalogProductPrice | null;
  stock: CatalogStock;
  categories: CatalogCategory[];
};

export type PagedCatalogProducts = {
  items: CatalogProduct[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CatalogVariantOption = {
  name: string;
  value: string;
  displayOrder: number;
};

export type CatalogProductVariant = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  isDefault: boolean;
  price: CatalogProductPrice | null;
  stock: CatalogStock;
  options: CatalogVariantOption[];
};

export type CatalogProductDetails = {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  isPopular: boolean;
  isXtra: boolean;
  publishedAtUtc: string | null;
  categories: CatalogCategory[];
  images: CatalogProductImage[];
  variants: CatalogProductVariant[];
};
