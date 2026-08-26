"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./site-header.module.css";

type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  role: string;
};

const upcomingAccountItems = ["İade Taleplerim"] as const;

function AccountIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.6-4 3.1-6 7.5-6s6.9 2 7.5 6" />
    </svg>
  );
}

export function AccountMenu() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;

        const payload = (await response.json()) as { user: CurrentUser };
        return payload.user;
      })
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    if (sessionStorage.getItem("sofistike_login_success") === "true") {
      sessionStorage.removeItem("sofistike_login_success");
      const showTimer = window.setTimeout(() => setShowWelcome(true), 0);
      const hideTimer = window.setTimeout(() => setShowWelcome(false), 3000);

      return () => {
        active = false;
        window.clearTimeout(showTimer);
        window.clearTimeout(hideTimer);
      };
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleProfileUpdated(event: Event) {
      const detail = (event as CustomEvent<{ firstName?: string }>).detail;
      if (!detail?.firstName) return;

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              firstName: detail.firstName ?? currentUser.firstName,
            }
          : currentUser,
      );
    }

    window.addEventListener("sofistike-profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener(
        "sofistike-profile-updated",
        handleProfileUpdated,
      );
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setLoggingOut(false);
      if (menuRef.current) menuRef.current.open = false;
    }
  }

  if (!user) {
    return (
      <Link className={styles.actionLink} href="/login" aria-label="Hesabım">
        <AccountIcon />
      </Link>
    );
  }

  const initial = user.firstName.trim().charAt(0).toLocaleUpperCase("tr-TR");

  return (
    <>
      {showWelcome ? (
        <div className={styles.welcomeToast} role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <p>
            Hoş geldiniz, <strong>{user.firstName}!</strong>
          </p>
        </div>
      ) : null}

      <details
        className={styles.accountMenu}
        ref={menuRef}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && menuRef.current) {
            menuRef.current.open = true;
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && menuRef.current) {
            menuRef.current.open = false;
          }
        }}
      >
        <summary
          aria-label={`${user.firstName} hesap menüsünü aç`}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse") event.preventDefault();
          }}
          onClick={(event) => {
            const usesMouse = window.matchMedia(
              "(hover: hover) and (pointer: fine)",
            ).matches;

            if (usesMouse && event.detail > 0) {
              event.preventDefault();
              menuRef.current?.removeAttribute("open");
              event.currentTarget.blur();
            }
          }}
        >
          <span className={styles.accountAvatar}>{initial}</span>
          <span className={styles.accountGreeting}>
            <small>Merhaba,</small>
            <strong>{user.firstName}</strong>
          </span>
          <span className={styles.accountChevron} aria-hidden="true">
            ⌄
          </span>
        </summary>

        <div className={styles.accountPanel}>
          <div className={styles.accountIdentity}>
            <span className={styles.accountAvatarLarge}>{initial}</span>
            <div>
              <strong>{user.firstName}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <nav aria-label="Hesap işlemleri">
            {user.role.toLocaleLowerCase("tr-TR") === "admin" ? (
              <>
                <Link href="/admin/urunler">
                  <span>Ürün Yönetimi</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/admin/bannerlar">
                  <span>Banner Yönetimi</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/admin/kategoriler">
                  <span>Kategori Yönetimi</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </>
            ) : null}
            <Link href="/hesabim/bilgilerim">
              <span>Kullanıcı Bilgilerim</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/hesabim/favorilerim">
              <span>Favorilerim</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/hesabim/siparislerim">
              <span>Siparişlerim</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/hesabim/degerlendirmelerim">
              <span>Değerlendirmelerim</span>
              <span aria-hidden="true">→</span>
            </Link>
            {upcomingAccountItems.map((item) => (
              <button type="button" disabled key={item}>
                <span>{item}</span>
                <small>Yakında</small>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className={styles.logoutButton}
            disabled={loggingOut}
            onClick={handleLogout}
          >
            {loggingOut ? "Çıkış yapılıyor…" : "Çıkış Yap"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </details>
    </>
  );
}
