"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./login-page.module.css";

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.googleIcon}>
      <path
        fill="#4285f4"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"
      />
      <path
        fill="#34a853"
        d="M12 22c2.7 0 5-.9 6.8-2.3l-3.3-2.6c-.9.6-2.1 1-3.5 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10.3 10.3 0 0 0 12 22Z"
      />
      <path
        fill="#fbbc05"
        d="M6.4 14a6.1 6.1 0 0 1 0-4V7.4H3a10.3 10.3 0 0 0 0 9.2L6.4 14Z"
      />
      <path
        fill="#ea4335"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1Z"
      />
    </svg>
  );
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          rememberMe: formData.get("remember") === "on",
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setErrorMessage(
          payload?.message ?? "Giriş yapılamadı. Bilgilerinizi kontrol edin.",
        );
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      sessionStorage.setItem("sofistike_login_success", "true");
      window.location.assign(
        redirect?.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/",
      );
    } catch {
      setErrorMessage(
        "Giriş servisine ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <div
        className={styles.brandPanel}
        role="img"
        aria-label="Sofistike +XTRA — Hayatı daha iyi tasarlıyoruz"
      />

      <section className={styles.formPanel} aria-labelledby="login-title">
        <Link
          href="/"
          className={styles.closeButton}
          aria-label="Giriş ekranını kapat"
        >
          <span aria-hidden="true">×</span>
        </Link>

        <div className={styles.formShell}>
          <div className={styles.mobileBrand} aria-hidden="true">
            SOFISTIKE
          </div>

          <div className={styles.intro}>
            <p>SOFISTIKE +XTRA</p>
            <h1 id="login-title">Tekrar hoş geldiniz</h1>
            <span>Hesabınıza giriş yaparak kaldığınız yerden devam edin.</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="email">E-posta adresi</label>
            <div className={styles.inputField}>
              <MailIcon />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="E-posta adresinizi girin"
                required
              />
            </div>

            <label htmlFor="password">Şifre</label>
            <div className={styles.inputField}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" name="remember" />
                <span>Beni hatırla</span>
              </label>
              <Link href="/?account=forgot-password">Şifremi unuttum</Link>
            </div>

            {errorMessage ? (
              <p className={styles.formError} role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>

            <div className={styles.divider}>
              <span>veya</span>
            </div>

            <button type="button" className={styles.googleButton}>
              <GoogleIcon />
              Google ile devam et
            </button>

            <p className={styles.signup}>
              Hesabınız yok mu? <Link href="/?account=register">Kayıt Ol</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
