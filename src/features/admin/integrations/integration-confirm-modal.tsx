import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import styles from "./integration-management.module.css";
import type { Integration } from "./integration-types";

export type ConfirmAction = "test" | "sync" | "enable" | "disable";
type Props = {
  integration: Integration;
  action: ConfirmAction;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function IntegrationConfirmModal({
  integration,
  action,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const labels =
    action === "test"
      ? {
          title: "Bağlantıyı test et",
          text: "Bağlantı ayarları kontrollü bir işlemle doğrulanacaktır.",
          button: "Testi Başlat",
        }
      : action === "sync"
        ? {
            title: "Şimdi senkronize et",
            text: "Bekleyen kayıtlar için manuel senkronizasyon başlatılacaktır.",
            button: "Senkronizasyonu Başlat",
          }
        : action === "disable"
          ? {
              title: "Entegrasyonu devre dışı bırak",
              text: "Otomatik veri akışı ve planlı senkronizasyonlar durdurulacaktır.",
              button: "Devre Dışı Bırak",
            }
          : {
              title: "Entegrasyonu etkinleştir",
              text: "Entegrasyon yeniden kullanıma açılacaktır.",
              button: "Etkinleştir",
            };
  const confirm = () => {
    if (action === "disable" && !reason.trim()) {
      setError("Devre dışı bırakma açıklaması zorunludur.");
      return;
    }
    onConfirm(reason.trim());
  };
  return (
    <CustomerModalFrame
      title={labels.title}
      eyebrow={integration.name}
      closeLabel="İşlem penceresini kapat"
      onClose={onClose}
      compact
    >
      <div className={styles.confirmBody}>
        <p className={styles.confirmText}>{labels.text}</p>
        {action === "disable" && (
          <label className={baseStyles.noteField}>
            <span>Açıklama (zorunlu)</span>
            <textarea
              rows={3}
              value={reason}
              placeholder="Devre dışı bırakma nedenini yazın..."
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
            />
          </label>
        )}
        {error && (
          <p className={baseStyles.formError} role="alert">
            {error}
          </p>
        )}
        <footer className={baseStyles.segmentActions}>
          <button
            type="button"
            className={baseStyles.cancelButton}
            disabled={busy}
            onClick={onClose}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className={baseStyles.saveButton}
            disabled={busy}
            onClick={confirm}
          >
            {busy ? "İşlem sürüyor..." : labels.button}
          </button>
        </footer>
      </div>
    </CustomerModalFrame>
  );
}
