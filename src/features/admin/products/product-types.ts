export const productCategories = [
  "Banyo",
  "Mutfak",
  "Uyku",
  "Evcil Dostlar",
  "Ev Bakımı",
] as const;

export type ProductCategory = (typeof productCategories)[number];
export type ProductStatus = "Aktif" | "Pasif";
export type ProductVisualTone = "sand" | "rose" | "mint" | "lavender" | "peach";

export type AdminProduct = {
  id: number;
  name: string;
  sku: string;
  category: ProductCategory;
  b2cPrice: number;
  b2bPrice: number;
  stock: number;
  minimumStock: number;
  status: ProductStatus;
  visual: string;
  visualTone: ProductVisualTone;
};

export type ProductFormValues = Pick<
  AdminProduct,
  | "name"
  | "sku"
  | "category"
  | "b2cPrice"
  | "b2bPrice"
  | "stock"
  | "minimumStock"
  | "status"
>;
