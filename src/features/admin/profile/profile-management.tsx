"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { AdminConfirmModal } from "../admin-confirm-modal";
import { Icon, type IconName } from "../admin-icons";
import {
  defaultNotifications,
  defaultProfile,
  initialSessions,
  profileTabs,
} from "./profile-data";
import { NotificationPreferencesPanel } from "./notification-preferences";
import { PersonalInformation } from "./personal-information";
import styles from "./profile-management.module.css";
import { ProfileSummary } from "./profile-summary";
import { SecuritySettings } from "./security-settings";
import { loadPersistedProfile, persistProfile } from "./profile-storage";
import type {
  ActiveSession,
  NotificationPreferenceKey,
  NotificationPreferences,
  ProfileData,
  ProfileNotice,
  ProfileTab,
} from "./profile-types";

type Confirmation =
  | { kind: "leave"; target: ProfileTab }
  | { kind: "terminate"; session: ActiveSession }
  | null;

const tabIcons: Record<ProfileTab, IconName> = {
  personal: "customers",
  security: "settings",
  notifications: "bell",
};

export function ProfileManagement() {
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [savedProfile, setSavedProfile] = useState<ProfileData>(defaultProfile);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [savedNotifications, setSavedNotifications] =
    useState<NotificationPreferences>(defaultNotifications);
  const [notifications, setNotifications] =
    useState<NotificationPreferences>(defaultNotifications);
  const [sessions, setSessions] = useState(initialSessions);
  const [securityDirty, setSecurityDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ProfileNotice | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [errors, setErrors] = useState<
    Partial<Record<"firstName" | "lastName" | "email", string>>
  >({});

  const personalDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(savedProfile),
    [profile, savedProfile],
  );
  const notificationsDirty = useMemo(
    () => JSON.stringify(notifications) !== JSON.stringify(savedNotifications),
    [notifications, savedNotifications],
  );
  const anyDirty = personalDirty || notificationsDirty || securityDirty;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const persisted = loadPersistedProfile();
      setSavedProfile(persisted.profile);
      setProfile(persisted.profile);
      setSavedNotifications(persisted.notifications);
      setNotifications(persisted.notifications);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!anyDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [anyDirty]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const currentTabDirty =
    activeTab === "personal"
      ? personalDirty
      : activeTab === "notifications"
        ? notificationsDirty
        : securityDirty;

  const requestTab = (target: ProfileTab) => {
    if (target === activeTab) return;
    if (currentTabDirty) {
      setConfirmation({ kind: "leave", target });
      return;
    }
    setActiveTab(target);
  };

  const discardCurrentTab = () => {
    if (activeTab === "personal") setProfile(savedProfile);
    if (activeTab === "notifications") setNotifications(savedNotifications);
    if (activeTab === "security") setSecurityDirty(false);
  };

  const saveToStorage = (
    nextProfile: ProfileData,
    nextNotifications: NotificationPreferences,
  ) => {
    try {
      persistProfile(nextProfile, nextNotifications);
      return true;
    } catch {
      setNotice({
        type: "error",
        text: "Değişiklikler tarayıcı depolamasına kaydedilemedi.",
      });
      return false;
    }
  };

  const savePersonal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!profile.firstName.trim())
      nextErrors.firstName = "Ad alanı zorunludur.";
    if (!profile.lastName.trim())
      nextErrors.lastName = "Soyad alanı zorunludur.";
    if (!/^\S+@\S+\.\S+$/.test(profile.email))
      nextErrors.email = "Geçerli bir e-posta adresi girin.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setNotice({ type: "error", text: "Zorunlu alanları kontrol edin." });
      return;
    }
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    if (saveToStorage(profile, savedNotifications)) {
      setSavedProfile(profile);
      setNotice({ type: "success", text: "Profil bilgileriniz kaydedildi." });
    }
    setSaving(false);
  };

  const saveNotifications = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    if (saveToStorage(savedProfile, notifications)) {
      setSavedNotifications(notifications);
      setNotice({
        type: "success",
        text: "Bildirim tercihleriniz kaydedildi.",
      });
    }
    setSaving(false);
  };

  const updateProfile = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
    if (key === "firstName" || key === "lastName" || key === "email") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const selectPhoto = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setNotice({
        type: "error",
        text: "Yalnızca görsel dosyaları yükleyebilirsiniz.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNotice({
        type: "error",
        text: "Profil fotoğrafı en fazla 2 MB olabilir.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        updateProfile("photoDataUrl", reader.result);
    };
    reader.onerror = () =>
      setNotice({ type: "error", text: "Görsel önizlemesi hazırlanamadı." });
    reader.readAsDataURL(file);
  };

  const handleSecurityDirty = useCallback((dirty: boolean) => {
    setSecurityDirty(dirty);
  }, []);

  if (!ready) return <ProfileSkeleton />;

  return (
    <section className={styles.page} aria-label="Profil yönetimi">
      <p className={styles.intro}>
        Kişisel bilgilerinizi, hesap güvenliğinizi ve bildirim tercihlerinizi
        tek bir yerden yönetin.
      </p>
      <ProfileSummary
        profile={profile}
        onPhotoSelected={selectPhoto}
        onPhotoRemoved={() => updateProfile("photoDataUrl", null)}
      />

      <div className={styles.profileLayout}>
        <div
          className={styles.tabNav}
          role="tablist"
          aria-label="Profil bölümleri"
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const currentIndex = profileTabs.findIndex(
              (tab) => tab.id === activeTab,
            );
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const next =
              profileTabs[
                (currentIndex + direction + profileTabs.length) %
                  profileTabs.length
              ];
            if (next) requestTab(next.id);
          }}
        >
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`profile-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={activeTab === tab.id ? styles.activeTab : ""}
              onClick={() => requestTab(tab.id)}
            >
              <Icon name={tabIcons[tab.id]} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div
          id={`profile-panel-${activeTab}`}
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`profile-tab-${activeTab}`}
        >
          {activeTab === "personal" && (
            <PersonalInformation
              profile={profile}
              dirty={personalDirty}
              saving={saving}
              errors={errors}
              onChange={updateProfile}
              onSubmit={savePersonal}
            />
          )}
          {activeTab === "security" && (
            <SecuritySettings
              sessions={sessions}
              onRequestTerminate={(session) =>
                setConfirmation({ kind: "terminate", session })
              }
              onNotice={setNotice}
              onDirtyChange={handleSecurityDirty}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationPreferencesPanel
              preferences={notifications}
              dirty={notificationsDirty}
              saving={saving}
              onChange={(key: NotificationPreferenceKey, value: boolean) =>
                setNotifications((current) => ({ ...current, [key]: value }))
              }
              onSubmit={saveNotifications}
            />
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`${styles.toast} ${notice.type === "error" ? styles.errorToast : ""}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      {confirmation?.kind === "leave" && (
        <AdminConfirmModal
          eyebrow="Kaydedilmemiş değişiklik"
          title="Kaydetmeden ayrılmak istiyor musunuz?"
          description="Bu sekmedeki kaydedilmemiş değişiklikler iptal edilecek."
          confirmLabel="Değişiklikleri İptal Et ve Ayrıl"
          danger
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            const target = confirmation.target;
            discardCurrentTab();
            setActiveTab(target);
            setConfirmation(null);
          }}
        />
      )}
      {confirmation?.kind === "terminate" && (
        <AdminConfirmModal
          eyebrow="Oturum güvenliği"
          title="Bu oturumu sonlandırmak istiyor musunuz?"
          description={`${confirmation.session.device} · ${confirmation.session.location} oturumu listeden kaldırılacak.`}
          confirmLabel="Oturumu Sonlandır"
          danger
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            setSessions((current) =>
              current.filter(
                (session) => session.id !== confirmation.session.id,
              ),
            );
            setNotice({
              type: "success",
              text: "Seçili oturum sonlandırıldı.",
            });
            setConfirmation(null);
          }}
        />
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <section
      className={styles.page}
      aria-label="Profil yükleniyor"
      aria-busy="true"
    >
      <div className={styles.skeletonIntro} />
      <div className={styles.skeletonSummary} />
      <div className={styles.skeletonLayout}>
        <div />
        <div />
      </div>
    </section>
  );
}
