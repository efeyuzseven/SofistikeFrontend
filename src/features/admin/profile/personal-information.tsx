import type { FormEvent } from "react";
import type { ProfileData } from "./profile-types";
import styles from "./profile-management.module.css";

type PersonalInformationProps = {
  profile: ProfileData;
  dirty: boolean;
  saving: boolean;
  errors: Partial<Record<"firstName" | "lastName" | "email", string>>;
  onChange: <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PersonalInformation({
  profile,
  dirty,
  saving,
  errors,
  onChange,
  onSubmit,
}: PersonalInformationProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <PanelHeading
        title="Kişisel Bilgiler"
        description="Hesabınızda görünen iletişim ve çalışma bilgilerini güncelleyin."
      />
      <div className={styles.formGrid}>
        <Field label="Ad" required error={errors.firstName}>
          <input
            required
            autoComplete="given-name"
            value={profile.firstName}
            aria-invalid={Boolean(errors.firstName)}
            onChange={(event) => onChange("firstName", event.target.value)}
          />
        </Field>
        <Field label="Soyad" required error={errors.lastName}>
          <input
            required
            autoComplete="family-name"
            value={profile.lastName}
            aria-invalid={Boolean(errors.lastName)}
            onChange={(event) => onChange("lastName", event.target.value)}
          />
        </Field>
        <Field label="E-posta" required error={errors.email}>
          <input
            required
            type="email"
            autoComplete="email"
            value={profile.email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => onChange("email", event.target.value)}
          />
        </Field>
        <Field label="Telefon">
          <input
            type="tel"
            autoComplete="tel"
            value={profile.phone}
            onChange={(event) => onChange("phone", event.target.value)}
          />
        </Field>
        <Field label="Pozisyon">
          <input
            value={profile.position}
            onChange={(event) => onChange("position", event.target.value)}
          />
        </Field>
        <Field label="Departman">
          <input
            value={profile.department}
            onChange={(event) => onChange("department", event.target.value)}
          />
        </Field>
        <Field label="Saat dilimi">
          <select
            value={profile.timezone}
            onChange={(event) => onChange("timezone", event.target.value)}
          >
            <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Europe/Berlin">Europe/Berlin</option>
          </select>
        </Field>
        <Field label="Dil">
          <select
            value={profile.language}
            onChange={(event) => onChange("language", event.target.value)}
          >
            <option>Türkçe</option>
            <option>English</option>
          </select>
        </Field>
      </div>
      <div className={styles.readOnlySection}>
        <div>
          <small>Rol</small>
          <strong>{profile.role}</strong>
        </div>
        <div>
          <small>Yetki seviyesi</small>
          <strong>{profile.permissionLevel}</strong>
        </div>
        <p>
          Rol ve yetki seviyesi yalnızca yetkili hesap yöneticileri tarafından
          değiştirilebilir.
        </p>
      </div>
      <FormActions dirty={dirty} saving={saving} />
    </form>
  );
}

export function PanelHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className={styles.panelHeading}>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <span>
        {label} {required && <b aria-hidden="true">*</b>}
      </span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

function FormActions({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  return (
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
        {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
      </button>
    </footer>
  );
}
