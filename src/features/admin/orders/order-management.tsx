"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../admin-icons";
import {
  initialOrders,
  orderStatuses,
  type AdminOrder,
  type OrderChannel,
  type OrderStatus,
} from "./order-data";
import styles from "./order-management.module.css";

type ChannelFilter = "Tümü" | OrderChannel;
type StatusFilter = "Tümü" | OrderStatus;
type Notice = {
  message: string;
  tone: "success" | "error";
};

const pageSize = 5;
const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});
const bulkStatusOptions: OrderStatus[] = [
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
];
const validBulkTransitions: Partial<Record<OrderStatus, OrderStatus>> = {
  Yeni: "Hazırlanıyor",
  Hazırlanıyor: "Kargoya Verildi",
  "Kargoya Verildi": "Teslim Edildi",
};

function isPendingB2COrder(order: AdminOrder) {
  return order.channel === "B2C" && order.paymentStatus === "Ödeme Bekliyor";
}

function applyStatus(
  order: AdminOrder,
  nextStatus: OrderStatus,
  changedAt: string,
): AdminOrder {
  return {
    ...order,
    status: nextStatus,
    statusHistory: [
      ...order.statusHistory,
      {
        status: nextStatus,
        date: changedAt,
        note: `Sipariş durumu ${nextStatus} olarak güncellendi.`,
      },
    ],
  };
}

function formatNow() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function statusClass(status: OrderStatus) {
  return {
    Yeni: styles.statusNew,
    Onaylandı: styles.statusApproved,
    Hazırlanıyor: styles.statusPreparing,
    "Kargoya Verildi": styles.statusShipped,
    "Teslim Edildi": styles.statusDelivered,
    "İptal Edildi": styles.statusCancelled,
  }[status];
}

export function OrderManagement() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<ChannelFilter>("Tümü");
  const [status, setStatus] = useState<StatusFilter>("Tümü");
  const [startDate, setStartDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | "">("");
  const selectAllRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(
    () => ({
      total: orders.length,
      new: orders.filter((order) => order.status === "Yeni").length,
      preparing: orders.filter((order) => order.status === "Hazırlanıyor")
        .length,
      shipped: orders.filter((order) => order.status === "Kargoya Verildi")
        .length,
      completed: orders.filter((order) => order.status === "Teslim Edildi")
        .length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber.toLocaleLowerCase("tr-TR").includes(query) ||
        order.customerName.toLocaleLowerCase("tr-TR").includes(query) ||
        order.companyName?.toLocaleLowerCase("tr-TR").includes(query);
      const matchesChannel = channel === "Tümü" || order.channel === channel;
      const matchesStatus = status === "Tümü" || order.status === status;
      const matchesDate = !startDate || order.orderDate >= startDate;
      return matchesSearch && matchesChannel && matchesStatus && matchesDate;
    });
  }, [channel, orders, search, startDate, status]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const pageStart = (activePage - 1) * pageSize;
  const visibleOrders = filteredOrders.slice(pageStart, pageStart + pageSize);
  const visibleIds = visibleOrders.map((order) => order.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selected.includes(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [allVisibleSelected, someVisibleSelected]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        openMenuId !== null &&
        event.target instanceof Element &&
        !event.target.closest("[data-order-menu]")
      ) {
        setOpenMenuId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (isBulkModalOpen) {
        setIsBulkModalOpen(false);
        setBulkStatus("");
      } else if (detailOrder) {
        setDetailOrder(null);
      } else if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detailOrder, isBulkModalOpen, openMenuId]);

  const summaryCards = [
    {
      label: "Toplam Sipariş",
      value: summary.total,
      icon: "orders" as const,
      tone: "pink",
    },
    {
      label: "Yeni Sipariş",
      value: summary.new,
      icon: "alert" as const,
      tone: "blue",
    },
    {
      label: "Hazırlanıyor",
      value: summary.preparing,
      icon: "stock" as const,
      tone: "orange",
    },
    {
      label: "Kargoda",
      value: summary.shipped,
      icon: "truck" as const,
      tone: "sky",
    },
    {
      label: "Tamamlanan",
      value: summary.completed,
      icon: "trend" as const,
      tone: "green",
    },
  ];

  const resetPage = () => setCurrentPage(1);
  const clearFilters = () => {
    setSearch("");
    setChannel("Tümü");
    setStatus("Tümü");
    setStartDate("");
    resetPage();
  };

  const toggleAll = () => {
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const toggleOrder = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((orderId) => orderId !== id)
        : [...current, id],
    );
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkStatus("");
  };

  const openBulkModal = () => {
    setOpenMenuId(null);
    setDetailOrder(null);
    setBulkStatus("");
    setIsBulkModalOpen(true);
  };

  const showNotice = (message: string, tone: Notice["tone"]) =>
    setNotice({ message, tone });

  const updateStatus = (order: AdminOrder, nextStatus: OrderStatus) => {
    if (order.status === nextStatus) {
      setOpenMenuId(null);
      return;
    }
    if (nextStatus === "Kargoya Verildi" && isPendingB2COrder(order)) {
      showNotice(
        "Ödemesi tamamlanmamış B2C siparişi kargoya verilemez.",
        "error",
      );
      setOpenMenuId(null);
      return;
    }

    const changedAt = formatNow();
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? applyStatus(item, nextStatus, changedAt) : item,
      ),
    );
    setDetailOrder((current) =>
      current?.id === order.id
        ? applyStatus(current, nextStatus, changedAt)
        : current,
    );
    showNotice(
      `${order.orderNumber} durumu ${nextStatus} olarak güncellendi.`,
      "success",
    );
    setOpenMenuId(null);
  };

  const updateBulkStatus = () => {
    if (!bulkStatus) return;

    const selectedOrders = orders.filter((order) =>
      selected.includes(order.id),
    );
    if (selectedOrders.length === 0) {
      showNotice("Güncellenecek sipariş seçilmedi.", "error");
      closeBulkModal();
      return;
    }

    const pendingB2COrders = selectedOrders.filter(
      (order) => bulkStatus === "Kargoya Verildi" && isPendingB2COrder(order),
    );

    if (pendingB2COrders.length > 0) {
      showNotice(
        `Ödemesi tamamlanmamış B2C siparişi kargoya verilemez. Uygun olmayan siparişler: ${pendingB2COrders.map((order) => order.orderNumber).join(", ")}.`,
        "error",
      );
      closeBulkModal();
      return;
    }

    const invalidOrders = selectedOrders.filter(
      (order) => validBulkTransitions[order.status] !== bulkStatus,
    );
    if (invalidOrders.length > 0) {
      showNotice(
        `Seçilen siparişler ${bulkStatus} durumuna birlikte geçirilemez. Sıradaki aşaması farklı olan siparişler: ${invalidOrders.map((order) => order.orderNumber).join(", ")}.`,
        "error",
      );
      closeBulkModal();
      return;
    }

    const selectedIds = new Set(selectedOrders.map((order) => order.id));
    const changedAt = formatNow();
    const updatedOrders = orders.map((order) =>
      selectedIds.has(order.id)
        ? applyStatus(order, bulkStatus, changedAt)
        : order,
    );
    setOrders(updatedOrders);
    setDetailOrder((current) =>
      current && selectedIds.has(current.id)
        ? applyStatus(current, bulkStatus, changedAt)
        : current,
    );
    showNotice(
      `${selectedOrders.length} siparişin durumu ${bulkStatus} olarak güncellendi.`,
      "success",
    );
    setSelected([]);
    closeBulkModal();
  };

  return (
    <div className={styles.page}>
      {notice && (
        <div
          className={`${styles.toast} ${notice.tone === "error" ? styles.errorToast : ""}`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      <p className={styles.intro}>
        Tüm satış kanallarındaki sipariş akışını tek ekrandan yönetin.
      </p>

      <section className={styles.summaryGrid} aria-label="Sipariş özeti">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className={`${styles.summaryCard} ${styles[card.tone]}`}
          >
            <span className={styles.summaryIcon}>
              <Icon name={card.icon} />
            </span>
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.card} aria-labelledby="order-list-title">
        <div className={styles.cardHeading}>
          <div>
            <h2 id="order-list-title">Sipariş Listesi</h2>
            <p>
              B2C ve B2B siparişlerin ödeme ve teslimat süreçlerini izleyin.
            </p>
          </div>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>
              Sipariş numarası veya müşteri adı ara
            </span>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              type="search"
              placeholder="Sipariş no veya müşteri ara..."
            />
          </label>
          <label>
            <span>Sipariş kanalı</span>
            <select
              value={channel}
              onChange={(event) => {
                setChannel(event.target.value as ChannelFilter);
                resetPage();
              }}
            >
              <option>Tümü</option>
              <option>B2C</option>
              <option>B2B</option>
            </select>
          </label>
          <label>
            <span>Sipariş durumu</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                resetPage();
              }}
            >
              <option>Tümü</option>
              {orderStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Başlangıç tarihi</span>
            <input
              type="date"
              value={startDate}
              max="2026-08-11"
              onChange={(event) => {
                setStartDate(event.target.value);
                resetPage();
              }}
            />
          </label>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Filtreleri Temizle
          </button>
        </div>

        <div className={styles.resultLine}>
          {orders.length} siparişten {filteredOrders.length} tanesi eşleşiyor
        </div>

        {selected.length > 0 && (
          <div
            className={styles.bulkActions}
            role="region"
            aria-label="Toplu işlemler"
          >
            <strong>{selected.length} sipariş seçildi</strong>
            <div>
              <button
                type="button"
                className={styles.bulkUpdateButton}
                onClick={openBulkModal}
              >
                Durumu Güncelle
              </button>
              <button
                type="button"
                className={styles.clearSelectionButton}
                onClick={() => setSelected([])}
              >
                Seçimi Temizle
              </button>
            </div>
          </div>
        )}

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    aria-label="Görünen tüm siparişleri seç"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th>Sipariş no</th>
                <th>Müşteri</th>
                <th>Kanal</th>
                <th>Ürün / adet</th>
                <th>Toplam tutar</th>
                <th>Sipariş tarihi</th>
                <th>Ödeme</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const totalQuantity = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0,
                );
                return (
                  <tr key={order.id}>
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        aria-label={`${order.orderNumber} siparişini seç`}
                        checked={selected.includes(order.id)}
                        onChange={() => toggleOrder(order.id)}
                      />
                    </td>
                    <td>
                      <strong className={styles.orderNumber}>
                        {order.orderNumber}
                      </strong>
                    </td>
                    <td>
                      <div className={styles.customer}>
                        <strong>
                          {order.companyName ?? order.customerName}
                        </strong>
                        {order.companyName && (
                          <small>{order.customerName}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          order.channel === "B2B"
                            ? styles.channelB2B
                            : styles.channelB2C
                        }
                      >
                        {order.channel}
                      </span>
                    </td>
                    <td>
                      <div className={styles.itemSummary}>
                        <strong>{order.items[0].name}</strong>
                        <small>
                          {order.items.length > 1
                            ? `+${order.items.length - 1} ürün · `
                            : ""}
                          {totalQuantity} adet
                        </small>
                      </div>
                    </td>
                    <td className={styles.price}>
                      {currency.format(order.total)}
                    </td>
                    <td className={styles.dateCell}>{order.orderDateLabel}</td>
                    <td>
                      <span
                        className={
                          order.paymentStatus === "Ödendi"
                            ? styles.paymentPaid
                            : order.paymentStatus === "İade Edildi"
                              ? styles.paymentRefunded
                              : styles.paymentPending
                        }
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={statusClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setDetailOrder(order);
                          }}
                        >
                          Görüntüle
                        </button>
                        <div className={styles.menuWrap} data-order-menu>
                          <button
                            type="button"
                            className={styles.moreButton}
                            aria-label={`${order.orderNumber} için işlem menüsü`}
                            aria-haspopup="true"
                            aria-expanded={openMenuId === order.id}
                            onClick={() =>
                              setOpenMenuId((current) =>
                                current === order.id ? null : order.id,
                              )
                            }
                          >
                            •••
                          </button>
                          {openMenuId === order.id && (
                            <div
                              className={styles.actionMenu}
                              role="group"
                              aria-label={`${order.orderNumber} durum işlemleri`}
                            >
                              <label>
                                <span>Sipariş durumunu değiştir</span>
                                <select
                                  aria-label={`${order.orderNumber} sipariş durumunu değiştir`}
                                  value={order.status}
                                  onChange={(event) =>
                                    updateStatus(
                                      order,
                                      event.target.value as OrderStatus,
                                    )
                                  }
                                >
                                  {orderStatuses.map((item) => (
                                    <option key={item}>{item}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" />
              </span>
              <h3>Sipariş bulunamadı</h3>
              <p>
                Arama ifadenizi veya filtrelerinizi değiştirerek tekrar deneyin.
              </p>
              <button type="button" onClick={clearFilters}>
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <nav
            className={styles.pagination}
            aria-label="Sipariş listesi sayfaları"
          >
            <span>
              {pageStart + 1}–
              {Math.min(pageStart + pageSize, filteredOrders.length)} /{" "}
              {filteredOrders.length} sipariş
            </span>
            <div>
              <button
                type="button"
                aria-label="Önceki sayfa"
                disabled={activePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <Icon name="chevron" />
              </button>
              <strong>{activePage}</strong>
              <span>/ {pageCount}</span>
              <button
                type="button"
                aria-label="Sonraki sayfa"
                disabled={activePage === pageCount}
                onClick={() =>
                  setCurrentPage((page) => Math.min(pageCount, page + 1))
                }
              >
                <Icon name="chevron" />
              </button>
            </div>
          </nav>
        )}
      </section>

      {isBulkModalOpen && (
        <div className={styles.modalLayer}>
          <button
            type="button"
            className={styles.modalScrim}
            aria-label="Toplu durum güncelleme penceresini kapat"
            onClick={closeBulkModal}
          />
          <section
            className={styles.bulkModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-status-title"
            aria-describedby="bulk-status-description"
          >
            <header className={styles.bulkModalHeader}>
              <div>
                <span>Toplu işlem</span>
                <h2 id="bulk-status-title">Sipariş Durumlarını Güncelle</h2>
              </div>
              <button
                type="button"
                aria-label="Toplu durum güncelleme penceresini kapat"
                onClick={closeBulkModal}
              >
                ×
              </button>
            </header>
            <div className={styles.bulkModalBody}>
              <p id="bulk-status-description">
                Seçili {selected.length} sipariş için uygulanacak sıradaki
                durumu seçin. Aşama atlamaya izin verilmez.
              </p>
              <label>
                <span>Hedef durum</span>
                <select
                  autoFocus
                  value={bulkStatus}
                  onChange={(event) =>
                    setBulkStatus(event.target.value as OrderStatus | "")
                  }
                >
                  <option value="">Durum seçin</option>
                  {bulkStatusOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <div className={styles.selectedOrdersPreview}>
                <span>Seçili siparişler</span>
                <p>
                  {orders
                    .filter((order) => selected.includes(order.id))
                    .map((order) => order.orderNumber)
                    .join(", ")}
                </p>
              </div>
            </div>
            <footer className={styles.bulkModalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeBulkModal}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                disabled={!bulkStatus}
                onClick={updateBulkStatus}
              >
                Güncellemeyi Onayla
              </button>
            </footer>
          </section>
        </div>
      )}

      {detailOrder && (
        <div className={styles.modalLayer}>
          <button
            type="button"
            className={styles.modalScrim}
            aria-label="Sipariş detayını kapat"
            onClick={() => setDetailOrder(null)}
          />
          <section
            className={styles.detailPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
          >
            <header className={styles.detailHeader}>
              <div>
                <span>Sipariş Detayı</span>
                <h2 id="order-detail-title">{detailOrder.orderNumber}</h2>
                <p>{detailOrder.orderDateLabel}</p>
              </div>
              <button
                type="button"
                aria-label="Pencereyi kapat"
                onClick={() => setDetailOrder(null)}
              >
                ×
              </button>
            </header>
            <div className={styles.detailBody}>
              <div className={styles.detailStatus}>
                <span className={statusClass(detailOrder.status)}>
                  {detailOrder.status}
                </span>
                <span
                  className={
                    detailOrder.channel === "B2B"
                      ? styles.channelB2B
                      : styles.channelB2C
                  }
                >
                  {detailOrder.channel}
                </span>
              </div>
              <section className={styles.detailSection}>
                <h3>Müşteri ve Teslimat</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <small>Müşteri</small>
                    <strong>
                      {detailOrder.companyName ?? detailOrder.customerName}
                    </strong>
                    {detailOrder.companyName && (
                      <span>{detailOrder.customerName}</span>
                    )}
                  </div>
                  <div>
                    <small>İletişim</small>
                    <strong>{detailOrder.phone}</strong>
                    <span>{detailOrder.email}</span>
                  </div>
                  <div className={styles.address}>
                    <small>Teslimat adresi</small>
                    <p>{detailOrder.address}</p>
                  </div>
                </div>
              </section>
              <section className={styles.detailSection}>
                <h3>Siparişteki Ürünler</h3>
                <div className={styles.orderLines}>
                  {detailOrder.items.map((item) => (
                    <div key={item.sku}>
                      <span className={styles.lineVisual}>
                        {item.name.slice(0, 2).toLocaleUpperCase("tr-TR")}
                      </span>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.sku}</small>
                      </div>
                      <span>
                        {item.quantity} adet × {currency.format(item.unitPrice)}
                      </span>
                      <b>{currency.format(item.quantity * item.unitPrice)}</b>
                    </div>
                  ))}
                </div>
              </section>
              <section className={styles.totals}>
                <div>
                  <span>Ara toplam</span>
                  <strong>{currency.format(detailOrder.subtotal)}</strong>
                </div>
                <div>
                  <span>Kargo ücreti</span>
                  <strong>
                    {detailOrder.shipping === 0
                      ? "Ücretsiz"
                      : currency.format(detailOrder.shipping)}
                  </strong>
                </div>
                <div>
                  <span>İndirim</span>
                  <strong className={styles.discount}>
                    −{currency.format(detailOrder.discount)}
                  </strong>
                </div>
                <div className={styles.grandTotal}>
                  <span>Genel toplam</span>
                  <strong>{currency.format(detailOrder.total)}</strong>
                </div>
              </section>
              <section className={styles.detailSection}>
                <h3>Ödeme ve Sipariş Notu</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <small>Ödeme yöntemi</small>
                    <strong>{detailOrder.paymentMethod}</strong>
                    <span
                      className={
                        detailOrder.paymentStatus === "Ödendi"
                          ? styles.paymentPaid
                          : detailOrder.paymentStatus === "İade Edildi"
                            ? styles.paymentRefunded
                            : styles.paymentPending
                      }
                    >
                      {detailOrder.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <small>Sipariş notu</small>
                    <p>{detailOrder.note}</p>
                  </div>
                </div>
              </section>
              <section className={styles.detailSection}>
                <h3>Sipariş Durum Geçmişi</h3>
                <ol className={styles.timeline}>
                  {detailOrder.statusHistory.map((entry, index) => (
                    <li key={`${entry.status}-${index}`}>
                      <span />
                      <div>
                        <strong>{entry.status}</strong>
                        <p>{entry.note}</p>
                        <small>{entry.date}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
