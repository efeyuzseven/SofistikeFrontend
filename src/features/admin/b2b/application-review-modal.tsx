import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import type {
  ApplicationDecision,
  B2BApplication,
  B2BDocument,
} from "./b2b-types";
import styles from "./b2b-management.module.css";

type ApplicationReviewModalProps = {
  application: B2BApplication;
  onClose: () => void;
  onConfirm: (
    decision: ApplicationDecision,
    note: string,
    missingDocuments: B2BDocument["name"][],
  ) => void;
};

const documentNames: B2BDocument["name"][] = [
  "Vergi levhası",
  "Faaliyet belgesi",
  "İmza sirküleri",
  "Yetki belgesi",
  "İhracat evrakı",
];

export function ApplicationReviewModal({
  application,
  onClose,
  onConfirm,
}: ApplicationReviewModalProps) {
  const [decision, setDecision] = useState<ApplicationDecision>("approve");
  const [note, setNote] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<
    B2BDocument["name"][]
  >([]);
  const [error, setError] = useState("");

  const confirm = () => {
    const trimmed = note.trim();
    if (decision === "reject" && !trimmed) {
      setError("Ret işlemi için gerekçe zorunludur.");
      return;
    }
    if (
      decision === "request-documents" &&
      (!trimmed || !selectedDocuments.length)
    ) {
      setError(
        "Belge talebi için en az bir eksik belge ve açıklama seçilmelidir.",
      );
      return;
    }
    onConfirm(decision, trimmed, selectedDocuments);
  };

  return (
    <CustomerModalFrame
      title="Başvuruyu değerlendir"
      eyebrow={application.applicationNumber}
      closeLabel="Başvuru değerlendirme penceresini kapat"
      onClose={onClose}
      compact
    >
      <div className={styles.reviewBody}>
        <div className={styles.reviewCompany}>
          <strong>{application.profile.companyName}</strong>
          <span>
            {application.profile.contactName} ·{" "}
            {application.profile.businessType}
          </span>
        </div>
        <div
          className={styles.decisionTabs}
          role="group"
          aria-label="Değerlendirme işlemi"
        >
          <button
            type="button"
            className={decision === "approve" ? styles.selectedDecision : ""}
            onClick={() => {
              setDecision("approve");
              setError("");
            }}
          >
            Onayla
          </button>
          <button
            type="button"
            className={decision === "reject" ? styles.selectedDecision : ""}
            onClick={() => {
              setDecision("reject");
              setError("");
            }}
          >
            Reddet
          </button>
          <button
            type="button"
            className={
              decision === "request-documents" ? styles.selectedDecision : ""
            }
            onClick={() => {
              setDecision("request-documents");
              setError("");
            }}
          >
            Belge Talep Et
          </button>
        </div>
        {decision === "approve" && (
          <p className={styles.approvalNotice}>
            Onay sonrasında firma frontend mock state’inde Aktif Firmalar
            sekmesine eklenecektir.
          </p>
        )}
        {decision === "request-documents" && (
          <fieldset className={styles.documentPicker}>
            <legend>Eksik belgeler</legend>
            {documentNames.map((name) => (
              <label key={name}>
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(name)}
                  onChange={() =>
                    setSelectedDocuments((current) =>
                      current.includes(name)
                        ? current.filter((item) => item !== name)
                        : [...current, name],
                    )
                  }
                />
                {name}
              </label>
            ))}
          </fieldset>
        )}
        <label className={baseStyles.noteField}>
          <span>
            Yönetici notu{" "}
            {(decision === "reject" || decision === "request-documents") &&
              "(zorunlu)"}
          </span>
          <textarea
            rows={4}
            value={note}
            placeholder="Değerlendirme notunu yazın..."
            onChange={(event) => {
              setNote(event.target.value);
              setError("");
            }}
          />
        </label>
        {error && (
          <p className={baseStyles.formError} role="alert">
            {error}
          </p>
        )}
        <p className={baseStyles.demoNotice}>
          Bu işlem gerçek firma, sözleşme, belge talebi veya bildirim
          oluşturmaz.
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
            onClick={confirm}
          >
            İşlemi Onayla
          </button>
        </footer>
      </div>
    </CustomerModalFrame>
  );
}
