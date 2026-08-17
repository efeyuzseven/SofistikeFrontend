import { useState } from "react";
import { AccessibleModal } from "./accessible-modal";
import type { AdminRefundRequest, ReviewDecision } from "./refund-types";
import styles from "./refund-management.module.css";

type ReviewConfirmationModalProps = {
  request: AdminRefundRequest;
  decision: ReviewDecision;
  onClose: () => void;
  onConfirm: (note: string) => void;
};

function formatMoney(value: number, currency: AdminRefundRequest["currency"]) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(
    value,
  );
}

export function ReviewConfirmationModal({
  request,
  decision,
  onClose,
  onConfirm,
}: ReviewConfirmationModalProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const isApprove = decision === "approve";

  const confirm = () => {
    const trimmedNote = note.trim();
    if (!isApprove && !trimmedNote) {
      setError("Ret işlemi için yönetici açıklaması zorunludur.");
      return;
    }
    if (
      isApprove &&
      request.requestType === "Kısmi iade" &&
      request.requestedAmount > request.orderAmount
    ) {
      setError("Kısmi iade tutarı sipariş toplamını aşamaz.");
      return;
    }
    onConfirm(trimmedNote);
  };

  return (
    <AccessibleModal
      title={isApprove ? "Talebi onayla" : "Talebi reddet"}
      eyebrow={request.requestNumber}
      closeLabel="Değerlendirme penceresini kapat"
      onClose={onClose}
      compact
    >
      <div className={styles.confirmBody}>
        <div
          className={isApprove ? styles.confirmApprove : styles.confirmReject}
        >
          <strong>
            {isApprove ? "Onay işlemini" : "Ret işlemini"} onaylıyor musunuz?
          </strong>
          <p>
            {isApprove
              ? `${request.requestType} talebi frontend mock kaydında onaylanacak.`
              : "Talep frontend mock kaydında reddedilecek. Bu aşamada gerçek finansal işlem yapılmaz."}
          </p>
        </div>
        {isApprove && (
          <div className={styles.confirmAmount}>
            <span>Onaylanacak iade tutarı</span>
            <strong>
              {formatMoney(request.requestedAmount, request.currency)}
            </strong>
          </div>
        )}
        <label className={styles.noteField}>
          <span>Yönetici notu {!isApprove && <b>(zorunlu)</b>}</span>
          <textarea
            value={note}
            rows={4}
            placeholder={
              isApprove
                ? "İsteğe bağlı değerlendirme notu..."
                : "Ret gerekçesini yazın..."
            }
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "review-error" : undefined}
            onChange={(event) => {
              setNote(event.target.value);
              if (error) setError("");
            }}
          />
        </label>
        {error && (
          <p id="review-error" className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <footer className={styles.confirmActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className={isApprove ? styles.approveButton : styles.rejectButton}
            onClick={confirm}
          >
            {isApprove ? "Talebi Onayla" : "Talebi Reddet"}
          </button>
        </footer>
      </div>
    </AccessibleModal>
  );
}
