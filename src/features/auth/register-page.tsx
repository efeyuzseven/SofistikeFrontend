"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./login-page.module.css";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

function meetsPasswordPolicy(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    if (!meetsPasswordPolicy(password)) {
      setErrorMessage(
        "Şifreniz en az 8 karakter; büyük/küçük harf, rakam ve özel karakter içermelidir.",
      );
      setSubmitting(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Şifreler birbiriyle eşleşmiyor.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName") || null,
          email: formData.get("email"),
          password,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setErrorMessage(
          payload?.message ??
            "Hesap oluşturulamadı. Bilgilerinizi kontrol edin.",
        );
        return;
      }

      sessionStorage.setItem("sofistike_login_success", "true");
      window.location.assign("/");
    } catch {
      setErrorMessage(
        "Kayıt servisine ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
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

      <section className={styles.formPanel} aria-labelledby="register-title">
        <Link
          href="/"
          className={styles.closeButton}
          aria-label="Kayıt ekranını kapat"
        >
          <span aria-hidden="true">×</span>
        </Link>

        <div className={styles.formShell}>
          <div className={styles.mobileBrand} aria-hidden="true">
            SOFISTIKE
          </div>

          <div className={styles.intro}>
            <p>SOFISTIKE +XTRA</p>
            <h1 id="register-title">Hesabınızı oluşturun</h1>
            <span>
              Favorilerinize, siparişlerinize ve size özel deneyimlere tek
              hesaptan ulaşın.
            </span>
          </div>

          <form
            className={`${styles.form} ${styles.registerForm}`}
            onSubmit={handleSubmit}
          >
            <div className={styles.nameGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">Ad</label>
                <div className={styles.inputField}>
                  <input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Adınız"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Soyad</label>
                <div className={styles.inputField}>
                  <input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Soyadınız"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="registerEmail">E-posta adresi</label>
              <div className={styles.inputField}>
                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@eposta.com"
                  maxLength={320}
                  required
                />
              </div>
            </div>

            <div className={styles.nameGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="registerPassword">Şifre</label>
                <div className={styles.inputField}>
                  <input
                    id="registerPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    aria-label={
                      showPassword ? "Şifreleri gizle" : "Şifreleri göster"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="passwordConfirmation">Şifre tekrarı</label>
                <div className={styles.inputField}>
                  <input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>
              </div>
            </div>

            <p className={styles.passwordHint}>
              En az 8 karakter, büyük/küçük harf, rakam ve özel karakter
              kullanın.
            </p>

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
              {submitting ? "Hesap oluşturuluyor…" : "Hesap Oluştur"}
            </button>

            <p className={styles.signup}>
              Zaten hesabınız var mı? <Link href="/login">Giriş Yap</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
