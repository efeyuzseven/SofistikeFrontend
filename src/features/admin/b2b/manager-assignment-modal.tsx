import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import { mockManagers, type B2BManager } from "./b2b-types";
import styles from "./b2b-management.module.css";

type ManagerAssignmentModalProps = {
  label: string;
  currentManager: B2BManager;
  onClose: () => void;
  onConfirm: (manager: B2BManager, note: string) => void;
};

export function ManagerAssignmentModal({
  label,
  currentManager,
  onClose,
  onConfirm,
}: ManagerAssignmentModalProps) {
  const [manager, setManager] = useState<B2BManager>(currentManager);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  return (
    <CustomerModalFrame
      title="Sorumlu yönetici ata"
      eyebrow={label}
      closeLabel="Yönetici atama penceresini kapat"
      onClose={onClose}
      compact
    >
      <div className={styles.reviewBody}>
        <div className={styles.managerCurrent}>
          <span>Mevcut sorumlu</span>
          <strong>{currentManager}</strong>
        </div>
        <label className={baseStyles.segmentField}>
          <span>Yeni sorumlu yönetici</span>
          <select
            value={manager}
            onChange={(event) => {
              setManager(event.target.value as B2BManager);
              setError("");
            }}
          >
            {mockManagers.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className={baseStyles.noteField}>
          <span>Atama notu (isteğe bağlı)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error && (
          <p className={baseStyles.formError} role="alert">
            {error}
          </p>
        )}
        <p className={baseStyles.demoNotice}>
          Atama yalnızca frontend mock kaydını ve işlem geçmişini günceller.
        </p>
        <footer className={baseStyles.segmentActions}>
          <button
            type="button"
            className={baseStyles.cancelButton}
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className={baseStyles.saveButton}
            onClick={() => {
              if (manager === currentManager) {
                setError(
                  "Lütfen mevcut yöneticiden farklı bir yönetici seçin.",
                );
                return;
              }
              onConfirm(manager, note.trim());
            }}
          >
            Yöneticiyi Ata
          </button>
        </footer>
      </div>
    </CustomerModalFrame>
  );
}
