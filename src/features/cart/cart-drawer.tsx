"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-context";
import styles from "./cart-drawer.module.css";

type AuthStatus = "loading" | "authenticated" | "guest" | "unavailable";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function BagIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 80">
      <path d="M18 27h44l4 43H14l4-43Z" />
      <path d="M29 30v-8c0-8 4-12 11-12s11 4 11 12v8" />
      <path d="M31 45c3 4 6 6 9 6s6-2 9-6" />
    </svg>
  );
}

export function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const open = searchParams.get("cart") === "open";

  useEffect(() => {
    if (!open) return;
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        if (response.ok) setAuthStatus("authenticated");
        else if (response.status === 401) setAuthStatus("guest");
        else setAuthStatus("unavailable");
      })
      .catch(() => {
        if (active) setAuthStatus("unavailable");
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  });

  function closeDrawer() {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("cart");
    const query = nextParams.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  if (!open) return null;

  const redirectPath = `${pathname}?cart=open`;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closeDrawer();
      }}
      role="presentation"
    >
      <aside
        aria-labelledby="cart-title"
        aria-modal="true"
        className={styles.drawer}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            <span>SOFISTIKE +XTRA</span>
            <h2 id="cart-title">
              Sepetim
              {authStatus === "authenticated" && itemCount
                ? ` (${itemCount} ürün)`
                : ""}
            </h2>
          </div>
          <button aria-label="Sepeti kapat" onClick={closeDrawer} type="button">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.colorRail} aria-hidden="true" />

        {authStatus === "loading" ? (
          <div className={styles.loading} role="status">
            <span />
            <p>Sepetiniz hazırlanıyor…</p>
          </div>
        ) : null}

        {authStatus === "guest" ? (
          <div className={styles.gate}>
            <span className={styles.illustration}>
              <BagIllustration />
            </span>
            <small>SEPETİNİZ SİZİ BEKLİYOR</small>
            <h3>Sepetinizi görüntülemek için giriş yapın.</h3>
            <p>
              Ürünlerinizi güvenle saklamak ve alışverişinize kaldığınız yerden
              devam etmek için hesabınıza giriş yapın.
            </p>
            <Link
              className={styles.primaryAction}
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            >
              Giriş Yap
            </Link>
            <Link className={styles.secondaryAction} href="/kayit">
              Hesabınız yok mu? <strong>Kayıt Ol</strong>
            </Link>
          </div>
        ) : null}

        {authStatus === "unavailable" ? (
          <div className={styles.gate}>
            <span className={styles.illustration}>
              <BagIllustration />
            </span>
            <h3>Sepet şu anda görüntülenemiyor.</h3>
            <p>Oturum servisine ulaşamadık. Kısa süre sonra tekrar deneyin.</p>
            <button
              className={styles.primaryAction}
              onClick={() => window.location.reload()}
              type="button"
            >
              Tekrar Dene
            </button>
          </div>
        ) : null}

        {authStatus === "authenticated" && items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.illustration}>
              <BagIllustration />
            </span>
            <small>SEPETİNİZ HENÜZ BOŞ</small>
            <h3>İyi yaşam seçkinizi oluşturmaya başlayın.</h3>
            <p>
              Beğendiğiniz ürünleri sepetinize ekleyin; burada tek bakışta
              görüntüleyin.
            </p>
            <button
              className={styles.primaryAction}
              onClick={closeDrawer}
              type="button"
            >
              Ürünleri Keşfet
            </button>
          </div>
        ) : null}

        {authStatus === "authenticated" && items.length > 0 ? (
          <>
            <div className={styles.content}>
              <div className={styles.deliveryNote}>
                <span aria-hidden="true">✓</span>
                <p>
                  Ürünleriniz ayrılmadı. <strong>Stokları tükenmeden</strong>{" "}
                  alışverişinizi tamamlayın.
                </p>
              </div>

              <div className={styles.items}>
                {items.map((item) => (
                  <article
                    className={styles.item}
                    key={item.id}
                    style={
                      { "--item-accent": item.color } as React.CSSProperties
                    }
                  >
                    <div className={styles.itemImage}>
                      <Image alt="" fill sizes="96px" src={item.image} />
                    </div>
                    <div className={styles.itemCopy}>
                      <span>{item.category}</span>
                      <h3>{item.name}</h3>
                      <small>Tahmini kargoya teslim: {item.delivery}</small>
                      <div className={styles.itemActions}>
                        <div
                          aria-label={`${item.name} adet`}
                          className={styles.quantity}
                        >
                          <button
                            aria-label="Adedi azalt"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            type="button"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            aria-label="Adedi artır"
                            disabled={item.quantity >= 9}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={styles.removeButton}
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          Kaldır
                        </button>
                        <strong>
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <footer className={styles.summary}>
              <div>
                <span>Ara toplam</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>Kargo</span>
                <small>Ödeme adımında hesaplanır</small>
              </div>
              <p>Vergiler ürün fiyatlarına dahildir.</p>
              <button
                className={styles.checkoutButton}
                onClick={() => router.push("/odeme")}
                type="button"
              >
                Ödemeye Geç <span aria-hidden="true">→</span>
              </button>
              <button
                className={styles.continueButton}
                onClick={closeDrawer}
                type="button"
              >
                Alışverişe devam et
              </button>
            </footer>
          </>
        ) : null}
      </aside>
    </div>
  );
}
