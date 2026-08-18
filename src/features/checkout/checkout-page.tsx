"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/features/cart/cart-context";
import { readApiMessage } from "@/lib/cart";
import type { CreatedOrder } from "@/lib/cart";
import styles from "./checkout-page.module.css";

type AuthStatus = "loading" | "authenticated" | "guest" | "unavailable";
type DeliveryMethod = "standard" | "express";

type CurrentUser = {
  email: string;
  firstName: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3 4.5 6v5.2c0 4.7 2.7 8.2 7.5 9.8 4.8-1.6 7.5-5.1 7.5-9.8V6L12 3Z" />
      <path d="m8.7 12.1 2.1 2.1 4.6-4.8" />
    </svg>
  );
}

function EmptyCheckout() {
  return (
    <main className={styles.statePage}>
      <div className={styles.stateCard}>
        <span aria-hidden="true">S+</span>
        <small>ÖDEME ADIMI</small>
        <h1>Sepetinizde henüz ürün bulunmuyor.</h1>
        <p>
          Ödeme adımına devam edebilmek için önce seçkinize bir ürün ekleyin.
        </p>
        <Link href="/#tum-urunler">Ürünleri Keşfet</Link>
      </div>
    </main>
  );
}

export function CheckoutPage() {
  const {
    items,
    itemCount,
    subtotal,
    loading: cartLoading,
    clearCart,
  } = useCart();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");
  const [billingSame, setBillingSame] = useState(true);
  const [formNotice, setFormNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401) {
          setAuthStatus("guest");
          return;
        }
        if (!response.ok) {
          setAuthStatus("unavailable");
          return;
        }

        const payload = (await response.json()) as { user: CurrentUser };
        if (active) {
          setUser(payload.user);
          setAuthStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) setAuthStatus("unavailable");
      });

    return () => {
      active = false;
    };
  }, []);

  const shippingCost = deliveryMethod === "express" ? 59 : 0;
  const total = subtotal + shippingCost;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting) return;

    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setFormNotice("");

    try {
      // Kart numarası, son kullanma tarihi ve CVV kasıtlı olarak bu isteğe
      // dahil edilmez. Gerçek ödeme daha sonra lisanslı sağlayıcıyla yapılır.
      const response = await fetch("/api/account/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail: user.email,
          firstName: String(form.get("firstName") ?? ""),
          lastName: String(form.get("lastName") ?? ""),
          phoneNumber: String(form.get("phone") ?? ""),
          city: String(form.get("city") ?? ""),
          district: String(form.get("district") ?? ""),
          addressLine: String(form.get("address") ?? ""),
          postalCode: String(form.get("postalCode") ?? "") || null,
          addressTitle: String(form.get("addressTitle") ?? "") || null,
          deliveryMethod,
        }),
      });

      if (!response.ok) throw new Error(await readApiMessage(response));

      const order = (await response.json()) as CreatedOrder;
      setCreatedOrder(order);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setFormNotice(
        reason instanceof Error
          ? reason.message
          : "Sipariş şu anda oluşturulamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authStatus === "loading" || cartLoading) {
    return (
      <main className={styles.statePage}>
        <div className={styles.loading} role="status">
          <span />
          <p>Güvenli ödeme ekranı hazırlanıyor…</p>
        </div>
      </main>
    );
  }

  if (authStatus === "guest") {
    return (
      <main className={styles.statePage}>
        <div className={styles.stateCard}>
          <span aria-hidden="true">S+</span>
          <small>GÜVENLİ ÖDEME</small>
          <h1>Ödeme adımına devam etmek için giriş yapın.</h1>
          <p>
            Sepetinizi ve teslimat bilgilerinizi hesabınızla güvenli biçimde
            eşleştirelim.
          </p>
          <Link href="/login?redirect=%2Fodeme">Giriş Yap</Link>
        </div>
      </main>
    );
  }

  if (authStatus === "unavailable") {
    return (
      <main className={styles.statePage}>
        <div className={styles.stateCard}>
          <span aria-hidden="true">!</span>
          <small>BAĞLANTI UYARISI</small>
          <h1>Oturum bilgilerinize şu anda ulaşamıyoruz.</h1>
          <p>Kısa süre sonra sayfayı yenileyerek tekrar deneyebilirsiniz.</p>
          <button onClick={() => window.location.reload()} type="button">
            Tekrar Dene
          </button>
        </div>
      </main>
    );
  }

  if (createdOrder) {
    return (
      <main className={styles.statePage}>
        <div className={styles.stateCard} role="status">
          <span aria-hidden="true">✓</span>
          <small>SİPARİŞİNİZ ALINDI</small>
          <h1>Teşekkürler, siparişiniz oluşturuldu.</h1>
          <p>
            Sipariş numaranız <strong>{createdOrder.orderNumber}</strong>. Ödeme
            sağlayıcısı bağlanana kadar siparişiniz “ödeme bekliyor” durumunda
            tutulacak.
          </p>
          <Link href="/hesabim/siparislerim">Siparişlerime Git</Link>
        </div>
      </main>
    );
  }

  if (!items.length) return <EmptyCheckout />;

  return (
    <main className={styles.checkoutPage}>
      <div className={styles.colorGlow} aria-hidden="true" />
      <header className={styles.intro}>
        <div>
          <span>SOFISTIKE +XTRA CHECKOUT</span>
          <h1>Güvenli ödeme</h1>
          <p>
            Teslimat bilgilerinizi tamamlayın, siparişinizi son kez kontrol
            edin.
          </p>
        </div>
        <div className={styles.secureBadge}>
          <ShieldIcon />
          <span>
            <strong>Güvenli işlem</strong>
            Bilgileriniz bu önizlemede kaydedilmez
          </span>
        </div>
      </header>

      <ol className={styles.steps} aria-label="Ödeme adımları">
        <li className={styles.completedStep}>
          <span>✓</span>
          Sepet
        </li>
        <li className={styles.activeStep}>
          <span>2</span>
          Teslimat ve ödeme
        </li>
        <li>
          <span>3</span>
          Onay
        </li>
      </ol>

      <div className={styles.checkoutLayout}>
        <form
          className={styles.checkoutForm}
          id="checkout-form"
          onSubmit={handleSubmit}
        >
          <section className={styles.formSection}>
            <div className={styles.sectionHeading}>
              <span>01</span>
              <div>
                <h2>İletişim bilgileri</h2>
                <p>Sipariş bilgilendirmelerini bu adrese göndereceğiz.</p>
              </div>
            </div>
            <label className={styles.fullField}>
              <span>E-posta adresi</span>
              <input
                aria-describedby="email-note"
                readOnly
                type="email"
                value={user?.email ?? ""}
              />
              <small id="email-note">
                Hesabınıza bağlı e-posta adresi kullanılıyor.
              </small>
            </label>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeading}>
              <span>02</span>
              <div>
                <h2>Teslimat adresi</h2>
                <p>Siparişinizin teslim edileceği bilgileri girin.</p>
              </div>
            </div>
            <div className={styles.fieldGrid}>
              <label>
                <span>Ad</span>
                <input autoComplete="given-name" name="firstName" required />
              </label>
              <label>
                <span>Soyad</span>
                <input autoComplete="family-name" name="lastName" required />
              </label>
              <label className={styles.fullField}>
                <span>Telefon numarası</span>
                <input
                  autoComplete="tel"
                  inputMode="tel"
                  name="phone"
                  placeholder="05__ ___ __ __"
                  required
                />
              </label>
              <label>
                <span>İl</span>
                <select autoComplete="address-level1" name="city" required>
                  <option value="">İl seçin</option>
                  <option>İstanbul</option>
                  <option>Ankara</option>
                  <option>İzmir</option>
                  <option>Bursa</option>
                  <option>Antalya</option>
                </select>
              </label>
              <label>
                <span>İlçe</span>
                <input autoComplete="address-level2" name="district" required />
              </label>
              <label className={styles.fullField}>
                <span>Adres</span>
                <textarea
                  autoComplete="street-address"
                  name="address"
                  placeholder="Mahalle, cadde, sokak ve bina bilgileri"
                  required
                  rows={3}
                />
              </label>
              <label>
                <span>Posta kodu</span>
                <input
                  autoComplete="postal-code"
                  inputMode="numeric"
                  name="postalCode"
                />
              </label>
              <label>
                <span>Adres başlığı</span>
                <input name="addressTitle" placeholder="Ev, İş…" />
              </label>
            </div>
          </section>

          <fieldset className={styles.formSection}>
            <legend className={styles.sectionHeading}>
              <span>03</span>
              <span>
                <strong>Teslimat yöntemi</strong>
                <small>Size uygun teslimat hızını seçin.</small>
              </span>
            </legend>
            <div className={styles.deliveryOptions}>
              <label
                className={
                  deliveryMethod === "standard" ? styles.optionSelected : ""
                }
              >
                <input
                  checked={deliveryMethod === "standard"}
                  name="delivery"
                  onChange={() => setDeliveryMethod("standard")}
                  type="radio"
                  value="standard"
                />
                <span>
                  <strong>Standart teslimat</strong>
                  <small>2–4 iş günü</small>
                </span>
                <b>Ücretsiz</b>
              </label>
              <label
                className={
                  deliveryMethod === "express" ? styles.optionSelected : ""
                }
              >
                <input
                  checked={deliveryMethod === "express"}
                  name="delivery"
                  onChange={() => setDeliveryMethod("express")}
                  type="radio"
                  value="express"
                />
                <span>
                  <strong>Hızlı teslimat</strong>
                  <small>1–2 iş günü</small>
                </span>
                <b>{formatPrice(59)}</b>
              </label>
            </div>
          </fieldset>

          <section className={styles.formSection}>
            <div className={styles.sectionHeading}>
              <span>04</span>
              <div>
                <h2>Ödeme yöntemi</h2>
                <p>
                  Kart bilgileriniz backend&apos;e gönderilmez veya kaydedilmez.
                </p>
              </div>
            </div>
            <div className={styles.paymentHeader}>
              <span>Kredi / Banka Kartı</span>
              <div aria-label="Desteklenen kartlar">
                <b>VISA</b>
                <b>MC</b>
                <b>TROY</b>
              </div>
            </div>
            <div className={styles.fieldGrid}>
              <label className={styles.fullField}>
                <span>Kart üzerindeki ad soyad</span>
                <input
                  autoComplete="cc-name"
                  name="cardName"
                  placeholder="AD SOYAD"
                  required
                />
              </label>
              <label className={styles.fullField}>
                <span>Kart numarası</span>
                <input
                  autoComplete="cc-number"
                  inputMode="numeric"
                  maxLength={19}
                  name="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  required
                />
              </label>
              <label>
                <span>Son kullanma tarihi</span>
                <input
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  maxLength={5}
                  name="expiry"
                  placeholder="AA/YY"
                  required
                />
              </label>
              <label>
                <span>CVV</span>
                <input
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  maxLength={3}
                  name="cvv"
                  placeholder="•••"
                  required
                  type="password"
                />
              </label>
            </div>
            <label className={styles.checkboxRow}>
              <input
                checked={billingSame}
                onChange={(event) => setBillingSame(event.target.checked)}
                type="checkbox"
              />
              <span>Fatura adresim teslimat adresimle aynı.</span>
            </label>
            {!billingSame ? (
              <div className={styles.billingNotice}>
                Ayrı fatura adresi sonraki ödeme entegrasyonu fazında eklenecek.
              </div>
            ) : null}
          </section>

          {formNotice ? (
            <div className={styles.formNotice} role="alert">
              <span aria-hidden="true">!</span>
              {formNotice}
            </div>
          ) : null}

          <button
            className={styles.mobileSubmit}
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Sipariş oluşturuluyor…" : "Siparişi Tamamla"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <aside className={styles.orderSummary} aria-labelledby="summary-title">
          <div className={styles.summaryHeading}>
            <div>
              <span>SİPARİŞ ÖZETİ</span>
              <h2 id="summary-title">Seçkiniz</h2>
            </div>
            <Link href="/?cart=open">Sepeti düzenle</Link>
          </div>

          <div className={styles.summaryItems}>
            {items.map((item) => (
              <article
                key={item.id}
                style={
                  { "--summary-accent": item.color } as React.CSSProperties
                }
              >
                <div className={styles.summaryImage}>
                  <Image alt="" fill sizes="72px" src={item.image} />
                  <span>{item.quantity}</span>
                </div>
                <div>
                  <small>{item.category}</small>
                  <h3>{item.name}</h3>
                  <p>Teslimat: {item.delivery}</p>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </article>
            ))}
          </div>

          <dl className={styles.totals}>
            <div>
              <dt>Ara toplam ({itemCount} ürün)</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Kargo</dt>
              <dd>{shippingCost ? formatPrice(shippingCost) : "Ücretsiz"}</dd>
            </div>
            <div className={styles.grandTotal}>
              <dt>Toplam</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <p className={styles.taxNote}>Vergiler ürün fiyatlarına dahildir.</p>
          <button
            className={styles.desktopSubmit}
            disabled={submitting}
            form="checkout-form"
            type="submit"
          >
            {submitting ? "Sipariş oluşturuluyor…" : "Siparişi Tamamla"}{" "}
            <span aria-hidden="true">→</span>
          </button>
          <div className={styles.summarySecurity}>
            <ShieldIcon />
            <span>
              <strong>Güvenli ödeme tasarımı</strong>
              Kart bilgileri backend&apos;e gönderilmez.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
