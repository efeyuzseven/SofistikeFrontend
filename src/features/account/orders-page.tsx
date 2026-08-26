"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BackendOrder } from "@/lib/orders";
import { AccountNavigation } from "./account-navigation";
import styles from "./orders-page.module.css";

type OrderState = "ongoing" | "delivered" | "returned" | "cancelled";
type OrderTab = "all" | "ongoing" | "delivered" | "returns";
type OpenFilter = "period" | "sort" | null;
const currentTimeMs = Date.now();

type FilterOption = {
  label: string;
  value: string;
};

type OrderProduct = {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  stateLabel: string;
  stateDate: string;
  tone?: OrderState | "problem";
};

type Order = {
  backendId?: string;
  id: string;
  date: string;
  dateValue: string;
  state: OrderState;
  status: string;
  statusNote: string;
  total: number;
  products: OrderProduct[];
  timeline: { label: string; date?: string; complete: boolean }[];
  payment: string;
  delivery: string;
};

function mapBackendOrder(order: BackendOrder): Order {
  const state: OrderState =
    order.status === "Delivered"
      ? "delivered"
      : order.status === "Cancelled"
        ? "cancelled"
        : order.status === "Returned"
          ? "returned"
          : "ongoing";
  const statusLabels: Record<string, string> = {
    AwaitingPayment: "Ödeme bekliyor",
    Confirmed: "Onaylandı",
    Preparing: "Hazırlanıyor",
    Shipped: "Kargoya verildi",
    Delivered: "Teslim edildi",
    Cancelled: "İptal edildi",
    Returned: "İade edildi",
  };
  const paymentLabels: Record<string, string> = {
    Pending: "Ödeme bekliyor",
    Paid: "Ödendi",
    Failed: "Ödeme başarısız",
    Refunded: "İade edildi",
  };
  const createdAt = new Date(order.createdAtUtc);

  return {
    backendId: order.id,
    id: order.orderNumber,
    date: createdAt.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    dateValue: createdAt.toISOString().slice(0, 10),
    state,
    status: statusLabels[order.status] ?? order.status,
    statusNote:
      order.status === "AwaitingPayment"
        ? "Ödeme sağlayıcısı bağlanana kadar siparişiniz bekletiliyor"
        : "Sipariş durumu mağaza sistemi tarafından güncellenir",
    total: order.totalAmount,
    products: order.items.map((item) => ({
      id: item.id,
      name: item.productName,
      image: "/images/hero-home.png",
      quantity: item.quantity,
      price: item.unitPrice,
      stateLabel: statusLabels[order.status] ?? order.status,
      stateDate: createdAt.toLocaleDateString("tr-TR"),
      tone: state,
    })),
    timeline: [
      {
        label: "Sipariş alındı",
        date: createdAt.toLocaleString("tr-TR"),
        complete: true,
      },
      {
        label: statusLabels[order.status] ?? order.status,
        complete: order.status !== "AwaitingPayment",
      },
    ],
    payment: paymentLabels[order.paymentStatus] ?? order.paymentStatus,
    delivery: `${order.recipientName} — ${order.city} / ${order.district}`,
  };
}

const tabs: { id: OrderTab; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "ongoing", label: "Devam Edenler" },
  { id: "delivered", label: "Teslim Edilenler" },
  { id: "returns", label: "İade ve İptaller" },
];

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function FilterMenu({
  label,
  value,
  options,
  open,
  onOpen,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  open: boolean;
  onOpen: () => void;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={styles.filterMenu}>
      <button
        type="button"
        className={styles.filterTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onOpen}
      >
        <span>{selected?.label}</span>
        <span className={styles.filterChevron} aria-hidden="true">
          ⌄
        </span>
      </button>
      {open ? (
        <div className={styles.filterOptions} role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={isSelected ? styles.selectedOption : undefined}
                key={option.value}
                onClick={() => onChange(option.value)}
              >
                <span>{option.label}</span>
                {isSelected ? <span aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function OrderCard({
  order,
  onAction,
}: {
  order: Order;
  onAction: (type: "tracking" | "cancel" | "review", order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stateClass = styles[order.state];

  return (
    <article className={styles.orderCard}>
      <header className={styles.orderHeader}>
        <div>
          <span>Sipariş no</span>
          <strong>{order.id}</strong>
        </div>
        <div>
          <span>Sipariş tarihi</span>
          <strong>{order.date}</strong>
        </div>
        <div>
          <span>Toplam</span>
          <strong>₺{order.total.toLocaleString("tr-TR")}</strong>
        </div>
        <div className={`${styles.orderStatus} ${stateClass}`}>
          <strong>{order.status}</strong>
          <small>{order.statusNote}</small>
        </div>
      </header>

      <div className={styles.products}>
        {order.products.map((product) => (
          <div className={styles.productRow} key={product.id}>
            <div className={styles.productImage}>
              <Image
                src={product.image}
                alt=""
                fill
                sizes="(max-width: 640px) 92px, 112px"
              />
            </div>
            <div className={styles.productCopy}>
              <h3>{product.name}</h3>
              <span>Adet: {product.quantity}</span>
              <strong>₺{product.price.toLocaleString("tr-TR")}</strong>
            </div>
            <div
              className={`${styles.productState} ${
                styles[product.tone ?? order.state]
              }`}
            >
              <span>{product.stateLabel}</span>
              <small>{product.stateDate}</small>
            </div>
          </div>
        ))}
      </div>

      {expanded ? (
        <div className={styles.orderDetails}>
          <ol className={styles.timeline} aria-label="Sipariş süreci">
            {order.timeline.map((step) => (
              <li
                className={step.complete ? styles.complete : ""}
                key={step.label}
              >
                <span aria-hidden="true" />
                <strong>{step.label}</strong>
                <small>{step.date ?? "Bekleniyor"}</small>
              </li>
            ))}
          </ol>
          <div className={styles.detailSummary}>
            <div>
              <span>Ödeme</span>
              <strong>{order.payment}</strong>
            </div>
            <div>
              <span>Teslimat</span>
              <strong>{order.delivery}</strong>
            </div>
            <div>
              <span>Ödenen toplam</span>
              <strong>₺{order.total.toLocaleString("tr-TR")}</strong>
            </div>
          </div>
        </div>
      ) : null}

      <footer className={styles.orderActions}>
        <button type="button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Detayı Kapat" : "Sipariş Detayı"}
        </button>
        {order.state === "ongoing" ? (
          <>
            {order.status === "Hazırlanıyor" ||
            order.status === "Ödeme bekliyor" ? (
              <button
                type="button"
                className={styles.dangerAction}
                onClick={() => onAction("cancel", order)}
              >
                Siparişi İptal Et
              </button>
            ) : null}
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => onAction("tracking", order)}
            >
              {order.status === "Hazırlanıyor" ? "Süreci Gör" : "Teslimatı Gör"}
            </button>
          </>
        ) : null}
        {order.state === "delivered" ? (
          <>
            <span className={styles.returnWindow}>
              İade için 13 gününüz kaldı
            </span>
            <button type="button" onClick={() => onAction("review", order)}>
              Ürünü Değerlendir
            </button>
            <button type="button" className={styles.primaryAction}>
              Tekrar Satın Al
            </button>
          </>
        ) : null}
        {order.state === "returned" || order.state === "cancelled" ? (
          <button type="button" className={styles.primaryAction}>
            Tekrar Satın Al
          </button>
        ) : null}
      </footer>
    </article>
  );
}

export function OrdersPage() {
  const [orderItems, setOrderItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("newest");
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const [dialog, setDialog] = useState<{
    type: "tracking" | "cancel" | "review";
    order: Order;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [rating, setRating] = useState(0);
  const controlsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const response = await fetch("/api/account/orders", {
          cache: "no-store",
        });
        if (response.status === 401) {
          window.location.assign("/login?redirect=%2Fhesabim%2Fsiparislerim");
          return;
        }
        const payload = (await response.json().catch(() => null)) as
          BackendOrder[] | { message?: string } | null;
        if (!response.ok) {
          throw new Error(
            payload && !Array.isArray(payload) && payload.message
              ? payload.message
              : "Siparişler yüklenemedi.",
          );
        }
        if (active)
          setOrderItems((payload as BackendOrder[]).map(mapBackendOrder));
      } catch (reason) {
        if (active) {
          setLoadError(
            reason instanceof Error
              ? reason.message
              : "Siparişler yüklenemedi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const periodOptions: FilterOption[] = [
    { label: "Tüm zamanlar", value: "all" },
    { label: "Son 30 gün", value: "30" },
    { label: "Son 3 ay", value: "90" },
  ];
  const sortOptions: FilterOption[] = [
    { label: "En yeni", value: "newest" },
    { label: "En eski", value: "oldest" },
  ];

  useEffect(() => {
    if (!openFilter) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenFilter(null);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openFilter]);

  useEffect(() => {
    if (!dialog) return;

    function closeDialogOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }

    document.addEventListener("keydown", closeDialogOnEscape);
    return () => document.removeEventListener("keydown", closeDialogOnEscape);
  }, [dialog]);

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = orderItems.filter((order) => {
      const tabMatches =
        activeTab === "all" ||
        order.state === activeTab ||
        (activeTab === "returns" &&
          (order.state === "returned" || order.state === "cancelled"));
      const searchMatches =
        !normalized ||
        order.id.toLocaleLowerCase("tr-TR").includes(normalized) ||
        order.products.some((product) =>
          product.name.toLocaleLowerCase("tr-TR").includes(normalized),
        );
      const ageInDays =
        (currentTimeMs - new Date(order.dateValue).getTime()) / 86_400_000;
      const periodMatches =
        period === "all" ||
        (period === "30" && ageInDays <= 30) ||
        (period === "90" && ageInDays <= 90);
      return tabMatches && searchMatches && periodMatches;
    });

    return [...filtered].sort((a, b) =>
      sort === "oldest"
        ? a.dateValue.localeCompare(b.dateValue)
        : b.dateValue.localeCompare(a.dateValue),
    );
  }, [activeTab, orderItems, period, query, sort]);

  function countFor(tab: OrderTab) {
    if (tab === "all") return orderItems.length;
    if (tab === "returns")
      return orderItems.filter(
        (order) => order.state === "returned" || order.state === "cancelled",
      ).length;
    return orderItems.filter((order) => order.state === tab).length;
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  async function cancelOrder() {
    if (!dialog) return;
    const orderId = dialog.order.id;
    if (!dialog.order.backendId) return;

    const response = await fetch(
      `/api/account/orders/${dialog.order.backendId}/cancel`,
      { method: "POST" },
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      showNotice(payload?.message ?? "Sipariş iptal edilemedi.");
      setDialog(null);
      return;
    }

    setOrderItems((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              state: "cancelled" as const,
              status: "İptal edildi",
              statusNote: "Sipariş iptal edildi",
              products: order.products.map((product) => ({
                ...product,
                stateLabel: "İptal edildi",
                stateDate: "12 Ağustos 2026 tarihinde iptal edildi.",
                tone: "cancelled" as const,
              })),
            }
          : order,
      ),
    );
    setDialog(null);
    showNotice("Siparişiniz iptal edildi ✓");
  }

  return (
    <main className={styles.ordersPage}>
      <div className={styles.colorGlow} aria-hidden="true" />
      <header className={styles.pageIntro}>
        <p>SOFISTIKE +XTRA HESAP</p>
        <div>
          <h1>Siparişlerim</h1>
          <span>{orderItems.length} sipariş</span>
        </div>
        <small>
          Siparişlerinizi ve ürünlerinizin güncel durumunu takip edin.
        </small>
      </header>

      <div className={styles.accountLayout}>
        <AccountNavigation active="orders" />

        <section className={styles.ordersPanel} aria-labelledby="orders-title">
          <div className={styles.panelHeader}>
            <div>
              <p>SİPARİŞ GEÇMİŞİNİZ</p>
              <h2 id="orders-title">Her adımı kolayca takip edin.</h2>
            </div>
            <span>Tasarım önizlemesi</span>
          </div>

          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Sipariş kategorileri"
          >
            {tabs.map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? styles.activeTab : ""}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} <span>{countFor(tab.id)}</span>
              </button>
            ))}
          </div>

          <div className={styles.controls} ref={controlsRef}>
            <label className={styles.searchField}>
              <span className={styles.srOnly}>Siparişlerde ara</span>
              <SearchIcon />
              <input
                type="search"
                value={query}
                placeholder="Sipariş no veya ürün ara"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <FilterMenu
              label="Tarih aralığı"
              value={period}
              options={periodOptions}
              open={openFilter === "period"}
              onOpen={() =>
                setOpenFilter((current) =>
                  current === "period" ? null : "period",
                )
              }
              onChange={(value) => {
                setPeriod(value);
                setOpenFilter(null);
              }}
            />
            <FilterMenu
              label="Sıralama"
              value={sort}
              options={sortOptions}
              open={openFilter === "sort"}
              onOpen={() =>
                setOpenFilter((current) => (current === "sort" ? null : "sort"))
              }
              onChange={(value) => {
                setSort(value);
                setOpenFilter(null);
              }}
            />
          </div>

          <div className={styles.resultSummary} aria-live="polite">
            <span>
              {loading
                ? "Siparişler yükleniyor…"
                : `${visibleOrders.length} sipariş gösteriliyor`}
            </span>
            <small>
              {loadError || "Durumlar mağaza veritabanından güncellenmektedir."}
            </small>
          </div>

          {visibleOrders.length ? (
            <div className={styles.orderList}>
              {visibleOrders.map((order) => (
                <OrderCard
                  order={order}
                  key={order.id}
                  onAction={(type, selectedOrder) => {
                    if (type === "review") {
                      window.location.assign(
                        `/hesabim/degerlendirmelerim?orderId=${selectedOrder.backendId ?? ""}`,
                      );
                      return;
                    }
                    setRating(0);
                    setDialog({ type, order: selectedOrder });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>Bu seçime uygun sipariş bulunamadı.</h3>
              <p>Arama metninizi veya tarih filtresini değiştirebilirsiniz.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPeriod("all");
                  setActiveTab("all");
                }}
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </section>
      </div>

      {dialog ? (
        <div
          className={styles.dialogBackdrop}
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
          >
            <button
              type="button"
              className={styles.dialogClose}
              aria-label="Pencereyi kapat"
              onClick={() => setDialog(null)}
            >
              ×
            </button>

            {dialog.type === "tracking" ? (
              <>
                <p>TESLİMAT DURUMU</p>
                <h2 id="order-dialog-title">Ürünlerinizin son durumu</h2>
                <span className={styles.dialogIntro}>
                  {dialog.order.id} numaralı siparişiniz ürün bazında takip
                  edilmektedir.
                </span>
                <div className={styles.trackingList}>
                  {dialog.order.products.map((product) => (
                    <div
                      className={
                        product.tone === "problem" ? styles.trackingProblem : ""
                      }
                      key={product.id}
                    >
                      <span
                        className={`${styles.trackingDot} ${
                          styles[product.tone ?? dialog.order.state]
                        }`}
                      />
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.stateLabel}</span>
                        <small>{product.stateDate}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.dialogPrimary}
                  onClick={() => setDialog(null)}
                >
                  Tamam
                </button>
              </>
            ) : null}

            {dialog.type === "cancel" ? (
              <>
                <p>SİPARİŞ İPTALİ</p>
                <h2 id="order-dialog-title">
                  Siparişi iptal etmek istiyor musunuz?
                </h2>
                <span className={styles.dialogIntro}>
                  Siparişiniz henüz kargoya verilmediği için iptal edilebilir.
                  Bu işlem yalnızca tasarım önizlemesinde gösterilecektir.
                </span>
                <div className={styles.cancelSummary}>
                  <span>{dialog.order.id}</span>
                  <strong>₺{dialog.order.total.toLocaleString("tr-TR")}</strong>
                </div>
                <div className={styles.dialogActions}>
                  <button type="button" onClick={() => setDialog(null)}>
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    className={styles.dialogDanger}
                    onClick={cancelOrder}
                  >
                    İptali Onayla
                  </button>
                </div>
              </>
            ) : null}

            {dialog.type === "review" ? (
              <>
                <p>ÜRÜN DEĞERLENDİRMESİ</p>
                <h2 id="order-dialog-title">Deneyiminizi paylaşın.</h2>
                <span className={styles.dialogIntro}>
                  {dialog.order.products[0]?.name} için puanınızı seçin.
                </span>
                <div className={styles.ratingPicker} aria-label="Ürün puanı">
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
                <textarea placeholder="Ürünle ilgili düşüncelerinizi yazın (isteğe bağlı)" />
                <button
                  type="button"
                  className={styles.dialogPrimary}
                  disabled={!rating}
                  onClick={() => {
                    setDialog(null);
                    showNotice("Değerlendirmeniz kaydedildi ✓");
                  }}
                >
                  Değerlendirmeyi Kaydet
                </button>
              </>
            ) : null}
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
