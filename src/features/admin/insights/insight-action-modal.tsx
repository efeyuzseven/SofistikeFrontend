import { useState } from "react";
import { CustomerModalFrame } from "../customers/customer-modal-frame";
import baseStyles from "../customers/customer-management.module.css";
import styles from "./insight-management.module.css";
import {
  actionTeams,
  type ActionPlan,
  type ActionTeam,
  type Insight,
} from "./insight-types";

type Props = {
  insight: Insight;
  kind: "plan" | "ignore";
  onClose: () => void;
  onPlan: (plan: ActionPlan) => void;
  onIgnore: (reason: string) => void;
};
export function InsightActionModal({
  insight,
  kind,
  onClose,
  onPlan,
  onIgnore,
}: Props) {
  const [team, setTeam] = useState<ActionTeam>(insight.suggestedTeam);
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (kind === "ignore") {
      if (!description.trim()) {
        setError("Göz ardı etme gerekçesi zorunludur.");
        return;
      }
      onIgnore(description.trim());
      return;
    }
    if (!targetDate || !description.trim()) {
      setError("Sorumlu ekip, hedef tarih ve aksiyon açıklaması zorunludur.");
      return;
    }
    onPlan({ team, targetDate, description: description.trim() });
  };
  return (
    <CustomerModalFrame
      title={kind === "plan" ? "Aksiyon planla" : "İçgörüyü göz ardı et"}
      eyebrow={insight.title}
      closeLabel="İşlem penceresini kapat"
      onClose={onClose}
      compact
    >
      <div className={styles.actionModalBody}>
        {kind === "plan" && (
          <>
            <label className={baseStyles.segmentField}>
              <span>Sorumlu ekip</span>
              <select
                value={team}
                onChange={(event) => setTeam(event.target.value as ActionTeam)}
              >
                {actionTeams.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className={baseStyles.segmentField}>
              <span>Hedef tarih</span>
              <input
                type="date"
                value={targetDate}
                onInput={(event) => {
                  setTargetDate(event.currentTarget.value);
                  setError("");
                }}
              />
            </label>
          </>
        )}
        <label className={baseStyles.noteField}>
          <span>{kind === "plan" ? "Aksiyon açıklaması" : "Gerekçe"}</span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError("");
            }}
          />
        </label>
        {error && (
          <p className={baseStyles.formError} role="alert">
            {error}
          </p>
        )}
        <p className={styles.actionNotice}>
          {kind === "plan"
            ? "Plan kaydedildiğinde gerçek görev veya iş emri oluşturulmaz."
            : "Gerekçe işlem geçmişine kaydedilir."}
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
            onClick={submit}
          >
            {kind === "plan" ? "Planı Kaydet" : "Göz Ardı Et"}
          </button>
        </footer>
      </div>
    </CustomerModalFrame>
  );
}
