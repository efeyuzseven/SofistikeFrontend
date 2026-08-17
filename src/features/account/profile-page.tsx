"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AccountNavigation } from "./account-navigation";
import styles from "./profile-page.module.css";

type CurrentUser = {
  email: string;
  firstName: string;
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const emptyProfile: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [draft, setDraft] = useState<ProfileForm>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { user: CurrentUser };
      })
      .then((payload) => {
        if (!active) return;

        if (payload?.user) {
          const currentProfile = {
            firstName: payload.user.firstName,
            lastName: "",
            email: payload.user.email,
            phone: "",
          };
          setProfile(currentProfile);
          setDraft(currentProfile);
        }

        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function startEditing() {
    setDraft(profile);
    setNotice("");
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setNotice("");
    setEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfile(draft);
    setEditing(false);
    setNotice("Tasarım önizlemesi: Bilgiler veritabanına kaydedilmedi.");
    window.setTimeout(() => setNotice(""), 3000);
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
                Bu ekran şimdilik tasarım önizlemesidir; bilgiler kalıcı olarak
                saklanmaz.
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
                Giriş yaptığınız e-posta adresi bu önizlemede değiştirilemez.
              </small>
            </label>

            <label className={styles.fullWidthField}>
              <span>Telefon numarası</span>
              <input
                name="phone"
                type="tel"
                value={draft.phone}
                disabled={!editing}
                placeholder={editing ? "+90 5xx xxx xx xx" : "Belirtilmedi"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>

            {editing ? (
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={cancelEditing}
                >
                  Vazgeç
                </button>
                <button type="submit" className={styles.saveButton}>
                  Değişiklikleri Kaydet
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
        </section>
      </div>
    </main>
  );
}
