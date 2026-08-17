import { useEffect, useState, type FormEvent } from "react";
import {
  productCategories,
  type AdminProduct,
  type ProductFormValues,
} from "./product-types";
import styles from "./product-management.module.css";

type ProductFormModalProps = {
  product: AdminProduct | null;
  usedSkus: string[];
  onClose: () => void;
  onSave: (values: ProductFormValues) => void;
};

type FormErrors = Partial<Record<keyof ProductFormValues, string>>;
type NumericField = "b2cPrice" | "b2bPrice" | "stock" | "minimumStock";
type ProductFormState = Omit<ProductFormValues, NumericField> &
  Record<NumericField, string>;

const emptyValues: ProductFormState = {
  name: "",
  sku: "",
  category: productCategories[0],
  b2cPrice: "",
  b2bPrice: "",
  stock: "",
  minimumStock: "",
  status: "Aktif",
};

export function ProductFormModal({
  product,
  usedSkus,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormState>(() =>
    product
      ? {
          ...product,
          b2cPrice: String(product.b2cPrice),
          b2bPrice: String(product.b2bPrice),
          stock: String(product.stock),
          minimumStock: String(product.minimumStock),
        }
      : emptyValues,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const updateValue = <Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const normalizedSku = values.sku.trim().toLocaleUpperCase("tr-TR");
    const b2cPrice = Number(values.b2cPrice);
    const b2bPrice = Number(values.b2bPrice);
    const stock = Number(values.stock);
    const minimumStock = Number(values.minimumStock);

    if (!values.name.trim()) nextErrors.name = "Ürün adı zorunludur.";
    if (!normalizedSku) nextErrors.sku = "SKU zorunludur.";
    else if (usedSkus.includes(normalizedSku))
      nextErrors.sku = "Bu SKU zaten kullanılıyor.";
    if (!values.b2cPrice || b2cPrice <= 0)
      nextErrors.b2cPrice = "B2C fiyatı 0'dan büyük olmalıdır.";
    if (!values.b2bPrice || b2bPrice <= 0)
      nextErrors.b2bPrice = "B2B fiyatı 0'dan büyük olmalıdır.";
    if (!values.stock || stock < 0 || !Number.isInteger(stock))
      nextErrors.stock = "Stok miktarı zorunlu ve tam sayı olmalıdır.";
    if (
      !values.minimumStock ||
      minimumStock < 0 ||
      !Number.isInteger(minimumStock)
    )
      nextErrors.minimumStock = "Minimum stok zorunlu ve tam sayı olmalıdır.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...values,
      name: values.name.trim(),
      sku: normalizedSku,
      b2cPrice,
      b2bPrice,
      stock,
      minimumStock,
    });
  };

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <section
        className={styles.formModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span>
              {product
                ? "Ürün bilgilerini güncelleyin"
                : "Kataloğunuza yeni ürün ekleyin"}
            </span>
            <h2 id="product-form-title">
              {product ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Formu kapat"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <label className={styles.fullField}>
              <span>Ürün adı *</span>
              <input
                autoFocus
                value={values.name}
                onChange={(event) => updateValue("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <small>{errors.name}</small>}
            </label>
            <label>
              <span>SKU *</span>
              <input
                value={values.sku}
                onChange={(event) => updateValue("sku", event.target.value)}
                aria-invalid={Boolean(errors.sku)}
              />
              {errors.sku && <small>{errors.sku}</small>}
            </label>
            <label>
              <span>Kategori *</span>
              <select
                value={values.category}
                onChange={(event) =>
                  updateValue(
                    "category",
                    event.target.value as ProductFormValues["category"],
                  )
                }
              >
                {productCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>B2C fiyatı *</span>
              <div className={styles.priceInput}>
                <span>₺</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.b2cPrice}
                  onChange={(event) =>
                    updateValue("b2cPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors.b2cPrice)}
                />
              </div>
              {errors.b2cPrice && <small>{errors.b2cPrice}</small>}
            </label>
            <label>
              <span>B2B fiyatı *</span>
              <div className={styles.priceInput}>
                <span>₺</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.b2bPrice}
                  onChange={(event) =>
                    updateValue("b2bPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors.b2bPrice)}
                />
              </div>
              {errors.b2bPrice && <small>{errors.b2bPrice}</small>}
            </label>
            <label>
              <span>Stok miktarı *</span>
              <input
                type="number"
                min="0"
                step="1"
                value={values.stock}
                onChange={(event) => updateValue("stock", event.target.value)}
                aria-invalid={Boolean(errors.stock)}
              />
              {errors.stock && <small>{errors.stock}</small>}
            </label>
            <label>
              <span>Minimum stok *</span>
              <input
                type="number"
                min="0"
                step="1"
                value={values.minimumStock}
                onChange={(event) =>
                  updateValue("minimumStock", event.target.value)
                }
                aria-invalid={Boolean(errors.minimumStock)}
              />
              {errors.minimumStock && <small>{errors.minimumStock}</small>}
            </label>
            <fieldset className={styles.fullField}>
              <legend>Ürün durumu *</legend>
              <div className={styles.statusOptions}>
                {(["Aktif", "Pasif"] as const).map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="status"
                      checked={values.status === item}
                      onChange={() => updateValue("status", item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Vazgeç
            </button>
            <button type="submit" className={styles.saveButton}>
              {product ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
