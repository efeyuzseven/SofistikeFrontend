"use client";

import { useEffect, useMemo, useState } from "react";
import type { BackendOrder } from "@/lib/orders";
import type { BackendReview } from "@/lib/reviews";
import { AccountNavigation } from "./account-navigation";
import styles from "./reviews-page.module.css";

type ReviewTarget = {
  key: string;
  orderId: string;
  orderNumber: string;
  productId: string | null;
  title: string;
  detail: string;
};

const statusLabels: Record<BackendReview["status"], string> = {
  Pending: "İnceleniyor",
  Published: "Yayında",
  Rejected: "Reddedildi",
};

export function ReviewsPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [selected, setSelected] = useState<ReviewTarget | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [ordersResponse, reviewsResponse] = await Promise.all([
          fetch("/api/account/orders", { cache: "no-store" }),
          fetch("/api/account/reviews", { cache: "no-store" }),
        ]);
        if (ordersResponse.status === 401 || reviewsResponse.status === 401) {
          window.location.assign(
            "/login?redirect=%2Fhesabim%2Fdegerlendirmelerim",
          );
          return;
        }
        if (!ordersResponse.ok || !reviewsResponse.ok) {
          throw new Error("Değerlendirme bilgileri yüklenemedi.");
        }

        const loadedOrders = (await ordersResponse.json()) as BackendOrder[];
        const loadedReviews = (await reviewsResponse.json()) as BackendReview[];
        if (active) {
          setOrders(loadedOrders);
          setReviews(loadedReviews);
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Değerlendirme bilgileri yüklenemedi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const targets = useMemo(() => {
    const reviewed = new Set(
      reviews.map(
        (review) => `${review.orderId}:${review.productId ?? "order"}`,
      ),
    );
    const available: ReviewTarget[] = [];

    for (const order of orders) {
      if (!reviewed.has(`${order.id}:order`)) {
        available.push({
          key: `${order.id}:order`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          productId: null,
          title: "Sipariş deneyimi",
          detail: `${order.items.length} ürün • ${order.orderNumber}`,
        });
      }

      for (const item of order.items) {
        if (reviewed.has(`${order.id}:${item.productId}`)) continue;
        available.push({
          key: `${order.id}:${item.productId}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          productId: item.productId,
          title: item.productName,
          detail: `${item.variantName} • ${order.orderNumber}`,
        });
      }
    }

    return available;
  }, [orders, reviews]);

  function openForm(target: ReviewTarget) {
    setSelected(target);
    setRating(0);
    setComment("");
    setAnonymous(false);
    setError("");
    setNotice("");
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !rating || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/account/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selected.orderId,
          productId: selected.productId,
          rating,
          comment,
          isAnonymous: anonymous,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        BackendReview | { message?: string } | null;
      if (!response.ok) {
        throw new Error(
          payload && "message" in payload && payload.message
            ? payload.message
            : "Değerlendirme gönderilemedi.",
        );
      }

      setReviews((current) => [payload as BackendReview, ...current]);
      setSelected(null);
      setNotice("Değerlendirmeniz alındı ve incelemeye gönderildi.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Değerlendirme gönderilemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <span>SOFISTIKE +XTRA HESAP</span>
        <h1>Değerlendirmelerim</h1>
        <p>Satın aldığınız ürünleri ve sipariş deneyiminizi paylaşın.</p>
      </header>

      <AccountNavigation active="reviews" />

      <div className={styles.layout}>
        <section className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>Değerlendirme bekleyenler</h2>
            <span>{targets.length}</span>
          </div>
          {loading ? <p>Bilgiler yükleniyor…</p> : null}
          {!loading && !targets.length ? (
            <div className={styles.empty}>
              <h3>Bekleyen değerlendirmeniz yok.</h3>
              <p>Yeni bir sipariş verdiğinizde ürünler burada görünecek.</p>
            </div>
          ) : null}
          <div className={styles.targetList}>
            {targets.map((target) => (
              <article key={target.key}>
                <div>
                  <small>{target.orderNumber}</small>
                  <h3>{target.title}</h3>
                  <p>{target.detail}</p>
                </div>
                <button type="button" onClick={() => openForm(target)}>
                  Değerlendir
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>Geçmiş değerlendirmeler</h2>
            <span>{reviews.length}</span>
          </div>
          <div className={styles.history}>
            {reviews.map((review) => (
              <article key={review.id}>
                <div className={styles.reviewMeta}>
                  <small>{review.orderNumber}</small>
                  <span className={styles[review.status.toLowerCase()]}>
                    {statusLabels[review.status]}
                  </span>
                </div>
                <h3>{review.productName ?? "Sipariş deneyimi"}</h3>
                <div
                  className={styles.stars}
                  aria-label={`${review.rating} yıldız`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} data-active={star <= review.rating}>
                      ★
                    </span>
                  ))}
                </div>
                <p>{review.comment}</p>
                <small>
                  {new Date(review.createdAtUtc).toLocaleDateString("tr-TR")}
                </small>
              </article>
            ))}
          </div>
        </section>
      </div>

      {notice ? <div className={styles.notice}>{notice}</div> : null}
      {error && !selected ? <div className={styles.error}>{error}</div> : null}

      {selected ? (
        <div className={styles.backdrop} role="presentation">
          <form
            className={styles.dialog}
            onSubmit={submitReview}
            aria-labelledby="review-form-title"
          >
            <button
              className={styles.close}
              type="button"
              aria-label="Kapat"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <small>{selected.orderNumber}</small>
            <h2 id="review-form-title">{selected.title}</h2>
            <div className={styles.rating} aria-label="Puan seçin">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  aria-pressed={star <= rating}
                  key={star}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <label>
              Yorumunuz
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={3}
                maxLength={2000}
                rows={5}
                required
              />
            </label>
            <label className={styles.anonymous}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              Adımı gizle
            </label>
            {error ? <p className={styles.formError}>{error}</p> : null}
            <button
              className={styles.submit}
              disabled={!rating || submitting}
              type="submit"
            >
              {submitting ? "Gönderiliyor…" : "Değerlendirmeyi Gönder"}
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
