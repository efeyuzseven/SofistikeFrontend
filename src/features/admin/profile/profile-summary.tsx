import { useId, useRef } from "react";
import { Icon } from "../admin-icons";
import type { ProfileData } from "./profile-types";
import styles from "./profile-management.module.css";

type ProfileSummaryProps = {
  profile: ProfileData;
  onPhotoSelected: (file: File) => void;
  onPhotoRemoved: () => void;
};

export function ProfileSummary({
  profile,
  onPhotoSelected,
  onPhotoRemoved,
}: ProfileSummaryProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = `${profile.firstName.at(0) ?? ""}${profile.lastName.at(0) ?? ""}`;

  return (
    <section
      className={styles.summaryCard}
      aria-labelledby="profile-summary-title"
    >
      <div className={styles.summaryAvatar}>
        {profile.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local user-selected data URL preview
          <img src={profile.photoDataUrl} alt="Profil fotoğrafı önizlemesi" />
        ) : (
          <span
            aria-label={`${profile.firstName} ${profile.lastName} baş harfleri`}
          >
            {initials || "AY"}
          </span>
        )}
      </div>
      <div className={styles.summaryInfo}>
        <span className={styles.summaryEyebrow}>Yönetici hesabı</span>
        <h2 id="profile-summary-title">
          {profile.firstName} {profile.lastName}
        </h2>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <div className={styles.summaryMeta}>
          <span className={styles.roleBadge}>{profile.role}</span>
          <span>
            <Icon name="calendar" /> Son giriş: {profile.lastLogin}
          </span>
        </div>
      </div>
      <div className={styles.photoActions}>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className={styles.srOnly}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPhotoSelected(file);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => inputRef.current?.click()}
        >
          Profil fotoğrafını değiştir
        </button>
        {profile.photoDataUrl && (
          <button
            type="button"
            className={styles.textDangerButton}
            onClick={onPhotoRemoved}
          >
            Fotoğrafı kaldır
          </button>
        )}
        <small>JPG, PNG veya WebP · En fazla 2 MB</small>
      </div>
    </section>
  );
}
