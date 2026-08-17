import { useState } from "react";
import { CustomerModalFrame } from "./customer-modal-frame";
import {
  customerSegments,
  type AdminCustomer,
  type CustomerSegment,
} from "./customer-types";
import styles from "./customer-management.module.css";

type CustomerSegmentModalProps = {
  customer: AdminCustomer;
  onClose: () => void;
  onConfirm: (segment: CustomerSegment, note: string) => void;
};

export function CustomerSegmentModal({
  customer,
  onClose,
  onConfirm,
}: CustomerSegmentModalProps) {
  const [segment, setSegment] = useState<CustomerSegment>(customer.segment);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <CustomerModalFrame
      title="Segmenti güncelle"
      eyebrow={fullName}
      closeLabel="Segment güncelleme penceresini kapat"
      onClose={onClose}
      compact
    >
      <div className={styles.segmentBody}>
        <div className={styles.segmentComparison}>
          <div>
            <span>Mevcut segment</span>
            <strong>{customer.segment}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>Yeni segment</span>
            <strong>{segment}</strong>
          </div>
        </div>
        <label className={styles.segmentField}>
          <span>Yeni segment</span>
          <select
            value={segment}
            onChange={(event) => {
              setSegment(event.target.value as CustomerSegment);
              setError("");
            }}
          >
            {customerSegments.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className={styles.noteField}>
          <span>Yönetici notu (isteğe bağlı)</span>
          <textarea
            rows={3}
            value={note}
            placeholder="Segment değişikliğinin nedenini yazabilirsiniz..."
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <p className={styles.demoNotice}>
          Bu işlem yalnızca frontend demosundaki mock müşteri kaydını günceller.
        </p>
        <footer className={styles.segmentActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={() => {
              if (segment === customer.segment) {
                setError("Lütfen mevcut segmentten farklı bir segment seçin.");
                return;
              }
              onConfirm(segment, note.trim());
            }}
          >
            Segmenti Güncelle
          </button>
        </footer>
      </div>
    </CustomerModalFrame>
  );
}
