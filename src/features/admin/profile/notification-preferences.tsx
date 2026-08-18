import type { FormEvent } from "react";
import { notificationOptions } from "./profile-data";
import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from "./profile-types";
import { PanelHeading } from "./personal-information";
import styles from "./profile-management.module.css";

type NotificationPreferencesProps = {
  preferences: NotificationPreferences;
  dirty: boolean;
  saving: boolean;
  onChange: (key: NotificationPreferenceKey, value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function NotificationPreferencesPanel({
  preferences,
  dirty,
  saving,
  onChange,
  onSubmit,
}: NotificationPreferencesProps) {
  return (
    <form onSubmit={onSubmit}>
      <PanelHeading
        title="Bildirim Tercihleri"
        description="Operasyonel gelişmelerden hangi kanallarda haberdar olmak istediğinizi seçin."
      />
      <div className={styles.preferenceGrid}>
        {notificationOptions.map((option) => (
          <label className={styles.switchRow} key={option.key}>
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
            <span className={styles.switchControl}>
              <input
                type="checkbox"
                role="switch"
                checked={preferences[option.key]}
                aria-label={option.label}
                onChange={(event) => onChange(option.key, event.target.checked)}
              />
              <i aria-hidden="true" />
            </span>
          </label>
        ))}
      </div>
      <footer className={styles.formActions}>
        <span>
          {dirty
            ? "Kaydedilmemiş değişiklikler var"
            : "Tüm değişiklikler kaydedildi"}
        </span>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={!dirty || saving}
        >
          {saving ? "Kaydediliyor…" : "Tercihleri Kaydet"}
        </button>
      </footer>
    </form>
  );
}
