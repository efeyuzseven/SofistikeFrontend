import { useEffect, useId, useState, type FormEvent } from "react";
import type { ActiveSession, ProfileNotice } from "./profile-types";
import { PanelHeading } from "./personal-information";
import styles from "./profile-management.module.css";

type PasswordForm = {
  current: string;
  next: string;
  repeat: string;
};

type SecuritySettingsProps = {
  sessions: ActiveSession[];
  onRequestTerminate: (session: ActiveSession) => void;
  onNotice: (notice: ProfileNotice) => void;
  onDirtyChange: (dirty: boolean) => void;
};

const emptyPasswords: PasswordForm = { current: "", next: "", repeat: "" };

export function SecuritySettings({
  sessions,
  onRequestTerminate,
  onNotice,
  onDirtyChange,
}: SecuritySettingsProps) {
  const [passwords, setPasswords] = useState<PasswordForm>(emptyPasswords);
  const [visible, setVisible] = useState<Record<keyof PasswordForm, boolean>>({
    current: false,
    next: false,
    repeat: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const rules = {
    length: passwords.next.length >= 8,
    uppercase: /[A-ZÇĞİÖŞÜ]/.test(passwords.next),
    lowercase: /[a-zçğıöşü]/.test(passwords.next),
    number: /\d/.test(passwords.next),
    matches: passwords.next.length > 0 && passwords.next === passwords.repeat,
  };
  const valid =
    passwords.current.length > 0 && Object.values(rules).every(Boolean);

  useEffect(() => {
    onDirtyChange(Object.values(passwords).some(Boolean));
  }, [onDirtyChange, passwords]);

  const update = (key: keyof PasswordForm, value: string) =>
    setPasswords((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) {
      onNotice({
        type: "error",
        text: "Şifre alanlarını ve tüm güvenlik kurallarını kontrol edin.",
      });
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setPasswords(emptyPasswords);
    setSubmitting(false);
    onNotice({ type: "success", text: "Şifreniz başarıyla güncellendi." });
  };

  return (
    <div>
      <form onSubmit={submit} noValidate>
        <PanelHeading
          title="Şifre Değiştir"
          description="Hesabınız için güçlü ve benzersiz bir şifre belirleyin."
        />
        <div className={styles.securityGrid}>
          <PasswordField
            label="Mevcut şifre"
            value={passwords.current}
            visible={visible.current}
            autoComplete="current-password"
            onChange={(value) => update("current", value)}
            onToggle={() =>
              setVisible((current) => ({
                ...current,
                current: !current.current,
              }))
            }
          />
          <PasswordField
            label="Yeni şifre"
            value={passwords.next}
            visible={visible.next}
            autoComplete="new-password"
            onChange={(value) => update("next", value)}
            onToggle={() =>
              setVisible((current) => ({ ...current, next: !current.next }))
            }
          />
          <PasswordField
            label="Yeni şifre tekrarı"
            value={passwords.repeat}
            visible={visible.repeat}
            autoComplete="new-password"
            onChange={(value) => update("repeat", value)}
            onToggle={() =>
              setVisible((current) => ({
                ...current,
                repeat: !current.repeat,
              }))
            }
          />
          <ul className={styles.passwordRules} aria-label="Şifre kuralları">
            <Rule valid={rules.length}>En az 8 karakter</Rule>
            <Rule valid={rules.uppercase}>En az bir büyük harf</Rule>
            <Rule valid={rules.lowercase}>En az bir küçük harf</Rule>
            <Rule valid={rules.number}>En az bir rakam</Rule>
            <Rule valid={rules.matches}>Yeni şifreler aynı</Rule>
          </ul>
        </div>
        <footer className={styles.formActions}>
          <span>Şifre bilgileri bu cihazda kalıcı olarak saklanmaz.</span>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={!valid || submitting}
          >
            {submitting ? "Güncelleniyor…" : "Şifreyi Güncelle"}
          </button>
        </footer>
      </form>

      <section className={styles.sessionsSection}>
        <PanelHeading
          title="Aktif Oturumlar"
          description="Hesabınızla açık olan cihazları ve son etkinliklerini inceleyin."
        />
        <div className={styles.sessionsList}>
          {sessions.map((session) => (
            <article key={session.id} className={styles.sessionCard}>
              <div className={styles.deviceMark} aria-hidden="true">
                {session.current ? "PC" : "MB"}
              </div>
              <div>
                <strong>{session.device}</strong>
                <span>{session.location}</span>
              </div>
              <time>{session.lastActivity}</time>
              {session.current ? (
                <span className={styles.currentBadge}>Bu cihaz</span>
              ) : (
                <button
                  type="button"
                  className={styles.textDangerButton}
                  onClick={() => onRequestTerminate(session)}
                >
                  Oturumu Sonlandır
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  value,
  visible,
  autoComplete,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  const inputId = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>
        {label} <b aria-hidden="true">*</b>
      </label>
      <span className={styles.passwordInput}>
        <input
          id={inputId}
          required
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={`${label} alanındaki şifreyi ${visible ? "gizle" : "göster"}`}
          aria-pressed={visible}
          onClick={onToggle}
        >
          {visible ? "Gizle" : "Göster"}
        </button>
      </span>
    </div>
  );
}

function Rule({
  valid,
  children,
}: {
  valid: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className={valid ? styles.ruleValid : ""}>
      <span aria-hidden="true">{valid ? "✓" : "○"}</span> {children}
    </li>
  );
}
