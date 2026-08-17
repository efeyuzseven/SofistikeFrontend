import { useEffect } from "react";
import type { AdminProduct } from "./product-types";
import styles from "./product-management.module.css";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

type ProductDetailModalProps = {
  product: AdminProduct;
  onClose: () => void;
  onEdit: () => void;
};

export function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: ProductDetailModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <section
        className={styles.detailModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span>Ürün detayı</span>
            <h2 id="product-detail-title">{product.name}</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Ürün detayını kapat"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.detailHero}>
          <span
            className={`${styles.detailVisual} ${styles[product.visualTone]}`}
          >
            {product.visual}
          </span>
          <div>
            <code>{product.sku}</code>
            <span
              className={
                product.status === "Aktif"
                  ? styles.activeStatus
                  : styles.passiveStatus
              }
            >
              {product.status}
            </span>
          </div>
        </div>
        <dl className={styles.detailGrid}>
          <div>
            <dt>Kategori</dt>
            <dd>{product.category}</dd>
          </div>
          <div>
            <dt>Mevcut stok</dt>
            <dd>{product.stock} adet</dd>
          </div>
          <div>
            <dt>B2C fiyatı</dt>
            <dd>{currency.format(product.b2cPrice)}</dd>
          </div>
          <div>
            <dt>B2B fiyatı</dt>
            <dd>{currency.format(product.b2bPrice)}</dd>
          </div>
          <div>
            <dt>Minimum stok</dt>
            <dd>{product.minimumStock} adet</dd>
          </div>
          <div>
            <dt>Stok durumu</dt>
            <dd>
              {product.stock === 0
                ? "Tükendi"
                : product.stock <= product.minimumStock
                  ? "Stokta Az"
                  : "Stokta"}
            </dd>
          </div>
        </dl>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Kapat
          </button>
          <button type="button" className={styles.saveButton} onClick={onEdit}>
            Ürünü Düzenle
          </button>
        </div>
      </section>
    </div>
  );
}
