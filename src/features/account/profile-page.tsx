"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AccountProfile } from "@/lib/auth";
import { AccountNavigation } from "./account-navigation";
import styles from "./profile-page.module.css";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const emptyProfile: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

export function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [draft, setDraft] = useState<ProfileForm>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/account/profile", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return null;
        }

        const payload = (await response.json().catch(() => null)) as
          { profile: AccountProfile } | { message?: string } | null;

        if (!response.ok) {
          throw new Error(
            payload && "message" in payload && payload.message
              ? payload.message
              : "Profil bilgileri yüklenemedi.",
          );
        }

        return payload && "profile" in payload ? payload.profile : null;
      })
      .then((currentUser) => {
        if (!active) return;

        if (currentUser) {
          const currentProfile = {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName ?? "",
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber ?? "",
          };
          setProfile(currentProfile);
          setDraft(currentProfile);
        }

        setLoading(false);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Profil bilgileri yüklenemedi.",
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  function startEditing() {
    setDraft(profile);
    setNotice("");
    setError("");
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setNotice("");
    setError("");
    setEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: draft.firstName,
          lastName: draft.lastName || null,
          phoneNumber: draft.phoneNumber || null,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        { profile: AccountProfile } | { message?: string } | null;

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !payload || !("profile" in payload)) {
        throw new Error(
          payload && "message" in payload && payload.message
            ? payload.message
            : "Bilgiler kaydedilemedi.",
        );
      }

      const updatedProfile = {
        firstName: payload.profile.firstName,
        lastName: payload.profile.lastName ?? "",
        email: payload.profile.email,
        phoneNumber: payload.profile.phoneNumber ?? "",
      };

      setProfile(updatedProfile);
      setDraft(updatedProfile);
      setEditing(false);
      setNotice("Bilgileriniz başarıyla kaydedildi.");
      window.dispatchEvent(
        new CustomEvent("sofistike-profile-updated", {
          detail: { firstName: updatedProfile.firstName },
        }),
      );
      window.setTimeout(() => setNotice(""), 3000);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Bilgiler kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.profilePage}>
      <div className={styles.colorGlow} aria-hidden="true" />

      <header className={styles.pageIntro}>
        <p>SOFISTIKE +XTRA HESAP</p>
        <h1>Kullanıcı Bilgilerim</h1>
        <span>
          Kişisel ve iletişim bilgilerinizi tek bir yerden görüntüleyin veya
          düzenleyin.
        </span>
      </header>

      <div className={styles.accountLayout}>
        <AccountNavigation active="profile" />

        <section className={styles.profileCard} aria-labelledby="profile-title">
          <div className={styles.cardHeader}>
            <div>
              <p>KİŞİSEL BİLGİLER</p>
              <h2 id="profile-title">Profilinizi güncel tutun.</h2>
              <span>
                Kaydettiğiniz bilgiler hesabınızda saklanır ve sonraki
                ziyaretlerinizde güncel haliyle gösterilir.
              </span>
            </div>

            {!editing ? (
              <button
                type="button"
                className={styles.editButton}
                disabled={loading}
                onClick={startEditing}
              >
                Bilgilerimi Düzenle
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <label>
              <span>Ad</span>
              <input
                name="firstName"
                value={draft.firstName}
                disabled={!editing}
                required
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Soyad</span>
              <input
                name="lastName"
                value={draft.lastName}
                disabled={!editing}
                placeholder={editing ? "Soyadınızı girin" : "Belirtilmedi"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.fullWidthField}>
              <span>E-posta adresi</span>
              <input
                name="email"
                type="email"
                value={draft.email}
                disabled
                aria-describedby="email-help"
              />
              <small id="email-help">
                Giriş yaptığınız e-posta adresi bu ekrandan değiştirilemez.
              </small>
            </label>

            <label className={styles.fullWidthField}>
              <span>Telefon numarası</span>
              <input
                name="phone"
                type="tel"
                value={draft.phoneNumber}
                disabled={!editing}
                placeholder={editing ? "+90 5xx xxx xx xx" : "Belirtilmedi"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </label>

            {editing ? (
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  disabled={saving}
                  onClick={cancelEditing}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
                </button>
              </div>
            ) : null}
          </form>

          {notice ? (
            <div className={styles.previewNotice} role="status">
              <span aria-hidden="true">✓</span>
              {notice}
            </div>
          ) : null}

          {error ? (
            <div className={styles.errorNotice} role="alert">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
