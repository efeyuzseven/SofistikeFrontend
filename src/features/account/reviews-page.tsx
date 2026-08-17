"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AccountNavigation } from "./account-navigation";
import styles from "./reviews-page.module.css";

type ReviewTab = "products" | "orders" | "history";
type ReviewType = "product" | "order";
type ReviewStatus = "published" | "pending" | "draft";

type ReviewTarget = {
  id: string;
  type: ReviewType;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  orderNo: string;
  questions: string[];
};

type PastReview = {
  id: string;
  type: ReviewType;
  title: string;
  image: string;
  rating: number;
  comment: string;
  date: string;
  status: ReviewStatus;
  helpful?: number;
  editableUntil?: string;
};

const productTargets: ReviewTarget[] = [
  {
    id: "pillow",
    type: "product",
    title: "+XTRA One Konfor Yastığı",
    subtitle: "Uyku • Doğrulanmış alışveriş",
    image: "/images/hero-sleep.png",
    date: "26 Temmuz 2026'da teslim edildi",
    orderNo: "SFX-260724-0715",
    questions: ["Konfor", "Malzeme kalitesi", "Fiyat–performans"],
  },
  {
    id: "towel",
    type: "product",
    title: "Yumuşak Dokulu Havlu Seti",
    subtitle: "Banyo • Doğrulanmış alışveriş",
    image: "/images/hero-living.png",
    date: "2 Ağustos 2026'da teslim edildi",
    orderNo: "SFX-260801-0671",
    questions: ["Yumuşaklık", "Emicilik", "Görselle uyum"],
  },
];

const orderTargets: ReviewTarget[] = [
  {
    id: "order-0715",
    type: "order",
    title: "Sipariş deneyimi",
    subtitle: "1 ürün • ₺699",
    image: "/images/hero-living.png",
    date: "26 Temmuz 2026'da tamamlandı",
    orderNo: "SFX-260724-0715",
    questions: ["Teslimat hızı", "Paketleme", "Bilgilendirme"],
  },
  {
    id: "order-0528",
    type: "order",
    title: "Sipariş deneyimi",
    subtitle: "2 ürün • ₺628",
    image: "/images/hero-home.png",
    date: "1 Ağustos 2026'da tamamlandı",
    orderNo: "SFX-260728-0528",
    questions: ["Teslimat görevlisi", "Paket sağlamlığı", "Doğru ürün"],
  },
];

const initialHistory: PastReview[] = [
  {
    id: "history-aroma",
    type: "product",
    title: "+XTRA Sakin Aroma",
    image: "/images/hero-home.png",
    rating: 5,
    comment: "Koku yoğunluğu dengeli, salon için çok hoş ve kalıcı oldu.",
    date: "7 Ağustos 2026",
    status: "published",
    helpful: 18,
    editableUntil: "18 Ağustos'a kadar düzenleyebilirsiniz.",
  },
  {
    id: "history-order",
    type: "order",
    title: "SFX-260710-0429 sipariş deneyimi",
    image: "/images/hero-living.png",
    rating: 4,
    comment:
      "Paketleme çok özenliydi. Teslimat bilgilendirmesi biraz daha sık olabilir.",
    date: "18 Temmuz 2026",
    status: "published",
    helpful: 6,
  },
  {
    id: "history-spray",
    type: "product",
    title: "Lavanta Tekstil Spreyi",
    image: "/images/hero-living.png",
    rating: 4,
    comment: "Kokusu güzel, yastıkta biraz daha uzun süre kalmasını isterdim.",
    date: "12 Temmuz 2026",
    status: "pending",
  },
  {
    id: "history-draft",
    type: "product",
    title: "Limon Bulaşık Deterjanı",
    image: "/images/hero-home.png",
    rating: 0,
    comment: "",
    date: "Taslak",
    status: "draft",
  },
];

const statusLabels: Record<ReviewStatus, string> = {
  published: "Yayında",
  pending: "İnceleniyor",
  draft: "Taslak",
};

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-label={`${value} yıldız`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span className={star <= value ? styles.starActive : ""} key={star}>
          ★
        </span>
      ))}
    </span>
  );
}

function PendingCard({
  target,
  onReview,
}: {
  target: ReviewTarget;
  onReview: (target: ReviewTarget) => void;
}) {
  return (
    <article className={styles.pendingCard}>
      <div className={styles.cardImage}>
        <Image src={target.image} alt="" fill sizes="120px" />
      </div>
      <div className={styles.cardCopy}>
        <span>{target.orderNo}</span>
        <h3>{target.title}</h3>
        <p>{target.subtitle}</p>
        <small>{target.date}</small>
      </div>
      <button type="button" onClick={() => onReview(target)}>
        {target.type === "product"
          ? "Ürünü Değerlendir"
          : "Siparişi Değerlendir"}
      </button>
    </article>
  );
}

export function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("products");
  const [history, setHistory] = useState(initialHistory);
  const [historyType, setHistoryType] = useState<"all" | ReviewType>("all");
  const [historyStatus, setHistoryStatus] = useState<"all" | ReviewStatus>(
    "all",
  );
  const [historySort, setHistorySort] = useState<"newest" | "oldest">("newest");
  const [query, setQuery] = useState("");
  const [dialogTarget, setDialogTarget] = useState<ReviewTarget | null>(null);
  const [rating, setRating] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState<"yes" | "no" | "">("");
  const [anonymous, setAnonymous] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [selectedPastReview, setSelectedPastReview] =
    useState<PastReview | null>(null);
  const [notice, setNotice] = useState("");

  const filteredHistory = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    const matches = history.filter(
      (review) =>
        (historyType === "all" || review.type === historyType) &&
        (historyStatus === "all" || review.status === historyStatus) &&
        (!normalized ||
          `${review.title} ${review.comment}`
            .toLocaleLowerCase("tr-TR")
            .includes(normalized)),
    );
    return historySort === "oldest" ? [...matches].reverse() : matches;
  }, [history, historySort, historyStatus, historyType, query]);

  function openReview(target: ReviewTarget) {
    setDialogTarget(target);
    setRating(0);
    setSubRatings({});
    setComment("");
    setRecommend("");
    setAnonymous(false);
    setPhotoName("");
    setPreviewing(false);
  }

  function submitReview() {
    if (!dialogTarget || !rating) return;
    setHistory((current) => [
      {
        id: `new-${dialogTarget.id}`,
        type: dialogTarget.type,
        title:
          dialogTarget.type === "product"
            ? dialogTarget.title
            : `${dialogTarget.orderNo} sipariş deneyimi`,
        image: dialogTarget.image,
        rating,
        comment: comment || "Yıldız puanı ile değerlendirildi.",
        date: "12 Ağustos 2026",
        status: "pending",
      },
      ...current,
    ]);
    setDialogTarget(null);
    setNotice("Değerlendirmeniz alındı ve incelemeye gönderildi ✓");
    window.setTimeout(() => setNotice(""), 3000);
  }

  const targets = activeTab === "products" ? productTargets : orderTargets;

  return (
    <main className={styles.reviewsPage}>
      <div className={styles.colorGlow} aria-hidden="true" />
      <header className={styles.pageIntro}>
        <p>SOFISTIKE +XTRA HESAP</p>
        <div>
          <h1>Değerlendirmelerim</h1>
          <span>{productTargets.length + orderTargets.length} bekleyen</span>
        </div>
        <small>
          Ürünleri ve alışveriş deneyiminizi değerlendirerek bize yol gösterin.
        </small>
      </header>

      <div className={styles.accountLayout}>
        <AccountNavigation active="reviews" />
        <section className={styles.reviewPanel} aria-labelledby="reviews-title">
          <div className={styles.panelHeader}>
            <div>
              <p>DEĞERLENDİRME MERKEZİ</p>
              <h2 id="reviews-title">Deneyiminiz bizim için değerli.</h2>
            </div>
            <span>Tasarım önizlemesi</span>
          </div>

          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Değerlendirme bölümleri"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "products"}
              className={activeTab === "products" ? styles.activeTab : ""}
              onClick={() => setActiveTab("products")}
            >
              Ürün Değerlendir <span>{productTargets.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "orders"}
              className={activeTab === "orders" ? styles.activeTab : ""}
              onClick={() => setActiveTab("orders")}
            >
              Siparişi Değerlendir <span>{orderTargets.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "history"}
              className={activeTab === "history" ? styles.activeTab : ""}
              onClick={() => setActiveTab("history")}
            >
              Geçmiş Değerlendirmelerim <span>{history.length}</span>
            </button>
          </div>

          {activeTab !== "history" ? (
            <div className={styles.pendingSection}>
              <div className={styles.sectionIntro}>
                <h3>
                  {activeTab === "products"
                    ? "Değerlendirmenizi bekleyen ürünler"
                    : "Değerlendirmenizi bekleyen siparişler"}
                </h3>
                <p>
                  {activeTab === "products"
                    ? "Ürün yorumunuz diğer müşterilerin seçimine yardımcı olur."
                    : "Teslimat, paketleme ve bilgilendirme deneyiminizi paylaşın."}
                </p>
              </div>
              <div className={styles.pendingList}>
                {targets.map((target) => (
                  <PendingCard
                    target={target}
                    onReview={openReview}
                    key={target.id}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.historySection}>
              <div className={styles.historyControls}>
                <label>
                  <span className={styles.srOnly}>Değerlendirmelerde ara</span>
                  <input
                    type="search"
                    value={query}
                    placeholder="Ürün veya değerlendirme ara"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <div
                  className={styles.typeFilters}
                  aria-label="Değerlendirme türü"
                >
                  {[
                    ["all", "Tümü"],
                    ["product", "Ürün"],
                    ["order", "Sipariş"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      className={
                        historyType === value ? styles.activeFilter : ""
                      }
                      key={value}
                      onClick={() =>
                        setHistoryType(value as "all" | ReviewType)
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  aria-label="Yayın durumu"
                  value={historyStatus}
                  onChange={(event) =>
                    setHistoryStatus(event.target.value as "all" | ReviewStatus)
                  }
                >
                  <option value="all">Tüm durumlar</option>
                  <option value="published">Yayında</option>
                  <option value="pending">İnceleniyor</option>
                  <option value="draft">Taslak</option>
                </select>
                <select
                  aria-label="Tarih sıralaması"
                  value={historySort}
                  onChange={(event) =>
                    setHistorySort(event.target.value as "newest" | "oldest")
                  }
                >
                  <option value="newest">En yeni</option>
                  <option value="oldest">En eski</option>
                </select>
              </div>
              <div className={styles.historyList}>
                {filteredHistory.map((review) => (
                  <article className={styles.historyCard} key={review.id}>
                    <div className={styles.historyImage}>
                      <Image src={review.image} alt="" fill sizes="100px" />
                    </div>
                    <div className={styles.historyCopy}>
                      <div>
                        <span>
                          {review.type === "product"
                            ? "Ürün"
                            : "Sipariş deneyimi"}
                        </span>
                        <span
                          className={`${styles.status} ${styles[review.status]}`}
                        >
                          {statusLabels[review.status]}
                        </span>
                      </div>
                      <h3>{review.title}</h3>
                      {review.rating ? <Stars value={review.rating} /> : null}
                      <p>
                        {review.comment ||
                          "Bu değerlendirme henüz tamamlanmadı."}
                      </p>
                      <small>
                        {review.date}
                        {review.helpful
                          ? ` • ${review.helpful} kişi faydalı buldu`
                          : ""}
                      </small>
                      {review.editableUntil ? (
                        <em>{review.editableUntil}</em>
                      ) : null}
                    </div>
                    <div className={styles.historyActions}>
                      {review.status === "draft" ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              openReview({
                                id: review.id,
                                type: review.type,
                                title: review.title,
                                subtitle: "Taslak değerlendirme",
                                image: review.image,
                                date: review.date,
                                orderNo: "Taslak",
                                questions: [
                                  "Ürün kalitesi",
                                  "Kullanım deneyimi",
                                  "Fiyat–performans",
                                ],
                              })
                            }
                          >
                            Göndermeye Devam Et
                          </button>
                          <button
                            type="button"
                            className={styles.textAction}
                            onClick={() =>
                              setHistory((current) =>
                                current.filter((item) => item.id !== review.id),
                              )
                            }
                          >
                            Sil
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedPastReview(review)}
                          >
                            Değerlendirmeyi Gör
                          </button>
                          {review.editableUntil ? (
                            <button
                              type="button"
                              className={styles.textAction}
                              onClick={() => {
                                setNotice(
                                  "Düzenleme ekranı tasarım önizlemesinde açıldı ✓",
                                );
                                window.setTimeout(() => setNotice(""), 3000);
                              }}
                            >
                              Düzenle
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {dialogTarget ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
          >
            <button
              type="button"
              className={styles.dialogClose}
              aria-label="Pencereyi kapat"
              onClick={() => setDialogTarget(null)}
            >
              ×
            </button>
            <p>
              {dialogTarget.type === "product"
                ? "ÜRÜN DEĞERLENDİRMESİ"
                : "SİPARİŞ DENEYİMİ"}
            </p>
            <h2 id="review-dialog-title">{dialogTarget.title}</h2>
            <span className={styles.dialogIntro}>
              {dialogTarget.type === "product"
                ? "Ürünle ilgili genel puanınızı seçin."
                : "Sofistike alışveriş deneyiminize genel puan verin."}
            </span>

            <div className={styles.ratingPicker} aria-label="Genel puan">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  aria-label={`${score} yıldız`}
                  aria-pressed={score <= rating}
                  key={score}
                  onClick={() => setRating(score)}
                >
                  ★
                </button>
              ))}
            </div>

            <div className={styles.questionList}>
              {dialogTarget.questions.map((question) => (
                <div key={question}>
                  <span>{question}</span>
                  <div>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        type="button"
                        aria-label={`${question}: ${score} yıldız`}
                        aria-pressed={score <= (subRatings[question] ?? 0)}
                        key={score}
                        onClick={() =>
                          setSubRatings((current) => ({
                            ...current,
                            [question]: score,
                          }))
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {previewing ? (
              <div className={styles.reviewPreview}>
                <span>GÖNDERİ ÖNİZLEMESİ</span>
                <Stars value={rating} />
                <p>{comment || "Yalnızca yıldız puanı paylaşılacak."}</p>
                <small>
                  {anonymous
                    ? "İsimsiz paylaşılacak"
                    : "Umay adıyla paylaşılacak"}
                  {photoName ? ` • ${photoName}` : ""}
                </small>
              </div>
            ) : (
              <>
                <textarea
                  value={comment}
                  placeholder="Deneyiminizi anlatın (isteğe bağlı)"
                  onChange={(event) => setComment(event.target.value)}
                />
                <label className={styles.photoUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPhotoName(event.target.files?.[0]?.name ?? "")
                    }
                  />
                  <span>{photoName || "Fotoğraf ekle (isteğe bağlı)"}</span>
                  <strong>＋</strong>
                </label>
              </>
            )}

            <div className={styles.recommendChoice}>
              <span>
                {dialogTarget.type === "product"
                  ? "Bu ürünü tavsiye eder misiniz?"
                  : "Sofistike'den tekrar alışveriş yapar mısınız?"}
              </span>
              <button
                type="button"
                className={recommend === "yes" ? styles.choiceActive : ""}
                onClick={() => setRecommend("yes")}
              >
                Evet
              </button>
              <button
                type="button"
                className={recommend === "no" ? styles.choiceActive : ""}
                onClick={() => setRecommend("no")}
              >
                Hayır
              </button>
            </div>

            {rating > 0 && rating <= 2 ? (
              <div className={styles.supportPrompt}>
                Sorununuz için destek almak ister misiniz?
                <button type="button">Destek Talebi Oluştur</button>
              </div>
            ) : null}

            <label className={styles.anonymousChoice}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              Değerlendirmemi isimsiz paylaş
            </label>
            <div className={styles.submitActions}>
              {previewing ? (
                <button type="button" onClick={() => setPreviewing(false)}>
                  Düzenlemeye Dön
                </button>
              ) : null}
              <button
                type="button"
                className={styles.submitButton}
                disabled={!rating}
                onClick={() =>
                  previewing ? submitReview() : setPreviewing(true)
                }
              >
                {previewing ? "Değerlendirmeyi Gönder" : "Önizlemeye Geç"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedPastReview ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="past-review-title"
          >
            <button
              type="button"
              className={styles.dialogClose}
              aria-label="Pencereyi kapat"
              onClick={() => setSelectedPastReview(null)}
            >
              ×
            </button>
            <p>GEÇMİŞ DEĞERLENDİRME</p>
            <h2 id="past-review-title">{selectedPastReview.title}</h2>
            <div className={styles.pastReviewDetail}>
              <Stars value={selectedPastReview.rating} />
              <p>{selectedPastReview.comment}</p>
              <small>{selectedPastReview.date}</small>
              <span
                className={`${styles.status} ${styles[selectedPastReview.status]}`}
              >
                {statusLabels[selectedPastReview.status]}
              </span>
            </div>
            <button
              type="button"
              className={styles.submitButton}
              onClick={() => setSelectedPastReview(null)}
            >
              Kapat
            </button>
          </section>
        </div>
      ) : null}

      {notice ? (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      ) : null}
    </main>
  );
}
