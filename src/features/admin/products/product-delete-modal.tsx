import { useEffect, useRef } from "react";
import type { AdminProduct } from "./product-types";
import styles from "./product-management.module.css";

type ProductDeleteModalProps = {
  product: AdminProduct;
  onClose: () => void;
  onConfirm: () => void;
};

export function ProductDeleteModal({
  product,
  onClose,
  onConfirm,
}: ProductDeleteModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <section
        className={styles.deleteModal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="product-delete-title"
        aria-describedby="product-delete-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span>Silme onayı</span>
            <h2 id="product-delete-title">Ürünü Sil</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Silme onayını kapat"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.deleteModalBody}>
          <strong>{product.name}</strong>
          <p id="product-delete-description">
            Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onConfirm}
          >
            Ürünü Sil
          </button>
        </div>
      </section>
    </div>
  );
}
